/* Header states, section tracking and the accessible mobile menu (native <dialog>). */

import { $, $$ } from '../core/dom.js';

export function initNavigation() {
  const header = $('[data-header]');
  if (!header) return;

  /* Scrolled / hidden / tone. Hides while scrolling down, returns on scroll up or focus. */
  let lastY = scrollY, ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const menuOpen = $('#menu') && $('#menu').open;
    if (!menuOpen) header.classList.toggle('is-hidden', y > 420 && y > lastY + 4);
    if (y < lastY - 4 || y < 420) header.classList.remove('is-hidden');
    lastY = y;
    // Tone follows whatever sits under the header (dark "signal rooms" vs porcelain).
    const probe = document.elementFromPoint(Math.min(40, innerWidth - 1), header.getBoundingClientRect().bottom + 2);
    header.dataset.tone = probe && probe.closest('.theme-dark') ? 'dark' : 'light';
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();

  /* Mark the link of the section in view. The hero has no link of its own, so reaching it clears the mark. */
  const links = $$('.primary-nav a');
  const byId = new Map(links.map((a) => [a.getAttribute('href').replace(/^.*#/, ''), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.removeAttribute('aria-current'));
        const link = byId.get(entry.target.id);
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    let tracked = 0;
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) { io.observe(s); tracked += 1; } });
    // Only where the links point at sections of this page (not on the case-study and legal pages,
    // whose current link is set in the HTML).
    const hero = document.getElementById('top');
    if (tracked && hero && !byId.has('top')) io.observe(hero);
  }

  /* Mobile menu */
  const menu = $('#menu');
  const openBtn = $('[data-menu-open]');
  if (menu && openBtn) {
    const open = () => {
      if (typeof menu.showModal === 'function') menu.showModal(); else menu.setAttribute('open', '');
      openBtn.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      if (menu.open) { try { menu.close(); } catch (e) { menu.removeAttribute('open'); } }
    };
    openBtn.addEventListener('click', open);
    menu.addEventListener('close', () => { openBtn.setAttribute('aria-expanded', 'false'); });
    $('[data-menu-close]', menu).addEventListener('click', close);
    $$('[data-menu-link]', menu).forEach((a) => a.addEventListener('click', close));
    menu.addEventListener('click', (e) => { if (e.target === menu) close(); });
  }
}
