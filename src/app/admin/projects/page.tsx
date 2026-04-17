import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Project } from "@/components/site/ProjectCard";
import SyncProjectPostsButton from "./SyncProjectPostsButton";

const statusColors = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
};

export default async function AdminProjectsPage() {
  let projects: Project[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) projects = data as Project[];
  }

  return (
    <div className="max-w-[900px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
            Admin / Projects
          </p>
          <h1 className="text-[22px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
            Projects
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <SyncProjectPostsButton />
          <Link
            href="/admin/projects/new"
            className="font-mono text-[12px] px-4 py-2 transition-all duration-200 hover:-translate-y-[1px]"
            style={{ color: "var(--violet-pale)", background: "var(--violet-mid)", borderRadius: "4px" }}
          >
            + add project
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>
          no projects yet — add one to get started
        </p>
      ) : (
        <div className="flex flex-col gap-0">
          {projects.map((project, i) => (
            <div
              key={project.id}
              className="flex items-start justify-between gap-4 py-4"
              style={{ borderBottom: i < projects.length - 1 ? "1px solid var(--gray-800)" : "none" }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                    {project.name}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.08em] uppercase" style={{ color: statusColors[project.status] }}>
                    {project.status}
                  </span>
                  {project.is_best && (
                    <span className="font-mono text-[10px] tracking-[0.06em]" style={{ color: "var(--violet-soft)" }}>
                      best
                    </span>
                  )}
                </div>
                <p className="text-[13px] leading-[1.5]" style={{ color: "var(--text-muted)" }}>
                  {project.description.slice(0, 100)}{project.description.length > 100 ? "..." : ""}
                </p>
              </div>
              <Link
                href={`/admin/projects/${project.id}`}
                className="font-mono text-[12px] px-3 py-1 shrink-0 transition-colors duration-150"
                style={{ color: "var(--text-muted)", border: "1px solid var(--gray-800)", borderRadius: "4px" }}
              >
                edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
