import { createServerClient } from "@/lib/supabase/server";
import { getBlogViewStats, type PostViewStats } from "@/lib/blog-views";
import AnalyticsChart from "./AnalyticsChart";
import AnalyticsBoard, { type BoardPost } from "./AnalyticsBoard";

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
  posts: BoardPost[];
}> {
  const empty = {
    rows: [] as Row[],
    totalLast30: 0,
    uniqueLast30: 0,
    totalLifetime: 0,
    uniqueLifetime: 0,
    posts: [] as BoardPost[],
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

    // Traffic + posts load in parallel.
    const [
      { count: lifetimeTotal },
      { data: lifetimeUniqRows },
      { data: windowRows },
      { data: postRows },
      viewStats,
    ] = await Promise.all([
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase.from("page_views").select("visitor_id"),
      supabase
        .from("page_views")
        .select("visitor_id, path, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("posts")
        .select(
          "id, title, slug, tags, is_published, published_at, created_at, project_id, show_on_writing",
        )
        .order("created_at", { ascending: false }),
      getBlogViewStats(),
    ]);

    const uniqueLifetime = new Set(
      (lifetimeUniqRows ?? []).map((r: { visitor_id: string }) => r.visitor_id),
    ).size;

    const recent = (windowRows ?? []) as Array<{
      visitor_id: string;
      path: string;
      created_at: string;
    }>;

    const byDay = new Map<string, { total: number; visitors: Set<string> }>();
    const lifetimeUniqSet = new Set<string>();
    for (const r of recent) {
      const day = r.created_at.slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, { total: 0, visitors: new Set() });
      const bucket = byDay.get(day)!;
      bucket.total++;
      bucket.visitors.add(r.visitor_id);
      lifetimeUniqSet.add(r.visitor_id);
    }

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

    const posts: BoardPost[] = ((postRows ?? []) as Array<{
      id: string;
      title: string;
      slug: string;
      tags: string[] | null;
      is_published: boolean;
      published_at: string | null;
      created_at: string;
      project_id: string | null;
      show_on_writing: boolean;
    }>).map((p) => {
      const stats: PostViewStats | undefined = viewStats.get(p.slug);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        tags: (p.tags ?? []).filter(
          (t) => !t.startsWith("series:") && !t.startsWith("part:"),
        ),
        isPublished: p.is_published,
        isProject: !!p.project_id,
        isHidden: !p.show_on_writing,
        postedAt: p.published_at ?? p.created_at,
        views: stats?.views ?? 0,
        uniques: stats?.uniques ?? 0,
        views7d: stats?.views7d ?? 0,
        viewsPrev7d: stats?.viewsPrev7d ?? 0,
      };
    });

    return {
      rows,
      totalLast30: recent.length,
      uniqueLast30: lifetimeUniqSet.size,
      totalLifetime: lifetimeTotal ?? 0,
      uniqueLifetime,
      posts,
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
    posts,
  } = await getAnalytics();

  const stats = [
    { label: "total views · 30d", value: totalLast30, color: "var(--violet-pale)" },
    { label: "unique visitors · 30d", value: uniqueLast30, color: "var(--green-bright)" },
    { label: "total views · all time", value: totalLifetime, color: "var(--text-primary)" },
    { label: "unique visitors · all time", value: uniqueLifetime, color: "var(--text-primary)" },
  ];

  return (
    <div className="max-w-[1400px]">
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
          <div key={label} className="glass flex flex-col gap-1 p-5">
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
          <h2 className="font-mono text-[14px] flex items-baseline gap-2">
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
        <div className="glass p-5">
          <AnalyticsChart rows={rows} />
        </div>
      </section>

      {/* Kanban board */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-mono text-[14px] flex items-baseline gap-2">
            <span style={{ color: "var(--violet-soft)" }}>##</span>
            <span style={{ color: "var(--text-primary)" }}>post board</span>
          </h2>
          <span
            className="font-mono text-[11px] tracking-[0.08em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            by lifetime views
          </span>
        </div>
        <AnalyticsBoard posts={posts} />
      </section>
    </div>
  );
}
