/* Selected work (homepage). The project covers use the shared signal reveal (core/reveal.js).

   Casa Gelso. The four chips under the title are tabs for four real screens of the live site: Teaser, Brand reveal,
   Invitation and RSVP. When the phone first comes into view it steps once through the first three, slowly enough to
   read, and rests on the invitation; from then on it is the visitor's. The first touch of a chip stops the pass, and
   it never runs with reduced motion. Without the script the first screen stays and the chips are plain labels.

   JETOUR. The real intro film (muted, 16 s) plays only while it is on screen, and never by itself for visitors who
   ask for reduced motion or a data saver. It always has a Pause / Play button and a running time. */

import { $, $$, el, tablist } from '../core/dom.js';
import { motion } from '../core/motion.js';
import { audio } from '../audio/AudioController.js';

const PASS = [1, 2];                  // the Teaser is showing; the pass shows Brand reveal, then Invitation, and rests there
const PASS_FIRST = 1100, PASS_EVERY = 1300;   // milliseconds

export function initProjectShowcase() {
  $$('[data-stepper]').forEach(initStepper);
  $$('[data-reel]').forEach(initReel);
}

function initStepper(stage) {
  const list = $('[data-steps]', stage.closest('.case'));
  const panel = $('.screen', stage);
  const shots = $$('[data-step-img]', stage);
  const items = list ? $$('li', list) : [];
  if (!panel || !items.length || items.length !== shots.length) return;

  // The labels become tabs.
  list.setAttribute('role', 'tablist');
  const tabs = items.map((item, i) => {
    const tab = el('button', {
      type: 'button', role: 'tab', id: `${panel.id}-tab-${i}`, 'aria-selected': String(i === 0),
      'aria-controls': panel.id, tabindex: i === 0 ? '0' : '-1', text: item.textContent.trim()
    });
    item.setAttribute('role', 'presentation');
    item.replaceChildren(tab);
    return tab;
  });
  panel.setAttribute('role', 'tabpanel');
  panel.tabIndex = 0;
  panel.setAttribute('aria-labelledby', tabs[0].id);

  let byPass = false, touched = false, timers = [];
  const show = (i) => {
    shots.forEach((img, k) => {
      img.classList.toggle('is-on', k === i);
      if (k === i) img.removeAttribute('aria-hidden'); else img.setAttribute('aria-hidden', 'true');
    });
    panel.setAttribute('aria-labelledby', tabs[i].id);
    if (!byPass) audio.play('note', { step: i + 1, soft: true });   // the visitor's own choice, with sound on
  };
  const select = tablist(tabs, show);

  const stop = () => { touched = true; timers.forEach(clearTimeout); timers = []; };
  tabs.forEach((tab) => ['click', 'keydown', 'focus'].forEach((type) => tab.addEventListener(type, stop)));
  motion.onChange((reduced) => { if (reduced) stop(); });

  const pass = () => PASS.forEach((i, k) => timers.push(setTimeout(() => {
    if (touched) return;
    byPass = true; select(i); byPass = false;
  }, PASS_FIRST + k * PASS_EVERY)));
  if (motion.reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    if (!touched) pass();
  }, { threshold: 0.35 });
  io.observe(stage);
}

function initReel(root) {
  const video = $('video', root), toggle = $('[data-reel-toggle]', root), clock = $('[data-reel-time]', root);
  if (!video || !toggle || typeof video.play !== 'function') return;
  toggle.hidden = false;

  const saver = !!(navigator.connection && navigator.connection.saveData);
  let wanted = !motion.reduced && !saver;      // what the visitor wants; scrolling away only pauses
  let visible = false;

  const playing = () => !video.paused && !video.ended;
  const label = () => { toggle.textContent = playing() ? 'Pause film' : 'Play film'; root.classList.toggle('is-playing', playing()); };
  const play = () => {
    const started = video.play();
    if (started && typeof started.catch === 'function') {
      started.catch((error) => {
        // Scrolling away while the film is still loading pauses it and cancels the start: the visitor has not said no.
        if (error && error.name === 'AbortError') return;
        wanted = false; label();
      });
    }
  };
  const update = () => {
    if (visible && wanted && !document.hidden) { if (video.paused) play(); }
    else if (!video.paused) video.pause();
  };
  const time = (s) => `0:${String(Math.max(0, Math.floor(s))).padStart(2, '0')}`;
  let shown = -1;
  const tick = () => {
    const s = Math.floor(video.currentTime);
    if (s === shown || !clock) return;
    shown = s;
    clock.textContent = `${time(s)} / ${time(Number.isFinite(video.duration) ? Math.round(video.duration) : 16)}`;
  };

  toggle.addEventListener('click', () => {
    wanted = !playing();
    if (wanted) play(); else video.pause();
  });
  ['play', 'pause', 'ended'].forEach((type) => video.addEventListener(type, label));
  video.addEventListener('timeupdate', tick);
  document.addEventListener('visibilitychange', update);
  motion.onChange((reduced) => { if (reduced) { wanted = false; update(); } });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.35 }).observe(video);
  } else {
    visible = true; update();
  }
  label();
}
