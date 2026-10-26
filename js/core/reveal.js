/* Signature "signal reveal": elements marked .sr lock in through scanline slices the
   first time they enter the viewport. Content is never hidden unless this module runs,
   and reduced-motion visitors simply see it. */

import { motion } from './motion.js';

export function initSignalReveal(root = document) {
  const items = Array.from(root.querySelectorAll('.sr'));
  if (!items.length || motion.reduced || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('sr-ready');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      el.classList.add('is-in');
      const done = () => el.classList.add('is-done');
      el.addEventListener('animationend', done, { once: true });
      setTimeout(done, 2200);   // in case animationend never fires (hidden tab)
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
}
