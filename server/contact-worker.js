/* ==========================================================================
   INVITÉ contact endpoint — Cloudflare Worker (optional backend)

   Receives the JSON that js/contact/FormService.js posts when
   config.forms.provider = 'custom', validates it again on the server, filters
   spam, and delivers the enquiry by email through the Resend API.
   Nothing is stored: the enquiry goes straight to the studio inbox.

   Settings (Cloudflare dashboard → Worker → Settings → Variables, or wrangler):
     RESEND_API_KEY    secret, required   Resend API key
     TO_EMAIL          required           inbox that receives enquiries
     FROM_EMAIL        required           sender on a domain verified in Resend,
                                          e.g. "INVITÉ website <web@your-domain>"
     ALLOWED_ORIGIN    required           site origin(s), comma-separated,
                                          e.g. "https://invitee.ge"
     TURNSTILE_SECRET  secret, optional   enables Cloudflare Turnstile checks
                                          (also set forms.turnstileSiteKey in js/config.js)
   Optional KV binding RATE_LIMIT: best-effort limit of 5 enquiries per IP per 10 minutes.
   ========================================================================== */

const LIMITS = {
  name: 120, email: 200, company: 160, category: 80, timeline: 60, budget: 60,
  description: 4000, notes: 4000, message: 4000, page: 300
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CATEGORIES = ['Digital Advertising', 'Launch & Interactive Experience', 'Creative Website', 'Private or Corporate Event', 'Something Else', 'Not Sure Yet',
  // earlier choices, still accepted so a page loaded before the three-service update can finish sending
  'Interactive Experience', 'Launch Campaign', 'Digital Invitation & RSVP'];
const MIN_FILL_MS = 2500;      // same threshold as the browser
const MAX_BODY = 20000;        // characters of JSON
const RATE = { max: 5, windowSec: 600 };

export default {
  async fetch(request, env) {
    const allowed = String(env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin'
    };
    if (allowed.includes(origin)) cors['Access-Control-Allow-Origin'] = origin;
    const reply = (status, body) => new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
    });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, { ok: false, error: 'Method not allowed.' });
    if (!allowed.length || !allowed.includes(origin)) return reply(403, { ok: false, error: 'Origin not allowed.' });
    if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) return reply(500, { ok: false, error: 'The contact endpoint is not configured.' });
    if (!String(request.headers.get('Content-Type') || '').includes('application/json')) return reply(415, { ok: false, error: 'Send JSON.' });

    // Refuse an oversized body before reading any of it (a character can take up to 4 bytes); the check below is exact.
    if (Number(request.headers.get('Content-Length')) > MAX_BODY * 4) return reply(413, { ok: false, error: 'The message is too long.' });
    const raw = await request.text();
    if (raw.length > MAX_BODY) return reply(413, { ok: false, error: 'The message is too long.' });
    let data;
    try { data = JSON.parse(raw); } catch (e) { return reply(400, { ok: false, error: 'Invalid request.' }); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, { ok: false, error: 'Invalid request.' });

    // Spam traps. Bots get a normal-looking answer and learn nothing; people never reach this,
    // because the browser stops early submissions with a visible message and the trap field is hidden.
    if (data.website) return reply(200, { ok: true });
    const elapsed = Number(data.elapsedMs);
    if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return reply(200, { ok: true });

    const ip = request.headers.get('CF-Connecting-IP') || '';
    if (env.RATE_LIMIT && ip && await overLimit(env.RATE_LIMIT, ip)) {
      return reply(429, { ok: false, error: 'Too many messages in a short time. Please try again later.' });
    }

    if (env.TURNSTILE_SECRET) {
      const passed = await verifyTurnstile(env.TURNSTILE_SECRET, data.turnstileToken, ip);
      if (!passed) return reply(400, { ok: false, error: 'The security check did not pass. Please try again.' });
    }

    const { clean, errors } = validate(data);
    if (errors.length) return reply(422, { ok: false, error: 'Some fields need attention.', fields: errors });

    const mail = compose(clean);
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.FROM_EMAIL,
          to: String(env.TO_EMAIL).split(',').map((s) => s.trim()).filter(Boolean),
          reply_to: clean.email,
          subject: mail.subject,
          text: mail.text,
          html: mail.html
        })
      });
      if (!res.ok) {
        console.error('Resend rejected the email', res.status, await res.text().catch(() => ''));
        return reply(502, { ok: false, error: 'The message could not be delivered.' });
      }
    } catch (e) {
      console.error('Resend unreachable', e && e.message);
      return reply(502, { ok: false, error: 'The message could not be delivered.' });
    }
    return reply(200, { ok: true });
  }
};

function validate(data) {
  const kind = data.kind === 'project' || data.kind === 'hello' ? data.kind : null;
  const clean = { kind };
  for (const [key, max] of Object.entries(LIMITS)) {
    if (data[key] == null) continue;
    clean[key] = String(data[key]).replace(/\r\n?/g, '\n').trim().slice(0, max);
  }
  const errors = [];
  if (!kind) errors.push('kind');
  if (!clean.name) errors.push('name');
  if (!clean.email || !EMAIL_RE.test(clean.email) || /[\r\n]/.test(clean.email)) errors.push('email');
  if (kind === 'project') {
    if (!CATEGORIES.includes(clean.category)) errors.push('category');
    if (!clean.description || clean.description.length < 15) errors.push('description');
  }
  if (kind === 'hello' && (!clean.message || clean.message.length < 2)) errors.push('message');
  return { clean, errors };
}

function compose(c) {
  const oneLine = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const subject = c.kind === 'project'
    ? `New project brief · ${oneLine(c.category)} · ${oneLine(c.company || c.name)}`
    : `Hello from ${oneLine(c.name)}`;
  const rows = c.kind === 'project'
    ? [['Name', c.name], ['Email', c.email], ['Company or brand', c.company], ['Planning', c.category],
       ['Timeline', c.timeline], ['Budget', c.budget], ['Description', c.description], ['Notes', c.notes], ['Sent from', c.page]]
    : [['Name', c.name], ['Email', c.email], ['Message', c.message], ['Sent from', c.page]];
  const filled = rows.filter(([, v]) => v);
  const text = filled.map(([k, v]) => `${k}: ${v}`).join('\n\n');
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const html = `<table style="font:14px/1.5 -apple-system,Segoe UI,Arial,sans-serif;border-collapse:collapse">${filled
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6B6C72;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join('')}</table>`;
  return { subject: subject.slice(0, 180), text, html };
}

async function verifyTurnstile(secret, token, ip) {
  if (!token || typeof token !== 'string') return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const json = await res.json();
    return json.success === true;
  } catch (e) {
    return false;
  }
}

/* KV is eventually consistent, so this is a soft limit, not a guarantee. */
async function overLimit(kv, ip) {
  const key = `rl:${ip}`;
  const now = Date.now();
  let hits = [];
  try { hits = JSON.parse((await kv.get(key)) || '[]'); } catch (e) { hits = []; }
  hits = hits.filter((t) => now - t < RATE.windowSec * 1000);
  if (hits.length >= RATE.max) return true;
  hits.push(now);
  await kv.put(key, JSON.stringify(hits), { expirationTtl: RATE.windowSec });
  return false;
}
