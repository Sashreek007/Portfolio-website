import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { Project } from "@/components/site/ProjectCard";
import { SEED_PROJECTS } from "@/lib/projects";

export async function getAllProjects(): Promise<Project[]> {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) return data as Project[];
    } catch {
      // fall through to seed
    }
  }
  return SEED_PROJECTS;
}
