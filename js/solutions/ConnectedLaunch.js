/* ==========================================================================
   Our signature: the connected launch. Five stages as tabs on one line;
   the lit line runs to the selected stage. Makes one gentle pass through the
   stages while in view, then rests; the visitor can take over at any point
   (never advances with reduced motion).
   ========================================================================== */

import { $, $$, tablist } from '../core/dom.js';
import { strings } from '../i18n/index.js';
import { audio } from '../audio/AudioController.js';
import { motion } from '../core/motion.js';

export function initConnectedLaunch() {
  const journey = $('[data-journey]');
  if (!journey) return;
  const steps = $$('.journey__step', journey);
  const fill = $('[data-journey-fill]', journey);
  const panel = $('#journey-panel');
  const when = $('[data-journey-when]', journey);
  const title = $('[data-journey-title]', journey);
  const text = $('[data-journey-text]', journey);
  const more = $('[data-journey-more]', journey), moreLabel = $('[data-journey-more-label]', journey);
  const data = strings.journey;
  let touched = false, timer = 0, current = 0;

  // The lit line runs to the centre of the selected step's dot, measured, so it stays exact at any width.
  const placeFill = () => {
    const dot = $('.journey__dot', steps[current]);
    fill.style.width = `${steps[current].offsetLeft + dot.offsetLeft + dot.offsetWidth / 2}px`;
  };
  const write = (item) => {
    when.textContent = item.when; title.textContent = item.title; text.textContent = item.text;
    if (more) { more.hidden = !item.more; if (item.more) moreLabel.textContent = item.more; }   // Invitation and RSVP point to service 004
  };
  // The panel keeps the height of its tallest stage, so choosing a stage never moves what is below it.
  const reserve = () => {
    panel.style.minHeight = '';
    let tallest = 0;
    data.forEach((item) => { write(item); tallest = Math.max(tallest, panel.offsetHeight); });
    write(data[current]);
    panel.style.minHeight = `${tallest}px`;
  };
  const show = (i) => {
    write(data[i]);
    panel.setAttribute('aria-labelledby', steps[i].id);
    steps.forEach((s, n) => s.classList.toggle('is-past', n < i));
    current = i;
    placeFill();
  };
  let resizing = 0;
  addEventListener('resize', () => { placeFill(); cancelAnimationFrame(resizing); resizing = requestAnimationFrame(reserve); }, { passive: true });
  const select = tablist(steps, (i) => show(i));
  // While the story advances by itself the panel is not announced (it would be read out every few seconds);
  // from the moment the visitor takes over it announces their own choices again.
  const rest = () => { clearInterval(timer); panel.setAttribute('aria-live', 'polite'); };
  const takeOver = () => { touched = true; rest(); };
  steps.forEach((s, i) => s.addEventListener('click', () => { takeOver(); audio.play('select', { step: i }); }));
  steps.forEach((s) => s.addEventListener('keydown', takeOver));
  journey.addEventListener('focusin', takeOver);
  show(0);
  reserve();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { reserve(); placeFill(); });

  if ('IntersectionObserver' in window && !motion.reduced) {
    // One gentle pass from the first stage to the last, while it is in view, then it rests. It holds still while a
    // mouse rests on it, and stops for good as soon as the visitor clicks, presses a key or moves focus into it.
    let i = 0, hovering = false;
    journey.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
    journey.addEventListener('pointerleave', () => { hovering = false; });
    new IntersectionObserver(([entry]) => {
      rest();
      if (!entry.isIntersecting || touched || i >= steps.length - 1) return;
      panel.setAttribute('aria-live', 'off');
      timer = setInterval(() => {
        if (touched || motion.reduced) { rest(); return; }
        if (hovering) return;
        i += 1;
        select(i);
        if (i >= steps.length - 1) rest();
      }, 3600);
    }, { threshold: 0.5 }).observe(journey);
  }
}
