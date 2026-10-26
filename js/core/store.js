/* localStorage that never throws (private windows, blocked storage, sandboxed previews). */
const PREFIX = 'invite.';

export const store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(PREFIX + key); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, String(value)); } catch (e) { /* storage unavailable */ }
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch (e) { /* storage unavailable */ }
  }
};
