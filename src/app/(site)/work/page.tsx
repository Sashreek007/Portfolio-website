import WorkClient from "./WorkClient";
import { getAllProjects } from "@/lib/projects.server";

export const metadata = { title: "Work · Sashreek Addanki" };

export default async function WorkPage() {
  const projects = await getAllProjects();

  return (
    <div className="px-[6vw] py-16 max-w-[1200px] mx-auto w-full">
      {/* Header — editorial kicker to match home + about */}
      <div className="flex items-center gap-4 mb-14">
        <span
          className="font-mono text-[11px] tracking-[0.2em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          WORK · FEATURE SPREADS
        </span>
        <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
        <span
          className="font-mono text-[11px] tracking-[0.2em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {String(projects.length).padStart(2, "0")} entries
        </span>
      </div>

      <h1
        className="text-[36px] lg:text-[44px] font-medium leading-[1.15] mb-4 tracking-[-0.015em] max-w-[720px]"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
      >
        Projects, laid out as{" "}
        <span style={{ color: "var(--green-bright)" }}>feature spreads</span>.
      </h1>
      <p
        className="text-[15px] leading-[1.75] mb-14 max-w-[640px]"
        style={{ color: "var(--text-secondary)" }}
      >
        Personal builds, research, and community work. Each project gets a
        full-width feature with a demo frame and a reading column — click to
        open the write-up and watch the demo.
      </p>

      <WorkClient projects={projects} />
    </div>
  );
}
