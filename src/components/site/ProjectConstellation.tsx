// Project constellation — generative cover for projects without media.
// A seeded node graph rendered as an animated system schematic: every
// project gets its own stable layout (seeded by name), nodes pulse and
// packets flow along a few edges. Server-renderable: deterministic
// math, CSS-only animation.

type Node = { x: number; y: number; r: number; accent: boolean; delay: number };
type Edge = { a: number; b: number; flow: boolean };

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 460;
const H = 288;
const MARGIN = 34;
const NODE_COUNT = 13;

function buildGraph(seed: string): { nodes: Node[]; edges: Edge[] } {
  const rng = mulberry32(hashString(seed));

  const nodes: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => ({
    x: Math.round((MARGIN + rng() * (W - MARGIN * 2)) * 10) / 10,
    y: Math.round((MARGIN + rng() * (H - MARGIN * 2)) * 10) / 10,
    r: Math.round((2 + rng() * 1.8) * 10) / 10,
    accent: i % 5 === 3,
    delay: Math.round(rng() * 38) / 10,
  }));

  // Each node links to its two nearest neighbors; dedupe pairs.
  const seen = new Set<string>();
  const edges: Edge[] = [];
  nodes.forEach((n, i) => {
    const byDist = nodes
      .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 }))
      .filter(({ j }) => j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { j } of byDist) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ a: Math.min(i, j), b: Math.max(i, j), flow: false });
      }
    }
  });

  // A few edges carry animated packets.
  const flowCount = Math.min(3, edges.length);
  for (let k = 0; k < flowCount; k++) {
    edges[Math.floor(rng() * edges.length)].flow = true;
  }

  return { nodes, edges };
}

// Orthogonal elbow routing (horizontal, then vertical) — reads as a
// circuit trace rather than a star chart.
function elbow(a: Node, b: Node): string {
  return `M ${a.x} ${a.y} L ${b.x} ${a.y} L ${b.x} ${b.y}`;
}

export default function ProjectConstellation({ seed }: { seed: string }) {
  const { nodes, edges } = buildGraph(seed);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute inset-0 w-full h-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      {/* traces */}
      {edges.map((e, i) => {
        const path = elbow(nodes[e.a], nodes[e.b]);
        return e.flow ? (
          <g key={i}>
            <path
              d={path}
              fill="none"
              stroke="var(--gray-800)"
              strokeWidth="1"
            />
            <path
              className="cn-flow"
              d={path}
              fill="none"
              stroke="var(--violet-soft)"
              strokeWidth="1"
              opacity="0.55"
            />
          </g>
        ) : (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="var(--gray-800)"
            strokeWidth="1"
          />
        );
      })}

      {/* nodes */}
      {nodes.map((n, i) => {
        const color = n.accent ? "var(--amber-bright)" : "var(--violet-soft)";
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r + 4} fill={color} opacity="0.1" />
            <circle
              className="cn-node"
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={color}
              style={{ animationDelay: `${n.delay}s` }}
            />
          </g>
        );
      })}
    </svg>
  );
}
