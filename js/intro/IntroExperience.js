/* ==========================================================================
   IntroExperience — the signature broken-television opening.

   Broken television → signal interference → INVITÉ reconstructs → line of light → homepage.

   Modes
     'full'     first visit, about 2.8 s
                  01 Signal discovery   power-on, snow, NO SIGNAL, tearing, one roll of the picture
                  02 Reconstruction     INVITÉ locks in band by band, TRANSMISSION COMPLETE
                  03 Light              the picture collapses into a line of light, which opens into the page
     'short'    returning visitors, about 1.2 s: the same three beats with the middle one reduced to a lock-in
     'classic'  the earlier 5.7 s version, kept for comparison: add ?intro=classic to the address

   The television runs wherever WebGL exists, at lower resolution on weaker devices; without WebGL (or GSAP)
   a static frame plays instead, and with reduced motion a still frame simply fades. Skip, Escape and a
   failsafe always release the page, and the page reports back with the `intro:done` event.
   ========================================================================== */

import { CRT } from './crt.js';
import { paintWord, paintOSD, clear } from './broadcast.js';
import { audio } from '../audio/AudioController.js';
import { gpu } from '../core/gpu.js';
import { quality } from '../core/quality.js';
import { motion, getGsap, rafLoop } from '../core/motion.js';
import { waitForFonts, CRT_FONTS } from '../core/fonts.js';
import { store } from '../core/store.js';
import { t } from '../i18n/index.js';
import { $ } from '../core/dom.js';

const whenIdle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1200));
const nextFrames = (n) => new Promise((resolve) => { const step = () => (--n <= 0 ? resolve() : requestAnimationFrame(step)); requestAnimationFrame(step); });

const START_LIMIT_MS = 6000;  // ms the page may wait for the television to start (fonts, shader) before it is released
const RUN_MARGIN_S = 3;       // seconds a running sequence may overrun its own length before it is released
const HARD_LIMIT_MS = 1500;   // ms a skip may take before the page is released regardless

export class IntroExperience {
  constructor(dialog) {
    this.dialog = dialog;
    this.screen = $('[data-intro-screen]', dialog);
    this.light = $('[data-intro-light]', dialog);
    this.staticFrame = $('.intro__static', dialog);
    this.status = $('#intro-status', dialog);
    this.statusText = this.status ? this.status.textContent : '';   // what the dialog describes itself as whenever it opens
    this.running = false;
    this.crt = null;
    this.tl = null;
    this.loop = null;
    this.paint = { scene: 'black', channel: '', bottom: '', blink: false, volume: 0 };
    this.blinkOn = true;

    window.__introOwned = true;   // the inline fallback in index.html stands down
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); this.skip(); });
    // Before the visitor has clicked or typed anything the browser does not let a page overrule Escape: it closes the
    // dialog itself. Nothing is left on screen to animate away then, so the page is released at once.
    dialog.addEventListener('close', () => { if (this.running) this._finish(); });
    $('[data-intro-skip]', dialog).addEventListener('click', () => this.skip());

    audio.subscribe((on) => {
      if (!this.running) return;
      if (on) {
        audio.hum(0.5);
        audio.noise(this.crt ? Math.min(0.85, this.crt.state.uNoise) : 0.2);
        this.paint.volume = 10; this._repaint();
        clearTimeout(this._volumeTimer);
        this._volumeTimer = setTimeout(() => { this.paint.volume = 0; this._repaint(); }, 1400);
      }
    });
    window.addEventListener('resize', () => {
      if (this.crt && this.running) { this.crt.resize(quality.dpr); this._repaint(); }
    }, { passive: true });
  }

  /* gpu scheduler interface */
  start() { if (this.loop) this.loop.start(); }
  stop() { if (this.loop) this.loop.stop(); }

  async play(mode = 'full') {
    if (this.running) return;
    const gsap = getGsap();
    this.running = true;
    this.mode = mode;
    this._open();
    // Failsafe for a start that stalls (slow GPU, hidden tab); replaced once the sequence runs.
    this._failsafe = setTimeout(() => this.skip(), START_LIMIT_MS);
    if (motion.reduced) { this._playStill(mode); return; }

    if (quality.webgl && gsap) {
      const scale = quality.tier === 'high' ? 1 : quality.tier === 'medium' ? 0.75 : 0.5;   // a CRT forgives low resolution
      this.crt = new CRT(this.screen, { scale });
      if (!this.crt.ok) { this.crt.dispose(); this.crt = null; }
    }
    if (!this.crt) { this._playStatic(mode, gsap); return; }

    this.crt.resize(quality.dpr);
    Object.assign(this.crt.state, { uNoise: 1, uRGB: 0, uRoll: 0, uTear: 0, uBright: 4, uFlick: 0, uRecon: 1, onX: 0, onY: 0 });
    Object.assign(this.paint, { scene: 'black', channel: '', bottom: '', blink: false, volume: 0 });
    this._repaint();
    // Draw once before the clock starts: the first draw compiles the shader, which can take a
    // while on slow or software GPUs, and must not eat into the timed sequence.
    this.crt.render(performance.now());
    this.loop = rafLoop((time) => this._frame(time));
    gpu.focus(this, 'intro');

    await Promise.all([waitForFonts(CRT_FONTS, 1200), nextFrames(2)]);
    if (!this.running || this.leavingBySkip) return;
    clearTimeout(this._failsafe);
    this._repaint();
    this.tl = mode === 'short' ? this._short(gsap) : mode === 'classic' ? this._classic(gsap) : this._full(gsap);
    // The sequence knows how long it takes; if it has not finished well after that, let the page go.
    this._failsafe = setTimeout(() => this.skip(), (this.tl.duration() + RUN_MARGIN_S) * 1000);
  }

  replay() {
    window.scrollTo({ top: 0, behavior: 'auto' });
    this.play('full');
  }

  /* First visit, about 2.8 s. The picture is the same as before; what changed is the pacing. The snow no longer
     fills a second on its own, the word starts arriving the moment the picture settles, and the finished frame is held
     just long enough to read before it collapses. */
  _full(gsap) {
    const U = this.crt.state, P = this.paint;
    return gsap.timeline({ onComplete: () => this._finish() })
      // 01 Signal discovery: the set switches on and finds only noise, with one roll of the picture
      .call(() => { audio.play('thunk'); audio.hum(0.5); }, null, 0.06)
      .to(U, { onX: 1, duration: 0.12, ease: 'expo.out' }, 0.06)
      .to(U, { onY: 1, duration: 0.26, ease: 'expo.out' }, 0.14)
      .to(U, { uBright: 1, duration: 0.42, ease: 'power2.out' }, 0.14)
      .call(() => { Object.assign(P, { scene: 'snow', channel: t('intro.channel'), bottom: t('intro.noSignal'), blink: false }); this._repaint(); audio.noise(0.85); }, null, 0.16)
      .to(U, { uNoise: 0.66, duration: 0.3 }, 0.2)             // thin enough for NO SIGNAL to be read
      .to(U, { uTear: 1, duration: 0.06, yoyo: true, repeat: 3 }, 0.3)
      .to(U, { uFlick: 0.6, duration: 0.07, yoyo: true, repeat: 1 }, 0.5)
      .fromTo(U, { uRoll: 0 }, { uRoll: 1, duration: 0.3, ease: 'power2.in' }, 0.42)
      .set(U, { uRoll: 0 }, 0.72)
      // 02 Reconstruction: INVITÉ arrives in displaced bands and locks into place
      .call(() => { Object.assign(P, { scene: 'word', bottom: t('intro.searching'), blink: true }); this._repaint(); audio.play('zap'); audio.noise(0.5); }, null, 0.72)
      .set(U, { uRecon: 0.1, uNoise: 0.6, uRGB: 0.03, uFlick: 0.8 }, 0.72)
      .to(U, { uRecon: 1, duration: 0.9, ease: 'power1.out' }, 0.74)
      .to(U, { uNoise: 0.06, duration: 1.0, ease: 'power2.in' }, 0.74)
      .to(U, { uRGB: 0.0022, uFlick: 0.1, duration: 1.0, ease: 'power3.out' }, 0.78)
      .call(() => audio.play('zap', { strength: 0.5 }), null, 1.02)
      .to(U, { uTear: 0.8, duration: 0.05, yoyo: true, repeat: 1 }, 1.02)
      .call(() => audio.play('zap', { strength: 0.5 }), null, 1.32)
      .to(U, { uTear: 0.6, duration: 0.05, yoyo: true, repeat: 1 }, 1.32)
      .call(() => { Object.assign(P, { bottom: t('intro.complete'), blink: false }); this._repaint(); audio.play('logo'); audio.noise(0.08); }, null, 1.62)
      .to(U, { uTear: 0.7, uRGB: 0.012, duration: 0.05, yoyo: true, repeat: 1 }, 1.76)
      // 03 Light: the picture collapses into a line, and the line opens into the page
      .call(() => { audio.play('powerOff'); audio.noise(0, 0.1); audio.hum(0, 0.4); this.dialog.classList.add('is-leaving'); }, null, 1.9)
      .to(U, { onY: 0.004, uBright: 6, duration: 0.24, ease: 'power4.in' }, 1.9)
      .set(this.light, { scaleY: 0.004, opacity: 1 }, 2.14)
      .set(this.screen, { opacity: 0 }, 2.16)
      .call(() => this._stopScreen(), null, 2.16)
      .to(this.light, { scaleY: 0.012, duration: 0.08, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 2.17)
      .to(this.light, { scaleY: 1, duration: 0.5, ease: 'expo.inOut' }, 2.33);
  }

  /* Returning visitors, about 1.2 s: the same three beats, with the snow reduced to a flash and the word locking in at once. */
  _short(gsap) {
    const U = this.crt.state, P = this.paint;
    return gsap.timeline({ onComplete: () => this._finish() })
      .call(() => audio.play('thunk'), null, 0.04)
      .to(U, { onX: 1, duration: 0.08, ease: 'expo.out' }, 0.04)
      .to(U, { onY: 1, duration: 0.16, ease: 'expo.out' }, 0.09)
      .to(U, { uBright: 1, duration: 0.22 }, 0.09)
      .call(() => { Object.assign(P, { scene: 'snow', channel: t('intro.channel'), bottom: '' }); this._repaint(); audio.noise(0.6); }, null, 0.1)
      .call(() => { P.scene = 'word'; this._repaint(); audio.play('zap'); }, null, 0.22)
      .set(U, { uRecon: 0.1, uNoise: 0.5, uRGB: 0.025, uFlick: 0.6 }, 0.22)
      .to(U, { uRecon: 1, uNoise: 0.06, duration: 0.36, ease: 'power2.out' }, 0.24)
      .to(U, { uRGB: 0.0022, uFlick: 0.1, duration: 0.38 }, 0.26)
      .call(() => { audio.play('logo'); audio.noise(0, 0.2); }, null, 0.56)
      .call(() => { audio.play('powerOff'); this.dialog.classList.add('is-leaving'); }, null, 0.64)
      .to(U, { onY: 0.004, uBright: 6, duration: 0.16, ease: 'power4.in' }, 0.64)
      .set(this.light, { scaleY: 0.004, opacity: 1 }, 0.8)
      .set(this.screen, { opacity: 0 }, 0.82)
      .call(() => this._stopScreen(), null, 0.82)
      .to(this.light, { scaleY: 1, duration: 0.36, ease: 'expo.inOut' }, 0.82);
  }

  /* The earlier first-visit sequence, about 5.7 s, kept so the two can be compared: open the site with ?intro=classic. */
  _classic(gsap) {
    const U = this.crt.state, P = this.paint;
    return gsap.timeline({ onComplete: () => this._finish() })
      .call(() => { audio.play('thunk'); audio.hum(0.5); }, null, 0.12)
      .to(U, { onX: 1, duration: 0.16, ease: 'expo.out' }, 0.12)
      .to(U, { onY: 1, duration: 0.34, ease: 'expo.out' }, 0.27)
      .to(U, { uBright: 1, duration: 0.6, ease: 'power2.out' }, 0.27)
      .call(() => { Object.assign(P, { scene: 'snow', channel: t('intro.channel'), bottom: t('intro.noSignal'), blink: true }); this._repaint(); audio.noise(0.85); }, null, 0.3)
      .to(U, { uNoise: 0.9, duration: 0.2 }, 0.45)
      .to(U, { uTear: 1, duration: 0.07, yoyo: true, repeat: 3 }, 0.8)
      .fromTo(U, { uRoll: 0 }, { uRoll: 1, duration: 0.42, ease: 'power2.in' }, 1.05)
      .set(U, { uRoll: 0 }, 1.47)
      .to(U, { uFlick: 0.6, duration: 0.1, yoyo: true, repeat: 1 }, 1.3)
      // Phase 02 — signal reconstruction
      .call(() => { Object.assign(P, { scene: 'word', bottom: t('intro.searching'), blink: true }); this._repaint(); audio.play('zap'); audio.noise(0.5); }, null, 1.65)
      .set(U, { uRecon: 0, uNoise: 0.6, uRGB: 0.03, uFlick: 0.8 }, 1.65)
      .to(U, { uRecon: 1, duration: 1.5, ease: 'power2.inOut' }, 1.7)
      .to(U, { uNoise: 0.06, duration: 1.5, ease: 'power2.in' }, 1.7)
      .to(U, { uRGB: 0.0022, uFlick: 0.1, duration: 1.6, ease: 'power3.out' }, 1.75)
      .call(() => audio.play('zap', { strength: 0.5 }), null, 2.05)
      .to(U, { uTear: 0.8, duration: 0.05, yoyo: true, repeat: 1 }, 2.05)
      .call(() => audio.play('zap', { strength: 0.5 }), null, 2.5)
      .to(U, { uTear: 0.6, duration: 0.05, yoyo: true, repeat: 1 }, 2.5)
      .call(() => { Object.assign(P, { bottom: t('intro.complete'), blink: false }); this._repaint(); audio.play('logo'); audio.noise(0.08); }, null, 3.2)
      .to(U, { uTear: 0.7, uRGB: 0.012, duration: 0.05, yoyo: true, repeat: 1 }, 3.65)
      // Phase 03 — collapse into a line of light, which becomes the page
      .call(() => { audio.play('powerOff'); audio.noise(0, 0.1); audio.hum(0, 0.4); this.dialog.classList.add('is-leaving'); }, null, 4.05)
      .to(U, { onY: 0.004, uBright: 6, duration: 0.32, ease: 'power4.in' }, 4.05)
      .set(this.light, { scaleY: 0.004, opacity: 1 }, 4.37)
      .set(this.screen, { opacity: 0 }, 4.39)
      .call(() => this._stopScreen(), null, 4.39)
      .to(this.light, { scaleY: 0.012, duration: 0.24, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 4.4)
      .to(this.light, { scaleY: 1, duration: 0.78, ease: 'expo.inOut' }, 4.9);
  }

  /* Static fallback: one composed frame, then the same line-of-light transition. */
  _playStatic(mode, gsap) {
    this.dialog.classList.add('intro--static');
    const holdS = mode === 'short' ? 0.4 : mode === 'classic' ? 1.4 : 0.9;
    if (!gsap) { this._timers = [setTimeout(() => this._finish(), holdS * 1000)]; return; }
    this.tl = gsap.timeline({ onComplete: () => this._finish() })
      .fromTo(this.staticFrame, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'steps(4)' }, 0)
      .call(() => audio.play('logo'), null, 0.25)
      .call(() => this.dialog.classList.add('is-leaving'), null, holdS)
      .to(this.staticFrame, { scaleY: 0.004, duration: 0.24, ease: 'power4.in' }, holdS)
      .set(this.light, { scaleY: 0.004, opacity: 1 }, holdS + 0.24)
      .set(this.staticFrame, { opacity: 0 }, holdS + 0.26)
      .to(this.light, { scaleY: 1, duration: 0.5, ease: 'expo.inOut' }, holdS + 0.3);
    clearTimeout(this._failsafe);
    this._failsafe = setTimeout(() => this.skip(), (this.tl.duration() + RUN_MARGIN_S) * 1000);
  }

  /* Reduced motion: the brand frame, still, then a plain fade. No movement, no flicker. */
  _playStill(mode) {
    this.dialog.classList.add('intro--static', 'intro--still');
    const holdMs = mode === 'short' ? 500 : mode === 'classic' ? 1300 : 1000;
    this._timers = [
      setTimeout(() => this.dialog.classList.add('is-fading'), holdMs),
      setTimeout(() => this._finish(), holdMs + 450)
    ];
  }

  skip() {
    if (!this.running) { this._close(); return; }
    if (this.leavingBySkip) return;
    this.leavingBySkip = true;
    clearTimeout(this._failsafe);
    this._hardStop = setTimeout(() => this._finish(), HARD_LIMIT_MS);   // whatever the animation does, the page is released
    if (this.tl) this.tl.kill();
    const gsap = getGsap();
    audio.noise(0, 0.1); audio.hum(0, 0.3);
    if (!gsap || motion.reduced) { this._finish(); return; }
    this.dialog.classList.add('is-leaving');
    const tl = gsap.timeline({ onComplete: () => this._finish() });
    if (this.crt) tl.to(this.crt.state, { onY: 0.004, uBright: 6, duration: 0.18, ease: 'power4.in' }).set(this.screen, { opacity: 0 });
    else tl.to(this.staticFrame, { scaleY: 0.004, duration: 0.18, ease: 'power4.in' }).set(this.staticFrame, { opacity: 0 });
    tl.set(this.light, { scaleY: 0.004, opacity: 1 }).to(this.light, { scaleY: 1, duration: 0.45, ease: 'expo.inOut' });
    this.tl = tl;
  }

  _frame(time) {
    if (!this.crt) return;
    if (this.paint.blink) {
      const on = Math.floor(time * 2.2) % 2 === 0;
      if (on !== this.blinkOn) { this.blinkOn = on; this._repaint(); }
    }
    this.crt.render(time);
  }

  _repaint() {
    if (!this.crt) return;
    const ctx = this.crt.ctx2d, W = this.crt.width, H = this.crt.height, P = this.paint;
    clear(ctx, W, H);
    if (P.scene === 'word') paintWord(ctx, W, H, 'INVITÉ');
    if (P.scene !== 'black') paintOSD(ctx, W, H, { channel: P.channel, bottom: P.bottom, showBottom: !P.blink || this.blinkOn, volume: P.volume, volumeLabel: t('intro.volume') });
    this.crt.markDirty();
  }

  _open() {
    const d = this.dialog;
    d.classList.remove('is-leaving', 'intro--static', 'intro--still', 'is-fading');
    d.hidden = false;
    if (this.status) this.status.textContent = this.statusText;
    if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute('open', ''); } }
    document.documentElement.classList.add('intro-active');
    const gsap = getGsap();
    if (gsap) { gsap.set([this.light, this.screen, this.staticFrame], { clearProps: 'all' }); }
    this.leavingBySkip = false;
  }

  _close() {
    const d = this.dialog;
    try { d.close(); } catch (e) { d.removeAttribute('open'); }
    d.hidden = true;
    document.documentElement.classList.remove('intro-active');
  }

  /* The screen is hidden once it has collapsed into the line: stop drawing it. */
  _stopScreen() { if (this.loop) this.loop.stop(); }

  _finish() {
    if (!this.running) return;
    this.running = false;
    clearTimeout(this._failsafe); clearTimeout(this._hardStop);
    if (this.tl) { this.tl.kill(); this.tl = null; }
    (this._timers || []).forEach(clearTimeout);
    this._timers = [];
    store.set('intro.seen', '1');
    audio.noise(0); audio.hum(0);
    gpu.release();
    if (this.loop) { this.loop.destroy(); this.loop = null; }
    // Releasing a WebGL context waits for the GPU to finish queued work, which can stall a slow
    // device for a moment. Do it once the page has settled, not during the hand-over.
    if (this.crt) { const crt = this.crt; this.crt = null; whenIdle(() => crt.dispose()); }
    this._close();
    const gsap = getGsap();
    if (gsap) gsap.set([this.light, this.screen, this.staticFrame], { clearProps: 'all' });
    this.dialog.classList.remove('is-leaving', 'intro--static', 'intro--still', 'is-fading');
    document.documentElement.dataset.intro = 'done';
    window.dispatchEvent(new CustomEvent('intro:done'));
    // Return keyboard focus to the start of the content.
    const title = document.querySelector('[data-hero-title]');
    if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
  }
}

export function initIntro() {
  const dialog = document.getElementById('intro');
  if (!dialog) return null;
  const intro = new IntroExperience(dialog);
  const mode = document.documentElement.dataset.intro;
  if (mode === 'full' || mode === 'short' || mode === 'classic') intro.play(mode);
  document.querySelectorAll('[data-replay-intro]').forEach((btn) => btn.addEventListener('click', () => {
    const menu = document.getElementById('menu');
    if (menu && menu.open) menu.close();
    intro.replay();
  }));
  return intro;
}
