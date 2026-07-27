/* ---------------------------------------------------------------------------
   Renderer — WebGL2, no three.js.

   Three passes into a persistent framebuffer:
     1. fade  — decays last frame instead of clearing it, which is what gives
                every record a real motion trail (continuity you can see)
     2. links — the permanent lattice + live provenance threads
     3. glyphs— one instanced quad per record, shaped by its source type
   then a present pass grades the buffer to screen.

   This scene is deliberately not built on three.js: the whole effect is an HDR
   accumulation buffer that survives between frames, which is a handful of raw
   GL calls here and a fight against the scene graph there. It also keeps the
   three.js chunk out of this section entirely.
--------------------------------------------------------------------------- */

import type { Camera } from "./topology";

const GLYPH_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aCorner;
layout(location=1) in vec2 iPos;
layout(location=2) in vec4 iMeta;   // size, rotation, shape, glow
layout(location=3) in vec4 iColor;  // rgb, alpha
uniform vec2 uMul;
uniform vec2 uAdd;
out vec2 vUV;
out vec4 vColor;
out float vShape;
out float vGlow;
void main(){
  float s = iMeta.x;
  float r = iMeta.y;
  vec2 c = vec2(cos(r), sin(r));
  vec2 off = vec2(aCorner.x*c.x - aCorner.y*c.y, aCorner.x*c.y + aCorner.y*c.x) * s;
  vec2 w = iPos + off;
  gl_Position = vec4(w.x*uMul.x + uAdd.x, w.y*uMul.y + uAdd.y, 0.0, 1.0);
  vUV = aCorner; vColor = iColor; vShape = iMeta.z; vGlow = iMeta.w;
}`;

const GLYPH_FS = `#version 300 es
precision highp float;
in vec2 vUV;
in vec4 vColor;
in float vShape;
in float vGlow;
out vec4 frag;
void main(){
  // Every mark is elongated along local +x. The vertex stage rotates that axis
  // onto the direction of travel, so records read as sharp darts rather than
  // soft dots — the shape still encodes the source type via its proportions.
  float d;
  if (vShape < 0.5) {            // signal — thin lens
    d = length(vec2(vUV.x * 0.60, vUV.y * 2.05));
  } else if (vShape < 1.5) {     // record — slim block
    d = max(abs(vUV.x) * 0.72, abs(vUV.y) * 1.85);
  } else if (vShape < 2.5) {     // document — hairline bar
    d = max(abs(vUV.x) * 0.54, abs(vUV.y) * 2.4);
  } else {                       // decision — narrow diamond
    d = abs(vUV.x) * 0.70 + abs(vUV.y) * 1.95;
  }
  // A tight transition band keeps the mark crisp at 2-3px instead of blooming.
  float core = smoothstep(1.0, 0.66, d);
  float halo = smoothstep(1.0, 0.0, d);
  // Halo stays small: these blend additively and hundreds overlap at the hub,
  // so a generous halo turns every dense node into a flat disc and destroys
  // the colour-is-meaning read.
  float a = (core * 0.82 + halo * halo * 0.16 * vGlow) * vColor.a;
  if (a <= 0.002) discard;
  frag = vec4(vColor.rgb * a, a);
}`;

const LINE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in vec4 aColor;
uniform vec2 uMul;
uniform vec2 uAdd;
out vec4 vColor;
void main(){
  gl_Position = vec4(aPos.x*uMul.x + uAdd.x, aPos.y*uMul.y + uAdd.y, 0.0, 1.0);
  vColor = aColor;
}`;

const LINE_FS = `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 frag;
void main(){ frag = vec4(vColor.rgb * vColor.a, vColor.a); }`;

const FULL_VS = `#version 300 es
precision highp float;
out vec2 vUV;
void main(){
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUV = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FADE_FS = `#version 300 es
precision highp float;
uniform float uFade;
out vec4 frag;
void main(){ frag = vec4(0.0, 0.0, 0.0, uFade); }`;

const COPY_FS = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uTex;
out vec4 frag;
void main(){ frag = texture(uTex, vUV); }`;

const PRESENT_FS = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uTex;
/// 1.0 in light mode: the buffer holds how much light each mark *removes*.
uniform float uInvert;
/// The page's own background, so the canvas edge is invisible against it.
uniform vec3 uGround;
out vec4 frag;
void main(){
  vec3 c = texture(uTex, vUV).rgb;
  // Reinhard with no overshoot: asymptotes to 1 instead of clipping, so a
  // dense node rolls off to a bright tint rather than a flat white disc.
  c = c / (c + vec3(1.0));
  c = pow(c, vec3(0.82));            // lift the deep end back up
  // Additive stacking pulls every hue toward white. Push saturation back so
  // the layer a record belongs to stays readable in dense areas.
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = max(vec3(0.0), mix(vec3(l), c, 1.45));
  vec2 d = vUV - 0.5;

  if (uInvert > 0.5) {
    // Light mode. Every ink was fed in as its own complement, so inverting
    // here turns additive accumulation into subtractive mixing — ink on paper,
    // with hues intact. Blending toward the ground colour rather than
    // subtracting from pure white keeps the field seated on the page.
    c = uGround * (1.0 - c) + c * (uGround * 0.12);
  } else {
    c *= 1.0 - dot(d, d) * 0.55;
    c += uGround;                    // substrate haze
  }
  frag = vec4(c, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("could not create shader");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || "shader compile failed");
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram();
  if (!p) throw new Error("could not create program");
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || "link failed");
  }
  return p;
}

const INSTANCE_FLOATS = 10; // pos(2) meta(4) color(4)
const LINE_FLOATS = 6; // pos(2) color(4)

export type DrawArgs = {
  camera: Camera;
  /// Instances 0..trailInstances are flux, and leave trails.
  trailInstances: number;
  /// Instances overlayFrom..+overlayCount are structure, drawn straight out.
  overlayFrom: number;
  overlayCount: number;
  lineVerts: number;
  fade: number;
  /// True in light mode, where the buffer holds subtractive ink.
  invert: boolean;
  /// The page background the field has to sit seamlessly against.
  ground: readonly [number, number, number];
};

export type SubstrateRenderer = {
  gl: WebGL2RenderingContext;
  resize(w: number, h: number): void;
  draw(args: DrawArgs): void;
  dispose(): void;
  instanceData: Float32Array;
  lineData: Float32Array;
  maxInstances: number;
  maxLineVerts: number;
};

export function createRenderer(
  canvas: HTMLCanvasElement,
  maxInstances = 4200,
  maxLineVerts = 4096,
): SubstrateRenderer | null {
  const context = canvas.getContext("webgl2", {
    // Transparent rather than opaque, even though every painted frame is fully
    // opaque. An opaque context shows solid black from the moment it exists
    // until its first frame lands — and the first frame can be a long way off
    // if the page opened in a background tab, where animation frames are
    // withheld. A black slab over the hero is a worse failure than a blank one.
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
  });
  if (!context) return null;
  // Bound to its own const rather than used through the narrowed original:
  // narrowing does not survive into the hoisted function declarations below.
  const gl: WebGL2RenderingContext = context;

  const progGlyph = program(gl, GLYPH_VS, GLYPH_FS);
  const progLine = program(gl, LINE_VS, LINE_FS);
  const progFade = program(gl, FULL_VS, FADE_FS);
  const progCopy = program(gl, FULL_VS, COPY_FS);
  const progPresent = program(gl, FULL_VS, PRESENT_FS);

  const u = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const uni = {
    glyphMul: u(progGlyph, "uMul"),
    glyphAdd: u(progGlyph, "uAdd"),
    lineMul: u(progLine, "uMul"),
    lineAdd: u(progLine, "uAdd"),
    fade: u(progFade, "uFade"),
    tex: u(progPresent, "uTex"),
    invert: u(progPresent, "uInvert"),
    ground: u(progPresent, "uGround"),
    copyTex: u(progCopy, "uTex"),
  };

  /* --- glyph geometry: one quad, instanced --- */
  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const vaoGlyph = gl.createVertexArray();
  gl.bindVertexArray(vaoGlyph);
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const instanceData = new Float32Array(maxInstances * INSTANCE_FLOATS);
  const instanceBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuf);
  gl.bufferData(gl.ARRAY_BUFFER, instanceData.byteLength, gl.DYNAMIC_DRAW);
  const stride = INSTANCE_FLOATS * 4;
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
  gl.vertexAttribDivisor(1, 1);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 8);
  gl.vertexAttribDivisor(2, 1);
  gl.enableVertexAttribArray(3);
  gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 24);
  gl.vertexAttribDivisor(3, 1);
  gl.bindVertexArray(null);

  /* --- line geometry --- */
  const lineData = new Float32Array(maxLineVerts * LINE_FLOATS);
  const vaoLine = gl.createVertexArray();
  gl.bindVertexArray(vaoLine);
  const lineBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
  gl.bufferData(gl.ARRAY_BUFFER, lineData.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, LINE_FLOATS * 4, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, LINE_FLOATS * 4, 8);
  gl.bindVertexArray(null);

  const vaoEmpty = gl.createVertexArray();

  /* --- accumulation buffer ---
     HDR accumulation. This must not be RGBA8: additive light at a dense node
     easily exceeds 1.0, and an 8-bit target clips it to flat white *inside* the
     buffer — the tone curve downstream then has nothing left to recover, so
     every busy node renders as a hard-edged white disc. A float target keeps
     the headroom and lets the present pass roll it off. */
  const hdr =
    gl.getExtension("EXT_color_buffer_float") ??
    gl.getExtension("EXT_color_buffer_half_float");

  type Target = { fbo: WebGLFramebuffer; tex: WebGLTexture | null };

  const makeTarget = (): Target => ({ fbo: gl.createFramebuffer(), tex: null });

  /** trail = persistent accumulation, compose = rebuilt every frame */
  const targets = { trail: makeTarget(), compose: makeTarget() };
  let bw = 0;
  let bh = 0;

  function sizeTarget(t: Target, w: number, h: number) {
    if (t.tex) gl.deleteTexture(t.tex);
    t.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    if (hdr) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function resize(w: number, h: number) {
    bw = w;
    bh = h;
    sizeTarget(targets.trail, w, h);
    sizeTarget(targets.compose, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** Re-points the per-instance attributes so we can draw a sub-range. */
  function instanceOffset(first: number) {
    const base = first * stride;
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuf);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, base);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, base + 8);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, base + 24);
  }

  /**
   * Flux (records, flashes) is drawn into the accumulation buffer and leaves
   * trails. Structure (node cores, the lattice) is drawn straight to the screen
   * afterwards — a near-stationary glyph repainted into a decaying buffer
   * compounds to roughly alpha/fade, which is what turned every dense node into
   * a solid white disc.
   */
  function draw({
    camera,
    trailInstances,
    overlayFrom,
    overlayCount,
    lineVerts,
    fade,
    invert,
    ground,
  }: DrawArgs) {
    const totalInstances = overlayFrom + overlayCount;
    if (totalInstances > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceData, 0, totalInstances * INSTANCE_FLOATS);
    }

    // 1. flux into the persistent trail buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, targets.trail.fbo);
    gl.viewport(0, 0, bw, bh);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(progFade);
    gl.uniform1f(uni.fade, Math.min(1, Math.max(0, fade)));
    gl.bindVertexArray(vaoEmpty);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(progGlyph);
    gl.uniform2fv(uni.glyphMul, camera.mul);
    gl.uniform2fv(uni.glyphAdd, camera.add);
    gl.bindVertexArray(vaoGlyph);
    if (trailInstances > 0) {
      instanceOffset(0);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, trailInstances);
    }

    // 2. compose: trails + structure, still in HDR so nothing clips early
    gl.bindFramebuffer(gl.FRAMEBUFFER, targets.compose.fbo);
    gl.disable(gl.BLEND);
    gl.useProgram(progCopy);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targets.trail.tex);
    gl.uniform1i(uni.copyTex, 0);
    gl.bindVertexArray(vaoEmpty);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    if (lineVerts > 0) {
      gl.useProgram(progLine);
      gl.uniform2fv(uni.lineMul, camera.mul);
      gl.uniform2fv(uni.lineAdd, camera.add);
      gl.bindVertexArray(vaoLine);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineData, 0, lineVerts * LINE_FLOATS);
      gl.drawArrays(gl.LINES, 0, lineVerts);
    }
    if (overlayCount > 0) {
      gl.useProgram(progGlyph);
      gl.bindVertexArray(vaoGlyph);
      instanceOffset(overlayFrom);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, overlayCount);
    }

    // 3. tone map to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, bw, bh);
    gl.disable(gl.BLEND);
    gl.useProgram(progPresent);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targets.compose.tex);
    gl.uniform1i(uni.tex, 0);
    gl.uniform1f(uni.invert, invert ? 1 : 0);
    gl.uniform3f(uni.ground, ground[0], ground[1], ground[2]);
    gl.bindVertexArray(vaoEmpty);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  /// Toggling graphics off has to hand the GPU its memory back, not just stop
  /// drawing — see the graphics toggle's contract.
  function dispose() {
    for (const t of [targets.trail, targets.compose]) {
      if (t.tex) gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fbo);
    }
    gl.deleteBuffer(quadBuf);
    gl.deleteBuffer(instanceBuf);
    gl.deleteBuffer(lineBuf);
    gl.deleteVertexArray(vaoGlyph);
    gl.deleteVertexArray(vaoLine);
    gl.deleteVertexArray(vaoEmpty);
    for (const p of [progGlyph, progLine, progFade, progCopy, progPresent]) {
      gl.deleteProgram(p);
    }

    // Everything the GPU was holding is gone by this point. Handing back the
    // context itself is worth doing too — a page gets only so many — but a lost
    // context can never be used again, and React re-runs an effect onto the
    // *same* canvas element (StrictMode in development, and any remount that
    // keeps the node). Deciding on the next tick separates the two cases: a
    // real unmount has detached the canvas by then, a remount has not.
    setTimeout(() => {
      if (!canvas.isConnected) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    }, 0);
  }

  return { gl, resize, draw, dispose, instanceData, lineData, maxInstances, maxLineVerts };
}
