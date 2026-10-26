/* ==========================================================================
   AudioController — one source of truth for sound.
   · Off by default. The visitor's choice is remembered (localStorage).
   · Never assumes autoplay: the AudioContext is only created or resumed inside a
     user gesture. If the visitor chose "on" last time, the first tap or key press
     on this visit resumes it.
   · Every [data-sound-toggle] on the page is kept in sync.
   · All sounds are synthesised (no audio files to download).

   Two layers share the output:
   · the intro's television: static, hum, the power thunk and the logo (below);
   · the site's music (Soundscape.js): a soft pad that changes chord from section
     to section and breathes with scrolling, sparse bells, and the interface
     sounds. The pad waits while the intro plays and fades in after it.
   ========================================================================== */

import { store } from '../core/store.js';
import { config } from '../config.js';
import { t } from '../i18n/index.js';
import { Soundscape } from './Soundscape.js';

class AudioController {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseGain = null;
    this.humGain = null;
    this.music = null;
    this.noiseLevel = 0;
    this.humLevel = 0;
    this.sceneName = 'top';
    this.preference = store.get('sound') === 'on';   // what the visitor wants
    this.active = false;                               // what is actually audible now
    this.subscribers = new Set();
  }

  init(root = document) {
    this.bind(root);
    this._sync();
    if (this.preference) {
      // Browsers require a gesture: resume on the first one.
      const resume = () => { if (this.preference && !this.active) this._start(); };
      window.addEventListener('pointerdown', resume, { once: true, capture: true });
      window.addEventListener('keydown', resume, { once: true, capture: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend().catch(() => {});
      else if (this.active) this.ctx.resume().catch(() => {});
    });
    // The pad waits while the intro (or its replay) is on screen.
    if ('MutationObserver' in window) {
      new MutationObserver(() => this._syncAmbient()).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
    this._watchScroll();
  }

  /* Wire every toggle inside root (call again for content added later, e.g. dialogs). */
  bind(root = document) {
    root.querySelectorAll('[data-sound-toggle]').forEach((btn) => {
      if (btn.dataset.soundBound) return;
      btn.dataset.soundBound = '1';
      btn.addEventListener('click', () => this.toggle());
    });
    this._sync();
  }

  subscribe(fn) { this.subscribers.add(fn); return () => this.subscribers.delete(fn); }

  get enabled() { return this.active; }

  toggle() { return this.preference && this.active ? this.disable() : this.enable(); }

  async enable() {
    this.preference = true;
    store.set('sound', 'on');
    await this._start();
    if (!document.documentElement.classList.contains('intro-active')) this.play('on');
  }

  disable() {
    this.preference = false;
    this.active = false;
    store.set('sound', 'off');
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0, now, 0.08);
      if (this.music) this.music.ambient(false);
      setTimeout(() => { if (!this.active && this.ctx) this.ctx.suspend().catch(() => {}); }, 400);
    }
    this._emit();
  }

  /* The section on screen: the pad moves to its chord (see Soundscape.SCENES). */
  scene(name) {
    this.sceneName = name;
    if (this.music) this.music.scene(name);
  }

  async _start() {
    if (!this._build()) { this._emit(); return; }
    try { if (this.ctx.state !== 'running') await this.ctx.resume(); } catch (e) { /* blocked until a gesture */ }
    if (this.ctx.state !== 'running') { this._emit(); return; }
    this.active = true;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0.55, now, 0.12);
    this.noiseGain.gain.setTargetAtTime(this.noiseLevel * 0.16, now, 0.08);
    this.humGain.gain.setTargetAtTime(this.humLevel * 0.09, now, 0.4);
    this._syncAmbient();
    this._emit();
  }

  _build() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { this.ctx = new AC(); } catch (e) { return false; }
    const ctx = this.ctx;
    this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);

    // Analog static: looped white noise through a soft band-pass.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buffer; src.loop = true;
    const band = ctx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = 2200; band.Q.value = 0.5;
    this.noiseGain = ctx.createGain(); this.noiseGain.gain.value = 0;
    src.connect(band).connect(this.noiseGain).connect(this.master); src.start();

    // Low hum of the set.
    this.humGain = ctx.createGain(); this.humGain.gain.value = 0;
    const low = ctx.createBiquadFilter(); low.type = 'lowpass'; low.frequency.value = 320;
    [55, 82.41, 110.3].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.connect(low); o.start();
    });
    low.connect(this.humGain).connect(this.master);

    // The site's music.
    try {
      const musicOut = ctx.createGain();
      musicOut.gain.value = Math.max(0, Math.min(1, Number((config.sound || {}).volume ?? 1)));
      musicOut.connect(this.master);
      this.music = new Soundscape(ctx, musicOut);
      this.music.sceneName = this.sceneName;
    } catch (e) { this.music = null; }
    return true;
  }

  _syncAmbient() {
    if (!this.music) return;
    const introOn = document.documentElement.classList.contains('intro-active');
    const wanted = (config.sound || {}).ambient !== false;
    this.music.ambient(this.active && wanted && !introOn);
  }

  /* Scrolling opens the pad a little; it settles again when the page is still. */
  _watchScroll() {
    let lastY = window.scrollY, lastT = performance.now(), level = 0, raf = 0, idle = 0;
    const apply = () => {
      raf = 0;
      if (this.music && this.active) this.music.motion(level);
    };
    window.addEventListener('scroll', () => {
      const now = performance.now(), dt = Math.max(16, now - lastT);
      const speed = Math.abs(window.scrollY - lastY) / dt;          // px per ms
      lastY = window.scrollY; lastT = now;
      level = level * 0.6 + Math.min(1, speed / 3) * 0.4;
      if (!raf) raf = requestAnimationFrame(apply);
      clearTimeout(idle);
      idle = setTimeout(() => { level = 0; apply(); }, 180);
    }, { passive: true });
  }

  /* Continuous layers (0–1). Safe to call while silent: the level is remembered. */
  noise(level, time = 0.08) {
    this.noiseLevel = level;
    if (this.active) this.noiseGain.gain.setTargetAtTime(level * 0.16, this.ctx.currentTime, time);
  }
  hum(level, time = 0.6) {
    this.humLevel = level;
    if (this.active) this.humGain.gain.setTargetAtTime(level * 0.09, this.ctx.currentTime, time);
  }

  /* One-shot sounds. Silent unless sound is on.
     Interface sounds (Soundscape.ui): hover, tick, note {step}, select {step}, ping {step},
     next, back, open, close, on, chime, error. The intro's: thunk, zap, logo, powerOff, swell. */
  play(name, opts = {}) {
    if (!this.active || (this.ctx && this.ctx.state !== 'running')) return;
    if (this.music && this.music.has(name)) {
      // The music waits while the intro's television is on screen.
      if (!document.documentElement.classList.contains('intro-active')) this.music.ui(name, opts);
      return;
    }
    const ctx = this.ctx, now = ctx.currentTime, out = this.master;
    const tone = (freq, len, vol, type = 'sine', at = 0) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0, now + at);
      g.gain.linearRampToValueAtTime(vol, now + at + Math.min(0.02, len / 4));
      g.gain.exponentialRampToValueAtTime(0.0001, now + at + len);
      o.connect(g).connect(out); o.start(now + at); o.stop(now + at + len + 0.05);
      return o;
    };
    switch (name) {
      case 'thunk': tone(58, 0.35, 0.16); tone(116, 0.12, 0.06); tone(2400, 0.05, 0.012, 'square'); break;
      case 'zap': {
        const v = opts.strength ?? 1;
        this.noiseGain.gain.cancelScheduledValues(now);
        this.noiseGain.gain.setValueAtTime(0.2 * v, now);
        this.noiseGain.gain.setTargetAtTime(this.noiseLevel * 0.16, now + 0.09, 0.04);
        break;
      }
      case 'logo': [[392, 0], [587.33, 0.07], [783.99, 0.14]].forEach(([f, d]) => tone(f, 2.4, 0.04, 'triangle', d)); tone(1567.98, 2.2, 0.016, 'sine', 0.22); break;
      case 'powerOff': {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
        o.frequency.setValueAtTime(1400, now); o.frequency.exponentialRampToValueAtTime(70, now + 0.4);
        g.gain.setValueAtTime(0.05, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        o.connect(g).connect(out); o.start(); o.stop(now + 0.5);
        break;
      }
      case 'swell': {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
        o.frequency.setValueAtTime(110, now); o.frequency.exponentialRampToValueAtTime(220, now + 1.2);
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.05, now + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        o.connect(g).connect(out); o.start(); o.stop(now + 1.7);
        break;
      }
      default: break;
    }
  }

  _emit() { this._sync(); this.subscribers.forEach((fn) => fn(this.active)); }

  _sync() {
    const on = this.preference && this.active;
    document.querySelectorAll('[data-sound-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(on));
      if (!btn.querySelector('[data-sound-label]')) btn.setAttribute('aria-label', on ? t('sound.on') : t('sound.off'));
    });
    document.querySelectorAll('[data-sound-label]').forEach((el) => { el.textContent = on ? t('sound.on') : t('sound.off'); });
  }
}

export const audio = new AudioController();
