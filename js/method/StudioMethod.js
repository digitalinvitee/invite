/* ==========================================================================
   How we work: the four stages as one interactive composition
   (markup: index.html › #process, look: css/home.css › How we work).

   The markup is a plain numbered list. This script turns it into tabs: a rail with the four stage names, one large
   panel under it, and the stage number set as type. A click, a tap or the arrow keys, Home and End change the
   stage (the same tab behaviour as the contact form, js/core/dom.js › tablist).

   Motion (GSAP, never looping)
     Arrival   When the section scrolls into view, once: the label, the headline and the lead come in, the line of
               light is drawn along the rail, the stage names follow one by one, and the first stage opens.
     Hand-over When the stage changes, the line of light runs to the new stage, the number rolls, the old text
               leaves and the new text rises into place. Going back reverses the direction.

   Reduced motion: the same tabs, switching at once. Without GSAP: the same, with a CSS transition on the line and
   the number. Without this script: every stage is listed and fully visible. The hidden start state of the arrival is
   only set once everything is ready to play it, and it is cleared when it ends.

   Phones (under 40em): no tabs. The list stays as it is and is styled as one vertical sequence, so every stage is
   visible at once and there is no arrival to play. The choice is made when the page loads.
   ========================================================================== */

import { $, $$, el, tablist } from '../core/dom.js';
import { motion, getGsap } from '../core/motion.js';
import { audio } from '../audio/AudioController.js';

const NS = 'process';

export function initStudioMethod() {
  const list = $('[data-method]');
  const root = list && list.closest('.method');
  const section = root && root.closest('section');
  const stages = list ? $$('.stage', list) : [];
  if (!root || !section || stages.length < 2) return;
  // On a phone the four stages stay the plain list: one vertical sequence with every stage open (css/home.css), so the
  // whole path can be read without a tap and nothing has to move. The tabs are built from the tablet width up.
  if (window.matchMedia && window.matchMedia('(max-width: 39.99em)').matches) return;
  const gsap = getGsap();
  const last = stages.length - 1;
  const parts = (stage) => ({ name: $('.stage__name-in', stage), text: $('.stage__text', stage), out: $('.stage__out', stage) });

  /* ── Build the tabs, the number and the panels ──────────────────────── */
  const line = el('span', { class: 'method__line', 'aria-hidden': 'true' });
  const fill = el('span', { class: 'method__fill', 'aria-hidden': 'true' });
  const tabs = stages.map((stage, i) => {
    const num = ($('.stage__num', stage) || {}).textContent || String(i + 1).padStart(2, '0');
    const name = ($('.stage__name', stage).textContent || '').replace(/\s+/g, ' ').trim();
    stage.id = `${NS}-stage-${i + 1}`;
    stage.setAttribute('role', 'tabpanel');
    stage.setAttribute('aria-labelledby', `${NS}-tab-${i + 1}`);
    stage.inert = i !== 0;
    if (i === 0) stage.tabIndex = 0;
    const n = $('.stage__num', stage);
    if (n) n.setAttribute('aria-hidden', 'true');
    return el('button', {
      class: 'method__tab', type: 'button', role: 'tab', id: `${NS}-tab-${i + 1}`,
      'aria-controls': stage.id, 'aria-selected': String(i === 0), tabindex: i === 0 ? '0' : '-1'
    }, [el('span', { class: 'method__tab-num', text: num.trim() }), ' ', el('span', { class: 'method__tab-name', text: name })]);
  });
  const rail = el('div', { class: 'method__rail', role: 'tablist', 'aria-label': 'The four stages' }, [line, fill, ...tabs]);

  const digits = el('span', { class: 'method__digits' }, stages.map((_, i) => el('span', { text: String(i + 1) })));
  const figure = el('span', { class: 'method__figure' }, [el('span', { class: 'method__zero', text: '0' }), el('span', { class: 'method__window' }, [digits])]);
  const numeral = el('div', { class: 'method__numeral', 'aria-hidden': 'true' }, [figure]);

  list.setAttribute('role', 'none');   // the stages are panels now, not list items
  root.insertBefore(rail, list);
  root.insertBefore(numeral, list);
  stages[0].classList.add('is-active');
  tabs[0].classList.remove('is-past');
  root.style.setProperty('--i', '0');
  if (gsap) root.classList.add('is-gsap');
  root.classList.add('is-tabs');

  /* ── Changing stage ─────────────────────────────────────────────────── */
  let current = 0;
  let handOver = null;   // the hand-over in flight, if any
  let arrival = null;    // the arrival in flight, if any
  const finish = () => { if (arrival) arrival.progress(1); if (handOver) handOver.progress(1); };

  const show = (next) => {
    if (next === current) return;
    finish();
    const prev = current;
    current = next;
    tabs.forEach((tab, k) => tab.classList.toggle('is-past', k < next));
    const from = stages[prev], to = stages[next];
    from.inert = true; from.removeAttribute('tabindex');
    to.inert = false; to.tabIndex = 0;
    from.classList.remove('is-active');
    to.classList.add('is-active');

    if (!gsap || motion.reduced) { root.style.setProperty('--i', String(next)); return; }

    const dir = next > prev ? 1 : -1;
    const a = parts(from), b = parts(to);
    const clear = (p) => gsap.set([p.name, p.text, p.out], { clearProps: 'transform,opacity,--draw' });
    from.classList.add('is-leaving');
    gsap.to(root, { '--i': next, duration: 0.95, ease: 'power3.inOut', overwrite: 'auto' });
    handOver = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { from.classList.remove('is-leaving'); clear(a); clear(b); handOver = null; }
    });
    handOver
      .to(a.name, { yPercent: -110 * dir, duration: 0.45, ease: 'power3.in' }, 0)
      .to([a.text, a.out], { opacity: 0, y: -12 * dir, duration: 0.3, ease: 'power2.in', stagger: 0.04 }, 0)
      .fromTo(b.name, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9 }, 0.26)
      .fromTo(b.text, { opacity: 0, y: 16 * dir }, { opacity: 1, y: 0, duration: 0.8 }, 0.4)
      .fromTo(b.out, { opacity: 0, y: 16 * dir, '--draw': 0 }, { opacity: 1, y: 0, '--draw': 1, duration: 0.9 }, 0.52);
  };

  tablist(tabs, (i) => {
    if (i !== current) { try { audio.play('select', { step: i }); } catch (e) { /* sound is an extra */ } }
    show(i);
  });
  motion.onChange((reduced) => { if (reduced) finish(); });

  /* ── Arrival, once ──────────────────────────────────────────────────── */
  if (!gsap || motion.reduced || !('IntersectionObserver' in window)) return;
  const head = $('.section-head', section);
  const label = head && $('.section-id', head);
  const title = head && $('.section-head__title', head);
  const lead = head && $('.section-head__aside', head);
  let titleIn = null;
  if (title) {   // the headline rises out of a mask, as one block
    titleIn = el('span', { class: 'mask__in' });
    while (title.firstChild) titleIn.append(title.firstChild);
    title.append(el('span', { class: 'mask' }, [titleIn]));
  }
  const first = parts(stages[0]);
  const headItems = [label, lead].filter(Boolean);
  const railItems = [line, ...tabs, figure, first.name, first.text, first.out];
  const resting = 'transform,opacity,--draw';
  const clearAll = () => gsap.set([...headItems, titleIn, ...railItems].filter(Boolean), { clearProps: resting });

  gsap.set(headItems, { opacity: 0, y: 12 });
  if (titleIn) gsap.set(titleIn, { yPercent: 110 });
  gsap.set(line, { scaleX: 0 });
  gsap.set(tabs, { opacity: 0, y: 12 });
  gsap.set(figure, { yPercent: 108 });
  gsap.set(first.name, { yPercent: 110 });
  gsap.set([first.text, first.out], { opacity: 0, y: 16 });
  gsap.set(first.out, { '--draw': 0 });
  root.style.setProperty('--i', '-1');

  const onceVisible = (node, play) => {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      play();
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    io.observe(node);
  };
  let pending = 2;   // the head and the composition each play when they are seen; when both have, the leftovers are cleared
  const done = () => { if (--pending === 0) { clearAll(); root.style.setProperty('--i', String(current)); } };

  if (head) {
    onceVisible(head, () => {
      if (motion.reduced) { gsap.set([...headItems, titleIn].filter(Boolean), { clearProps: resting }); done(); return; }
      gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: done })
        .to(label, { opacity: 1, y: 0, duration: 0.7 }, 0)
        .to(titleIn, { yPercent: 0, duration: 1 }, 0.08)
        .to(lead, { opacity: 1, y: 0, duration: 0.8 }, 0.32);
    });
  } else done();

  onceVisible(root, () => {
    if (motion.reduced) { clearAll(); root.style.setProperty('--i', String(current)); arrival = null; done(); return; }
    const target = current;   // the visitor may already have chosen another stage by keyboard
    arrival = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { arrival = null; done(); } })
      .to(line, { scaleX: 1, duration: 1, ease: 'power3.inOut' }, 0)
      .to(tabs, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 }, 0.15)
      .to(root, { '--i': target, duration: 1.1, ease: 'power3.inOut' }, 0.3)
      .to(figure, { yPercent: 0, duration: 1 }, 0.35)
      .to(first.name, { yPercent: 0, duration: 0.9 }, 0.55)
      .to(first.text, { opacity: 1, y: 0, duration: 0.8 }, 0.7)
      .to(first.out, { opacity: 1, y: 0, '--draw': 1, duration: 0.9 }, 0.82);
  });
}
