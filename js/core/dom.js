export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of [].concat(children)) if (child != null) node.append(child);
  return node;
}

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Loads a classic script once (used for the optional Turnstile check on the contact form). */
const scripts = new Map();
export function loadScript(url) {
  const href = String(url);
  if (!scripts.has(href)) {
    scripts.set(href, new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = href; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { scripts.delete(href); reject(new Error(`Could not load ${href}`)); };
      document.head.append(s);
    }));
  }
  return scripts.get(href);
}

/* Roving tabindex + arrow keys for a tablist. Returns select(index). */
export function tablist(tabs, onSelect) {
  let current = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  const select = (i, focus = false) => {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach((t, n) => {
      t.setAttribute('aria-selected', String(n === current));
      t.tabIndex = n === current ? 0 : -1;
    });
    if (focus) tabs[current].focus();
    onSelect(current);
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in keys) { e.preventDefault(); select(current + keys[e.key], true); }
      else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });
  return select;
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
