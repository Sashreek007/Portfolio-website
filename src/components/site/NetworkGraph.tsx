type Props = {
  className?: string;
  style?: React.CSSProperties;
};

// Asymmetric node placement — looks like an actual graph, not a rosette
const NODES: { x: number; y: number; r: number; me?: boolean }[] = [
  { x: 122, y: 122, r: 9, me: true },
  { x: 50, y: 56, r: 5 },
  { x: 200, y: 50, r: 5 },
  { x: 30, y: 132, r: 4 },
  { x: 220, y: 138, r: 4 },
  { x: 110, y: 28, r: 3.5 },
  { x: 80, y: 200, r: 4 },
  { x: 178, y: 215, r: 4.5 },
  { x: 222, y: 200, r: 3 },
  { x: 28, y: 200, r: 3 },
];

const EDGES: [number, number][] = [
  // hub-and-spoke from self
  [0, 1], [0, 2], [0, 3], [0, 4],
  [0, 5], [0, 6], [0, 7], [0, 8], [0, 9],
  // peripheral mesh
  [1, 5], [2, 5], [3, 9], [4, 8],
  [6, 7], [3, 6], [4, 7], [1, 3],
];

const HOT = new Set(["0-2", "0-3", "0-7", "1-5", "4-8"]);

export default function NetworkGraph({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 250 232"
      fill="none"
      className={className}
      style={style}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round">
        {/* Edges */}
        {EDGES.map(([a, b]) => {
          const na = NODES[a];
          const nb = NODES[b];
          const hot = HOT.has(`${a}-${b}`);
          return (
            <line
              key={`e-${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              strokeWidth={hot ? 1.2 : 0.8}
              opacity={hot ? 0.7 : 0.22}
            />
          );
        })}

        {/* Self-node halo (dashed orbit) */}
        <circle
          cx={NODES[0].x}
          cy={NODES[0].y}
          r={NODES[0].r + 7}
          strokeWidth={0.8}
          opacity={0.45}
          strokeDasharray="2.5 2.5"
        />
        <circle
          cx={NODES[0].x}
          cy={NODES[0].y}
          r={NODES[0].r + 14}
          strokeWidth={0.6}
          opacity={0.22}
          strokeDasharray="1.5 3"
        />

        {/* Nodes */}
        {NODES.map((n, i) => (
          <circle
            key={`n-${i}`}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1}
            opacity={n.me ? 1 : 0.85}
          />
        ))}

        {/* tiny coordinate ticks at corners — adds "diagram" feel */}
        <g opacity={0.3} strokeWidth={0.6}>
          <line x1="6" y1="6" x2="14" y2="6" />
          <line x1="6" y1="6" x2="6" y2="14" />
          <line x1="244" y1="6" x2="236" y2="6" />
          <line x1="244" y1="6" x2="244" y2="14" />
          <line x1="6" y1="226" x2="14" y2="226" />
          <line x1="6" y1="226" x2="6" y2="218" />
          <line x1="244" y1="226" x2="236" y2="226" />
          <line x1="244" y1="226" x2="244" y2="218" />
        </g>
      </g>
    </svg>
  );
}
