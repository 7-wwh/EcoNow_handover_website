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

    // Update Contrast on the Glass Scroll Progress Capillary Rail
    var burnRail = document.getElementById('burnRail');
    if(burnRail) burnRail.classList.toggle('on-light', !zone);
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
