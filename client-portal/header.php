<?php
// header.php - include at top of portal pages (after any PHP logic)
?>
<!doctype html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>NEFT Client Portal</title>
  <link rel="icon" href="/logo.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Montserrat', sans-serif; background:#fff; color:#0a0a0a; }
    .glass{backdrop-filter:saturate(180%) blur(10px); background: rgba(255,255,255,.85); }
  </style>
</head>
<body>
<!-- NAV (matches your site) -->
<nav class="fixed inset-x-0 top-0 z-50 glass border-b border-black/5">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <a href="/index.html" class="flex items-center gap-2">
        <img src="/logo.png" class="h-9 w-9 object-contain" alt="NEFT logo"/>
        <span class="font-extrabold text-lg">NEFT OIL TRADING</span>
      </a>

      <div class="hidden md:flex items-center gap-8 font-medium">
        <a href="/index.html#home" class="hover:opacity-80">Home</a>
        <a href="/index.html#products" class="hover:opacity-80">Products</a>
        <a href="/news.html" class="hover:opacity-80">Media Center</a>
        <a href="/index.html#about" class="hover:opacity-80">Leadership</a>
        <a href="/index.html#contact" class="hover:opacity-80">Contact Us</a>
        <a href="/client-portal/login.php" class="hover:opacity-80 font-semibold">Client Portal</a>
      </div>

      <button id="menuBtn" class="md:hidden border border-black/10 rounded-full w-10 h-10 grid place-items-center" aria-label="Open menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>

    <div id="mobileMenu" class="md:hidden hidden pt-2 pb-4 space-y-2">
      <a href="/index.html#home" class="block px-3 py-2 rounded hover:bg-black/5">Home</a>
      <a href="/index.html#products" class="block px-3 py-2 rounded hover:bg-black/5">Products</a>
      <a href="/news.html" class="block px-3 py-2 rounded hover:bg-black/5">Media Center</a>
      <a href="/index.html#about" class="block px-3 py-2 rounded hover:bg-black/5">Leadership</a>
      <a href="/index.html#contact" class="block px-3 py-2 rounded hover:bg-black/5">Contact Us</a>
      <a href="/client-portal/login.php" class="block px-3 py-2 rounded hover:bg-black/5 font-semibold">Client Portal</a>
    </div>
  </div>
</nav>

<div class="pt-20"></div>
