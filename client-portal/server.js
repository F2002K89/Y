// Paste into server.js (replace previous /api/kyc/webhook)
const crypto = require('crypto');
app.post('/api/kyc/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const raw = req.body; // Buffer containing exact request body
    // Provider signature header (adjust name if DIDIT uses a different header)
    let providedSig = (req.headers['x-didit-signature'] || '').toString();

    // Some providers send "sha256=<hex>" — strip prefix if present
    if (providedSig.startsWith('sha256=')) providedSig = providedSig.slice(7);

    if (!process.env.DIDIT_WEBHOOK_SECRET) {
      console.warn('DIDIT_WEBHOOK_SECRET not set in env; webhook cannot be verified.');
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    // Compute expected HMAC-SHA256 (hex)
    const expected = crypto.createHmac('sha256', process.env.DIDIT_WEBHOOK_SECRET).update(raw).digest('hex');

    // Safe compare
    const providedBuf = Buffer.from(providedSig, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      console.warn('Webhook signature mismatch', { providedSig, expected });
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    // Signature OK — parse JSON and handle event
    const payload = JSON.parse(raw.toString('utf8'));
    console.log('Valid webhook payload:', payload);

    // TODO: update your DB or in-memory user map here, e.g.:
    // const providerRef = payload.reference || payload.id;
    // const applicantEmail = payload.applicant?.email;
    // update user status and persist record...
    // appendRecord(KYC_FILE, { providerRef, applicantEmail, payload, receivedAt: new Date().toISOString() });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Webhook handling error', err);
    return res.status(500).end();
  }
});
