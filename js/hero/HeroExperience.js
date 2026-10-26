/* Hero: calm after the storm. The headline arrives through the signal once the
   intro hands over; Fig. 01, the connected experience, sits to the side. */

import { initConnectedDiagram } from './ConnectedDiagram.js';
import { motion } from '../core/motion.js';
import { $ } from '../core/dom.js';

export function initHero() {
  const hero = $('.hero');
  if (!hero) return;
  const title = $('[data-hero-title]', hero);

  // Headline: a signal reveal only when arriving from the intro (never delays first paint otherwise).
  const fromIntro = ['full', 'short', 'classic'].includes(document.documentElement.dataset.intro);
  const revealTitle = () => {
    if (!title || motion.reduced) return;
    title.classList.add('sr');
    document.documentElement.classList.add('sr-ready');
    requestAnimationFrame(() => {
      title.classList.add('is-in');
      title.addEventListener('animationend', () => title.classList.add('is-done'), { once: true });
    });
  };
  if (fromIntro) window.addEventListener('intro:done', revealTitle, { once: true });

  initConnectedDiagram();
}
