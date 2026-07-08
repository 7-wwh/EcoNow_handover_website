(function(){
  // Ensure the client has mouse hover precision support before loading cursor elements
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;

  var mouseX = 0, mouseY = 0;
  var hasMoved = false;

  window.addEventListener('mousemove', function(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
    if(!hasMoved){
      hasMoved = true;
      // Make all trail segments visible once initialized
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

  // Create a 10-bead fluid trail array
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
    
    // Calculate progressive sizing and base opacity multipliers
    var sizeMultiplier = Math.pow(0.82, i);
    var baseOpacity = 1.0 * Math.pow(0.65, i); // High transparency fade-off on tail
    
    if (i > 0) {
      lens.style.transform = 'scale(' + sizeMultiplier.toFixed(3) + ')';
      segEl.style.opacity = '0';
      
      // Tail segment glass overrides with increased contrast chromatic aberration and edge boundaries
      lens.style.boxShadow = 
        'inset 1px 1px 1.5px 0px rgba(255, 255, 255, 0.75), ' +
        'inset -1px -1px 2px 0px rgba(0, 0, 0, 0.05), ' +
        '0 0 0 0.6px rgba(255, 0, 80, 0.35), ' +
        '0 0 0 1.2px rgba(0, 220, 255, 0.35), ' +
        '0 0 0 0.3px rgba(36, 29, 21, 0.08), ' +
        '0 4px 10px -2px rgba(21, 15, 10, 0.12)';
    } else {
      // Head segment contains splash ripple markup
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

  // Handle physical tap down/up squash across the entire chain
  document.addEventListener('mousedown', function(){
    segments[0].el.classList.add('is-clicking');
    var ripple = segments[0].el.querySelector('.water-cursor__ripple');
    if (ripple) {
      ripple.style.animation = 'none';
      void ripple.offsetHeight; // Reflow reset
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

  // Detect clickables to expand target absorption (hover swelling)
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

  // Lag and trail physics cycle
  function tick(){
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var targetX = (i === 0) ? mouseX : segments[i - 1].x;
      var targetY = (i === 0) ? mouseY : segments[i - 1].y;

      // Custom organic lagging factors (delay coefficients)
      var delay = (i === 0) ? 0.09 : 0.28; 
      
      var dx = targetX - seg.x;
      var dy = targetY - seg.y;

      seg.x += dx * delay;
      seg.y += dy * delay;

      var velX = dx * delay;
      var velY = dy * delay;
      var speed = Math.sqrt(velX * velX + velY * velY);

      var angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Highly elastic stretching factors to achieve a "longer trail" visual
      var maxStretch = (i === 0) ? 0.55 : 0.70;
      var stretchCoeff = (i === 0) ? 0.08 : 0.12;
      var stretch = Math.min(speed * stretchCoeff, maxStretch);
      
      var scaleX = seg.sizeMultiplier * (1 + stretch);
      var scaleY = seg.sizeMultiplier * (1 - (stretch * 0.45));

      // Dynamically fade out trailing beads during fast, sweeping gestures
      var movementAlphaModifier = Math.max(0.4, 1 - (speed * 0.015));
      var finalOpacity = seg.baseOpacity * movementAlphaModifier;

      seg.el.style.opacity = hasMoved ? finalOpacity : '0';
      seg.el.style.transform = 'translate3d(' + seg.x.toFixed(2) + 'px, ' + seg.y.toFixed(2) + 'px, 0) rotate(' + angle.toFixed(1) + 'deg) scale(' + scaleX.toFixed(3) + ', ' + scaleY.toFixed(3) + ')';
    }

    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
})();
