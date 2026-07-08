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

  // Set layout positions initially
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

  // Initialize state
  var currentPath = window.location.pathname.split('/').pop() || 'main.html';
  var initialIndex = 0;
  links.forEach(function(l, i) {
    if (l.getAttribute('href') === currentPath) {
      initialIndex = i;
    }
  });
  syncActiveIndicators(initialIndex, true);

  // Interactive Scroll Navigation Links
  function handleAnchorClick(e, linkElement, index){
    e.preventDefault();
    var targetId = linkElement.getAttribute('href');
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

  links.forEach(function(link, i) {
    link.addEventListener('click', function(e) { handleAnchorClick(e, link, i); });
  });

  dropdownLinks.forEach(function(link, i) {
    link.addEventListener('click', function(e) { handleAnchorClick(e, link, i); });
  });

  // Scroll active tracking logic
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
