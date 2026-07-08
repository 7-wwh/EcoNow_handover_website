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
