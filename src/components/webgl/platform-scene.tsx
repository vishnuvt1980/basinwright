"use client";

import { Line } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ComponentRef,
} from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import type { TopologyLayer } from "@/components/sections/topology-layers";
import { cn } from "@/components/ui/primitives";

/**
 * The platform topology scene.
 *
 * Four plates stacked at an isometric tilt, threaded by filaments, with pulses
 * running up (a request being served) and down (context being grounded). It has
 * to read as an explanatory diagram first and an effect second, so the idle
 * motion is a narrow sway rather than a full orbit — the stack never turns far
 * enough to hide a caption or show its back.
 *
 * Two decisions carry most of the visual quality:
 *
 *   1. **Type is DOM, not texture.** Labels live in an overlay above the canvas
 *      and are positioned each frame by projecting their 3D anchor to screen
 *      space. Drawing text into a canvas texture and scaling it onto a sprite
 *      resamples every glyph well below 1:1 and looks soft at any budget.
 *   2. **Lighting is image-based.** A room probe generated in-memory gives the
 *      plates and nodes a real specular response; without it PBR materials
 *      render flat and the whole thing reads as clip art.
 *
 * Reached only through a dynamic import, so three.js stays out of the homepage
 * bundle.
 */

/* -------------------------------------------------------------------------- */
/* Composition                                                                */
/* -------------------------------------------------------------------------- */

const PLATE_W = 5.6;
const PLATE_D = 3.4;
const PLATE_T = 0.11;
const SPACING = 1.6;

/// Isometric tilt, applied to the stack rather than the camera.
const TILT = 0.44;
/// The stack sits left of centre to leave the captions room.
const OFFSET_X = -1.15;

const SWAY_AMPLITUDE = 0.12;
const SWAY_SPEED = 0.1;
const PARALLAX_YAW = 0.16;
const PARALLAX_PITCH = 0.08;
/// Resting pose, and the only pose when motion is switched off.
const RESTING_YAW = -0.22;

const RAISE = 0.3;
/// How far unfocused layers recede.
const DIMMED = 0.3;

/// Where filaments attach, as a fraction of half-width.
const FILAMENT_ANCHORS = [-0.74, -0.37, 0, 0.37, 0.74];

/// Node labels are only ever shown for one layer, so a fixed pool is enough.
const MAX_NODE_LABELS = 10;

const PULSES_BY_QUALITY = {
  2: { up: 24, down: 12 },
  1: { up: 11, down: 6 },
} as const;

export type Quality = keyof typeof PULSES_BY_QUALITY;
export type FpsVerdict = "degrade" | "abort";

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/* -------------------------------------------------------------------------- */

/// The palette lives in CSS custom properties so both themes stay in sync.
/// Watching `data-theme` lets the scene re-read them when the visitor flips it.
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const themeSnapshot = () => document.documentElement.dataset.theme ?? "light";

function useThemeKey() {
  return useSyncExternalStore(subscribeTheme, themeSnapshot, () => "light");
}

type Palette = {
  /// The theme these colours were resolved against.
  theme: string;
  tones: THREE.Color[];
  accent: THREE.Color;
  grounding: THREE.Color;
  dark: boolean;
};

function readPalette(layers: TopologyLayer[], theme: string): Palette {
  const root = document.documentElement;
  const read = (name: string) =>
    getComputedStyle(root).getPropertyValue(name).trim();

  // Tone hues are declared as `[data-tone="…"] { --tone: … }` rules, so the
  // only way to resolve one is to ask an element carrying the attribute.
  const probe = document.createElement("span");
  probe.style.display = "none";
  root.appendChild(probe);

  const tones = layers.map((layer) => {
    probe.dataset.tone = layer.tone;
    const value = getComputedStyle(probe).getPropertyValue("--tone").trim();
    return new THREE.Color(value || "#0078d4");
  });

  probe.remove();

  // Whether the page behind the canvas is dark decides how much the plates can
  // lean on light, and how bright the pulses have to be to hold their own.
  const canvas = new THREE.Color(read("--bw-canvas") || "#ffffff");

  return {
    theme,
    tones,
    accent: new THREE.Color(read("--bw-accent") || "#0067b8"),
    grounding: new THREE.Color(read("--color-teal-500") || "#038387"),
    dark: canvas.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5,
  };
}

/* -------------------------------------------------------------------------- */
/* Geometry helpers                                                           */
/* -------------------------------------------------------------------------- */

/// Index 0 is the base of the stack.
function layerY(index: number, count: number) {
  return (index - (count - 1) / 2) * SPACING;
}

/**
 * Node placement, deliberately different per layer so the four read as four
 * kinds of thing: racks at the base, a spread of models above them, a ring of
 * collaborating agents, then a row of systems of record.
 */
function nodeLayout(index: number, count: number): [number, number][] {
  const n = Math.max(1, Math.min(count, MAX_NODE_LABELS));
  const points: [number, number][] = [];
  const spread = (i: number, total: number, width: number) =>
    total > 1 ? (i / (total - 1) - 0.5) * width : 0;

  if (index === 0 || index === 1) {
    const cols = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      points.push([
        spread(col, cols, 3.9) + (index === 1 && row === 1 ? 0.3 : 0),
        n > cols ? (row - 0.5) * 1.0 : 0,
      ]);
    }
  } else if (index === 2) {
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + 0.5;
      points.push([Math.cos(angle) * 1.85, Math.sin(angle) * 0.95]);
    }
  } else {
    for (let i = 0; i < n; i++) points.push([spread(i, n, 4.2), 0]);
  }

  return points;
}

/// One curve per filament: a gentle S from the top of one plate to the bottom
/// of the next. Doubles as the path the pulses travel.
function buildFilaments(count: number) {
  const curves: THREE.CatmullRomCurve3[] = [];

  for (let i = 0; i < count - 1; i++) {
    const from = layerY(i, count) + PLATE_T;
    const to = layerY(i + 1, count) - PLATE_T;

    FILAMENT_ANCHORS.forEach((anchor, k) => {
      const x = (anchor * PLATE_W) / 2;
      const bow = (k - (FILAMENT_ANCHORS.length - 1) / 2) * 0.14;

      curves.push(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(x, from, 0),
          new THREE.Vector3(x * 0.92, from + (to - from) * 0.35, bow),
          new THREE.Vector3(x * 0.92, from + (to - from) * 0.65, bow),
          new THREE.Vector3(x, to, 0),
        ]),
      );
    });
  }

  return curves;
}

/// The rim drawn around a plate's top face.
function plateRim(): [number, number, number][] {
  const w = PLATE_W / 2;
  const d = PLATE_D / 2;
  const y = PLATE_T / 2;
  return [
    [-w, y, -d],
    [w, y, -d],
    [w, y, d],
    [-w, y, d],
    [-w, y, -d],
  ];
}

/* -------------------------------------------------------------------------- */
/* Label projection                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Anchors live in the 3D scene; the elements they drive live in a DOM overlay.
 * Both sides register here, and `Projector` marries them once per frame.
 *
 * Module-scoped on purpose. Threading it through props would make every
 * `el.style.transform` a prop mutation, which the React Compiler rules reject;
 * and only one topology scene is ever mounted at a time. `reset` clears it so a
 * remount never inherits stale nodes.
 */
type LabelRegistry = {
  captionAnchors: (THREE.Object3D | null)[];
  captionEls: (HTMLDivElement | null)[];
  /// [layerIndex][nodeIndex]
  nodeAnchors: (THREE.Object3D | null)[][];
  /// A flat pool, reused by whichever layer currently holds the focus.
  nodeEls: (HTMLDivElement | null)[];
};

const labels: LabelRegistry = {
  captionAnchors: [],
  captionEls: [],
  nodeAnchors: [],
  nodeEls: [],
};

function resetLabels() {
  labels.captionAnchors = [];
  labels.captionEls = [];
  labels.nodeAnchors = [];
  labels.nodeEls = [];
}

function place(
  el: HTMLDivElement,
  anchor: THREE.Object3D,
  camera: THREE.Camera,
  width: number,
  height: number,
  vector: THREE.Vector3,
  opacity: number,
  align: "left" | "centre",
) {
  anchor.getWorldPosition(vector).project(camera);

  const x = (vector.x * 0.5 + 0.5) * width;
  const y = (-vector.y * 0.5 + 0.5) * height;
  const shift = align === "left" ? "0" : "-50%";

  // Rounding to whole pixels keeps text off half-pixel boundaries, where
  // subpixel antialiasing softens it.
  el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(${shift}, -50%)`;
  el.style.opacity = String(opacity);
}

function Projector({
  active,
  count,
}: {
  active: number | null;
  count: number;
}) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const vector = useMemo(() => new THREE.Vector3(), []);

  // Positions are written from the frame loop, so a resize — or a first paint
  // with motion switched off — has to ask for a frame or the labels sit at the
  // canvas origin.
  useEffect(() => invalidate(), [size, active, invalidate]);

  useFrame(() => {
    for (let i = 0; i < count; i++) {
      const el = labels.captionEls[i];
      const anchor = labels.captionAnchors[i];
      if (!el || !anchor) continue;
      place(
        el,
        anchor,
        camera,
        size.width,
        size.height,
        vector,
        active === null || active === i ? 1 : 0.35,
        "left",
      );
    }

    const anchors = active === null ? [] : (labels.nodeAnchors[active] ?? []);
    for (let i = 0; i < labels.nodeEls.length; i++) {
      const el = labels.nodeEls[i];
      const anchor = anchors[i];
      if (!el) continue;
      if (!anchor) {
        el.style.opacity = "0";
        continue;
      }
      place(el, anchor, camera, size.width, size.height, vector, 1, "centre");
    }
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/* Environment                                                                */
/* -------------------------------------------------------------------------- */

/// A room probe generated in memory — no HDR download, but enough of a light
/// field that metals and glossy plates get a believable specular roll-off.
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);

  // `attach` hands the texture to scene.environment declaratively — assigning
  // it ourselves would be a mutation of a hook result.
  const texture = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);

    pmrem.dispose();
    room.traverse((object) => {
      const mesh = object as Partial<THREE.Mesh>;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });

    return target.texture;
  }, [gl]);

  useEffect(() => () => texture.dispose(), [texture]);

  return <primitive object={texture} attach="environment" />;
}

/* -------------------------------------------------------------------------- */
/* Layer                                                                      */
/* -------------------------------------------------------------------------- */

function Layer({
  layer,
  index,
  count,
  color,
  dark,
  emphasis,
  raised,
  animated,
  quality,
  onHover,
  onSelect,
}: {
  layer: TopologyLayer;
  index: number;
  count: number;
  color: THREE.Color;
  dark: boolean;
  /// 1 when this layer holds the focus (or nothing does), DIMMED otherwise.
  emphasis: number;
  raised: boolean;
  animated: boolean;
  quality: Quality;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
}) {
  // In demand mode nothing redraws unless we ask, and the work below happens
  // in effects — after the frame that would have shown it.
  const invalidate = useThree((state) => state.invalidate);

  const group = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  // Animated materials are reached through JSX refs: they are the one mutable
  // handle the React Compiler rules allow us to write to from a frame loop.
  const plate = useRef<THREE.MeshStandardMaterial>(null);
  const node = useRef<THREE.MeshStandardMaterial>(null);
  const rim = useRef<ComponentRef<typeof Line>>(null);

  const baseY = layerY(index, count);
  const positions = useMemo(
    () => nodeLayout(index, layer.nodes.length),
    [index, layer.nodes.length],
  );

  // Rounded corners are most of the difference between "rendered" and
  // "primitive" — they give every edge a highlight to catch.
  const plateGeometry = useMemo(
    () => new RoundedBoxGeometry(PLATE_W, PLATE_T, PLATE_D, 3, 0.05),
    [],
  );

  const nodeGeometry = useMemo(() => {
    switch (index) {
      // Accelerator racks.
      case 0:
        return new RoundedBoxGeometry(0.3, 0.36, 0.3, 3, 0.05);
      case 1:
        return new THREE.SphereGeometry(0.17, 32, 20);
      case 2:
        return new THREE.IcosahedronGeometry(0.2, 0);
      // Systems of record — flat plates.
      default:
        return new RoundedBoxGeometry(0.5, 0.12, 0.34, 3, 0.045);
    }
  }, [index]);

  const rimPoints = useMemo(() => plateRim(), []);

  useEffect(() => {
    return () => {
      plateGeometry.dispose();
      nodeGeometry.dispose();
    };
  }, [plateGeometry, nodeGeometry]);

  // One instanced draw for every node on the plate, so highlighting the layer
  // is a single material change rather than one per node.
  useEffect(() => {
    const instanced = nodes.current;
    if (!instanced) return;

    const dummy = new THREE.Object3D();
    positions.forEach(([x, z], i) => {
      dummy.position.set(x, PLATE_T / 2 + 0.19, z);
      // A touch of yaw per node stops the grid reading as machine-stamped.
      dummy.rotation.y = index === 2 ? i * 0.7 : 0;
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });
    instanced.count = positions.length;
    instanced.instanceMatrix.needsUpdate = true;
    instanced.computeBoundingSphere();
    invalidate();
  }, [positions, index, invalidate]);

  // Emphasis is eased inside the frame loop, so a change to it has to ask for
  // at least one frame when the loop is otherwise parked.
  useEffect(() => invalidate(), [emphasis, raised, invalidate]);

  useFrame((_, delta) => {
    const ease = animated ? Math.min(1, delta * 7) : 1;

    if (group.current) {
      const target = baseY + (raised ? RAISE : 0);
      group.current.position.y += (target - group.current.position.y) * ease;
    }

    if (plate.current) {
      const target = (dark ? 0.3 : 0.42) * emphasis + 0.06;
      plate.current.opacity += (target - plate.current.opacity) * ease;
    }
    if (node.current) {
      node.current.opacity += (0.35 + emphasis * 0.65 - node.current.opacity) * ease;
    }
    if (rim.current) {
      const material = rim.current.material;
      material.opacity += (0.25 + emphasis * 0.7 - material.opacity) * ease;
    }
  });

  return (
    <group ref={group} position={[0, baseY, 0]}>
      {/* Hit volume — invisible but raycastable, covering the plate and the gap
          above it so the layer is easy to point at. */}
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(index);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(index);
        }}
      >
        <boxGeometry args={[PLATE_W, SPACING * 0.84, PLATE_D]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>

      {/* The plate */}
      <mesh geometry={plateGeometry} receiveShadow>
        <meshStandardMaterial
          ref={plate}
          color={color}
          transparent
          opacity={0.42}
          roughness={0.22}
          metalness={0}
          envMapIntensity={dark ? 0.5 : 0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Rim. drei's Line is a screen-space quad strip, so it honours
          lineWidth — the built-in LineBasicMaterial does not. */}
      <Line
        ref={rim}
        points={rimPoints}
        color={color}
        lineWidth={1.6}
        transparent
        opacity={0.7}
        depthWrite={false}
        toneMapped={false}
      />

      {/* Nodes. The shape says what kind of thing the layer holds: upright
          racks, model spheres, agent facets, then flat systems of record. */}
      <instancedMesh
        ref={nodes}
        args={[nodeGeometry, undefined, Math.max(positions.length, 1)]}
        castShadow={quality === 2}
      >
        <meshStandardMaterial
          ref={node}
          color={color}
          transparent
          opacity={1}
          roughness={0.28}
          metalness={0.12}
          envMapIntensity={1.35}
        />
      </instancedMesh>

      {/* Anchors the DOM labels track. Empty objects — nothing is drawn here. */}
      <object3D
        ref={(instance) => {
          labels.captionAnchors[index] = instance;
        }}
        position={[PLATE_W / 2 + 0.3, 0.05, 0]}
      />
      {positions.map(([x, z], i) => (
        <object3D
          key={layer.nodes[i] ?? i}
          ref={(instance) => {
            const set = (labels.nodeAnchors[index] ??= []);
            set[i] = instance;
          }}
          position={[x, PLATE_T / 2 + 0.46, z]}
        />
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Filaments and pulses                                                       */
/* -------------------------------------------------------------------------- */

function Filaments({
  curves,
  color,
}: {
  curves: THREE.CatmullRomCurve3[];
  color: THREE.Color;
}) {
  const geometries = useMemo(
    () => curves.map((curve) => new THREE.TubeGeometry(curve, 22, 0.009, 6, false)),
    [curves],
  );

  // Filaments carry the accent rather than a layer tone: they are the one
  // control plane threading the whole stack together.
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.42,
        roughness: 0.4,
        metalness: 0.1,
        depthWrite: false,
      }),
    [color],
  );

  useEffect(() => {
    return () => {
      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
    };
  }, [geometries, material]);

  return (
    <>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={material} />
      ))}
    </>
  );
}

type Pulse = { curve: number; t: number; speed: number };

/// Deterministic spacing rather than Math.random, so the composition is the
/// same on every load and nothing jumps when quality steps down.
function makePulses(curveCount: number, total: number, seed: number): Pulse[] {
  return Array.from({ length: total }, (_, i) => ({
    curve: (i * 7 + seed * 3) % curveCount,
    t: (i * 0.618 + seed * 0.31) % 1,
    speed: 0.15 + ((i * 37) % 11) / 95,
  }));
}

function PulseStream({
  curves,
  count,
  color,
  direction,
  animated,
}: {
  curves: THREE.CatmullRomCurve3[];
  count: number;
  color: THREE.Color;
  direction: 1 | -1;
  animated: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const mesh = useRef<THREE.InstancedMesh>(null);
  // The travelling state is mutated every frame, so it lives behind a ref
  // rather than in a memo.
  const rig = useRef<{ pulses: Pulse[]; dummy: THREE.Object3D } | null>(null);

  const write = useCallback(
    (delta: number) => {
      const instanced = mesh.current;
      const current = rig.current;
      if (!instanced || !current) return;

      const { pulses, dummy } = current;

      for (let i = 0; i < pulses.length; i++) {
        const pulse = pulses[i];
        if (delta > 0) pulse.t = (pulse.t + pulse.speed * delta) % 1;

        const curve = curves[pulse.curve];
        const along = direction > 0 ? pulse.t : 1 - pulse.t;
        dummy.position.copy(curve.getPointAt(along));

        // Fade in and out at the ends so pulses emerge from a plate rather
        // than blinking into existence beside it.
        const fade = Math.sin(pulse.t * Math.PI);
        dummy.scale.setScalar(0.25 + fade * 0.85);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      }

      instanced.instanceMatrix.needsUpdate = true;
    },
    [curves, direction],
  );

  useEffect(() => {
    rig.current = {
      pulses: makePulses(curves.length, count, direction > 0 ? 0 : 1),
      dummy: new THREE.Object3D(),
    };
    write(0);
    invalidate();
  }, [curves, count, direction, write, invalidate]);

  useFrame((_, delta) => {
    if (animated) write(delta);
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.055, 12, 8]} />
      {/* Flat, unlit and untone-mapped so a pulse is the same colour on every
          background. Additive blending would erase these on a light page. */}
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- */
/* Frame-rate guard                                                           */
/* -------------------------------------------------------------------------- */

const WARMUP_MS = 700;
const SAMPLE_MS = 2000;
const DEGRADE_BELOW = 40;
const ABORT_BELOW = 30;
/// A gap this long means the loop was paused, not slow.
const STALL_MS = 400;

/**
 * Watches the real frame rate after mount and reports back. Shader compilation
 * and the first texture uploads make the opening frames meaningless, so the
 * first window is discarded before a verdict is taken.
 *
 * Remounted whenever quality changes, so each tier gets its own measurement.
 */
function FpsGuard({ onVerdict }: { onVerdict: (verdict: FpsVerdict) => void }) {
  const state = useRef({ start: 0, last: 0, frames: 0, warm: false, done: false });

  useFrame(() => {
    const s = state.current;
    if (s.done) return;

    const now = performance.now();

    // First frame, or the loop was parked while the section was offscreen.
    if (s.start === 0 || now - s.last > STALL_MS) {
      s.start = now;
      s.last = now;
      s.frames = 0;
      return;
    }

    s.last = now;
    s.frames++;

    const elapsed = now - s.start;
    if (elapsed < (s.warm ? SAMPLE_MS : WARMUP_MS)) return;

    if (!s.warm) {
      s.warm = true;
      s.start = now;
      s.frames = 0;
      return;
    }

    s.done = true;
    const fps = (s.frames * 1000) / elapsed;

    if (fps < ABORT_BELOW) onVerdict("abort");
    else if (fps < DEGRADE_BELOW) onVerdict("degrade");
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/* Stage                                                                      */
/* -------------------------------------------------------------------------- */

/// Releases the GPU context on unmount. Switching graphics off has to actually
/// free the context, not just stop drawing into it.
function ReleaseOnUnmount() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    return () => {
      scene.traverse((object) => {
        const mesh = object as Partial<THREE.Mesh>;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });

      try {
        gl.dispose();
        gl.forceContextLoss();
      } catch {
        // Already torn down by react-three-fiber.
      }
    };
  }, [gl, scene]);

  return null;
}

function Stack({
  layers,
  active,
  animated,
  quality,
  onHover,
  onSelect,
  onVerdict,
}: {
  layers: TopologyLayer[];
  active: number | null;
  animated: boolean;
  quality: Quality;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  onVerdict: (verdict: FpsVerdict) => void;
}) {
  const sway = useRef<THREE.Group>(null);
  const theme = useThemeKey();

  // The theme decides what the custom properties behind the palette resolve
  // to, so flipping it re-reads every colour.
  const palette = useMemo(() => readPalette(layers, theme), [layers, theme]);
  const curves = useMemo(() => buildFilaments(layers.length), [layers.length]);

  const pulses = PULSES_BY_QUALITY[quality];

  useFrame((state) => {
    const group = sway.current;
    if (!group || !animated) return;

    const yaw =
      RESTING_YAW +
      Math.sin(state.clock.elapsedTime * SWAY_SPEED) * SWAY_AMPLITUDE +
      state.pointer.x * PARALLAX_YAW;
    const pitch = -state.pointer.y * PARALLAX_PITCH;

    // Ease toward the target so the stack drifts rather than tracks.
    group.rotation.y += (yaw - group.rotation.y) * 0.04;
    group.rotation.x += (pitch - group.rotation.x) * 0.04;
  });

  return (
    <>
      <StudioEnvironment />

      {/* The probe supplies the ambient fill; these two only shape it and
          throw the shadows. */}
      <directionalLight
        position={[5, 9, 6]}
        intensity={palette.dark ? 1.1 : 1.5}
        castShadow={quality === 2}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 2, -5]} intensity={0.35} />

      <group position={[OFFSET_X, 0, 0]}>
        <group rotation={[TILT, 0, 0]}>
          <group ref={sway} rotation={[0, RESTING_YAW, 0]}>
            <Filaments curves={curves} color={palette.accent} />

            <PulseStream
              curves={curves}
              count={pulses.up}
              color={palette.accent}
              direction={1}
              animated={animated}
            />
            <PulseStream
              curves={curves}
              count={pulses.down}
              color={palette.grounding}
              direction={-1}
              animated={animated}
            />

            {layers.map((layer, index) => (
              <Layer
                key={layer.id}
                layer={layer}
                index={index}
                count={layers.length}
                color={palette.tones[index]}
                dark={palette.dark}
                emphasis={active === null || active === index ? 1 : DIMMED}
                raised={active === index}
                animated={animated}
                quality={quality}
                onHover={onHover}
                onSelect={onSelect}
              />
            ))}
          </group>
        </group>
      </group>

      <Projector active={active} count={layers.length} />
      <FpsGuard key={quality} onVerdict={onVerdict} />
      <ReleaseOnUnmount />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Canvas + label overlay                                                     */
/* -------------------------------------------------------------------------- */

export default function PlatformScene({
  layers,
  active,
  animated,
  quality,
  paused,
  onHover,
  onSelect,
  onClear,
  onVerdict,
}: {
  layers: TopologyLayer[];
  active: number | null;
  animated: boolean;
  quality: Quality;
  paused: boolean;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  onClear: () => void;
  onVerdict: (verdict: FpsVerdict) => void;
}) {
  // Clear any nodes left by a previous mount before the refs below re-register.
  useMemo(() => resetLabels(), []);

  const activeLayer = active === null ? null : layers[active];

  return (
    <div className="relative size-full">
      <Canvas
        className="size-full"
        // Type is DOM now, so the canvas only carries geometry — it can afford
        // full retina and real multisampling.
        dpr={quality === 2 ? [1, 2] : 1}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          // Neutral keeps brand hues where the design system put them; filmic
          // curves desaturate exactly the blues this palette is built on.
          toneMapping: THREE.NeutralToneMapping,
          toneMappingExposure: 1.05,
        }}
        // "percentage" (PCFShadowMap), not the boolean: `shadows` defaults to
        // PCFSoftShadowMap, which three deprecated and silently downgrades to
        // PCFShadowMap anyway — same pixels, minus the console warning.
        shadows={quality === 2 ? "percentage" : false}
        camera={{ position: [0, 0, 13.2], fov: 30 }}
        // Nothing is drawn while the section is offscreen or the tab is hidden;
        // with motion switched off we only redraw when something changes.
        frameloop={paused ? "never" : animated ? "always" : "demand"}
        onPointerMissed={onClear}
      >
        <Stack
          layers={layers}
          active={active}
          animated={animated}
          quality={quality}
          onHover={onHover}
          onSelect={onSelect}
          onVerdict={onVerdict}
        />
      </Canvas>

      {/* Label overlay. Real DOM text in the site's own type ramp, positioned
          by Projector — never a rasterised texture. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            ref={(el) => {
              labels.captionEls[index] = el;
            }}
            className="absolute top-0 left-0 will-change-transform"
            style={{ transition: "opacity 350ms ease" }}
          >
            <div
              data-tone={layer.tone}
              className="flex items-center gap-2.5 whitespace-nowrap"
            >
              <span className="h-px w-5 bg-[var(--tone)] opacity-70" aria-hidden />
              <span>
                <span
                  className={cn(
                    "block text-[0.82rem] leading-tight font-semibold",
                    active === index ? "text-ink" : "text-ink-2",
                  )}
                >
                  {layer.title}
                </span>
                {layer.subtitle ? (
                  <span className="block text-[0.6rem] tracking-[0.14em] text-ink-3 uppercase">
                    {layer.subtitle}
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        ))}

        {/* Node labels for the focused layer, from a fixed pool. */}
        {Array.from({ length: MAX_NODE_LABELS }, (_, i) => {
          const text = activeLayer?.nodes[i];
          return (
            <div
              key={i}
              ref={(el) => {
                labels.nodeEls[i] = el;
              }}
              className="absolute top-0 left-0 will-change-transform"
              style={{ opacity: 0, transition: "opacity 250ms ease" }}
            >
              {text ? (
                <span className="block rounded-md border border-line bg-surface/90 px-1.5 py-0.5 text-[0.62rem] leading-none font-medium whitespace-nowrap text-ink-2 shadow-[var(--bw-shadow-panel)] backdrop-blur-sm">
                  {text}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
