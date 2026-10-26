/* Footer: contact links (email, WhatsApp, socials) from config, and the closing line of light. */

import { config } from '../config.js';
import { $, el } from '../core/dom.js';
import { motion } from '../core/motion.js';
import { whatsappNumber, whatsappUrl } from '../core/whatsapp.js';

export function initFooter() {
  const contact = $('[data-footer-contact]');
  if (contact && config.studio.email) {
    contact.append(el('a', { href: `mailto:${config.studio.email}`, text: config.studio.email }));
  }
  if (contact && whatsappNumber()) {
    // The number never breaks in the middle; on narrow screens it moves under "WhatsApp".
    contact.append(el('a', { href: whatsappUrl(), target: '_blank', rel: 'noopener' }, ['WhatsApp ', el('span', { class: 'nowrap', text: whatsappNumber() })]));
  }
  if (contact && config.socials.length) {
    config.socials.forEach((s) => contact.append(el('a', { href: s.url, target: '_blank', rel: 'noopener', text: s.label })));
  }

  // End of transmission: the line draws itself once, like the intro's last frame in reverse.
  // CSS transition only, so case and legal pages don't need GSAP for it.
  const line = $('[data-footer-line]');
  if (line && !motion.reduced && 'IntersectionObserver' in window) {
    line.classList.add('will-draw');
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      requestAnimationFrame(() => line.classList.add('is-drawn'));
    }, { rootMargin: '0px 0px -5% 0px' });
    io.observe(line);
  }
}
