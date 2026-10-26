import en from './en.js';

/* Register translations here, keyed by the <html lang> value. */
const dictionaries = { en };

const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
export const strings = dictionaries[lang] || en;

/* t('form.successTitle', { name: 'Ana' }) → "Received. Thank you, Ana." */
export function t(path, vars) {
  const value = path.split('.').reduce((node, key) => (node == null ? node : node[key]), strings);
  const text = value == null ? path.split('.').reduce((node, key) => (node == null ? node : node[key]), en) : value;
  if (typeof text !== 'string' || !vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : String(vars[k])));
}
