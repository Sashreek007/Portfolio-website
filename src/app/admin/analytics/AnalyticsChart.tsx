type DayRow = { day: string; total: number; uniques: number };

// Lightweight inline SVG bar chart — two bars per day side-by-side
// (total views in violet, unique visitors in green). No chart library.
export default function AnalyticsChart({ rows }: { rows: DayRow[] }) {
  if (rows.length === 0) {
    return (
      <div
        className="font-mono text-[12px] py-16 text-center"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--gray-800)",
          borderRadius: "6px",
        }}
      >
        no data yet — visit the public site to generate traffic
      </div>
    );
  }

  const width = 960;
  const height = 240;
  const pad = { top: 16, right: 16, bottom: 32, left: 40 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const max = Math.max(1, ...rows.map((r) => Math.max(r.total, r.uniques)));
  const niceMax = Math.ceil(max / 5) * 5 || 5;
  const xStep = plotW / rows.length;
  const barPairW = Math.max(2, xStep * 0.8);
  const barW = barPairW / 2 - 1;

  const yFor = (v: number) => pad.top + plotH - (v / niceMax) * plotH;
  const ticks = [0, Math.round(niceMax / 2), niceMax];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="auto"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {/* Y-axis gridlines + labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              x2={pad.left + plotW}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="var(--gray-800)"
              strokeDasharray={t === 0 ? "" : "2 4"}
            />
            <text
              x={pad.left - 8}
              y={yFor(t) + 4}
              textAnchor="end"
              fontSize="10"
              fontFamily="var(--font-mono)"
              fill="var(--text-muted)"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Bars */}
        {rows.map((r, i) => {
          const x = pad.left + i * xStep + (xStep - barPairW) / 2;
          const totalH = plotH - (yFor(r.total) - pad.top);
          const uniqH = plotH - (yFor(r.uniques) - pad.top);
          return (
            <g key={r.day}>
              <rect
                x={x}
                y={yFor(r.total)}
                width={barW}
                height={totalH}
                fill="var(--violet-soft)"
                opacity="0.9"
              >
                <title>{`${r.day} · ${r.total} total views`}</title>
              </rect>
              <rect
                x={x + barW + 2}
                y={yFor(r.uniques)}
                width={barW}
                height={uniqH}
                fill="var(--green-bright)"
                opacity="0.9"
              >
                <title>{`${r.day} · ${r.uniques} unique visitors`}</title>
              </rect>
            </g>
          );
        })}

        {/* X-axis labels — every ~5th day */}
        {rows.map((r, i) => {
          if (i % 5 !== 0 && i !== rows.length - 1) return null;
          const x = pad.left + i * xStep + xStep / 2;
          const label = r.day.slice(5); // MM-DD
          return (
            <text
              key={`xl-${r.day}`}
              x={x}
              y={height - pad.bottom + 16}
              textAnchor="middle"
              fontSize="10"
              fontFamily="var(--font-mono)"
              fill="var(--text-muted)"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div
        className="flex items-center gap-5 mt-4 font-mono text-[11px] tracking-[0.08em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="flex items-center gap-2">
          <span
            className="w-[10px] h-[10px] inline-block"
            style={{ background: "var(--violet-soft)" }}
          />
          total views
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-[10px] h-[10px] inline-block"
            style={{ background: "var(--green-bright)" }}
          />
          unique visitors
        </span>
      </div>
    </div>
  );
}
