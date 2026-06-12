import Link from "next/link";
import WorkClient from "./WorkClient";
import SectionKicker from "@/components/site/SectionKicker";
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
        <span aria-hidden>←</span> home
      </Link>

      {/* Header — editorial kicker to match home + about */}
      <SectionKicker
        label="WORK · PROJECTS"
        meta={`${String(projects.length).padStart(2, "0")} entries`}
      />

      <h1
        className="text-[42px] lg:text-[58px] font-medium leading-[1.1] mb-5 tracking-[-0.02em] max-w-[840px]"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
      >
        Projects<span style={{ color: "var(--violet-soft)" }}>.</span>
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
