import { createServerClient } from "@/lib/supabase/server";
import AnalyticsChart from "./AnalyticsChart";

export const metadata = { title: "Analytics | Admin" };

type Row = { day: string; total: number; uniques: number };

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function getAnalytics(): Promise<{
  rows: Row[];
  totalLast30: number;
  uniqueLast30: number;
  totalLifetime: number;
  uniqueLifetime: number;
  topPaths: Array<{ path: string; views: number }>;
}> {
  const empty = {
    rows: [] as Row[],
    totalLast30: 0,
    uniqueLast30: 0,
    totalLifetime: 0,
    uniqueLifetime: 0,
    topPaths: [],
  };

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return empty;
  }

  try {
    const supabase = await createServerClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Lifetime counts. `count: exact` is cheap.
    const [{ count: lifetimeTotal }, { data: lifetimeUniqRows }] = await Promise.all([
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase.from("page_views").select("visitor_id"),
    ]);

    const uniqueLifetime = new Set(
      (lifetimeUniqRows ?? []).map((r: { visitor_id: string }) => r.visitor_id)
    ).size;

    // Last-30-day window for daily buckets.
    const { data: windowRows } = await supabase
      .from("page_views")
      .select("visitor_id, path, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());
    const recent = (windowRows ?? []) as Array<{
      visitor_id: string;
      path: string;
      created_at: string;
    }>;

    // Aggregate by day.
    const byDay = new Map<string, { total: number; visitors: Set<string> }>();
    const pathCounts = new Map<string, number>();
    const lifetimeUniqSet = new Set<string>();
    for (const r of recent) {
      const day = r.created_at.slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, { total: 0, visitors: new Set() });
      const bucket = byDay.get(day)!;
      bucket.total++;
      bucket.visitors.add(r.visitor_id);
      lifetimeUniqSet.add(r.visitor_id);
      pathCounts.set(r.path, (pathCounts.get(r.path) ?? 0) + 1);
    }

    // Fill 30-day array (inclusive today, oldest → newest).
    const now = new Date();
    const rows: Row[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      const bucket = byDay.get(key);
      rows.push({
        day: key,
        total: bucket?.total ?? 0,
        uniques: bucket?.visitors.size ?? 0,
      });
    }

    const topPaths = [...pathCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, views]) => ({ path, views }));

    return {
      rows,
      totalLast30: recent.length,
      uniqueLast30: lifetimeUniqSet.size,
      totalLifetime: lifetimeTotal ?? 0,
      uniqueLifetime,
      topPaths,
    };
  } catch {
    return empty;
  }
}

export default async function AdminAnalyticsPage() {
  const {
    rows,
    totalLast30,
    uniqueLast30,
    totalLifetime,
    uniqueLifetime,
    topPaths,
  } = await getAnalytics();

  const stats = [
    { label: "total views · 30d", value: totalLast30, color: "var(--violet-pale)" },
    { label: "unique visitors · 30d", value: uniqueLast30, color: "var(--green-bright)" },
    { label: "total views · all time", value: totalLifetime, color: "var(--text-primary)" },
    { label: "unique visitors · all time", value: uniqueLifetime, color: "var(--text-primary)" },
  ];

  return (
    <div className="max-w-[1100px]">
      <div className="mb-8">
        <p
          className="font-mono text-[11px] tracking-[0.12em] uppercase mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Admin / Analytics
        </p>
        <h1
          className="text-[22px] font-medium"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Traffic
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="flex flex-col gap-1 p-4"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--gray-800)",
              borderRadius: "6px",
            }}
          >
            <span
              className="font-mono text-[28px] font-medium tabular-nums"
              style={{ color }}
            >
              {value.toLocaleString()}
            </span>
            <span
              className="font-mono text-[10px] tracking-[0.08em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2
            className="font-mono text-[14px] flex items-baseline gap-2"
          >
            <span style={{ color: "var(--violet-soft)" }}>##</span>
            <span style={{ color: "var(--text-primary)" }}>last 30 days</span>
          </h2>
          <span
            className="font-mono text-[11px] tracking-[0.08em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            daily
          </span>
        </div>
        <div
          className="p-4"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--gray-800)",
            borderRadius: "6px",
          }}
        >
          <AnalyticsChart rows={rows} />
        </div>
      </section>

      {/* Top paths */}
      {topPaths.length > 0 && (
        <section>
          <h2 className="font-mono text-[14px] mb-4 flex items-baseline gap-2">
            <span style={{ color: "var(--violet-soft)" }}>##</span>
            <span style={{ color: "var(--text-primary)" }}>top paths · 30d</span>
          </h2>
          <div
            className="flex flex-col"
            style={{ border: "1px solid var(--gray-800)", borderRadius: "6px" }}
          >
            {topPaths.map((p, i) => (
              <div
                key={p.path}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom:
                    i < topPaths.length - 1 ? "1px solid var(--gray-800)" : "none",
                }}
              >
                <span
                  className="font-mono text-[12px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {p.path}
                </span>
                <span
                  className="font-mono text-[12px] tabular-nums"
                  style={{ color: "var(--violet-pale)" }}
                >
                  {p.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
