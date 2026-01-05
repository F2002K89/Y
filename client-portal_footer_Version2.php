<?php
// footer.php - include at bottom of portal pages
?>
<footer class="bg-black text-white py-14 mt-12">
  <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
    <div>
      <div class="text-2xl font-extrabold mb-3">NEFT OIL TRADING</div>
      <p class="text-white/70">Your trusted partner in global oil trading solutions.</p>
    </div>

    <div>
      <h3 class="font-semibold mb-3">Quick Links</h3>
      <ul class="space-y-2 text-white/80">
        <li><a href="/index.html#home" class="hover:text-white">Home</a></li>
        <li><a href="/index.html#products" class="hover:text-white">Products</a></li>
        <li><a href="/news.html" class="hover:text-white">Media Center</a></li>
        <li><a href="/index.html#about" class="hover:text-white">Leadership</a></li>
        <li><a href="/index.html#contact" class="hover:text-white">Contact Us</a></li>
      </ul>
    </div>

    <div>
      <h3 class="font-semibold mb-4">Contact Information</h3>
      <div class="space-y-5 text-white/90">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-6.5-5.33-6.5-10.2a6.5 6.5 0 1 1 13 0C18.5 15.67 12 21 12 21z"/>
              <circle cx="12" cy="10.5" r="2" fill="currentColor"/>
            </svg>
          </div>
          <p>Office No: E-25F-08<br>Hamriyah Free Zone,<br>Sharjah, United Arab Emirates</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="6.5" width="18" height="11" rx="2.5" ry="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 8l9 6 9-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <a href="mailto:info@neftoiltrading.com" class="hover:underline">info@neftoiltrading.com</a>
        </div>
      </div>
    </div>
  </div>

  <div class="border-t border-white/10 mt-10 pt-6 text-center text-white/60">
    © <span id="year"></span> NEFT OIL TRADING. All rights reserved.
  </div>
</footer>

<button id="toTop" class="to-top fixed bottom-6 right-6 w-10 h-10 rounded-full border border-black/10 bg-white/90 shadow grid place-items-center" aria-label="Back to top">↑</button>

<script>
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  menuBtn?.addEventListener('click', ()=> mobileMenu.classList.toggle('hidden'));
  document.getElementById('year').textContent = new Date().getFullYear();
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll',()=>{
    if(window.scrollY > 900) toTop.classList.add('show'); else toTop.classList.remove('show');
  });
  toTop.addEventListener('click',()=> window.scrollTo({top:0, behavior:'smooth'}));
</script>

</body>
</html>