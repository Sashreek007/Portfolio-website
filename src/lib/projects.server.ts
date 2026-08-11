import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { GalleryItem, Project } from "@/components/site/ProjectCard";
import { SEED_PROJECTS } from "@/lib/projects";

// Rows written before the gallery/highlights columns existed come back with
// the keys missing, so coerce both to arrays and drop malformed entries
// rather than letting an undefined reach a `.map` in a server component.
function normalize(row: Record<string, unknown>): Project {
  const gallery = Array.isArray(row.gallery) ? row.gallery : [];
  const highlights = Array.isArray(row.highlights) ? row.highlights : [];

  return {
    ...(row as unknown as Project),
    gallery: gallery.filter(
      (g): g is GalleryItem =>
        !!g && typeof g === "object" && typeof (g as GalleryItem).url === "string"
    ),
    highlights: highlights.filter((h): h is string => typeof h === "string"),
  };
}

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
      if (data && data.length > 0) return data.map(normalize);
    } catch {
      // fall through to seed
    }
  }
  return SEED_PROJECTS;
}

// Homepage feature reel. Goes through the same normalizer as getAllProjects
// so the gallery/highlights fields are never undefined downstream.
export async function getBestProjects(limit = 4): Promise<Project[]> {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("is_best", true)
        .order("sort_order", { ascending: true })
        .limit(limit);
      if (data && data.length > 0) return data.map(normalize);
    } catch {
      // fall through to seed
    }
  }
  return SEED_PROJECTS.filter((p) => p.is_best).slice(0, limit);
}
