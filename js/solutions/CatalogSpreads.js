/* ==========================================================================
   Catalog spreads: the motion of the 004 You're Invited catalog (markup: catalog.js › renderSpread,
   look: catalog.css › Spreads).

   Reveal  When a spread scrolls into view its plate is drawn from the top down, the screens rise into
           it (the middle one first), and the name and the words follow. It plays once per spread.
   Drift   With a mouse, the screens move a little against the pointer, each at its own depth, and settle
           back when it leaves. Keyboard focus on the live link lifts them gently instead.

   Both need GSAP and are skipped for people who prefer reduced motion. The markup is complete without
   them, so nothing here can hide content: the hidden start state is only set once the script is ready
   to play it, and it is cleared again when the reveal ends.
   ========================================================================== */

import { getGsap, motion } from '../core/motion.js';
import { $, $$ } from '../core/dom.js';

const EASE = 'power3.out';

export function initCatalogSpreads(root = document) {
  const rows = $$('[data-spread]', root);
  const gsap = rows.length ? getGsap() : null;
  if (!gsap) return;   // no spreads, or the library did not load: they stay exactly as written
  rows.forEach((row) => {
    const parts = {
      plate: $('.spread__plate', row),
      screens: $$('.spread__screen', row),
      glides: $$('.spread__glide', row),
      title: $('.spread__title-in', row),
      words: $$('.spread__num, .spread__text, .spread__tags, .spread__facts, .spread__go, .spread__caption', row)
    };
    if (!parts.plate || !parts.screens.length) return;
    reveal(row, parts, gsap);
    drift(row, parts, gsap);
  });
}

/* ── Reveal, once ───────────────────────────────────────────────────── */
function reveal(row, p, gsap) {
  if (motion.reduced || !('IntersectionObserver' in window)) return;
  // Only what the reveal set is cleared afterwards: the plate keeps its colour, which sits in its style attribute.
  const clear = () => {
    gsap.set(p.plate, { clearProps: 'clipPath' });
    gsap.set(p.screens, { clearProps: 'opacity,transform' });
    if (p.title) gsap.set(p.title, { clearProps: 'transform' });
    gsap.set(p.words, { clearProps: 'opacity,transform' });
  };
  gsap.set(p.plate, { clipPath: 'inset(0% 0% 100% 0%)' });
  gsap.set(p.screens, { opacity: 0, yPercent: 7 });
  if (p.title) gsap.set(p.title, { yPercent: 110 });
  gsap.set(p.words, { opacity: 0, y: 16 });

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    if (motion.reduced) { clear(); return; }   // asked for less motion since the page loaded
    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: EASE }, onComplete: clear });
    tl.to(p.plate, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' }, 0)
      .to(p.screens, { opacity: 1, yPercent: 0, duration: 1, stagger: { each: 0.14, from: 'center' } }, 0.25);
    if (p.title) tl.to(p.title, { yPercent: 0, duration: 0.9 }, 0.15);
    tl.to(p.words, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.3);
  }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
  io.observe(row);
}

/* ── Drift, for a mouse; a lift for the keyboard ────────────────────── */
function drift(row, p, gsap) {
  if (!p.glides.length) return;
  const lead = p.glides.length === 3 ? 1 : 0;   // the largest screen moves the most
  const moves = p.glides.map((g, i) => ({
    x: gsap.quickTo(g, 'x', { duration: 0.9, ease: EASE }),
    y: gsap.quickTo(g, 'y', { duration: 0.9, ease: EASE }),
    k: i === lead ? 1 : 0.5
  }));
  const settle = () => moves.forEach((m) => { m.x(0); m.y(0); });

  p.plate.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || motion.reduced) return;
    const r = p.plate.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
    moves.forEach((m) => { m.x(-nx * 28 * m.k); m.y(-ny * 18 * m.k); });
  });
  p.plate.addEventListener('pointerleave', settle);

  row.addEventListener('focusin', (e) => {
    if (motion.reduced || !e.target.matches(':focus-visible')) return;
    moves.forEach((m) => { m.x(0); m.y(-10 * m.k); });
  });
  row.addEventListener('focusout', settle);
}
