/* ==========================================================================
   CRT — a broken-television renderer in raw WebGL 1 (no three.js).
   Used by the intro and by Lab experiment 04.

   Lifecycle: new CRT(container) → resize() → markDirty() when the picture
   changes → render(time) per frame → dispose().
   The 2D "broadcast" canvas is only re-uploaded when marked dirty, so idle
   frames cost one draw call. Handles WebGL context loss and restore.
   ========================================================================== */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uOn;
uniform vec2 uPtr;
uniform float uTime, uNoise, uRGB, uRoll, uTear, uWarp, uBright, uFlick, uRecon, uPtrAmt;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 c = vUv - 0.5;
  float r2 = dot(c, c);
  vec2 uv = 0.5 + c * (1.0 + uWarp * r2);                       // curved glass
  vec2 cc = uv - 0.5;
  float ox = max(uOn.x * 0.5, 0.0006);
  float oy = max(uOn.y * 0.5, 0.0006);                           // power on / collapse
  float inside = step(abs(cc.x), ox) * step(abs(cc.y), oy);
  vec2 s = vec2(0.5 + cc.x / (ox * 2.0), 0.5 + cc.y / (oy * 2.0));
  s.y = fract(s.y + uRoll);                                      // vertical hold slipping

  float tk = floor(uTime * 24.0);

  // Signal reconstruction: bands arrive displaced and missing, then lock into place.
  float settle = 1.0 - uRecon;
  float band = floor(s.y * 22.0);
  float jitter = hash(vec2(band, floor(uTime * 10.0)));
  s.x += (hash(vec2(band, 1.7)) - 0.5) * 0.5 * settle * settle + (jitter - 0.5) * 0.05 * settle;
  float present = step(hash(vec2(band, 9.1)), uRecon * 1.25);

  // Tearing, and the disturbance under the visitor's pointer.
  float ln = floor(s.y * 160.0);
  float tear = step(0.8, hash(vec2(ln * 0.17, tk)));
  float near = exp(-pow((vUv.y - uPtr.y) * 9.0, 2.0)) * uPtrAmt;
  s.x += (hash(vec2(ln, tk)) - 0.5) * (0.16 * uTear * tear + 0.06 * near);
  s.x += sin(s.y * 38.0 + uTime * 31.0) * (0.004 * uTear + 0.007 * near);

  float rgb = uRGB + near * 0.014 + settle * 0.02;               // colour channels drifting apart
  vec3 col;
  col.r = texture2D(uTex, vec2(s.x + rgb, s.y)).r;
  col.g = texture2D(uTex, s).g;
  col.b = texture2D(uTex, vec2(s.x - rgb, s.y + rgb * 0.3)).b;
  col *= present;

  float n = hash(floor(vUv * uRes * 0.8) + fract(uTime * 7.31) * vec2(91.7, 47.3));
  col = mix(col, vec3(n), clamp(uNoise + near * 0.14, 0.0, 1.0));  // snow
  float bar = fract(vUv.y * 0.55 - uTime * 0.22);
  col += smoothstep(0.0, 0.05, bar) * (1.0 - smoothstep(0.05, 0.2, bar)) * (0.05 + uNoise * 0.1);
  col *= 0.8 + 0.2 * sin(gl_FragCoord.y * 1.7);                    // scanlines
  col *= vec3(0.95, 0.98, 1.05);                                   // cool phosphor
  col *= mix(0.25, 1.0, smoothstep(0.78, 0.2, length(c * vec2(1.0, 1.2))));
  col *= uBright * (1.0 - uFlick * hash(vec2(tk, 7.0)) * 0.5);
  vec2 q = abs(uv - 0.5);
  col *= step(q.x, 0.5) * step(q.y, 0.5) * inside;
  gl_FragColor = vec4(col, 1.0);
}`;

/* The only uniforms ever written. Animation libraries add private keys to tweened
   objects (GSAP adds `_gsap`), so the renderer must never iterate an object's keys. */
const SCALARS = ['uTime', 'uNoise', 'uRGB', 'uRoll', 'uTear', 'uWarp', 'uBright', 'uFlick', 'uRecon', 'uPtrAmt'];

export function defaultState() {
  return { uNoise: 1, uRGB: 0, uRoll: 0, uTear: 0, uWarp: 0.16, uBright: 1, uFlick: 0, uRecon: 1, uPtrAmt: 0, onX: 0, onY: 0, ptrY: 0.5 };
}

export class CRT {
  constructor(container, { scale = 1, maxContentWidth = 1280 } = {}) {
    this.container = container;
    this.scale = scale;
    this.maxContentWidth = maxContentWidth;
    this.state = defaultState();
    this.dirty = true;
    this.ok = false;
    this.lost = false;

    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.content = document.createElement('canvas');
    this.ctx2d = this.content.getContext('2d');
    container.append(this.canvas);

    this._onLost = (e) => { e.preventDefault(); this.lost = true; };
    this._onRestored = () => { this.lost = false; this._init(); this.dirty = true; };
    this.canvas.addEventListener('webglcontextlost', this._onLost);
    this.canvas.addEventListener('webglcontextrestored', this._onRestored);

    this.gl = this.canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (this.gl) this.ok = this._init();
    if (!this.ok) this.canvas.remove();
    this.resize();
  }

  _init() {
    const gl = this.gl;
    const compile = (type, src) => {
      const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn('[CRT] shader:', gl.getShaderInfoLog(sh)); gl.deleteShader(sh); return null; }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('[CRT] link:', gl.getProgramInfoLog(prog)); return false; }
    this.prog = prog;
    gl.useProgram(prog);

    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);  // one full-screen triangle
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.u = {};
    ['uTex', 'uRes', 'uOn', 'uPtr', ...SCALARS].forEach((name) => { this.u[name] = gl.getUniformLocation(prog, name); });
    gl.uniform1i(this.u.uTex, 0);
    return true;
  }

  /* Size the drawing buffer to the container (capped DPR) and the broadcast canvas to a
     resolution that keeps type crisp without wasting fill rate. */
  resize(dpr = Math.min(window.devicePixelRatio || 1, 1.75)) {
    const w = Math.max(1, this.container.clientWidth), h = Math.max(1, this.container.clientHeight);
    const k = dpr * this.scale;
    this.canvas.width = Math.round(w * k); this.canvas.height = Math.round(h * k);
    const W = Math.round(Math.min(this.maxContentWidth, Math.max(560, w)) * Math.min(1, this.scale + 0.25));
    this.content.width = W; this.content.height = Math.max(1, Math.round(W * h / w));
    this.width = this.content.width; this.height = this.content.height;
    this.dirty = true;
  }

  markDirty() { this.dirty = true; }

  render(time) {
    if (!this.ok || this.lost) return;
    const gl = this.gl, s = this.state, u = this.u;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (this.dirty) {
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.content);
      this.dirty = false;
    }
    gl.uniform2f(u.uRes, this.content.width, this.content.height);
    gl.uniform2f(u.uOn, s.onX, s.onY);
    gl.uniform2f(u.uPtr, 0.5, s.ptrY);
    gl.uniform1f(u.uTime, time);
    for (let i = 1; i < SCALARS.length; i++) gl.uniform1f(u[SCALARS[i]], s[SCALARS[i]]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    this.canvas.removeEventListener('webglcontextlost', this._onLost);
    this.canvas.removeEventListener('webglcontextrestored', this._onRestored);
    const gl = this.gl;
    if (gl && this.ok && !gl.isContextLost()) {
      gl.deleteTexture(this.tex); gl.deleteBuffer(this.buf); gl.deleteProgram(this.prog);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
    this.canvas.remove();
    this.content.width = this.content.height = 0;
    this.ok = false;
  }
}
