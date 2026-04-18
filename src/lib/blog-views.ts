import { createAdminClient, createServerClient } from "@/lib/supabase/server";

export type PostViewStats = {
  slug: string;
  views: number;
  uniques: number;
  views7d: number;
  viewsPrev7d: number;
};

// Aggregate public blog view counts keyed by slug. We derive the slug
// from the path rather than joining through posts so posts that were
// renamed retain their historical traffic under both paths.
export async function getBlogViewStats(): Promise<Map<string, PostViewStats>> {
  const result = new Map<string, PostViewStats>();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return result;
  }

  try {
    // page_views has RLS that only allows authenticated reads, so the
    // public blog index / sidebar needs the service-role client to
    // aggregate counts. Fall back to the anon client (which will
    // return an empty set for unauthenticated visitors) if the
    // service role isn't configured locally.
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createAdminClient()
      : await createServerClient();
    const { data } = await supabase
      .from("page_views")
      .select("path, visitor_id, created_at")
      .like("path", "/blog/%");

    if (!data) return result;

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const cutoff7d = now - weekMs;
    const cutoff14d = now - 2 * weekMs;

    // Bucket by slug. Path format: `/blog/<slug>` — skip the index
    // itself (`/blog`) and anything with deeper segments.
    type Bucket = {
      views: number;
      visitors: Set<string>;
      views7d: number;
      viewsPrev7d: number;
    };
    const buckets = new Map<string, Bucket>();

    for (const r of data as Array<{
      path: string;
      visitor_id: string;
      created_at: string;
    }>) {
      const parts = r.path.split("/").filter(Boolean);
      if (parts.length !== 2 || parts[0] !== "blog") continue;
      const slug = parts[1];
      let b = buckets.get(slug);
      if (!b) {
        b = { views: 0, visitors: new Set(), views7d: 0, viewsPrev7d: 0 };
        buckets.set(slug, b);
      }
      b.views++;
      b.visitors.add(r.visitor_id);
      const ts = Date.parse(r.created_at);
      if (ts >= cutoff7d) b.views7d++;
      else if (ts >= cutoff14d) b.viewsPrev7d++;
    }

    for (const [slug, b] of buckets) {
      result.set(slug, {
        slug,
        views: b.views,
        uniques: b.visitors.size,
        views7d: b.views7d,
        viewsPrev7d: b.viewsPrev7d,
      });
    }
    return result;
  } catch {
    return result;
  }
}

// Truthy view counts only — tiny helper to keep callers terse.
export function topTrendingSlugs(
  stats: Map<string, PostViewStats>,
  knownSlugs: Set<string>,
  limit = 5,
): PostViewStats[] {
  const rows: PostViewStats[] = [];
  for (const [slug, s] of stats) {
    if (!knownSlugs.has(slug)) continue;
    if (s.views === 0) continue;
    rows.push(s);
  }
  rows.sort((a, b) => {
    // Rank by 7-day views first, fall back to lifetime total.
    if (b.views7d !== a.views7d) return b.views7d - a.views7d;
    return b.views - a.views;
  });
  return rows.slice(0, limit);
}
