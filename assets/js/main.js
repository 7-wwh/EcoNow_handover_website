(function(){
  // Brand Logo Scroll Effect
  const logo = document.getElementById('brand-logo');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      logo.style.opacity = '0';
      logo.style.pointerEvents = 'none';
    } else {
      logo.style.opacity = '1';
      logo.style.pointerEvents = 'auto';
    }
  });

  // Mobile Burger Menu
  const burger = document.getElementById('burger-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex');
    });
  }

  // Burn Rail (Scroll Progress)
  var fill = document.getElementById('burnedFill');
  if(!fill) return;
  function update(){
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollHeight = (doc.scrollHeight - doc.clientHeight) || 1;
    var pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
    fill.style.height = pct + '%';
  }
  document.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
  update();
})();
