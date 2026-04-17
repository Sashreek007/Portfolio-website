/**
 * One-off: create a project-linked blog post for every project that
 * doesn't already have one. Uses the service role key so it bypasses
 * RLS. Safe to re-run; it only inserts when missing.
 *
 * Run: `npx tsx scripts/seed-project-posts.ts`
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { buildProjectPostPayload } from "../src/lib/project-post";
import type { Project } from "../src/components/site/ProjectCard";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing supabase env vars");

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const [projectsRes, postsRes] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("posts").select("project_id").not("project_id", "is", null),
  ]);
  if (projectsRes.error) throw projectsRes.error;
  if (postsRes.error) throw postsRes.error;

  const linked = new Set(
    (postsRes.data ?? []).map((r: { project_id: string | null }) => r.project_id)
  );
  const projects = (projectsRes.data ?? []) as Project[];
  const missing = projects.filter((p) => !linked.has(p.id));
  console.log(`projects=${projects.length}, already linked=${linked.size}, missing=${missing.length}`);

  if (missing.length === 0) {
    console.log("nothing to do");
    return;
  }

  const rows = missing.map((p) => buildProjectPostPayload(p));
  const { error } = await supabase.from("posts").insert(rows);
  if (error) throw error;

  console.log(`created ${rows.length} project posts`);
  for (const r of rows) console.log(` - ${r.title} → /blog/${r.slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
