import ProjectForm from "@/components/admin/ProjectForm";

export const metadata = { title: "New Project | Admin" };

export default function NewProjectPage() {
  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
          Admin / Projects / New
        </p>
        <h1 className="text-[22px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          Add project
        </h1>
      </div>
      <ProjectForm mode="new" />
    </div>
  );
}
