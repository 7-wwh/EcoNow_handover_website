/* [Paste ALL JS from the block provided in the user's last message] */
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

(function(){
  var nav = document.getElementById('liquidNav');
  var indicator = document.getElementById('navIndicator');
  var dropdown = document.getElementById('navDropdown');
  var dropdownIndicator = document.getElementById('dropdownIndicator');
  if(!nav || !indicator || !dropdown || !dropdownIndicator) return;

  var links = Array.prototype.slice.call(nav.querySelectorAll('.liquid-nav__link'));
  var dropdownLinks = Array.prototype.slice.call(dropdown.querySelectorAll('.nav-dropdown__link'));
  var activeLink = links[0];
  var activeDropdownLink = dropdownLinks[0];
  
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

  function syncActiveIndicators(index, instant = false){
    links.forEach(function(l, i){
      if(i === index){
        l.classList.add('active');
        activeLink = l;
        moveIndicator(l, instant);
      } else {
        l.classList.remove('active');
      }
    });

    dropdownLinks.forEach(function(dl, i){
      if(i === index){
        dl.classList.add('active');
        activeDropdownLink = dl;
        moveDropdownIndicator(dl, instant);
      } else {
        dl.classList.remove('active');
      }
    });
  }

  syncActiveIndicators(0, true);

  function handleAnchorClick(e, linkElement, index){
    e.preventDefault();
    var targetId = linkElement.getAttribute('href');
    var targetSection = document.querySelector(targetId);
    if (targetSection) {
      syncActiveIndicators(index);
      
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

  links.forEach(function(link, i) {
    link.addEventListener('click', function(e) { handleAnchorClick(e, link, i); });
  });

  dropdownLinks.forEach(function(link, i) {
    link.addEventListener('click', function(e) { handleAnchorClick(e, link, i); });
  });

  var sections = document.querySelectorAll('section');
  function updateActiveOnScroll(){
    var scrollPos = window.scrollY || document.documentElement.scrollTop;
    sections.forEach(function(section, index){
      var top = section.offsetTop - 150;
      var bottom = top + section.offsetHeight;
      if(scrollPos >= top && scrollPos < bottom){
        var id = section.getAttribute('id');
        if(activeLink && activeLink.getAttribute('href') !== '#' + id){
          syncActiveIndicators(index);
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveOnScroll, {passive:true});
  window.addEventListener('resize', function(){ 
    if(activeLink) moveIndicator(activeLink, true);
    if(activeDropdownLink) moveDropdownIndicator(activeDropdownLink, true);
  });

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ 
      if(activeLink) moveIndicator(activeLink, true);
      if(activeDropdownLink) moveDropdownIndicator(activeDropdownLink, true);
    });
  }

  if(window.ResizeObserver){
    var ro = new ResizeObserver(function(){ 
      if(activeLink) moveIndicator(activeLink, true);
      if(activeDropdownLink) moveDropdownIndicator(activeDropdownLink, true);
    });
    ro.observe(nav);
    ro.observe(dropdown);
  }
})();

(function(){
  var brand = document.getElementById('navBrand');
  if(!brand) return;

  brand.addEventListener('click', function(e){
    e.preventDefault();
    brand.classList.remove('nav-brand--pulse');
    void brand.offsetWidth;
    brand.classList.add('nav-brand--pulse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function(){ brand.classList.remove('nav-brand--pulse'); }, 500);
  });
})();

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
