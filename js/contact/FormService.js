/* ==========================================================================
   FormService — delivers enquiries to the configured provider.
   Returns { ok: true } only when the provider confirms that it saved the
   enquiry. Never simulates success, and never treats an unreadable response
   as a success.

   Google Apps Script ('appsscript'):
   - The request is a "simple" CORS request: POST with a text/plain body that
     contains JSON. A JSON content type would make the browser send a preflight
     (OPTIONS) request first, which Apps Script web apps cannot answer, so the
     browser would block the send before it reached the script.
   - Apps Script answers with a redirect to script.googleusercontent.com, which
     returns the JSON with "Access-Control-Allow-Origin: *". fetch follows the
     redirect and can read that JSON, so the page knows the real result:
     {"success":true,"emailSent":true} or {"success":false,"error":"…"}.
   - If the web app is not deployed for "Anyone", Google answers with a sign-in
     page instead of JSON; that is reported as a failure, not a success.
   ========================================================================== */

import { config } from '../config.js';

const APPS_SCRIPT = /^https:\/\/script\.google(usercontent)?\.com\//;

function provider() {
  const f = config.forms;
  // An Apps Script URL entered under 'custom' is still Apps Script.
  if (f.provider === 'custom' && APPS_SCRIPT.test(f.customEndpoint || '')) return 'appsscript';
  return f.provider;
}

export function isConfigured() {
  const f = config.forms;
  switch (provider()) {
    case 'appsscript': return APPS_SCRIPT.test(f.appsScriptUrl || f.customEndpoint || '');
    case 'formspree': return !!f.formspreeId;
    case 'web3forms': return !!f.web3formsKey;
    case 'custom': return !!f.customEndpoint;
    default: return false;
  }
}

function subjectFor(kind, data) {
  if (kind === 'project') return `New project brief · ${data.category || 'Project'} · ${data.company || data.name}`;
  return `Hello from ${data.name}`;
}

/* The fields the Apps Script reads, named as it expects. A "Just say hello" message becomes a
   General Inquiry with the message as its description. */
export function toAppsScript(kind, data) {
  const isProject = kind === 'project';
  const projectType = isProject ? (data.category || '') : 'General Inquiry';
  const description = isProject ? (data.description || '') : (data.message || '');
  return {
    kind,
    name: data.name || '', fullName: data.name || '',
    email: data.email || '',
    company: isProject ? (data.company || '') : '',
    category: projectType, projectType,
    description, message: description,
    budget: isProject ? (data.budget || '') : '',
    timeline: isProject ? (data.timeline || '') : '',
    notes: isProject ? (data.notes || '') : '',
    website: ''   // honeypot: filled-in submissions never leave the browser (see ContactForm.js)
  };
}

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return null; }
}

export async function send(kind, data) {
  if (!isConfigured()) return { ok: false, reason: 'not-configured' };
  const f = config.forms;
  const which = provider();
  const controller = 'AbortController' in window ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), f.timeoutMs || 20000) : 0;
  const signal = controller ? controller.signal : undefined;

  try {
    if (which === 'appsscript') {
      const res = await fetch(f.appsScriptUrl || f.customEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(toAppsScript(kind, data)),
        redirect: 'follow',
        credentials: 'omit',
        cache: 'no-store',
        signal
      });
      const json = await readJson(res);
      if (!json) return { ok: false, reason: 'unreadable', status: res.status };   // e.g. a Google sign-in page
      if (json.success === true) return { ok: true, emailSent: json.emailSent !== false };
      return { ok: false, reason: 'provider', message: json.error || json.message || '' };
    }

    const payload = { kind, ...data, page: location.href, sentAt: new Date().toISOString() };
    let url, body;
    if (which === 'formspree') {
      url = `https://formspree.io/f/${encodeURIComponent(f.formspreeId)}`;
      body = { ...payload, _subject: subjectFor(kind, data), _replyto: data.email };
    } else if (which === 'web3forms') {
      url = 'https://api.web3forms.com/submit';
      body = { access_key: f.web3formsKey, subject: subjectFor(kind, data), from_name: 'INVITÉ website', replyto: data.email, ...payload };
    } else {
      url = f.customEndpoint;
      body = payload;
    }
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal });
    const json = await readJson(res);
    if (!res.ok) return { ok: false, reason: 'http', status: res.status, message: json && (json.error || json.message) };
    if (which === 'web3forms' && (!json || json.success !== true)) return { ok: false, reason: 'provider', message: json && json.message };
    if (which === 'custom' && json && (json.ok === false || json.success === false)) return { ok: false, reason: 'provider', message: json.error };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e && e.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}
