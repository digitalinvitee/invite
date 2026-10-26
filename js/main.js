/* ==========================================================================
   INVITÉ Studio — entry point.
   Each module starts independently: if one fails, the rest of the page still works.
   ========================================================================== */

import { audio } from './audio/AudioController.js';
import { initNavigation } from './nav/Navigation.js';
import { initSignalReveal } from './core/reveal.js';

const page = document.body.dataset.page;

function safe(name, fn) {
  try { const r = fn(); if (r && typeof r.catch === 'function') r.catch((e) => console.error(`[INVITÉ] ${name}`, e)); }
  catch (e) { console.error(`[INVITÉ] ${name}`, e); }
}

function start() {
  safe('audio', () => audio.init());
  safe('navigation', () => initNavigation());

  if (page === 'home') {
    // The intro module is imported first so it can take over from the inline fallback quickly.
    safe('intro', () => import('./intro/IntroExperience.js').then((m) => m.initIntro()));
    safe('hero', () => import('./hero/HeroExperience.js').then((m) => m.initHero()));
    safe('work', () => import('./work/ProjectShowcase.js').then((m) => m.initProjectShowcase()));
    safe('solutions', () => import('./solutions/CreativeSolutions.js').then((m) => m.initCreativeSolutions()));
    safe('method', () => import('./method/StudioMethod.js').then((m) => m.initStudioMethod()));
    safe('contact', () => import('./contact/ContactForm.js').then((m) => m.initContactForm()));
  }

  if (page === 'case') {
    safe('case', () => import('./work/CaseStudy.js').then((m) => m.initCaseStudy()));
  }

  safe('footer', () => import('./footer/Footer.js').then((m) => m.initFooter()));
  safe('sound', () => import('./audio/SoundDesign.js').then((m) => m.initSoundDesign()));
  safe('reveal', () => initSignalReveal());
}

// The site can start from these modules or, for pages opened straight from a folder, from the
// single-file copy in js/offline.js. Whichever runs first starts it; the other stands down.
if (!window.__inviteStarted) {
  window.__inviteStarted = true;
  start();
}
