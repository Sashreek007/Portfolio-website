import Link from "next/link";
import WorkClient from "./WorkClient";
import { getAllProjects } from "@/lib/projects.server";

export const metadata = { title: "Work · Sashreek Addanki" };

export default async function WorkPage() {
  const projects = await getAllProjects();

  return (
    <div className="px-[6vw] py-16 max-w-[1320px] mx-auto w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-[13px] mb-10 transition-colors duration-150"
        style={{ color: "var(--violet-soft)" }}
      >
        <span style={{ color: "var(--amber-bright)" }}>←</span> home
      </Link>

      {/* Header — editorial kicker to match home + about */}
      <div className="flex items-center gap-4 mb-14">
        <span
          className="inline-block w-[7px] h-[7px] rounded-full"
          style={{
            background: "var(--violet-soft)",
            boxShadow:
              "0 0 14px color-mix(in srgb, var(--violet-soft) 60%, transparent)",
          }}
        />
        <span
          className="font-mono text-[12.5px] tracking-[0.22em] uppercase font-medium"
          style={{ color: "var(--violet-pale)" }}
        >
          WORK · PROJECTS
        </span>
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(to right, color-mix(in srgb, var(--violet-mid) 60%, transparent), var(--gray-800) 70%)",
          }}
        />
        <span
          className="font-mono text-[12px] tracking-[0.18em]"
          style={{ color: "var(--amber-bright)" }}
        >
          {String(projects.length).padStart(2, "0")} entries
        </span>
      </div>

      <h1
        className="text-[42px] lg:text-[58px] font-medium leading-[1.1] mb-5 tracking-[-0.02em] max-w-[840px]"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
      >
        <span
          style={{
            color: "var(--green-bright)",
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--green-deep) 55%, transparent) 35%, transparent 35%)",
            padding: "0 6px",
          }}
        >
          Projects
        </span>
        .
      </h1>
      <p
        className="text-[18px] leading-[1.7] mb-14 max-w-[680px]"
        style={{ color: "var(--text-secondary)" }}
      >
        Personal builds, research, and community work. Click any project to
        open the case file and watch the demo.
      </p>

      <WorkClient projects={projects} />
    </div>
  );
}
