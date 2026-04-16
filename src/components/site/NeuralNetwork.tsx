type Props = {
  className?: string;
  style?: React.CSSProperties;
};

// Slight intentional jitter — perfect grids read as AI-generated
const INPUTS = [
  { x: 30, y: 28 },
  { x: 30, y: 66 },
  { x: 30, y: 102 },
  { x: 30, y: 142 },
];
const HIDDENS = [
  { x: 120, y: 18 },
  { x: 120, y: 48 },
  { x: 120, y: 76 },
  { x: 120, y: 104 },
  { x: 120, y: 134 },
  { x: 120, y: 162 },
];
const OUTPUTS = [
  { x: 210, y: 50 },
  { x: 210, y: 90 },
  { x: 210, y: 130 },
];

// Edges that read as a coherent forward-pass activation trace
const HOT_IH = new Set(["0-1", "1-2", "1-3", "2-3", "3-4", "2-1"]);
const HOT_HO = new Set(["1-0", "2-1", "3-1", "4-2"]);

export default function NeuralNetwork({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 240 188"
      fill="none"
      className={className}
      style={style}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round">
        {/* input → hidden */}
        {INPUTS.flatMap((i, ii) =>
          HIDDENS.map((h, hi) => {
            const hot = HOT_IH.has(`${ii}-${hi}`);
            return (
              <line
                key={`ih-${ii}-${hi}`}
                x1={i.x}
                y1={i.y}
                x2={h.x}
                y2={h.y}
                strokeWidth={hot ? 1.1 : 0.7}
                opacity={hot ? 0.78 : 0.16}
              />
            );
          })
        )}

        {/* hidden → output */}
        {HIDDENS.flatMap((h, hi) =>
          OUTPUTS.map((o, oi) => {
            const hot = HOT_HO.has(`${hi}-${oi}`);
            return (
              <line
                key={`ho-${hi}-${oi}`}
                x1={h.x}
                y1={h.y}
                x2={o.x}
                y2={o.y}
                strokeWidth={hot ? 1.1 : 0.7}
                opacity={hot ? 0.78 : 0.16}
              />
            );
          })
        )}

        {/* nodes — rendered last so they sit on top of edges */}
        {[...INPUTS, ...HIDDENS, ...OUTPUTS].map((n, i) => (
          <circle
            key={`n-${i}`}
            cx={n.x}
            cy={n.y}
            r={3.6}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1}
          />
        ))}

        {/* layer labels */}
        <g
          fontFamily="var(--font-mono)"
          fontSize="6.5"
          opacity="0.42"
          fill="currentColor"
          stroke="none"
          letterSpacing="0.08em"
        >
          <text x="30" y="178" textAnchor="middle">x</text>
          <text x="120" y="184" textAnchor="middle">h</text>
          <text x="210" y="172" textAnchor="middle">ŷ</text>
        </g>
      </g>
    </svg>
  );
}
