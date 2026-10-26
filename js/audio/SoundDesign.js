/* ==========================================================================
   Sound design — connects the page to the sounds in Soundscape.js.
   Everything here is silent until the visitor turns sound on.

   · Sections: the pad changes chord as each section reaches the middle of
     the screen (hero, solutions, work, process and studio together, contact; the footer keeps
     the contact chord). Case studies sit in the work chord, other pages in the hero's.
   · Hover (mouse only): links and buttons give a tiny high blip. Parts with
     their own notes (solution tiles, the diagram, the launch steps) are left
     to their own scripts.
   · Navigation links tap softly; the menu opens and closes with a breath of air.
   ========================================================================== */

import { audio } from './AudioController.js';
import { $, $$ } from '../core/dom.js';

const OWN_SOUNDS = '.sol, [data-cx], [data-journey], [data-steps], .intro, [data-sound-toggle]';

export function initSoundDesign() {
  scenes();
  hover();
  navigation();
}

function scenes() {
  const page = document.body.dataset.page;
  if (page !== 'home') { audio.scene(page === 'case' ? 'work' : 'top'); return; }
  const map = [['#top', 'top'], ['#solutions', 'solutions'], ['#work', 'work'], ['#process', 'studio'], ['#studio', 'studio'], ['#contact', 'contact'], ['.site-footer', 'contact']]
    .map(([sel, name]) => [$(sel), name]).filter(([node]) => node);
  if (!map.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const hit = map.find(([node]) => node === e.target);
    if (hit) audio.scene(hit[1]);
  }), { rootMargin: '-49% 0px -49% 0px', threshold: 0 });   // the section crossing the middle line
  map.forEach(([node]) => io.observe(node));
}

function hover() {
  let last = null, lastAt = 0;
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' || !audio.enabled) return;
    const target = e.target.closest('a[href], button, label.chip, [role="tab"]');
    if (!target || target === last) { if (!target) last = null; return; }
    last = target;
    if (target.closest(OWN_SOUNDS) || target.disabled) return;
    const now = performance.now();
    if (now - lastAt < 70) return;   // sweeping across a row of links stays a light patter
    lastAt = now;
    audio.play('hover');
  }, { passive: true });
}

function navigation() {
  $$('.primary-nav a, .menu__nav a, a[href="#top"], [data-start-project]').forEach((a) => {
    a.addEventListener('click', () => audio.play('tick', { freq: 987.77 }));
  });
  const menu = $('#menu'), openBtn = $('[data-menu-open]');
  if (menu && openBtn) {
    openBtn.addEventListener('click', () => audio.play('open'));
    menu.addEventListener('close', () => audio.play('close'));
  }
}
