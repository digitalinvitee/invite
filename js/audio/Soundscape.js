/* ==========================================================================
   Soundscape — the music of the site, synthesised (no audio files).

   · A soft pad that follows the visitor through the page: each section has its
     own chord, and moving between sections crossfades to the next one.
       hero Gmaj9 · work Em9 · solutions Cmaj9 · studio D6/9 · contact Gadd9
   · Scrolling opens the pad a little (brighter, slightly louder) and it settles
     again when the page is still.
   · Sparse bell notes drift over it, never more than one every few seconds.
   · The interface speaks the same language: one key (G major pentatonic for
     every melodic sound), one bell timbre, one shared room.

   Everything goes through one compressor, so many sounds at once never clip.
   The class takes any AudioContext (also an OfflineAudioContext, for tests).
   ========================================================================== */

// G major pentatonic, G4 → E6. Melodic sounds only ever use these.
export const SCALE = [392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77, 1174.66, 1318.51];

export const SCENES = {
  top:       { root: 98.00, notes: [146.83, 220.00, 246.94, 369.99] },   // Gmaj9
  work:      { root: 82.41, notes: [123.47, 146.83, 196.00, 369.99] },   // Em9
  solutions: { root: 65.41, notes: [98.00, 164.81, 246.94, 293.66] },    // Cmaj9
  studio:    { root: 73.42, notes: [110.00, 164.81, 185.00, 246.94] },   // D6/9
  contact:   { root: 98.00, notes: [146.83, 246.94, 293.66, 440.00] }    // Gadd9
};

const UI_SOUNDS = new Set(['hover', 'tick', 'note', 'select', 'ping', 'next', 'back', 'open', 'close', 'on', 'chime', 'error']);
const PAD_LEVEL = 0.011;     // per oscillator: the pad sits well under every other sound
const CROSSFADE = 3.2;       // seconds between chords

export class Soundscape {
  constructor(ctx, destination) {
    this.ctx = ctx;
    const g = (v) => { const n = ctx.createGain(); n.gain.value = v; return n; };

    // Out: a gentle compressor, so stacked notes never clip.
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -20; this.comp.knee.value = 10; this.comp.ratio.value = 3;
    this.comp.attack.value = 0.006; this.comp.release.value = 0.3;
    this.comp.connect(destination);

    // One shared room.
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = room(ctx, 3.6);
    this.wet = g(0.62);
    this.reverb.connect(this.wet).connect(this.comp);

    // Pad: chords → shared low-pass (slowly breathing, opened by scrolling) → level → room.
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass'; this.padFilter.frequency.value = 640; this.padFilter.Q.value = 0.6;
    const lfo = ctx.createOscillator(), depth = g(150);
    lfo.frequency.value = 0.055; lfo.connect(depth).connect(this.padFilter.frequency); lfo.start();
    this.padLift = g(1);         // scrolling lifts it a touch
    this.padLevel = g(0);        // ambient on/off
    this.padFilter.connect(this.padLift).connect(this.padLevel);
    this.padLevel.connect(this.comp);
    this.padLevel.connect(g(0.7)).connect(this.reverb);

    // Bells and interface: a little dry, mostly room.
    this.fx = g(1);
    this.fx.connect(g(0.75)).connect(this.comp);
    this.fx.connect(g(0.9)).connect(this.reverb);

    this.chord = null;          // { gain, oscs }
    this.sceneName = 'top';
    this.ambientOn = false;
    this.bellTimer = 0;
    this.motionLevel = 0;
  }

  /* ── Ambient pad ────────────────────────────────────────────────── */
  ambient(on, time = 2.5) {
    const now = this.ctx.currentTime;
    if (on === this.ambientOn) return;
    this.ambientOn = on;
    this.padLevel.gain.cancelScheduledValues(now);
    this.padLevel.gain.setTargetAtTime(on ? 1 : 0, now, on ? time / 3 : 0.5);
    if (on) {
      if (!this.chord) this.chord = this._chord(SCENES[this.sceneName] || SCENES.top, now, 0.01);
      this._bells();
    } else {
      clearTimeout(this.bellTimer);
      // Free the oscillators once the pad has faded out.
      const chord = this.chord; this.chord = null;
      if (chord) this._release(chord, now + 2.5, 0.2);
    }
  }

  scene(name) {
    if (!SCENES[name] || name === this.sceneName) return;
    this.sceneName = name;
    if (!this.ambientOn) return;
    const now = this.ctx.currentTime;
    if (this.chord) this._release(this.chord, now, CROSSFADE * 0.4);
    this.chord = this._chord(SCENES[name], now, CROSSFADE * 0.28);
  }

  /* 0–1: how fast the page is moving. Opens the filter and lifts the pad a touch. */
  motion(level) {
    const now = this.ctx.currentTime, l = Math.max(0, Math.min(1, level));
    if (Math.abs(l - this.motionLevel) < 0.02) return;
    this.motionLevel = l;
    this.padFilter.frequency.setTargetAtTime(640 + l * 1100, now, l > 0.05 ? 0.12 : 0.9);
    this.padLift.gain.setTargetAtTime(1 + l * 0.4, now, l > 0.05 ? 0.15 : 1.1);
  }

  /* fadeIn is a time constant: the chord is ~95% in after three of them. */
  _chord(scene, at, fadeIn) {
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.setTargetAtTime(1, at, fadeIn);
    gain.connect(this.padFilter);
    const oscs = [];
    const voice = (freq, type, detune, level, pan) => {
      const o = ctx.createOscillator(), v = ctx.createGain();
      o.type = type; o.frequency.value = freq; o.detune.value = detune; v.gain.value = level;
      o.connect(v);
      if (ctx.createStereoPanner && pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; v.connect(p).connect(gain); }
      else v.connect(gain);
      o.start(at); oscs.push(o);
    };
    voice(scene.root, 'sine', 0, PAD_LEVEL * 2.6, 0);                 // warm floor
    scene.notes.forEach((f, i) => {
      const side = i % 2 ? 1 : -1;
      voice(f, 'sawtooth', -6, PAD_LEVEL, -0.35 * side);
      voice(f, 'sawtooth', +6, PAD_LEVEL, 0.35 * side);
    });
    voice(scene.notes[scene.notes.length - 1] * 2, 'triangle', 3, PAD_LEVEL * 0.5, 0.2);  // air on top
    return { gain, oscs };
  }

  _release(chord, at, timeConstant) {
    chord.gain.gain.cancelScheduledValues(at);
    chord.gain.gain.setTargetAtTime(0, at, timeConstant);
    const end = at + timeConstant * 6;
    chord.oscs.forEach((o) => { try { o.stop(end); } catch (e) { /* already stopped */ } });
    setTimeout(() => { try { chord.gain.disconnect(); } catch (e) { /* gone */ } }, (end - this.ctx.currentTime + 0.5) * 1000);
  }

  /* Sparse bells over the pad, every 5–11 s. Skipped while the tab is hidden. */
  _bells() {
    clearTimeout(this.bellTimer);
    if (!this.ambientOn) return;
    const wait = 5000 + Math.random() * 6000;
    this.bellTimer = setTimeout(() => {
      if (this.ambientOn && this.ctx.state === 'running' && !(typeof document !== 'undefined' && document.hidden)) {
        const i = 4 + Math.floor(Math.random() * 6);              // D5 → E6
        this.bell(SCALE[i], { gain: 0.05, decay: 3.4 });
        if (Math.random() < 0.3) this.bell(SCALE[Math.max(0, i - 2)], { gain: 0.035, decay: 3.2, at: 0.42 });
      }
      this._bells();
    }, wait);
  }

  /* ── The instrument: a soft glass bell ─────────────────────────────
     FM at 1 : 3.5 gives a short glassy "ting" that melts into a pure tone. */
  bell(freq, { gain = 0.12, decay = 1.8, at = 0, bright = 1, out = this.fx } = {}) {
    const ctx = this.ctx, t = ctx.currentTime + at;
    const car = ctx.createOscillator(), mod = ctx.createOscillator(), index = ctx.createGain(), amp = ctx.createGain();
    car.type = 'sine'; mod.type = 'sine';
    car.frequency.value = freq; mod.frequency.value = freq * 3.5;
    index.gain.setValueAtTime(freq * 0.55 * bright, t);
    index.gain.exponentialRampToValueAtTime(Math.max(0.5, freq * 0.01), t + 0.32);
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(gain, t + 0.005);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    mod.connect(index).connect(car.frequency);
    car.connect(amp).connect(out);
    car.start(t); mod.start(t); car.stop(t + decay + 0.05); mod.stop(t + decay + 0.05);
  }

  /* A short, quiet sine blip (hover). */
  blip(freq, gain, len = 0.05, at = 0) {
    const ctx = this.ctx, t = ctx.currentTime + at;
    const o = ctx.createOscillator(), a = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(gain, t + 0.004); a.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(a).connect(this.fx); o.start(t); o.stop(t + len + 0.02);
  }

  /* A soft wooden tap: a sine that drops in pitch. */
  tap(freq = 880, gain = 0.07, at = 0) {
    const ctx = this.ctx, t = ctx.currentTime + at;
    const o = ctx.createOscillator(), a = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.5, t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.025);
    a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(gain, t + 0.003); a.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(a).connect(this.fx); o.start(t); o.stop(t + 0.15);
  }

  /* Air: filtered noise that sweeps up (open) or down (close). */
  air(up = true, gain = 0.05, len = 0.45) {
    const ctx = this.ctx, t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noise(ctx, len + 0.1);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(up ? 500 : 2600, t); bp.frequency.exponentialRampToValueAtTime(up ? 2600 : 500, t + len);
    const a = ctx.createGain();
    a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(gain, t + len * 0.45); a.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(bp).connect(a).connect(this.fx); src.start(t); src.stop(t + len + 0.05);
  }

  /* ── Named interface sounds ─────────────────────────────────────── */
  has(name) { return UI_SOUNDS.has(name); }

  ui(name, opts = {}) {
    const step = Math.max(0, Math.min(SCALE.length - 1, opts.step | 0));
    switch (name) {
      case 'hover': this.blip(opts.freq || 2349.32, 0.022, 0.045); return true;                  // D7, barely there
      case 'tick': this.tap(opts.freq || 880, 0.07); return true;
      case 'note': this.bell(SCALE[step], { gain: opts.soft ? 0.05 : 0.1, decay: opts.soft ? 1.2 : 1.9, at: opts.at || 0 }); return true;
      case 'select': this.bell(SCALE[step + 2] || SCALE[step], { gain: 0.09, decay: 1.7 }); return true;
      case 'ping': this.bell(SCALE[step + 5] || SCALE[SCALE.length - 1], { gain: 0.018, decay: 1.4, bright: 0.6 }); return true;
      case 'next': this.tap(987.77, 0.06); this.tap(1318.51, 0.045, 0.06); return true;          // B5 → E6
      case 'back': this.tap(1318.51, 0.05); this.tap(987.77, 0.045, 0.06); return true;
      case 'open': this.air(true, 0.03); return true;
      case 'close': this.air(false, 0.024, 0.35); return true;
      case 'on': [[0, 0.07], [3, 0.06], [5, 0.05]].forEach(([s, v], k) => this.bell(SCALE[s], { gain: v, decay: 2.4, at: k * 0.09 })); return true;
      case 'chime': [[0, 0.08], [2, 0.07], [3, 0.07], [5, 0.075]].forEach(([s, v], k) => this.bell(SCALE[s], { gain: v, decay: 2.8, at: k * 0.11 })); return true;
      case 'error': this.bell(293.66, { gain: 0.07, decay: 1.2, bright: 0.5 }); this.bell(246.94, { gain: 0.06, decay: 1.5, bright: 0.5, at: 0.16 }); return true;
      default: return false;
    }
  }
}

/* A dark, natural room: decaying stereo noise, smoothed more as it fades. */
function room(ctx, seconds) {
  const rate = ctx.sampleRate, len = Math.floor(rate * seconds), pre = Math.floor(rate * 0.018);
  const buf = ctx.createBuffer(2, len, rate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    for (let i = pre; i < len; i++) {
      const x = (i - pre) / (len - pre);
      const k = 0.55 - 0.45 * x;                      // brighter early, darker late
      lp += k * ((Math.random() * 2 - 1) - lp);
      d[i] = lp * Math.pow(1 - x, 2.4) * 0.9;
    }
  }
  return buf;
}

function noise(ctx, seconds) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}
