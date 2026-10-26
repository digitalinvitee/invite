/* ==========================================================================
   Contact — two entry points ("Start a project" / "Just say hello"),
   client-side validation, loading / error / success states, honeypot and
   time-trap spam protection, and an honest not-connected state.

   The project brief is a four-step flow (type → description → timing and
   budget → contact details, with a review of the earlier answers). Every field
   stays in the one form, so answers are kept when moving back and forth, and
   without the script all four steps simply show as one form.
   ========================================================================== */

import { config } from '../config.js';
import { $, $$, el, tablist, loadScript } from '../core/dom.js';
import { t } from '../i18n/index.js';
import { isConfigured, send } from './FormService.js';
import { audio } from '../audio/AudioController.js';
import { motion } from '../core/motion.js';
import { whatsappNumber, whatsappUrl } from '../core/whatsapp.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_MS = 2500;   // humans take longer than this; most bots do not
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const RULES = {
  project: [
    ['category', (v) => (v ? '' : t('form.category')), 'p-category-err', 0],
    ['description', (v) => (v.trim().length >= 15 ? '' : t('form.description')), null, 1],
    ['name', (v) => (v.trim() ? '' : t('form.name')), null, 3],
    ['email', (v) => (!v.trim() ? t('form.email') : EMAIL.test(v.trim()) ? '' : t('form.emailFormat')), null, 3]
  ],
  hello: [
    ['name', (v) => (v.trim() ? '' : t('form.name'))],
    ['email', (v) => (!v.trim() ? t('form.email') : EMAIL.test(v.trim()) ? '' : t('form.emailFormat'))],
    ['message', (v) => (v.trim().length >= 2 ? '' : t('form.message'))]
  ]
};

export function initContactForm() {
  const root = $('[data-contact]');
  if (!root) return;
  const connected = isConfigured();
  if (!connected) {
    // Say exactly what the form can do until a provider is connected (see js/config.js).
    const notice = $('[data-form-setup-notice]', root);
    const email = config.studio.email;
    notice.replaceChildren(el('span', { text: email ? t('form.setupEmail', { email }) : t('form.setupCopy') }));
    notice.hidden = false;
  }

  // Direct email and WhatsApp, once configured
  const direct = $('[data-direct]');
  if (direct) {
    const link = $('[data-email-link]', direct), wa = $('[data-whatsapp-link]', direct);
    if (config.studio.email && link) { link.href = `mailto:${config.studio.email}`; link.textContent = config.studio.email; link.hidden = false; }
    if (whatsappNumber() && wa) {
      wa.href = whatsappUrl();
      $('[data-whatsapp-number]', wa).textContent = whatsappNumber();
      wa.setAttribute('aria-label', t('form.whatsappLink', { number: whatsappNumber() }));
      wa.hidden = false;
    }
    direct.hidden = !(config.studio.email || whatsappNumber());
  }

  // Tabs: two entry points
  const tabs = $$('[role="tab"]', root);
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const selectTab = tablist(tabs, (i) => panels.forEach((p, n) => { p.hidden = n !== i; }));
  $$('[data-start-project]').forEach((a) => a.addEventListener('click', () => {
    selectTab(0);
    // "Discuss a project like this" arrives with the matching project type already chosen.
    const category = a.dataset.category;
    const project = $('form[data-form="project"]', root);
    if (category && project) {
      const radio = Array.from(project.elements.category || []).find((r) => r.value === category);
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
      if (project._steps) project._steps.go(0, { focus: false });
    }
  }));

  tabs.forEach((tab) => tab.addEventListener('click', () => audio.play('tick')));
  $$('form[data-form]', root).forEach((form) => {
    setupForm(form, form.dataset.form, connected);
    // Choosing an answer (project type, timeline, budget) taps softly.
    form.addEventListener('change', (e) => { if (e.target.type === 'radio') audio.play('tick', { freq: 1046.5 }); });
  });
}

function setupForm(form, kind, connected) {
  const rules = RULES[kind];
  const started = Date.now();
  const submit = $('[data-submit]', form);
  const submitLabel = $('[data-submit-label]', form);
  const errorBox = $('[data-form-error]', form);
  // The button says what will really happen: send, open an email, or prepare a copy.
  if (!connected) submitLabel.textContent = t(config.studio.email ? 'form.prepareEmail' : 'form.prepareCopy');
  const defaultLabel = submitLabel.textContent;
  const captcha = connected ? mountTurnstile(form) : null;

  const field = (name) => form.elements[name];
  const valueOf = (name) => {
    const f = field(name);
    if (!f) return '';
    if (f instanceof RadioNodeList) return f.value || '';
    return f.value || '';
  };
  const errorEl = (name, override) => document.getElementById(override || `${kind === 'project' ? 'p' : 'h'}-${name}-err`);

  const check = (name, rule, errId) => {
    const msg = rule(valueOf(name));
    const f = field(name);
    const target = f instanceof RadioNodeList ? null : f;
    if (target) target.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const err = errorEl(name, errId);
    if (err) err.textContent = msg;
    return !msg;
  };

  // Validate on blur once a field has been touched; clear as soon as it is fixed.
  // Pressing Continue, Back or Send also takes the focus out of the field. A message appearing under the field at that
  // moment would push the button away from under the pointer, so the click would never arrive. While such a press is
  // under way the field is left alone; Continue and Send check everything themselves, and Back needs no check.
  // A mouse moves the focus before the button is released, but a finger only afterwards (when the browser sends the
  // mouse events that follow a tap), so the press lasts until the click, not until the pointer is lifted.
  let pressing = false;
  const release = () => { pressing = false; };
  form.addEventListener('pointerdown', (e) => {
    if (!e.target.closest || !e.target.closest('.form__submit, .form__more summary')) return;
    pressing = true;
    addEventListener('click', release, { once: true, capture: true });
    addEventListener('pointercancel', release, { once: true });
    setTimeout(release, 2000);
  }, true);
  rules.forEach(([name, rule, errId]) => {
    const f = field(name);
    if (!f) return;
    const nodes = f instanceof RadioNodeList ? Array.from(f) : [f];
    nodes.forEach((n) => {
      n.addEventListener('blur', () => { if (n.value && !pressing) check(name, rule, errId); });
      n.addEventListener('input', () => { if (n.getAttribute('aria-invalid') === 'true') check(name, rule, errId); });
      n.addEventListener('change', () => { const err = errorEl(name, errId); if (err && err.textContent) check(name, rule, errId); });
    });
  });

  const steps = kind === 'project' && form.classList.contains('form--steps') ? stepper(form, rules, (...a) => check(...a), valueOf) : null;
  form._steps = steps;

  const collect = () => {
    const data = {};
    new FormData(form).forEach((v, k) => { if (k !== 'website') data[k] = String(v).trim(); });
    return data;
  };

  const summary = (data) => {
    const lines = kind === 'project'
      ? [`Project brief — INVITÉ Studio`, '', `Name: ${data.name}`, `Email: ${data.email}`, data.company ? `Company or brand: ${data.company}` : null,
        `Planning: ${data.category}`, data.timeline ? `Timeline: ${data.timeline}` : null, data.budget ? `Budget: ${data.budget}` : null, '', data.description, data.notes ? `\nNotes: ${data.notes}` : null]
      : [`Hello — INVITÉ Studio`, '', `Name: ${data.name}`, `Email: ${data.email}`, '', data.message];
    return lines.filter((l) => l !== null).join('\n');
  };

  const setBusy = (busy) => {
    submit.disabled = busy;
    submit.setAttribute('aria-busy', String(busy));
    submitLabel.textContent = busy ? t('form.sending') : defaultLabel;
    const spinner = $('.spinner', submit);
    if (busy && !spinner) submit.prepend(el('span', { class: 'spinner', 'aria-hidden': 'true' }));
    if (!busy && spinner) spinner.remove();
  };

  let sending = false;   // one request at a time, whatever triggers the submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    errorBox.hidden = true;
    if (steps && !steps.atLast()) { steps.next(); return; }
    const results = rules.map(([name, rule, errId]) => check(name, rule, errId));
    const firstBad = rules.find((r, i) => !results[i]);
    if (firstBad) {
      if (steps && firstBad[3] != null) steps.go(firstBad[3], { focus: false });
      const f = field(firstBad[0]);
      (f instanceof RadioNodeList ? f[0] : f).focus();
      return;
    }
    // Honeypot: never sent. A person whose browser filled the hidden field still gets told it did not send.
    if (form.elements.website && form.elements.website.value) { errorBox.textContent = `${t('form.errorTitle')} ${t('form.errorText')}`; errorBox.hidden = false; return; }
    if (Date.now() - started < MIN_FILL_MS) { errorBox.textContent = t('form.tooFast'); errorBox.hidden = false; return; }

    const data = collect();
    data.elapsedMs = String(Date.now() - started);   // lets the server-side time-trap reject instant bot posts
    if (!connected) { showNotConnected(form, data, summary(data), kind); return; }
    if (captcha) {
      const token = captcha.token();
      if (!token) { errorBox.textContent = t(captcha.failed() ? 'form.verifyFailed' : 'form.verifyWait'); errorBox.hidden = false; return; }
      data.turnstileToken = token;
    }

    sending = true;
    setBusy(true);
    let result;
    try { result = await send(kind, data); } finally { sending = false; setBusy(false); }
    if (captcha) captcha.reset();   // a token can only be used once
    if (result.ok) { showSuccess(form, data); audio.play('chime'); return; }
    // Say what actually happened; the answers stay in the form.
    const reason = { timeout: t('form.errorTimeout'), network: t('form.errorNetwork'), unreadable: t('form.errorNetwork') }[result.reason]
      || (result.reason === 'provider' && result.message ? t('form.errorRejected', { detail: String(result.message).slice(0, 160) }) : t('form.errorGeneric'));
    const email = config.studio.email;
    const [before, after = ''] = (email ? t('form.errorTextEmail') : t('form.errorText')).split('{email}');
    // The message is already written, so WhatsApp can carry it as it is.
    const wa = whatsappUrl(summary(data));
    errorBox.replaceChildren(el('span', { class: 'notice__body' }, [
      el('span', {}, [el('strong', { text: t('form.errorTitle') }), ` ${reason} ${before}`, email ? el('a', { href: `mailto:${email}`, text: email }) : null, after]),
      wa ? el('a', { class: 'btn btn--ghost btn--sm', href: wa, target: '_blank', rel: 'noopener', text: t('form.sendWhatsapp') }) : null
    ]));
    errorBox.hidden = false;
    errorBox.setAttribute('tabindex', '-1');
    errorBox.focus();
    audio.play('error');
  });
}

function showSuccess(form, data) {
  const first = (data.name || '').split(/\s+/)[0];
  // Confirmed by the server, so the form can be cleared for a next message.
  form.reset();
  form.querySelectorAll('.field__error').forEach((p) => { p.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach((f) => f.setAttribute('aria-invalid', 'false'));
  if (form._steps) form._steps.go(0, { focus: false });
  const box = el('div', { class: 'form-success', role: 'status', tabindex: '-1' }, [
    el('p', { class: 'label label--accent', text: '●  Received' }),
    el('h3', { text: t('form.successTitle', { name: first }) }),
    el('p', { text: t('form.successText', { email: data.email }) }),
    el('button', { class: 'btn btn--ghost', type: 'button', text: t('form.successAgain'), onclick: () => { box.remove(); form.hidden = false; if (form._steps) form._steps.go(0); else form.querySelector('input').focus(); } })
  ]);
  form.hidden = true;
  form.after(box);
  box.focus();
}

function showNotConnected(form, data, text, kind) {
  const existing = form.parentElement.querySelector('.copy-box');
  if (existing) existing.remove();
  const email = config.studio.email;
  const pre = el('pre', { text });
  const copyBtn = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: t('form.copy') });
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(text); copyBtn.textContent = t('form.copied'); }
    catch (e) {
      const range = document.createRange(); range.selectNodeContents(pre);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      copyBtn.textContent = t('form.selectCopy');
    }
  });
  const intro = el('p', {}, [el('strong', { text: t('form.notConnectedTitle') }), ' ', email ? t('form.notConnectedEmail', { email }) : t('form.notConnectedText')]);
  const wa = whatsappUrl(text);
  const actions = [copyBtn];
  if (email) actions.push(el('a', { class: 'btn btn--primary btn--sm', href: `mailto:${email}?subject=${encodeURIComponent(kind === 'project' ? `Project brief · ${data.category || 'INVITÉ'}` : 'Hello INVITÉ')}&body=${encodeURIComponent(text)}`, text: `Email ${email}` }));
  if (wa) actions.push(el('a', { class: 'btn btn--ghost btn--sm', href: wa, target: '_blank', rel: 'noopener', text: t('form.sendWhatsapp') }));
  const children = [intro, pre, el('div', { class: 'form__submit' }, actions)];
  const box = el('div', { class: 'copy-box notice', role: 'status', tabindex: '-1' }, [el('div', { style: 'display:grid;gap:.75rem;min-width:0' }, children)]);
  form.querySelector('.form__foot').before(box);
  box.focus();
}

/* ── The four-step project brief ────────────────────────────────────── */
function stepper(form, rules, check, valueOf) {
  const steps = $$('[data-step]', form);
  const head = $('[data-steps-head]', form);
  const num = $('[data-step-num]', form), name = $('[data-step-name]', form);
  const bar = $$('.steps-head__bar li', form);
  const back = $('[data-step-back]', form), next = $('[data-step-next]', form), submit = $('[data-submit]', form);
  const review = $('[data-review]', form), reviewList = $('[data-review-list]', form);
  const last = steps.length - 1;
  let current = 0;

  head.hidden = false;
  form.classList.add('is-stepped');

  const validate = (i) => {
    const own = rules.filter((r) => r[3] === i);
    const results = own.map(([n, rule, errId]) => check(n, rule, errId));
    const bad = own.find((r, k) => !results[k]);
    if (bad) {
      const f = form.elements[bad[0]];
      (f instanceof RadioNodeList ? f[0] : f).focus();
      return false;
    }
    return true;
  };

  const fillReview = () => {
    const none = t('form.reviewNone');
    const desc = valueOf('description').trim();
    const rows = [
      [t('form.reviewType'), valueOf('category') || none, 0],
      [t('form.reviewProject'), desc.length > 140 ? `${desc.slice(0, 140).trim()}…` : desc || none, 1],
      [t('form.reviewTiming'), [valueOf('timeline'), valueOf('budget')].filter(Boolean).join(' · ') || none, 2]
    ];
    reviewList.replaceChildren(...rows.map(([label, value, step]) => el('div', { class: 'review__row' }, [
      el('dt', { text: label }),
      el('dd', {}, [el('span', { text: value }), el('button', { class: 'review__edit', type: 'button', onclick: () => go(step) }, [t('form.reviewEdit'), el('span', { class: 'sr-only', text: ` ${label.toLowerCase()}` })])])
    ])));
    review.hidden = false;
  };

  function go(i, { focus = true } = {}) {
    const from = current;
    current = Math.max(0, Math.min(last, i));
    if (focus && current !== from) audio.play(current > from ? 'next' : 'back');
    steps.forEach((s, n) => {
      const show = n === current;
      if (show && s.hidden) { s.classList.remove('is-entering'); void s.offsetWidth; s.classList.add('is-entering'); }
      s.hidden = !show;
    });
    num.textContent = String(current + 1);
    name.textContent = steps[current].dataset.stepName || '';
    bar.forEach((li, n) => { li.classList.toggle('is-done', n < current); li.classList.toggle('is-current', n === current); });
    back.hidden = current === 0;
    next.hidden = current === last;
    submit.hidden = current !== last;
    if (current === last) fillReview();
    if (focus) {
      const q = $('.step__q', steps[current]);
      if (q) q.focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * 0.6) form.scrollIntoView({ block: 'start', behavior: motion.reduced ? 'auto' : 'smooth' });
    }
  }

  next.addEventListener('click', () => api.next());
  back.addEventListener('click', () => go(current - 1));
  // Enter in a single-line field or a choice moves on (in the last step it sends, as usual).
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || current === last) return;
    const tgt = e.target;
    if (tgt.tagName === 'TEXTAREA' || tgt.tagName === 'BUTTON' || tgt.tagName === 'SUMMARY') return;
    e.preventDefault();
    api.next();
  });

  const api = {
    go,
    atLast: () => current === last,
    next: () => { if (validate(current)) go(current + 1); }
  };
  go(0, { focus: false });
  return api;
}

/* Optional Cloudflare Turnstile for the 'custom' endpoint. The script loads only once the visitor
   starts filling in the form, so nothing is fetched from Cloudflare by people who never use it. */
function mountTurnstile(form) {
  const key = config.forms.turnstileSiteKey;
  if (!key || config.forms.provider !== 'custom') return null;
  const slot = el('div', { class: 'form__captcha' });
  $('.form__submit', form).before(slot);
  let id = null, failed = false, started = false;
  const start = () => {
    if (started) return;
    started = true;
    loadScript(TURNSTILE_URL)
      .then(() => { id = window.turnstile.render(slot, { sitekey: key, theme: 'dark', size: 'flexible', 'error-callback': () => { failed = true; } }); })
      .catch(() => { failed = true; });
  };
  form.addEventListener('focusin', start);
  return {
    token: () => { start(); return id !== null && window.turnstile ? window.turnstile.getResponse(id) || '' : ''; },
    failed: () => failed,
    reset: () => { if (id !== null && window.turnstile) window.turnstile.reset(id); }
  };
}
