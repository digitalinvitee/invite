/* Case study pages.
   · Story scenes: as each step of the guest journey crosses the middle of the viewport,
     the sticky browser frame switches to that step's real screenshot.
   · Film (JETOUR): plays muted only while it is on screen and never starts by itself for
     reduced-motion visitors. The three figures light up at the cue times the live site uses.
   Without JavaScript the page is still complete: every step shows its own screenshot inline. */

import { $, $$ } from '../core/dom.js';
import { motion } from '../core/motion.js';

export function initCaseStudy() {
  $$('[data-scenes]').forEach(initScenes);
  $$('[data-film]').forEach(initFilm);
  initScrollHints();
}

/* "Scroll sideways" only shows when a row actually overflows at the current width. */
function initScrollHints() {
  const pairs = $$('[data-scroll-hint]').map((hint) => [hint, $('.scroller', hint.closest('.case-block'))]).filter(([, row]) => row);
  if (!pairs.length) return;
  const check = () => pairs.forEach(([hint, row]) => { hint.hidden = row.scrollWidth <= row.clientWidth + 2; });
  check();
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(check); pairs.forEach(([, row]) => ro.observe(row)); }
  else addEventListener('resize', check, { passive: true });
}

function initScenes(root) {
  const steps = $$('[data-scene-step]', root);
  const view = $('[data-scene-frame]', root);
  if (!steps.length || !view) return;
  const shots = new Map($$('img[data-shot]', view).map((img) => [img.dataset.shot, img]));
  let current = null;

  const activate = (step, animate = true) => {
    if (step === current) return;
    current = step;
    steps.forEach((s) => s.classList.toggle('is-active', s === step));
    const img = shots.get(step.dataset.sceneStep);
    if (!img) return;
    shots.forEach((i) => i.classList.toggle('is-active', i === img));
    if (!animate || motion.reduced) return;
    view.classList.remove('is-switching');
    void view.offsetWidth;            // restart the switch animation
    view.classList.add('is-switching');
  };

  activate(steps[0], false);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) activate(e.target); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => io.observe(s));
}

function initFilm(root) {
  const video = $('video', root);
  const toggle = $('[data-film-toggle]', root);
  if (!video || !toggle) return;
  const cues = $$('[data-cue]', root).map((el) => ({
    el, start: Number(el.dataset.cueStart), end: Number(el.dataset.cueEnd),
    overlay: $(`[data-overlay="${el.dataset.cue}"]`, root)
  }));

  let wanted = !motion.reduced;       // the visitor's intent; scrolling away only pauses
  let visible = false;

  const playing = () => !video.paused && !video.ended;
  const label = () => {
    toggle.textContent = playing() ? 'Pause film' : 'Play film';
    root.classList.toggle('is-playing', playing());
  };
  const play = () => {
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => { wanted = false; label(); });
  };
  const sync = () => {
    const t = video.currentTime;
    cues.forEach((c) => {
      const on = t >= c.start && t < c.end;
      c.el.classList.toggle('is-active', on);
      if (c.overlay) c.overlay.classList.toggle('is-on', on);
    });
  };
  const update = () => {
    if (visible && wanted && !document.hidden) { if (video.paused) play(); }
    else if (!video.paused) video.pause();
  };

  toggle.addEventListener('click', () => {
    wanted = !playing();
    if (wanted) play(); else video.pause();
  });
  ['play', 'pause', 'ended'].forEach((type) => video.addEventListener(type, label));
  video.addEventListener('timeupdate', sync);
  video.addEventListener('seeked', sync);
  document.addEventListener('visibilitychange', update);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.35 }).observe(video);
  } else {
    visible = true; update();
  }
  label();
}
