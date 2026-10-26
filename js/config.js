
/* ==========================================================================
   INVITÉ Studio — Site Configuration
   ========================================================================== */

export const config = {

  siteUrl: 'https://invitee.ge',

  studio: {
    name: 'INVITÉ Studio',
    city: 'Tbilisi',
    country: 'Georgia',
    email: 'digitalinvite8@gmail.com',

    /* WhatsApp: the number with country code (spaces are fine), and the message a chat opens with.
       Shown in the contact section and footer, and offered if a form message cannot be sent.
       Leave the number empty to hide WhatsApp everywhere. */
    whatsapp: '+995 599 29 89 12',
    whatsappMessage: 'Hello INVITÉ, I have a project in mind.'
  },

  /* Contact Form Integration */
  forms: {
    provider: 'appsscript',

    // Updated Google Apps Script URL
    appsScriptUrl:
      'https://script.google.com/macros/s/AKfycbz4oF7iGZO9JJFzhjMXFFG6wF9KaOhzYGWu-v2HjPfOIpBx-xQLUZCcoFZmgYG55DLxhQ/exec',

    formspreeId: '',
    web3formsKey: '',
    customEndpoint: '',
    turnstileSiteKey: '',
    timeoutMs: 20000
  },

  /* Sound — plays only after a visitor turns it on (the "Sound off" button in the header).
       ambient: the soft background music (a pad that changes chord with each section, and
                sparse bells). false keeps only the small sounds of buttons, tiles and the form.
       volume:  0–1 for the music and interface sounds together. */
  sound: {
    ambient: true,
    volume: 1
  },

  /* Social Media */
  socials: [
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/invitee.ge/'
    }
  ]
};
