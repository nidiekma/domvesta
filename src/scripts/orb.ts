// Live recreation of the wireframe orb from Anton Skvortsov's "AI company
// website concept" (@skvortsov.design). The original is a C4D/Redshift
// render; this rebuilds the look in real time:
//   - a faceted, noise-displaced icosphere shell (hexagonal silhouette when
//     seen down its 3-fold axis) + a tangled inner shell,
//   - dark ember particles, an additive orange spark core and flickering
//     "lightning" streaks,
//   - glow via additive sprites instead of a bloom pass, because the canvas is
//     transparent over the CSS card and bloom on alpha is unreliable.
// The homepage hero (src/pages/index.astro) places it with setFrame() and its
// scroll timeline drives it through setProgress(). introDrop/portrait*/
// landscapeFit and the intro close-up date from the first concept recreation;
// the homepage always uses setFrame() and intro 0.
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Ashima/Stefan Gustavson 3D simplex noise (MIT).
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// Shared vertex displacement for shell lines and their node dots.
const DISPLACE = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
${NOISE}
vec3 displace(vec3 p){
  float t = uTime * 0.12;
  float n = snoise(p * uFreq + vec3(0.0, 0.0, t))
          + 0.5 * snoise(p * uFreq * 2.3 - vec3(t, 0.0, 0.0));
  return p * (1.0 + uAmp * n);
}
`;

const SHELL_VERT = /* glsl */ `
${DISPLACE}
varying float vFront;
varying float vCore;
void main(){
  vec4 mv = modelViewMatrix * vec4(displace(position), 1.0);
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec3 d = mv.xyz - c.xyz;
  vFront = smoothstep(-1.0, 1.0, d.z);
  vCore = 1.0 - smoothstep(0.0, 0.85, length(d.xy));
  gl_Position = projectionMatrix * mv;
}
`;

const SHELL_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uGlow;
uniform float uOpacity;
uniform float uIntensity;
varying float vFront;
varying float vCore;
void main(){
  float a = uOpacity * mix(0.3, 1.0, vFront);
  // Edges in front of the hot core pick up its light.
  float glow = clamp(vCore * vCore * vCore * uIntensity * 1.4, 0.0, 1.0);
  gl_FragColor = vec4(mix(uColor, uGlow, glow), a);
}
`;

const NODE_VERT = /* glsl */ `
${DISPLACE}
uniform float uPixelRatio;
uniform float uSize;
varying float vFront;
void main(){
  vec4 mv = modelViewMatrix * vec4(displace(position), 1.0);
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vFront = smoothstep(-1.0, 1.0, mv.z - c.z);
  gl_PointSize = uSize * uPixelRatio * mix(0.6, 1.0, vFront);
  gl_Position = projectionMatrix * mv;
}
`;

const NODE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vFront;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor, uOpacity * mix(0.3, 1.0, vFront) * smoothstep(0.5, 0.3, d));
}
`;

const PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uDrift;
attribute float aSeed;
attribute float aSize;
varying float vHeat;
varying float vTwinkle;
${NOISE}
void main(){
  vec3 p = position;
  float t = uTime * 0.25;
  p += uDrift * vec3(
    snoise(p * 2.5 + vec3(t, 0.0, 0.0) + aSeed),
    snoise(p * 2.5 + vec3(0.0, t, 0.0) + aSeed * 1.7),
    snoise(p * 2.5 + vec3(0.0, 0.0, t) + aSeed * 2.3));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vHeat = 1.0 - smoothstep(0.0, 0.55, length(p));
  vTwinkle = 0.55 + 0.45 * sin(uTime * 3.0 + aSeed * 20.0);
  gl_PointSize = aSize * uPixelRatio * (4.2 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

// Additive spark core: deep orange at the rim, white-hot in the middle.
const CORE_FRAG = /* glsl */ `
uniform float uIntensity;
varying float vHeat;
varying float vTwinkle;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float m = smoothstep(0.5, 0.0, d);
  vec3 col = mix(vec3(1.0, 0.36, 0.06), vec3(1.0, 0.82, 0.55), vHeat);
  col = mix(col, vec3(1.0), pow(vHeat, 5.0));
  gl_FragColor = vec4(col, m * vTwinkle * uIntensity);
}
`;

// Normal-blended embers: additive light can't darken, but the reference has
// burnt red-brown flecks that read darker than the grey card.
const EMBER_FRAG = /* glsl */ `
varying float vHeat;
varying float vTwinkle;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  vec3 col = mix(vec3(0.42, 0.13, 0.05), vec3(0.85, 0.33, 0.08), vHeat);
  gl_FragColor = vec4(col, smoothstep(0.5, 0.2, d) * (0.5 + 0.5 * vTwinkle));
}
`;

const BOLT_VERT = /* glsl */ `
attribute float aSeed;
attribute float aT;
varying float vSeed;
varying float vT;
void main(){
  vSeed = aSeed;
  vT = aT;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const BOLT_FRAG = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
varying float vSeed;
varying float vT;
void main(){
  float f = fract(sin(floor(uTime * 7.0 + vSeed * 5.0) * 12.9898 + vSeed * 78.233) * 43758.5453);
  float on = step(0.45, f);
  gl_FragColor = vec4(1.0, 0.72, 0.38, on * (1.0 - vT * 0.8) * uIntensity);
}
`;

const PHI = (1 + Math.sqrt(5)) / 2;

// Face normals of a unit icosahedron = normalized dodecahedron vertices.
const FACE_NORMALS: THREE.Vector3[] = (() => {
  const a = 1 / PHI;
  const raw: [number, number, number][] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) raw.push([x, y, z]);
  for (const s of [-1, 1]) for (const t of [-1, 1]) {
    raw.push([0, s * a, t * PHI], [s * a, t * PHI, 0], [s * PHI, 0, t * a]);
  }
  return raw.map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());
})();
const ICO_INRADIUS = 0.7946544722917661; // for circumradius 1

// Subdivided icosphere, pulled `facet` of the way back onto the flat
// icosahedron faces, then rotated so a 3-fold axis faces the camera — that is
// what gives the reference its hexagonal silhouette.
function facetedIcosphere(radius: number, detail: number, facet: number) {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g);

  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let best = -1;
    for (const n of FACE_NORMALS) best = Math.max(best, v.dot(n));
    const flat = v.clone().multiplyScalar(ICO_INRADIUS / best);
    v.lerp(flat, facet).multiplyScalar(radius);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(0, 0, 1)),
  );
  return g;
}

function gaussian() {
  let u = 0;
  let w = 0;
  while (u === 0) u = Math.random();
  while (w === 0) w = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w);
}

function randomDir(out = new THREE.Vector3()) {
  const z = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return out.set(r * Math.cos(a), r * Math.sin(a), z);
}

function particleGeometry(count: number, place: (v: THREE.Vector3) => void, size: [number, number]) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    place(v);
    v.toArray(positions, i * 3);
    seeds[i] = Math.random() * 10;
    sizes[i] = size[0] + Math.random() * (size[1] - size[0]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  return g;
}

function boltGeometry(count: number) {
  const positions: number[] = [];
  const seeds: number[] = [];
  const ts: number[] = [];
  const dir = new THREE.Vector3();
  const side = new THREE.Vector3();
  const up = new THREE.Vector3();
  for (let b = 0; b < count; b++) {
    randomDir(dir);
    side.crossVectors(dir, new THREE.Vector3(0, 1, 0.3)).normalize();
    up.crossVectors(dir, side).normalize();
    const len = 0.25 + Math.random() * 0.35;
    const steps = 6;
    const seed = Math.random() * 10;
    let prev = new THREE.Vector3();
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const jitter = 0.05 * t;
      const next = dir
        .clone()
        .multiplyScalar(len * t)
        .addScaledVector(side, (Math.random() - 0.5) * 2 * jitter)
        .addScaledVector(up, (Math.random() - 0.5) * 2 * jitter);
      positions.push(prev.x, prev.y, prev.z, next.x, next.y, next.z);
      seeds.push(seed, seed);
      ts.push((s - 1) / steps, t);
      prev = next;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  g.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
  return g;
}

function radialTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(0.6, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// introDrop: how far (× visible height) the intro close-up sits below the
// hero spot, as [landscape, portrait]. Must match the page's --drop CSS.
// portraitLift / portraitFit: where the hero orb sits on portrait screens
// (× visible height above centre) and how much width it may take (larger =
// smaller orb). Must match the page's --cy on portrait.
// landscapeFit: visible world height on landscape (larger = smaller orb);
// the page's ring sizes should scale with it.
// colors: per-page tint of the cage and the haze; the core stays orange.
// setFrame() (on the returned handle) places the orb explicitly instead: centre
// y and cage diameter in CSS px of the canvas, e.g. to fit a measured gap.
export type OrbColors = { shell: number; inner: number; nodes: number; smoke: number; edgeGlow: number };
const DEFAULT_COLORS: OrbColors = { shell: 0x232323, inner: 0x2e2a28, nodes: 0x1c1c1c, smoke: 0x241812, edgeGlow: 0xffa04a };
// World units a setFrame() size spans: the cage's diameter (radius 0.95 plus
// its noise displacement).
const FRAME_SPAN = 2;

export function mountOrb(
  canvas: HTMLCanvasElement,
  opts: {
    introDrop?: [number, number];
    portraitLift?: number;
    portraitFit?: number;
    landscapeFit?: number;
    colors?: Partial<OrbColors>;
  } = {},
) {
  const colors = { ...DEFAULT_COLORS, ...opts.colors };
  const [dropLandscape, dropPortrait] = opts.introDrop ?? [0.14, 0.3];
  const portraitLift = opts.portraitLift ?? 0.12;
  const portraitFit = opts.portraitFit ?? 1.15;
  const landscapeFit = opts.landscapeFit ?? 2.65;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  const orb = new THREE.Group();
  scene.add(orb);

  const intensity = { value: 1 };
  const time = { value: 0 };

  const shellMaterial = (color: number, opacity: number, amp: number, freq: number) =>
    new THREE.ShaderMaterial({
      vertexShader: SHELL_VERT,
      fragmentShader: SHELL_FRAG,
      uniforms: {
        uTime: time,
        uAmp: { value: amp },
        uFreq: { value: freq },
        uColor: { value: new THREE.Color(color) },
        uGlow: { value: new THREE.Color(colors.edgeGlow) },
        uOpacity: { value: opacity },
        uIntensity: intensity,
      },
      transparent: true,
      depthWrite: false,
    });

  const nodeMaterial = (amp: number, freq: number, size: number, opacity: number) =>
    new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      uniforms: {
        uTime: time,
        uAmp: { value: amp },
        uFreq: { value: freq },
        uPixelRatio: { value: pixelRatio },
        uSize: { value: size },
        uColor: { value: new THREE.Color(colors.nodes) },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
    });

  // Outer faceted shell + its vertex nodes.
  const outerGeo = facetedIcosphere(0.95, 3, 0.55);
  const outer = new THREE.LineSegments(new THREE.WireframeGeometry(outerGeo), shellMaterial(colors.shell, 0.85, 0.11, 1.6));
  const outerNodes = new THREE.Points(outerGeo, nodeMaterial(0.11, 1.6, 2.6, 0.8));

  // Inner tangle: smaller, noisier, counter-rotating.
  const innerGeo = facetedIcosphere(0.5, 2, 0.2);
  const inner = new THREE.LineSegments(new THREE.WireframeGeometry(innerGeo), shellMaterial(colors.inner, 0.5, 0.32, 2.6));

  const shell = new THREE.Group();
  shell.add(outer, outerNodes);
  const tangle = new THREE.Group();
  tangle.add(inner);

  // Smoky dark haze behind the core.
  const glowTex = radialTexture();
  const smoke = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: colors.smoke, opacity: 0.55, transparent: true, depthWrite: false }),
  );
  smoke.scale.setScalar(1.35);

  const embers = new THREE.Points(
    particleGeometry(
      220,
      (v) => randomDir(v).multiplyScalar(0.22 + Math.pow(Math.random(), 0.7) * 0.7),
      [2, 5.5],
    ),
    new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: EMBER_FRAG,
      uniforms: { uTime: time, uPixelRatio: { value: pixelRatio }, uDrift: { value: 0.05 } },
      transparent: true,
      depthWrite: false,
    }),
  );

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xff8a2a,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
  glow.scale.setScalar(1.25);
  const hot = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xfff1d6,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
  hot.scale.setScalar(0.32);

  const core = new THREE.Points(
    particleGeometry(
      2600,
      (v) => {
        // Mostly a tight Gaussian cluster, with a sprinkle out at the shell.
        if (Math.random() < 0.88) v.set(gaussian(), gaussian(), gaussian()).multiplyScalar(0.12);
        else randomDir(v).multiplyScalar(0.3 + Math.random() * 0.6);
      },
      [1.5, 4.5],
    ),
    new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: CORE_FRAG,
      uniforms: { uTime: time, uPixelRatio: { value: pixelRatio }, uDrift: { value: 0.035 }, uIntensity: intensity },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );

  const bolts = new THREE.LineSegments(
    boltGeometry(9),
    new THREE.ShaderMaterial({
      vertexShader: BOLT_VERT,
      fragmentShader: BOLT_FRAG,
      uniforms: { uTime: time, uIntensity: intensity },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );

  // Explicit draw order; nothing writes depth, so this is the compositing order.
  [smoke, shell, tangle, embers, glow, core, bolts, hot].forEach((o, i) => {
    o.renderOrder = i;
    o.traverse((c) => (c.renderOrder = i));
    orb.add(o);
  });

  // --- sizing -------------------------------------------------------------
  // The canvas fills the viewport; on portrait the hero orb sits higher so the
  // copy fits underneath (matches --cy in the page CSS).
  let visibleH = 2.65;
  let baseY = 0;
  let introDrop = dropLandscape;
  let frame: { y: number; size: number } | null = null;
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    // Fit the orb to ~72% of the height on landscape, ~80% of the width on portrait.
    visibleH = aspect < 1.15 ? 2.65 * (Math.max(1.15, aspect < 1 ? portraitFit : 1.15) / aspect) : landscapeFit;
    baseY = aspect < 1 ? visibleH * portraitLift : 0;
    introDrop = aspect < 1 ? dropPortrait : dropLandscape;
    if (frame) {
      visibleH = (FRAME_SPAN * h) / frame.size;
      baseY = ((h / 2 - frame.y) / h) * visibleH;
    }
    camera.position.z = visibleH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.updateProjectionMatrix();
    if (reducedMotion) render(6);
  };

  // --- interaction ----------------------------------------------------------
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  // intro: 1 = close-up seen from below (section 001), 0 = hero framing (002).
  // cover: 1 = the services panel hides the orb completely, so stop rendering.
  const progress = { intro: 1, cover: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = e.clientX / window.innerWidth - 0.5;
    pointer.y = e.clientY / window.innerHeight - 0.5;
  };

  function render(t: number) {
    time.value = t;
    const k = progress.intro;
    intensity.value = 1 + 0.5 * k;
    tilt.x += (pointer.y * 0.5 - tilt.x) * 0.05;
    tilt.y += (pointer.x * 0.5 - tilt.y) * 0.05;

    // Spin mostly about the view axis so the hex silhouette holds, with a
    // gentle wobble + pointer tilt for depth.
    shell.rotation.set(Math.sin(t * 0.21) * 0.12, Math.cos(t * 0.17) * 0.12, t * 0.06 + k * 0.9);
    tangle.rotation.set(t * -0.11, t * 0.14, t * -0.05);
    // Camera pull-back: close-up from below in the intro, settling into the hero.
    orb.rotation.set(tilt.x - 0.6 * k, tilt.y, 0);
    orb.scale.setScalar(1 + 0.15 * k);
    orb.position.y = baseY - visibleH * introDrop * k;

    const pulse = 1 + 0.06 * Math.sin(t * 2.1) + 0.03 * Math.sin(t * 5.3);
    glow.scale.setScalar(1.25 * pulse);
    (glow.material as THREE.SpriteMaterial).opacity = 0.65 * intensity.value;
    hot.scale.setScalar(0.32 * pulse * intensity.value);

    renderer.render(scene, camera);
  }

  // --- loop -----------------------------------------------------------------
  const t0 = performance.now();
  let raf = 0;
  const running = () => !document.hidden && progress.cover < 1;
  const tick = () => {
    raf = 0;
    if (!running()) return;
    render((performance.now() - t0) / 1000);
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!reducedMotion && !raf && running()) raf = requestAnimationFrame(tick);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const onVisibility = () => start();
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  if (reducedMotion) render(6);
  else start();

  return {
    setFrame(f: { y: number; size: number } | null) {
      frame = f;
      resize();
    },
    setProgress(intro: number, cover: number) {
      progress.intro = intro;
      progress.cover = cover;
      if (reducedMotion) render(6);
      else start();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | undefined;
        mat?.dispose();
      });
      glowTex.dispose();
      renderer.dispose();
    },
  };
}
