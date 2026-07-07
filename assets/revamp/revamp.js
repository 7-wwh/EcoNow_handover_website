  // ---------- Designing premium water droplet custom cursor logic ----------
  (function(){
    var isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    var mouseX = 0, mouseY = 0;
    var hasMoved = false;

    window.addEventListener('mousemove', function(e){
      mouseX = e.clientX;
      mouseY = e.clientY;
      if(!hasMoved){
        hasMoved = true;
        segments.forEach(function(seg) {
          seg.el.style.opacity = '1';
          seg.x = mouseX;
          seg.y = mouseY;
        });
      }
    }, {passive: true});

    window.addEventListener('mouseleave', function(){
      segments.forEach(function(seg) {
        seg.el.style.opacity = '0';
      });
    });

    window.addEventListener('mouseenter', function(){
      if(hasMoved) {
        segments.forEach(function(seg) {
          seg.el.style.opacity = '1';
        });
      }
    });

    var numSegments = 10;
    var segments = [];
    var container = document.createElement('div');
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    for (var i = 0; i < numSegments; i++) {
      var segEl = document.createElement('div');
      segEl.className = 'water-cursor';
      
      var lens = document.createElement('div');
      lens.className = 'water-cursor__lens';
      
      var sizeMultiplier = Math.pow(0.82, i);
      var baseOpacity = 1.0 * Math.pow(0.65, i);
      
      if (i > 0) {
        lens.style.transform = 'scale(' + sizeMultiplier.toFixed(3) + ')';
        segEl.style.opacity = '0';
        
        lens.style.boxShadow = 
          'inset 1px 1px 1.5px 0px rgba(255, 255, 255, 0.75), ' +
          'inset -1px -1px 2px 0px rgba(0, 0, 0, 0.05), ' +
          '0 0 0 0.6px rgba(255, 0, 80, 0.35), ' +
          '0 0 0 1.2px rgba(0, 220, 255, 0.35), ' +
          '0 0 0 0.3px rgba(36, 29, 21, 0.08), ' +
          '0 4px 10px -2px rgba(21, 15, 10, 0.12)';
      } else {
        var ripple = document.createElement('div');
        ripple.className = 'water-cursor__ripple';
        segEl.appendChild(ripple);
      }

      segEl.appendChild(lens);
      container.appendChild(segEl);

      segments.push({
        el: segEl,
        lens: lens,
        x: 0,
        y: 0,
        sizeMultiplier: sizeMultiplier,
        baseOpacity: baseOpacity,
        index: i
      });
    }

    document.addEventListener('mousedown', function(){
      segments[0].el.classList.add('is-clicking');
      var ripple = segments[0].el.querySelector('.water-cursor__ripple');
      if (ripple) {
        ripple.style.animation = 'none';
        void ripple.offsetHeight;
        ripple.style.animation = '';
      }
      for (var i = 1; i < segments.length; i++) {
        segments[i].el.classList.add('is-clicking');
      }
    });

    document.addEventListener('mouseup', function(){
      segments.forEach(function(seg) {
        seg.el.classList.remove('is-clicking');
      });
    });

    document.addEventListener('mouseover', function(e){
      var target = e.target;
      if(!target) return;
      var clickable = target.closest('a, button, [role="button"], .nav-brand, .liquid-nav__link');
      if(clickable){
        segments[0].el.classList.add('is-hovering');
      } else {
        segments[0].el.classList.remove('is-hovering');
      }
    });

    function tick(){
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        var targetX = (i === 0) ? mouseX : segments[i - 1].x;
        var targetY = (i === 0) ? mouseY : segments[i - 1].y;

        var delay = (i === 0) ? 0.09 : 0.28; 
        
        var dx = targetX - seg.x;
        var dy = targetY - seg.y;

        seg.x += dx * delay;
        seg.y += dy * delay;

        var velX = dx * delay;
        var velY = dy * delay;
        var speed = Math.sqrt(velX * velX + velY * velY);

        var angle = Math.atan2(dy, dx) * (180 / Math.PI);

        var maxStretch = (i === 0) ? 0.55 : 0.70;
        var stretchCoeff = (i === 0) ? 0.08 : 0.12;
        var stretch = Math.min(speed * stretchCoeff, maxStretch);
        
        var scaleX = seg.sizeMultiplier * (1 + stretch);
        var scaleY = seg.sizeMultiplier * (1 - (stretch * 0.45));

        var movementAlphaModifier = Math.max(0.4, 1 - (speed * 0.015));
        var finalOpacity = seg.baseOpacity * movementAlphaModifier;

        seg.el.style.opacity = hasMoved ? finalOpacity : '0';
        seg.el.style.transform = 'translate3d(' + seg.x.toFixed(2) + 'px, ' + seg.y.toFixed(2) + 'px, 0) rotate(' + angle.toFixed(1) + 'deg) scale(' + scaleX.toFixed(3) + ', ' + scaleY.toFixed(3) + ')';
      }

      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  })();

  // ---------- Implementing scroll tracking burn rail values ----------
  (function(){
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

    function moveIndicator(link, instant = false){
      if(!link) return;
      
      var targetLeft = link.offsetLeft;
      var targetRight = nav.offsetWidth - (link.offsetLeft + link.offsetWidth);

      if(instant) {
        indicator.style.transition = 'none';
        indicator.style.setProperty('--left', targetLeft + 'px');
        indicator.style.setProperty('--right', targetRight + 'px');
        indicator.offsetHeight;
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

    function moveDropdownIndicator(link, instant = false){
      if(!link) return;

      var targetTop = link.offsetTop;
      var targetBottom = dropdown.offsetHeight - (link.offsetTop + link.offsetHeight);

      if(instant) {
        dropdownIndicator.style.transition = 'none';
        dropdownIndicator.style.setProperty('--top', targetTop + 'px');
        dropdownIndicator.style.setProperty('--bottom', targetBottom + 'px');
        dropdownIndicator.offsetHeight;
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

    function initActiveIndicators(){
      var currentPath = window.location.pathname.split('/').pop();
      if(currentPath === "" || currentPath === "index.html") currentPath = "main.html";

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

    initActiveIndicators();

    // Interactive Scroll Navigation Links
    function handleAnchorClick(e, linkElement, index){
      var targetId = linkElement.getAttribute('href');
      
      // If it's a hash, handle internally
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        var targetSection = document.querySelector(targetId);
        if (targetSection) {
          syncActiveIndicators(index);
          
          // Let liquid menu snap shut if on mobile
          var burger = document.getElementById('navBurger');
          if(burger && burger.getAttribute('aria-expanded') === 'true') {
            burger.click();
          }

          window.scrollTo({
            top: targetSection.offsetTop - 60,
            behavior: 'smooth'
          });
        }
      }
      // If it's not a hash (i.e. 'main.html'), do not call preventDefault
    }

    links.forEach(function(link, i) {
      link.addEventListener('click', function(e) { handleAnchorClick(e, link, i); });
    });

    dropdownLinks.forEach(function(link, i) {
      link.addEventListener('click', function(e) { handleAnchorClick(e, link, i); });
    });

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
      void brand.offsetWidth;
      brand.classList.add('nav-brand--pulse');
      setTimeout(function(){ brand.classList.remove('nav-brand--pulse'); }, 500);
    });
  })();

  // ---------- Scroll-linked Morphing (Top Bar to Compact Liquid Nav) ----------
  (function(){
    var topBar = document.getElementById('topBar');
    var liquidNav = document.getElementById('liquidNav');
    if(!topBar || !liquidNav) return;
    
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
      
      nav.classList.toggle('on-light', !zone);
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

      closingTimeout = setTimeout(function(){
        dropdown.classList.remove('closing');
      }, 480);
    }

    burger.addEventListener('click', function(e){
      e.stopPropagation();
      var expanded = burger.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    document.addEventListener('click', function(e){
      if(!nav.contains(e.target) && !dropdown.contains(e.target)){
        closeDropdown();
      }
    });
  })();
