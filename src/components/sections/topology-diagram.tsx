import {
  topologyGeometry,
  type TopologyLayer,
} from "@/components/sections/topology-layers";

/**
 * The stacked-layer diagram, drawn in SVG.
 *
 * This is what the section shows whenever the WebGL scene is not running —
 * unsupported hardware, graphics switched off, reduced motion, or no JS at all.
 * It mirrors the scene's composition (isometric plates, captions off the right
 * edge, filaments threading the stack) and sits in the same 3:2 box, so
 * swapping between the two shifts nothing.
 *
 * The layer copy lives in the rail beside it, so the drawing itself is
 * presentational as far as assistive tech is concerned.
 */

/* Isometric projection ------------------------------------------------------
   Each plate is a rhombus with corners at (0, ±HD) and (±HW, 0) relative to its
   centre. A plate-local point (a, b) — both in [-1, 1], `a` along the width
   axis and `b` along the depth axis — projects as below.                     */
const HW = 175; // half width, on screen
const THICKNESS = 9;
const CX = 200;
/// Where captions start, clear of the widest plate.
const CAPTION_X = CX + HW + 15;

// Half-depth, spacing and the top margin are no longer constants: they come
// from `topologyGeometry`, because a seven-layer stack has to flatten to stay
// in a readable box. See the note there.

function project(a: number, b: number, y: number, hd: number) {
  return { x: CX + ((a - b) * HW) / 2, y: y + ((a + b) * hd) / 2 };
}

/// Node positions across a plate's top face: two rows, evenly spread.
function nodeLayout(count: number) {
  const capped = Math.min(count, 10);
  const cols = Math.ceil(capped / 2);
  const points: { a: number; b: number }[] = [];

  for (let i = 0; i < capped; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    points.push({
      a: cols > 1 ? -0.6 + (col / (cols - 1)) * 1.2 : 0,
      b: capped > cols ? -0.34 + row * 0.68 : 0,
    });
  }

  return points;
}

/// Where the filaments between layers attach.
const FILAMENT_ANCHORS = [-0.72, -0.36, 0, 0.36, 0.72];

function plate(y: number, hd: number) {
  const back = project(-1, -1, y, hd);
  const right = project(1, -1, y, hd);
  const front = project(1, 1, y, hd);
  const left = project(-1, 1, y, hd);

  return {
    top: `M${back.x} ${back.y} L${right.x} ${right.y} L${front.x} ${front.y} L${left.x} ${left.y} Z`,
    // The two faces the viewer can see, extruded downward.
    leftFace: `M${left.x} ${left.y} L${front.x} ${front.y} L${front.x} ${front.y + THICKNESS} L${left.x} ${left.y + THICKNESS} Z`,
    rightFace: `M${front.x} ${front.y} L${right.x} ${right.y} L${right.x} ${right.y + THICKNESS} L${front.x} ${front.y + THICKNESS} Z`,
  };
}

export function TopologyDiagram({ layers }: { layers: TopologyLayer[] }) {
  if (!layers.length) return null;

  const count = layers.length;
  const { depth, spacing, topY, width, height } = topologyGeometry(count);

  /// Layers are indexed bottom-first, but drawn top-first.
  const centreY = (index: number) => topY + (count - 1 - index) * spacing;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      aria-hidden
      role="presentation"
    >
      {/* Filaments first, so the plates sit on top of them. */}
      <g>
        {layers.slice(0, -1).map((layer, i) => {
          const from = centreY(i);
          const to = centreY(i + 1);

          return FILAMENT_ANCHORS.map((anchor, k) => {
            const start = project(anchor, 0, from, depth);
            const end = project(anchor, 0, to, depth);
            // A slight bow keeps the run from reading as a hard rule.
            const bow = (k - (FILAMENT_ANCHORS.length - 1) / 2) * 2.5;

            return (
              <path
                key={`${layer.id}-${k}`}
                d={`M${start.x} ${start.y} Q${start.x + bow} ${(start.y + end.y) / 2} ${end.x} ${end.y}`}
                fill="none"
                stroke="var(--bw-accent)"
                strokeOpacity={0.3}
                strokeWidth={1.1}
              />
            );
          });
        })}
      </g>

      {layers.map((layer, i) => {
        const y = centreY(i);
        const faces = plate(y, depth);
        const nodes = nodeLayout(layer.nodes.length);

        return (
          <g key={layer.id} data-tone={layer.tone} data-topology-layer={i}>
            {/* Plate */}
            <path d={faces.leftFace} fill="var(--tone)" fillOpacity={0.16} />
            <path d={faces.rightFace} fill="var(--tone)" fillOpacity={0.28} />
            <path
              d={faces.top}
              fill="var(--tone)"
              fillOpacity={0.09}
              stroke="var(--tone)"
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />

            {/* Nodes */}
            {nodes.map((point, k) => {
              const p = project(point.a, point.b, y, depth);
              return (
                <circle
                  key={layer.nodes[k] ?? k}
                  cx={p.x}
                  cy={p.y}
                  r={3.2}
                  fill="var(--tone)"
                  fillOpacity={0.92}
                />
              );
            })}

            {/* Caption, off the right edge — the same place the scene puts it. */}
            <text x={CAPTION_X} y={y - 1} className="fill-ink text-[12.5px] font-medium">
              {layer.title}
            </text>
            {layer.subtitle ? (
              <text
                x={CAPTION_X}
                y={y + 13}
                className="fill-ink-3 text-[9.5px] tracking-[0.16em] uppercase"
              >
                {layer.subtitle}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
