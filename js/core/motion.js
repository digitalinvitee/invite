/* Motion helpers: reduced-motion state (live), and safe access to GSAP. */

const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
let reduced = !!(mq && mq.matches);
const listeners = new Set();
if (mq) {
  const update = (e) => { reduced = e.matches; listeners.forEach((fn) => fn(reduced)); };
  if (mq.addEventListener) mq.addEventListener('change', update); else if (mq.addListener) mq.addListener(update);
}

export const motion = {
  get reduced() { return reduced; },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
};

export function getGsap() {
  const g = window.gsap;
  if (!g) return null;
  if (window.ScrollTrigger && !getGsap.registered) { g.registerPlugin(window.ScrollTrigger); getGsap.registered = true; }
  return g;
}

export const hasScrollTrigger = () => !!(getGsap() && window.ScrollTrigger);

/* rAF loop that pauses when the tab is hidden. */
export function rafLoop(tick) {
  let id = 0, last = performance.now(), running = false;
  const frame = (now) => {
    id = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    tick(now / 1000, dt);
  };
  const onVisibility = () => {
    if (document.hidden && running) { cancelAnimationFrame(id); }
    else if (!document.hidden && running) { cancelAnimationFrame(id); last = performance.now(); id = requestAnimationFrame(frame); }
  };
  document.addEventListener('visibilitychange', onVisibility);
  return {
    start() { if (running) return; running = true; last = performance.now(); id = requestAnimationFrame(frame); },
    stop() { running = false; cancelAnimationFrame(id); },
    destroy() { running = false; cancelAnimationFrame(id); document.removeEventListener('visibilitychange', onVisibility); },
    get running() { return running; }
  };
}
