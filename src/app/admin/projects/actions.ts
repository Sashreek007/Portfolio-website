"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { buildProjectPostPayload } from "@/lib/project-post";
import type { Project } from "@/components/site/ProjectCard";

// Ensure every project has a matching project-linked post. Safe to run
// repeatedly — only inserts for projects that don't already have one.
export async function syncMissingProjectPosts(): Promise<{
  created: number;
  error?: string;
}> {
  const supabase = await createServerClient();

  const [projectsRes, postsRes] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("posts").select("project_id").not("project_id", "is", null),
  ]);

  if (projectsRes.error) return { created: 0, error: projectsRes.error.message };
  if (postsRes.error) return { created: 0, error: postsRes.error.message };

  const linked = new Set(
    (postsRes.data ?? []).map((r: { project_id: string | null }) => r.project_id)
  );
  const projects = (projectsRes.data ?? []) as Project[];
  const missing = projects.filter((p) => !linked.has(p.id));
  if (missing.length === 0) return { created: 0 };

  const rows = missing.map((p) => buildProjectPostPayload(p));
  const { error } = await supabase.from("posts").insert(rows);
  if (error) return { created: 0, error: error.message };

  revalidatePath("/admin/projects");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  return { created: missing.length };
}
