(function(){
  // Navigation Toggle
  const burger = document.querySelector('.burger-menu');
  const navLinks = document.querySelector('.nav-links');
  
  if(burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Theme Switcher Logic
  const switcher = document.querySelector('.switcher');
  if(switcher) {
    const trackPrevious = (el) => {
      const radios = el.querySelectorAll('input[type="radio"]');
      let previousValue = null;

      const initiallyChecked = el.querySelector('input[type="radio"]:checked');
      if (initiallyChecked) {
        previousValue = initiallyChecked.getAttribute("c-option");
        el.setAttribute('c-previous', previousValue);
      }

      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          if (radio.checked) {
            el.setAttribute('c-previous', previousValue ?? '');
            previousValue = radio.getAttribute("c-option");
          }
        });
      });
    }
    trackPrevious(switcher);
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
