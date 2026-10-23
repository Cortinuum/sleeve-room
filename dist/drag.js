(() => {
  const grid = document.getElementById('grid');
  let gesture = null, frame = 0;
  function targetAt(x, y) {
    const slot = document.elementFromPoint(x, y)?.closest('#grid .slot');
    return slot && grid.contains(slot) ? slot : null;
  }
  function markTarget(x, y) {
    grid.querySelector('.drop-target')?.classList.remove('drop-target');
    const target = targetAt(x, y);
    if (target && Number(target.dataset.index) !== gesture.from) target.classList.add('drop-target');
  }
  function scroll() {
    if (!gesture?.active) return;
    const y = gesture.y;
    if (y < 60) window.scrollBy(0, -10);
    else if (y > window.innerHeight - 60) window.scrollBy(0, 10);
    markTarget(gesture.x, y);
    frame = requestAnimationFrame(scroll);
  }
  function cleanup() {
    if (!gesture) return;
    const id = gesture.id;
    gesture.ghost?.remove();
    gesture.source.classList.remove('drag-source');
    grid.querySelector('.drop-target')?.classList.remove('drop-target');
    document.body.classList.remove('dragging-cover');
    cancelAnimationFrame(frame);
    gesture = null;
    if (grid.hasPointerCapture(id)) grid.releasePointerCapture(id);
  }
  grid.addEventListener('pointerdown', event => {
    if (gesture || !event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
    const source = event.target.closest('.slot:not(.empty)');
    if (!source) return;
    gesture = {id:event.pointerId,from:Number(source.dataset.index),source,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,active:false};
    grid.setPointerCapture(event.pointerId);
  });
  grid.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    gesture.x = event.clientX; gesture.y = event.clientY;
    if (!gesture.active && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 6) return;
    event.preventDefault();
    if (!gesture.active) {
      gesture.active = true;
      const rect = gesture.source.getBoundingClientRect();
      const ghost = gesture.source.querySelector('img').cloneNode();
      ghost.className = 'cover-ghost'; ghost.alt = ''; ghost.setAttribute('aria-hidden','true');
      ghost.style.width = rect.width + 'px'; ghost.style.height = rect.height + 'px';
      document.body.append(ghost); gesture.ghost = ghost;
      gesture.source.classList.add('drag-source');
      document.body.classList.add('dragging-cover');
      frame = requestAnimationFrame(scroll);
    }
    gesture.ghost.style.left = event.clientX + 'px'; gesture.ghost.style.top = event.clientY + 'px';
    markTarget(event.clientX, event.clientY);
  });
  grid.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const from = gesture.from, target = gesture.active && targetAt(event.clientX,event.clientY);
    const to = target ? Number(target.dataset.index) : null;
    cleanup();
    if (to !== null && to !== from) window.sleeveRoom.move(from,to);
  });
  grid.addEventListener('pointercancel',cleanup);
  grid.addEventListener('lostpointercapture',cleanup);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') cleanup(); });
  window.addEventListener('blur',cleanup);
  // Keep native image dragging from intercepting pointer interactions.
  grid.addEventListener('dragstart',event=>event.preventDefault());
})();
