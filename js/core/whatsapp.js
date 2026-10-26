/* WhatsApp links from js/config.js (studio.whatsapp and studio.whatsappMessage).
   wa.me opens the chat in the WhatsApp app on phones and in WhatsApp Web on computers. */

import { config } from '../config.js';

/* The number as written in the config, e.g. "+995 599 29 89 12" ('' when not set). */
export function whatsappNumber() {
  return String(config.studio.whatsapp || '').trim();
}

/* A link that opens a chat with the studio, with a message already typed in. */
export function whatsappUrl(text = config.studio.whatsappMessage) {
  const digits = whatsappNumber().replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
