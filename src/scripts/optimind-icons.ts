// Embossed service icons from the "Discover our services" screen of the
// Skvortsov concept: thin, shallow, porcelain-white glyphs (clear-coated, with
// soft studio reflections) that rise out of the card surface, warm-lit from
// inside with soft shadows on the card. ring/triangle/diamond
// are the Optimind originals; document/trend/person serve /lab/domvesta.
// One small renderer per card; the page drives reveal + active state.
// Sandbox only (/lab/*).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type IconKind = "ring" | "triangle" | "diamond" | "document" | "trend" | "person";

type Vec = [number, number];

// Flat, thin plates with a crisp micro-bevel, like the reference: the shape
// reads through its shadow and the thin glowing side walls, not through bulk.
const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.035,
  bevelEnabled: true,
  bevelThickness: 0.008,
  bevelSize: 0.006,
  bevelSegments: 2,
  curveSegments: 72,
};
const W = 0.19; // main stroke width (flat, so it can be wide without bulk)
const F = 0.1; // front-layer stroke width
const Z = 0.07; // front layer floats this far in front of the main one

// Thick polyline → one extruded bar per segment plus a round disc at every
// vertex, so joints stay clean even at the triangle's sharp apex.
function strokes(paths: Vec[][], width: number, z = 0) {
  const parts: THREE.BufferGeometry[] = [];
  const h = width / 2;
  for (const path of paths) {
    for (let i = 0; i < path.length - 1; i++) {
      const [ax, ay] = path[i];
      const [bx, by] = path[i + 1];
      const len = Math.hypot(bx - ax, by - ay);
      const s = new THREE.Shape();
      s.moveTo(0, -h);
      s.lineTo(len, -h);
      s.lineTo(len, h);
      s.lineTo(0, h);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, EXTRUDE);
      g.rotateZ(Math.atan2(by - ay, bx - ax));
      g.translate(ax, ay, z);
      parts.push(g);
    }
    for (const [x, y] of path) {
      const disc = new THREE.Shape();
      disc.absarc(0, 0, h, 0, Math.PI * 2, false);
      const g = new THREE.ExtrudeGeometry(disc, { ...EXTRUDE, curveSegments: 24 });
      g.translate(x, y, z);
      parts.push(g);
    }
  }
  return parts;
}

function arc(r0: number, r1: number, from: number, to: number, cx = 0, cy = 0, z = 0) {
  const s = new THREE.Shape();
  s.absarc(cx, cy, r1, from, to, false);
  s.absarc(cx, cy, r0, to, from, true);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, EXTRUDE);
  g.translate(0, 0, z);
  return g;
}

function disc(r0: number, r1: number, cx = 0, cy = 0, z = 0) {
  const s = new THREE.Shape();
  s.absarc(cx, cy, r1, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(cx, cy, r0, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, EXTRUDE);
  g.translate(0, 0, z);
  return g;
}

function glyph(kind: IconKind) {
  let parts: THREE.BufferGeometry[];
  if (kind === "ring") {
    // Broken ring with a thinner offset ring layered in front.
    parts = [arc(1 - W, 1, 0.5, Math.PI * 2 - 0.5), arc(0.86, 0.86 + F, 1.7, 4.9, -0.2, 0.06, Z)];
  } else if (kind === "triangle") {
    const top: Vec = [0, 1.05];
    const bl: Vec = [-1.05, -0.78];
    const br: Vec = [1.05, -0.78];
    parts = [
      ...strokes([[br, top, bl, [0.2, -0.78]]], W),
      ...strokes([[[-0.36, -0.42], [0.06, 0.3], [0.42, -0.36]]], F, Z),
    ];
  } else if (kind === "document") {
    // Sheet with a folded-open corner, text lines layered in front.
    parts = [
      ...strokes([[[0.35, 1.05], [-0.78, 1.05], [-0.78, -1.05], [0.78, -1.05], [0.78, 0.55]]], W),
      ...strokes([[[-0.36, 0.45], [0.3, 0.45]], [[-0.36, 0], [0.36, 0]], [[-0.36, -0.45], [0.08, -0.45]]], F, Z),
    ];
  } else if (kind === "trend") {
    // Falling cost curve with an arrowhead in front.
    parts = [
      ...strokes([[[-1.05, 0.8], [-0.4, 0.08], [0.08, 0.42], [0.92, -0.5]]], W),
      ...strokes([[[0.32, -0.58], [0.95, -0.55], [0.98, 0.05]]], F, Z),
      ...strokes([[[-1.05, -0.95], [0.4, -0.95]]], F, Z),
    ];
  } else if (kind === "person") {
    // Shoulders arc with the head ring floating in front.
    parts = [arc(0.97 - W, 0.97, 0.18, Math.PI - 0.18, 0, -1.02), disc(0.4 - F, 0.4, 0, 0.42, Z)];
  } else {
    parts = [
      ...strokes([[[0.5, -0.5], [1, 0], [0, 1], [-1, 0], [-0.55, -0.45]]], W),
      ...strokes([[[-0.42, 0.08], [0.02, -0.36], [0.44, 0.06]]], F, Z),
      ...strokes([[[-0.12, 0.38], [0.14, 0.12]]], F, Z),
    ];
  }
  const g = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return g;
}

function mountIcon(canvas: HTMLCanvasElement, kind: IconKind) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  // Soft roll-off so the white keeps its shading instead of clipping flat.
  // Neutral (not ACES): ACES bleaches the amber rims back to white.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  // Straight on: with the pointer centred the glyph faces the viewer flat.
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);

  // Card surface: an invisible depth-only occluder drawn first, so the glyph
  // stays hidden while it sits "inside" the card (z < 0) and emerges as it
  // rises, plus a shadow-only plane on top (transparent, so it can't occlude).
  const surface = new THREE.PlaneGeometry(12, 12);
  const occluder = new THREE.Mesh(surface, new THREE.MeshBasicMaterial({ colorWrite: false }));
  occluder.renderOrder = -1;
  const plane = new THREE.Mesh(surface, new THREE.ShadowMaterial({ opacity: 0.15 }));
  plane.receiveShadow = true;
  scene.add(occluder, plane);

  // Porcelain/glass finish: a soft studio environment for the reflections
  // plus a clear coat, so the thin edges catch highlights.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  // Set on the material (not scene.environment), so envMapIntensity applies.
  const mesh = new THREE.Mesh(
    glyph(kind),
    // Tone-on-tone: a matte light grey close to the card, not bright white.
    new THREE.MeshPhysicalMaterial({
      color: 0xd2d0cc,
      roughness: 0.6,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
      envMap,
      envMapIntensity: 0.35,
    }),
  );
  mesh.castShadow = true;
  const icon = new THREE.Group();
  icon.add(mesh);
  scene.add(icon);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2aa, 0.5));
  // Fairly grazing key from the top left: models the rounded bevels and casts
  // the long, soft shadow down-right like the reference.
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(-3, 3, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 22;
  key.shadow.blurSamples = 25;
  key.shadow.bias = -0.0005;
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 15 });
  scene.add(key);
  // Warm light low in the middle of the glyph (riding along with it): only the
  // inward-facing bevels catch it, which reads as the thin glowing amber rims
  // in the reference.
  // At plate height in the middle of the glyph: only the thin inner side
  // walls catch it, which reads as fine glowing amber edges.
  const warm = new THREE.PointLight(0xffb03c, 0, 1.6, 2);
  warm.position.set(0.02, -0.04, 0.03);
  icon.add(warm);
  const warm2 = new THREE.PointLight(0xffd27a, 0, 1.2, 2);
  warm2.position.set(-0.3, 0.28, 0.035);
  icon.add(warm2);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep ~4 units visible across the narrower side (glyph is ~2.1 wide).
    const fitH = camera.aspect < 1 ? 4 / camera.aspect : 4;
    const d = fitH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.setLength(d);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const render = (t: number, reveal: number, tiltX: number, tiltY: number) => {
    const e = reveal * reveal * (3 - 2 * reveal);
    // Rises from inside the card to hover just above it.
    icon.position.z = -0.2 + 0.36 * e;
    // tiltX/tiltY run -0.5…0.5 with the pointer: flat at the centre, turning
    // slightly toward the pointer's side (left → faces left, up → faces up).
    icon.rotation.set(tiltY * 0.3, tiltX * 0.4, 0);
    const flicker = 1 + 0.05 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.3);
    warm.intensity = 55 * e * flicker;
    warm2.intensity = 16 * e;
    renderer.render(scene, camera);
  };

  return {
    render,
    dispose() {
      ro.disconnect();
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      envMap.dispose();
      surface.dispose();
      (occluder.material as THREE.Material).dispose();
      (plane.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}

// Mounts every icon canvas and runs one shared loop while the services
// screen is on stage.
export function mountIcons(canvases: HTMLCanvasElement[]) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const icons = canvases.map((c) => mountIcon(c, (c.dataset.icon as IconKind) ?? "ring"));
  const state = { reveal: 0, active: false };
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = e.clientX / window.innerWidth - 0.5;
    pointer.y = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const t0 = performance.now();
  let raf = 0;
  const frame = () => {
    const t = reducedMotion ? 0 : (performance.now() - t0) / 1000;
    tilt.x += (pointer.x - tilt.x) * 0.06;
    tilt.y += (pointer.y - tilt.y) * 0.06;
    // Stagger: each icon starts lighting up a little after the previous one.
    icons.forEach((icon, i) => {
      const r = Math.min(1, Math.max(0, state.reveal * 1.5 - i * 0.25));
      icon.render(t, r, tilt.x, tilt.y);
    });
  };
  const tick = () => {
    raf = 0;
    if (!state.active || document.hidden) return;
    frame();
    raf = requestAnimationFrame(tick);
  };
  const onVisibility = () => !document.hidden && start();
  document.addEventListener("visibilitychange", onVisibility);
  function start() {
    if (reducedMotion) frame();
    else if (!raf && state.active) raf = requestAnimationFrame(tick);
  }

  return {
    set(reveal: number, active: boolean) {
      state.reveal = reveal;
      state.active = active;
      start();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      icons.forEach((i) => i.dispose());
    },
  };
}
