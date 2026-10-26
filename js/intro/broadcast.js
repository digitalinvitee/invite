/* What the broken television is receiving: painted into a 2D canvas that the CRT
   shader then distorts. Painting happens only when something visible changes. */

const OSD_COLOR = '#E9EDFF';

export function setDisplayFont(ctx, px, weight = 800) {
  ctx.font = `${weight} ${px}px Archivo, "Arial Black", Arial, sans-serif`;
  if ('fontStretch' in ctx) ctx.fontStretch = 'expanded';
}

/* Fits a word to a share of the canvas width, capped by height. */
export function fitWord(ctx, text, W, H, { share = 0.78, cap = 0.42, weight = 800 } = {}) {
  setDisplayFont(ctx, 100, weight);
  const width = ctx.measureText(text).width || 1;
  const px = Math.min(H * cap, (100 * W * share) / width);
  setDisplayFont(ctx, px, weight);
  return px;
}

export function paintWord(ctx, W, H, text, { y = 0.5, glow = true, share, cap } = {}) {
  const portrait = W < H;
  const px = fitWord(ctx, text, W, H, { share: share || (portrait ? 0.86 : 0.76), cap: cap || 0.4 });
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#F6F5F2';
  if (glow) { ctx.shadowColor = 'rgba(255,255,255,.35)'; ctx.shadowBlur = px * 0.08; }
  ctx.fillText(text, W / 2, H * y);
  ctx.restore();
  return px;
}

export function paintOSD(ctx, W, H, { channel = '', bottom = '', showBottom = true, volume = 0, volumeLabel = 'VOLUME' } = {}) {
  ctx.save();
  ctx.textBaseline = 'top';
  ctx.fillStyle = OSD_COLOR;
  ctx.shadowColor = 'rgba(184,196,255,.8)';
  ctx.shadowBlur = 12;
  const fs = Math.round(Math.min(W, H * 1.6) * 0.045);
  ctx.font = `${fs}px VT323, ui-monospace, monospace`;
  if (channel) { ctx.textAlign = 'right'; ctx.fillText(channel, W * 0.93, H * 0.08); }
  if (bottom && showBottom) { ctx.textAlign = 'left'; ctx.fillText(bottom, W * 0.07, H * 0.86); }
  if (volume > 0) {
    ctx.textAlign = 'left';
    ctx.fillText(volumeLabel, W * 0.07, H * 0.08);
    for (let i = 0; i < 14; i++) {
      ctx.globalAlpha = i < volume ? 1 : 0.25;
      ctx.fillRect(W * 0.07 + i * fs * 0.42, H * 0.08 + fs * 1.05, fs * 0.28, fs * 0.55);
    }
  }
  ctx.restore();
}

/* A monochrome test card in the INVITÉ palette (one lavender bar). */
export function paintTestCard(ctx, W, H, label = 'INVITÉ  TEST CARD') {
  const cols = ['#F3F2EF', '#D6D7D9', '#BFC1C7', '#B8C4FF', '#8A8C93', '#55565B', '#1C1C1F'];
  const bw = W / cols.length, top = H * 0.66;
  cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * bw, 0, bw + 1, top); });
  [...cols].reverse().forEach((c, i) => { ctx.fillStyle = i % 2 ? '#0A0A0B' : c; ctx.fillRect(i * bw, top, bw + 1, H * 0.08); });
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#000'); g.addColorStop(1, '#fff');
  ctx.fillStyle = g; ctx.fillRect(0, top + H * 0.08, W, H * 0.26);
  const R = Math.min(W, H) * 0.3;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, W * 0.003);
  ctx.beginPath(); ctx.arc(W / 2, H * 0.45, R, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 - R, H * 0.45); ctx.lineTo(W / 2 + R, H * 0.45); ctx.moveTo(W / 2, H * 0.45 - R); ctx.lineTo(W / 2, H * 0.45 + R); ctx.stroke();
  const bh = Math.min(W, H) * 0.09, bw2 = Math.min(W * 0.8, bh * 7);
  ctx.fillStyle = '#0A0A0B'; ctx.fillRect(W / 2 - bw2 / 2, H * 0.45 - bh / 2, bw2, bh);
  ctx.fillStyle = '#F3F2EF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(bh * 0.7)}px VT323, ui-monospace, monospace`;
  ctx.fillText(label, W / 2, H * 0.45);
}

/* Generative pattern: interference lines (used by Lab experiment 04). */
export function paintPattern(ctx, W, H, seed = 0) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#F3F2EF'; ctx.lineWidth = Math.max(1, W / 640);
  const n = 46;
  for (let i = 0; i < n; i++) {
    const y0 = (i / n) * H;
    ctx.globalAlpha = 0.25 + 0.75 * ((i % 7) / 7);
    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const y = y0 + Math.sin(x * 0.012 + i * 0.35 + seed) * H * 0.02 + Math.sin(x * 0.003 - seed * 0.7) * H * 0.04;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function clear(ctx, W, H) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
