import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import type { Project } from "@/components/site/ProjectCard";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Edit Project | Admin" };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    notFound();
  }

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const project = data as Project;

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
          Admin / Projects / Edit
        </p>
        <h1 className="text-[22px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          {project.name}
        </h1>
      </div>
      <ProjectForm mode="edit" project={project} />
    </div>
  );
}
