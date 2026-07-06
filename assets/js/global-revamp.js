
/* ---------- CURSOR JS ---------- */
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
      
      segEl.appendChild(lens);
      container.appendChild(segEl);

      segments.push({el: segEl, lens: lens, x: 0, y: 0, sizeMultiplier: sizeMultiplier, baseOpacity: baseOpacity, index: i});
    }

    function tick(){
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        var targetX = (i === 0) ? mouseX : segments[i - 1].x;
        var targetY = (i === 0) ? mouseY : segments[i - 1].y;
        var delay = (i === 0) ? 0.09 : 0.28; 
        
        seg.x += (targetX - seg.x) * delay;
        seg.y += (targetY - seg.y) * delay;

        seg.el.style.opacity = hasMoved ? seg.baseOpacity : '0';
        seg.el.style.transform = 'translate3d(' + seg.x.toFixed(2) + 'px, ' + seg.y.toFixed(2) + 'px, 0) scale(' + seg.sizeMultiplier.toFixed(3) + ')';
      }
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
})();

/* ---------- NAV JS (Load state) ---------- */
(function(){
    // Immediately set to compact state
    var nav = document.getElementById('liquidNav');
    if(nav) {
        nav.style.setProperty('--nav-opacity', '1');
        nav.style.setProperty('--nav-y', '0px');
        nav.style.setProperty('--nav-scale', '1');
    }
})();
