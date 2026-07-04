(function(){
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
