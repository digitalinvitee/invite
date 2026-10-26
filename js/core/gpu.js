/* GPU scheduler: prevents simultaneous WebGL workloads.
   Modes: 'page' (visible page scenes may run) · 'intro' · 'dialog' (only the focused scene runs).
   A scene is any object with start() and stop(). */

const scenes = new Map();   // scene -> { layer, visible }
let mode = 'page';
let focused = null;

function sync() {
  for (const [scene, s] of scenes) {
    const allowed = mode === 'page' ? (s.layer === 'page' && s.visible) : scene === focused;
    if (allowed && !s.running) { s.running = true; try { scene.start(); } catch (e) { console.error(e); } }
    else if (!allowed && s.running) { s.running = false; try { scene.stop(); } catch (e) { console.error(e); } }
  }
}

export const gpu = {
  /* layer: 'page' scenes run while visible; 'exclusive' scenes only run when focused */
  register(scene, { layer = 'page', element = null } = {}) {
    const state = { layer, visible: !element, running: false };
    scenes.set(scene, state);
    if (element && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        state.visible = entries[entries.length - 1].isIntersecting;
        sync();
      }, { rootMargin: '80px' });
      io.observe(element);
      state.io = io;
    }
    sync();
    return () => gpu.unregister(scene);
  },
  unregister(scene) {
    const s = scenes.get(scene);
    if (!s) return;
    if (s.running) { try { scene.stop(); } catch (e) { /* ignore */ } }
    if (s.io) s.io.disconnect();
    scenes.delete(scene);
    if (focused === scene) focused = null;
  },
  /* Run one scene exclusively (intro, an open experiment); everything else pauses. */
  focus(scene, newMode = 'dialog') {
    const prev = focused && scenes.get(focused);
    if (prev && focused !== scene && prev.temporary) {
      if (prev.running) { try { focused.stop(); } catch (e) { /* ignore */ } }
      scenes.delete(focused);
    }
    if (!scenes.has(scene)) scenes.set(scene, { layer: 'exclusive', visible: true, running: false, temporary: true });
    focused = scene; mode = newMode; sync();
  },
  release() {
    const prev = focused;
    focused = null; mode = 'page';
    if (prev && scenes.get(prev) && scenes.get(prev).temporary) {
      const s = scenes.get(prev);
      if (s.running) { try { prev.stop(); } catch (e) { /* ignore */ } }
      scenes.delete(prev);
    }
    sync();
  },
  get mode() { return mode; }
};
