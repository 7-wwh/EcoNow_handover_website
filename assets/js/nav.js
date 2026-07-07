  // ---------- Synced Double-Indicator Liquid Pill Physics System ----------
  (function(){
    var nav = document.getElementById('liquidNav');
    var indicator = document.getElementById('navIndicator');
    var dropdown = document.getElementById('navDropdown');
    var dropdownIndicator = document.getElementById('dropdownIndicator');
    if(!nav || !indicator || !dropdown || !dropdownIndicator) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('.liquid-nav__link'));
    var dropdownLinks = Array.prototype.slice.call(dropdown.querySelectorAll('.nav-dropdown__link'));
    
    var animTimeout = null;
    var dropdownAnimTimeout = null;

    // Move Horizontal Indicator (Desktop)
    function moveIndicator(link, instant = false){
      if(!link) return;
      
      var targetLeft = link.offsetLeft;
      var targetRight = nav.offsetWidth - (link.offsetLeft + link.offsetWidth);

      if(instant) {
        indicator.style.transition = 'none';
        indicator.style.setProperty('--left', targetLeft + 'px');
        indicator.style.setProperty('--right', targetRight + 'px');
        indicator.offsetHeight; // Force reflow
        indicator.style.transition = '';
        return;
      }

      var currentLeft = parseFloat(indicator.style.getPropertyValue('--left') || 0);
      var direction = targetLeft >= currentLeft ? 'right' : 'left';

      nav.setAttribute('data-direction', direction);
      nav.classList.add('is-animating');

      indicator.style.setProperty('--left', targetLeft + 'px');
      indicator.style.setProperty('--right', targetRight + 'px');

      clearTimeout(animTimeout);
      animTimeout = setTimeout(function(){
        nav.classList.remove('is-animating');
      }, 550);
    }

    // Move Vertical Indicator (Mobile Dropdown)
    function moveDropdownIndicator(link, instant = false){
      if(!link) return;

      var targetTop = link.offsetTop;
      var targetBottom = dropdown.offsetHeight - (link.offsetTop + link.offsetHeight);

      if(instant) {
        dropdownIndicator.style.transition = 'none';
        dropdownIndicator.style.setProperty('--top', targetTop + 'px');
        dropdownIndicator.style.setProperty('--bottom', targetBottom + 'px');
        dropdownIndicator.offsetHeight; // Force reflow
        dropdownIndicator.style.transition = '';
        return;
      }

      var currentTop = parseFloat(dropdownIndicator.style.getPropertyValue('--top') || 0);
      var direction = targetTop >= currentTop ? 'down' : 'up';

      dropdown.setAttribute('data-direction', direction);
      dropdown.classList.add('is-animating');

      dropdownIndicator.style.setProperty('--top', targetTop + 'px');
      dropdownIndicator.style.setProperty('--bottom', targetBottom + 'px');

      clearTimeout(dropdownAnimTimeout);
      dropdownAnimTimeout = setTimeout(function(){
        dropdown.classList.remove('is-animating');
      }, 550);
    }

    // Set layout positions based on current page
    function initActiveIndicators(){
      var currentPath = window.location.pathname.split('/').pop();
      if(currentPath === "" || currentPath === "index.html") currentPath = "main.html"; // Default

      var activeIndex = 0;
      links.forEach(function(l, i){
        if(l.getAttribute('href') === currentPath){
          activeIndex = i;
        }
      });

      links.forEach(function(l, i){
        if(i === activeIndex){
          l.classList.add('active');
          moveIndicator(l, true);
        } else {
          l.classList.remove('active');
        }
      });

      dropdownLinks.forEach(function(dl, i){
        if(i === activeIndex){
          dl.classList.add('active');
          moveDropdownIndicator(dl, true);
        } else {
          dl.classList.remove('active');
        }
      });
    }

    // Initialize state on load
    initActiveIndicators();

    // Responsive fixes
    window.addEventListener('resize', function(){ 
      initActiveIndicators();
    });

    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(function(){ 
        initActiveIndicators();
      });
    }

    if(window.ResizeObserver){
      var ro = new ResizeObserver(function(){ 
        initActiveIndicators();
      });
      ro.observe(nav);
      ro.observe(dropdown);
    }
  })();

  // ---------- Navigation Logo Pulse Effect ----------
  (function(){
    var brand = document.getElementById('navBrand');
    if(!brand) return;

    brand.addEventListener('click', function(e){
      brand.classList.remove('nav-brand--pulse');
      void brand.offsetWidth; // Force Reflow
      brand.classList.add('nav-brand--pulse');
      setTimeout(function(){ brand.classList.remove('nav-brand--pulse'); }, 500);
    });
  })();

  // ---------- Scroll-linked Morphing (Top Bar to Compact Liquid Nav) ----------
  (function(){
    var topBar = document.getElementById('topBar');
    var liquidNav = document.getElementById('liquidNav');
    if(!topBar || !liquidNav) return;
    
    // Initially set to compact state if scrolled, or just default state
    var y = window.scrollY || window.pageYOffset || 0;
    var t = y > 150 ? 1 : (y < 10 ? 0 : (y - 10) / 140);
    render(t);

    function render(t){
      topBar.style.setProperty('--bar-opacity', String(1 - t));
      liquidNav.style.setProperty('--nav-opacity', String(t));
      liquidNav.style.setProperty('--nav-y', (10 * (1 - t)).toFixed(2) + 'px');
      liquidNav.style.setProperty('--nav-scale', (0.92 + 0.08 * t).toFixed(4));

      var merged = t > 0.55;
      topBar.style.pointerEvents = merged ? 'none' : '';
      liquidNav.style.pointerEvents = merged ? '' : 'none';
    }

    document.addEventListener('scroll', function(){
        var y = window.scrollY || window.pageYOffset || 0;
        var t = Math.min(1, Math.max(0, (y - 10) / 140));
        render(t);
    }, {passive:true});

  })();

  // ---------- Dynamic Contrast Monitor (Real-Time Zone Checking) ----------
  (function(){
    var nav = document.getElementById('liquidNav');
    if(!nav) return;
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
      
      // Update Contrast on Floating Pill Navigation
      nav.classList.toggle('on-light', !zone);
      
      // Update Contrast on Mobile Dropdown Menu
      var dropdown = document.getElementById('navDropdown');
      if(dropdown) dropdown.classList.toggle('on-light', !zone);
    }

    function requestSample(){
      if(!ticking){
        ticking = true;
        window.requestAnimationFrame(sampleContrast);
      }
    }

    document.addEventListener('scroll', requestSample, {passive:true});
    window.addEventListener('resize', requestSample);
    window.addEventListener('load', sampleContrast);
    setTimeout(sampleContrast, 50);
  })();

  // ---------- Mobile Burger Dropdown Controller ----------
  (function(){
    var nav = document.getElementById('liquidNav');
    var burger = document.getElementById('navBurger');
    var dropdown = document.getElementById('navDropdown');
    if(!nav || !burger || !dropdown) return;

    var closingTimeout = null;

    function openDropdown() {
      clearTimeout(closingTimeout);
      dropdown.classList.remove('closing');
      burger.setAttribute('aria-expanded', 'true');
      dropdown.classList.add('open');
      dropdown.setAttribute('aria-hidden', 'false');
    }

    function closeDropdown() {
      if (!dropdown.classList.contains('open')) return;
      burger.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('open');
      dropdown.classList.add('closing');
      dropdown.setAttribute('aria-hidden', 'true');

      // Sync timeout cleanly with the 480ms liquid close animation
      closingTimeout = setTimeout(function(){
        dropdown.classList.remove('closing');
      }, 480);
    }

    // Toggle dropdown state
    burger.addEventListener('click', function(e){
      e.stopPropagation();
      var expanded = burger.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Close when clicking outside of navigation panel
    document.addEventListener('click', function(e){
      if(!nav.contains(e.target) && !dropdown.contains(e.target)){
        closeDropdown();
      }
    });
  })();
