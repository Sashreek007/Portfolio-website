type Props = {
  className?: string;
  style?: React.CSSProperties;
};

const Y_TOPS = [30, 56, 82, 108, 134, 160];
// Which units have the primary status LED lit (slightly varied so it doesn't read as a generated pattern)
const POWERED = new Set([0, 1, 2, 4, 5]);
// Drive bay shows on units 1, 4
const DRIVE = new Set([1, 4]);

export default function ServerRack({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 140 230"
      fill="none"
      className={className}
      style={style}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round">
        {/* Outer rack frame */}
        <rect
          x="14"
          y="10"
          width="112"
          height="180"
          rx="3"
          strokeWidth={1.5}
        />

        {/* Top brand band */}
        <line x1="22" y1="22" x2="100" y2="22" strokeWidth={0.7} opacity={0.4} />
        <circle cx="118" cy="20" r="1.4" fill="currentColor" opacity={0.7} />

        {/* Server units */}
        {Y_TOPS.map((y, i) => (
          <g key={i}>
            {/* unit chassis */}
            <rect
              x="22"
              y={y}
              width="96"
              height="22"
              rx="1"
              strokeWidth={1}
              opacity={0.7}
            />

            {/* vent slits (left half) */}
            {[5, 9, 13, 17].map((dy) => (
              <line
                key={dy}
                x1="28"
                y1={y + dy}
                x2={i === 2 ? 46 : 50}
                y2={y + dy}
                strokeWidth={0.6}
                opacity={0.4}
              />
            ))}

            {/* drive slot */}
            {DRIVE.has(i) ? (
              <g>
                <rect
                  x="56"
                  y={y + 4}
                  width="34"
                  height="14"
                  rx="0.5"
                  strokeWidth={0.7}
                  opacity={0.6}
                />
                <line
                  x1="60"
                  y1={y + 11}
                  x2="86"
                  y2={y + 11}
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              </g>
            ) : (
              <rect
                x="56"
                y={y + 5}
                width="34"
                height="12"
                rx="0.5"
                strokeWidth={0.7}
                opacity={0.45}
              />
            )}

            {/* status LEDs */}
            <circle
              cx="103"
              cy={y + 11}
              r="1.7"
              fill={POWERED.has(i) ? "currentColor" : "none"}
              strokeWidth={0.9}
              opacity={POWERED.has(i) ? 0.95 : 0.55}
            />
            <circle
              cx="111"
              cy={y + 11}
              r="1.7"
              fill="none"
              strokeWidth={0.9}
              opacity={0.5}
            />
          </g>
        ))}

        {/* Cables drooping from bottom — slightly chaotic, like real ones */}
        <path d="M 30 190 Q 24 204 22 228" strokeWidth={0.9} opacity={0.5} />
        <path d="M 50 190 Q 56 204 52 228" strokeWidth={0.9} opacity={0.5} />
        <path d="M 78 190 Q 86 206 82 228" strokeWidth={0.9} opacity={0.5} />
        <path d="M 102 190 Q 114 202 116 228" strokeWidth={0.9} opacity={0.5} />

        {/* Tiny floor plate — anchors the visual */}
        <line x1="6" y1="222" x2="134" y2="222" strokeWidth={0.7} opacity={0.3} />
      </g>
    </svg>
  );
}
