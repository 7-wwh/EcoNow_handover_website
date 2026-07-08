(function(){
  var brand = document.getElementById('navBrand');
  if(!brand) return;

  brand.addEventListener('click', function(e){
    e.preventDefault();
    brand.classList.remove('nav-brand--pulse');
    void brand.offsetWidth; // Force Reflow
    brand.classList.add('nav-brand--pulse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function(){ brand.classList.remove('nav-brand--pulse'); }, 500);
  });
})();
