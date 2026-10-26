/* Graphics quality presets.
   high   → full shader resolution, all scenes
   medium → reduced resolution and geometry
   low    → static fallbacks instead of animated WebGL (no GPU, data saver,
            very low memory/cores). The WebGL experiments in the Lab still open
            on request, at reduced resolution.
   Override for testing with ?quality=low|medium|high */

import { motion } from './motion.js';

function probe(strict) {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl', strict ? { failIfMajorPerformanceCaveat: true } : undefined) || (!strict && c.getContext('experimental-webgl'));
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch (e) { return false; }
}

const hardware = probe(true);               // a real GPU
const webgl = hardware || probe(false);     // any WebGL, including software rendering

function detectTier() {
  const forced = new URLSearchParams(location.search).get('quality');
  if (forced === 'low' || forced === 'medium' || forced === 'high') return forced;
  if (!hardware) return 'low';
  const conn = navigator.connection || {};
  if (conn.saveData) return 'low';
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const small = Math.min(screen.width, screen.height) < 500;
  if (mem <= 2 || cores <= 2) return 'low';
  if (mem <= 4 || cores <= 4 || small) return 'medium';
  return 'high';
}

const tier = detectTier();

export const quality = {
  webgl,
  hardware,
  tier,
  /* Device-pixel-ratio cap per tier */
  get dpr() { return Math.min(window.devicePixelRatio || 1, tier === 'high' ? 1.75 : tier === 'medium' ? 1.25 : 1); },
  /* Use static fallbacks instead of continuous WebGL animation */
  get staticOnly() { return tier === 'low' || !webgl || motion.reduced; }
};

document.documentElement.dataset.quality = tier;
