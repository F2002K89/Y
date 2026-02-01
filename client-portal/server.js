// server.js
// Simple demo KYC server that starts a DIDIT verification session and accepts webhooks.
// NOTE: This is a demo. Replace with DB, secure storage and full webhook auth for production.

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // npm i node-fetch@2
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors()); // allow cross-origin for testing; lock this down in production
app.use(express.json()); // parse JSON for most routes

// storage folder for demo
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const KYC_FILE = path.join(DATA_DIR, 'kyc_records.jsonl');

// helper: append JSON line
function appendRecord(file, obj) {
  fs.appendFileSync(file, JSON.stringify(obj) + '\n');
}

// simple in-memory user state (for demo). Replace with DB in production.
const users = {}; // users[email] = { kycStatus, providerRef, kycResult }

// very small auth middleware for demo: X-User-Email header
function requireAuth(req, res, next) {
  const email = (req.headers['x-user-email'] || '').toString().toLowerCase();
  if (!email) return res.status(401).json({ message: 'Provide X-User-Email header (demo auth)' });
  req.userEmail = email;
  if (!users[email]) users[email] = { kycStatus: 'not_started' };
  next();
}

// POST /api/kyc/start  -> create DIDIT session and return provider verification URL
app.post('/api/kyc/start', requireAuth, async (req, res) => {
  try {
    const email = req.userEmail;
    const name = (req.body.name || '').toString();

    // Build provider payload — adapt to DIDIT required fields if different
    const providerPayload = {
      reference: `neft_kyc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      callback_url: process.env.KYC_WEBHOOK_URL,
      applicant: { email, name }
      // Add other DIDIT-specific options if required
    };

    const diditBase = (process.env.DIDIT_API_URL || '').replace(/\/$/, '');
    if (!diditBase || !process.env.DIDIT_APP_KEY) {
      return res.status(500).json({ message: 'Missing DIDIT_API_URL or DIDIT_APP_KEY in .env' });
    }

    // POST to DIDIT (example path /verifications - change if DIDIT docs use a different path)
    const providerEndpoint = `${diditBase}/verifications`;

    const providerResp = await fetch(providerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Using X-App-Key header per your request; if DIDIT requires "Authorization: Bearer ...", change this:
        'X-App-Key': process.env.DIDIT_APP_KEY
      },
      body: JSON.stringify(providerPayload)
    });

    if (!providerResp.ok) {
      const text = await providerResp.text().catch(()=>'<no body>');
      console.error('DIDIT create session error:', providerResp.status, text);
      return res.status(502).json({ message: 'Provider error', detail: text });
    }

    const providerJson = await providerResp.json();

    // adapt the fields below to DIDIT response shape
    const verificationUrl = providerJson.verification_url || providerJson.redirect_url || providerJson.url || providerJson.session_url;
    const providerRef = providerJson.id || providerJson.reference || providerJson.session_id || providerPayload.reference;

    // Save demo record & update in-memory status
    users[email].kycStatus = 'in_progress';
    users[email].providerRef = providerRef;
    appendRecord(KYC_FILE, {
      id: providerRef,
      email,
      name,
      createdAt: new Date().toISOString(),
      providerPayload,
      providerResponse: providerJson,
      status: 'in_progress'
    });

    return res.json({ verificationUrl, providerRef, providerResponse: providerJson });
  } catch (err) {
    console.error('Start KYC error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/kyc/webhook  -> DIDIT will POST results here
// We parse raw body to verify signature (if you set DIDIT_WEBHOOK_SECRET)
app.post('/api/kyc/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const raw = req.body; // Buffer
    let payload;
    try { payload = JSON.parse(raw.toString('utf8')); } catch (e) { payload = null; }

    // If you have a webhook secret, verify HMAC-SHA256 signature in header 'x-didit-signature'
    if (process.env.DIDIT_WEBHOOK_SECRET) {
      const providedSig = (req.headers['x-didit-signature'] || '').toString();
      const expected = crypto.createHmac('sha256', process.env.DIDIT_WEBHOOK_SECRET).update(raw).digest('hex');
      const ok = providedSig && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(providedSig));
      if (!ok) {
        console.warn('Webhook signature mismatch');
        return res.status(401).json({ message: 'Invalid webhook signature' });
      }
    }

    // Extract provider fields (adapt to DIDIT webhook shape)
    const providerRef = (payload && (payload.reference || payload.id || payload.session_id)) || null;
    const applicantEmail = payload && (payload.applicant && payload.applicant.email) || payload && payload.external_user_id || null;
    const statusRaw = (payload && (payload.status || payload.verification_status || payload.result) || '').toString().toLowerCase();

    const map = { approved: 'approved', verified: 'approved', passed: 'approved', rejected: 'rejected', failed: 'rejected', pending: 'manual_review', manual_review: 'manual_review' };
    const status = map[statusRaw] || (statusRaw ? statusRaw : 'unknown');

    // Update in-memory user state
    if (applicantEmail && users[applicantEmail]) {
      users[applicantEmail].kycStatus = status;
      users[applicantEmail].kycResult = payload;
    } else {
      for (const e of Object.keys(users)) {
        if (users[e].providerRef && users[e].providerRef.toString() === (providerRef || '').toString()) {
          users[e].kycStatus = status;
          users[e].kycResult = payload;
        }
      }
    }

    // Save webhook payload for admin inspection
    appendRecord(KYC_FILE, {
      providerRef,
      applicantEmail,
      status,
      payload,
      receivedAt: new Date().toISOString()
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Webhook handling error', err);
    return res.status(500).end();
  }
});

// GET /api/kyc/status  -> frontend polls for user status
app.get('/api/kyc/status', requireAuth, (req, res) => {
  const u = users[req.userEmail] || { kycStatus: 'not_started' };
  res.json({ email: req.userEmail, kycStatus: u.kycStatus, providerRef: u.providerRef || null, result: u.kycResult || null });
});

// GET /api/admin/kyc?token=...  -> returns saved records (demo)
app.get('/api/admin/kyc', (req, res) => {
  const token = req.query.token || req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return res.status(401).json({ message: 'unauthorized' });
  if (!fs.existsSync(KYC_FILE)) return res.json([]);
  const lines = fs.readFileSync(KYC_FILE, 'utf8').trim().split('\n').filter(Boolean);
  const items = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).reverse();
  res.json(items);
});

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`KYC server listening on ${PORT}`));
