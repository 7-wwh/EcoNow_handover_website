(function(){
    var fill = document.getElementById('burnedFill');
    function updateRail(){
      if(!fill) return;
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var scrollHeight = (doc.scrollHeight - doc.clientHeight) || 1;
      var pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      fill.style.height = pct + '%';
    }
    document.addEventListener('scroll', updateRail, {passive:true});
    window.addEventListener('resize', updateRail);
    updateRail();
})();

(function(){
    var nav = document.getElementById('liquidNav');
    var indicator = document.getElementById('navIndicator');
    var brand = document.getElementById('navBrand');
    if(!nav || !indicator) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('.liquid-nav__link'));
    var page = document.body.getAttribute('data-page');

    // Click handler to save state
    links.forEach(function(link){
      link.addEventListener('click', function(){
        localStorage.setItem('prevPage', page);
      });
    });

    function moveIndicator(link){
      indicator.style.width = link.offsetWidth + 'px';
      indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    }

    var active = links.filter(function(l){ return l.dataset.page === page; })[0];
    if (active) active.classList.add('active');

    var prevPage = localStorage.getItem('prevPage');
    var prevLink = links.filter(function(l){ return l.dataset.page === prevPage; })[0];

    // Initial position (no transition)
    indicator.style.transition = 'none';
    if (prevLink) {
        moveIndicator(prevLink);
    } else if (active) {
        moveIndicator(active);
    }

    // Animate to active (with transition)
    requestAnimationFrame(function(){
      indicator.style.transition = '';
      if (active) moveIndicator(active);
    });

    window.addEventListener('resize', function(){ if(active) moveIndicator(active); });

    // Adaptive contrast
    var ticking = false;
    function sampleContrast(){
      ticking = false;
      var navRect = nav.getBoundingClientRect();
      var x = navRect.left + navRect.width / 2;
      var y = navRect.bottom + 6;
      if(y >= window.innerHeight) y = window.innerHeight - 2;
      var el = document.elementFromPoint(x, y);
      if(!el) return;
      var zone = el.closest('.dark-zone');
      nav.classList.toggle('on-light', !zone);
    }

    function requestSample(){
      if(!ticking){ ticking = true; window.requestAnimationFrame(sampleContrast); }
    }
    document.addEventListener('scroll', requestSample, {passive:true});
    window.addEventListener('resize', requestSample);
    window.addEventListener('load', sampleContrast);
    setTimeout(sampleContrast, 50);

    // Brand pulse
    if(brand) {
      brand.addEventListener('click', function(e){
        localStorage.setItem('prevPage', page);
        brand.classList.remove('nav-brand--pulse');
        void brand.offsetWidth;
        brand.classList.add('nav-brand--pulse');
      });
    }
})();

(function(){
    var topBar = document.getElementById('topBar');
    var liquidNav = document.getElementById('liquidNav');
    if(!topBar || !liquidNav) return;
    var brand = topBar.querySelector('.top-bar__brand');
    var menu = topBar.querySelector('.top-bar__menu');

    var startPx = 10;
    var endPx = 170;
    var viscosity = 0.065;
    var target = 0;
    var current = 0;
    var rafId = null;

    function computeTarget(){
      var y = window.scrollY || window.pageYOffset || 0;
      target = Math.min(1, Math.max(0, (y - startPx) / (endPx - startPx)));
    }

    function render(t){
      topBar.style.setProperty('--bar-opacity', String(1 - t));
      if(brand) brand.style.setProperty('--brand-x', (46 * t).toFixed(2) + 'px');
      if(menu) menu.style.setProperty('--menu-x', (-46 * t).toFixed(2) + 'px');

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
      if(rafId === null) rafId = window.requestAnimationFrame(tick);
    }

    document.addEventListener('scroll', onScrollOrResize, {passive:true});
    window.addEventListener('resize', onScrollOrResize);

    computeTarget();
    current = target;
    render(current);

    var topBarBrand = document.getElementById('topBarBrand');
    if(topBarBrand){
      topBarBrand.addEventListener('click', function(e){
        topBarBrand.classList.remove('nav-brand--pulse');
        void topBarBrand.offsetWidth;
        topBarBrand.classList.add('nav-brand--pulse');
      });
    }
})();
