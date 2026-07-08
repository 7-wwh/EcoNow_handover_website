(function(){
  var topBar = document.getElementById('topBar');
  var liquidNav = document.getElementById('liquidNav');
  if(!topBar || !liquidNav) return;
  var brand = topBar.querySelector('.top-bar__brand');
  var menu = topBar.querySelector('.top-bar__menu');

  var startPx = 10;
  var endPx = 150;
  var viscosity = 0.085;
  var target = 0;
  var current = 0;
  var rafId = null;

  function computeTarget(){
    var y = window.scrollY || window.pageYOffset || 0;
    target = Math.min(1, Math.max(0, (y - startPx) / (endPx - startPx)));
  }

  function render(t){
    topBar.style.setProperty('--bar-opacity', String(1 - t));
    brand.style.setProperty('--brand-x', (46 * t).toFixed(2) + 'px');
    menu.style.setProperty('--menu-x', (-46 * t).toFixed(2) + 'px');

    liquidNav.style.setProperty('--nav-opacity', String(t));
    liquidNav.style.setProperty('--nav-y', (10 * (1 - t)).toFixed(2) + 'px');
    liquidNav.style.setProperty('--nav-scale', (0.92 + 0.08 * t).toFixed(4));

    var merged = t > 0.55;
    topBar.style.pointerEvents = merged ? 'none' : '';
    liquidNav.style.pointerEvents = merged ? '' : 'none';
  }

  function tick(){
    current += (target - current) * viscosity;
    if(Math.abs(target - current) < 0.0006){
      current = target;
      render(current);
      rafId = null;
      return;
    }
    render(current);
    rafId = window.requestAnimationFrame(tick);
  }

  function onScrollOrResize(){
    computeTarget();
    if(rafId === null){
      rafId = window.requestAnimationFrame(tick);
    }
  }

  document.addEventListener('scroll', onScrollOrResize, {passive:true});
  window.addEventListener('resize', onScrollOrResize);

  computeTarget();
  current = target;
  render(current);

  var topBarBrand = document.getElementById('topBarBrand');
  if(topBarBrand){
    topBarBrand.addEventListener('click', function(e){
      e.preventDefault();
      topBarBrand.classList.remove('nav-brand--pulse');
      void topBarBrand.offsetWidth;
      topBarBrand.classList.add('nav-brand--pulse');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(function(){ topBarBrand.classList.remove('nav-brand--pulse'); }, 500);
    });
  }
})();
