import Link from "next/link";
import SkillsTable from "@/components/site/SkillsTable";
import Timeline from "@/components/site/Timeline";

export const metadata = {
  title: "About | Sashreek Addanki",
};

export default function AboutPage() {
  return (
    <div className="w-full" style={{ background: "var(--bg-base)" }}>
      <div className="px-[6vw] py-20 max-w-[1100px] mx-auto w-full">
        {/* Kicker */}
        <div className="flex items-center gap-4 mb-14">
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            ABOUT · FULL BIO
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            readme.md
          </span>
        </div>

        {/* Intro */}
        <section className="mb-20 max-w-[760px]">
          <h1
            className="text-[36px] lg:text-[44px] font-medium leading-[1.15] mb-10 tracking-[-0.015em]"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            Computing science @ UAlberta, building at the intersection of{" "}
            <span style={{ color: "var(--violet-pale)" }}>AI</span>{" "}
            and{" "}
            <span style={{ color: "var(--amber-bright)" }}>systems</span>.
          </h1>
          <div
            className="flex flex-col gap-5 text-[15px] leading-[1.85]"
            style={{ color: "var(--text-secondary)" }}
          >
            <p>
              My work spans backend systems, low-level programming, and AI-driven
              features that move beyond research demos into usable software. I&apos;m
              especially interested in the engineering required to bridge AI research
              ideas with real systems.
            </p>
            <p>
              I learn bottom-up — the mechanism before the abstraction. Kurose &amp;
              Ross before FastAPI. Induction proofs before statistical packages. RISC-V
              before operating systems. Using something I don&apos;t understand makes me
              uncomfortable.
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              Currently in my second year, co-op stream, graduating 2028. Each project
              is a deliberate rung — not a random one.
            </p>
          </div>
        </section>

        {/* Stack */}
        <section className="mb-20">
          <h2 className="font-mono text-[14px] mb-6 flex items-baseline gap-2">
            <span style={{ color: "var(--violet-soft)" }}>##</span>
            <span style={{ color: "var(--text-primary)" }}>stack</span>
          </h2>
          <SkillsTable />
        </section>

        {/* Experience */}
        <section className="mb-16">
          <h2 className="font-mono text-[14px] mb-6 flex items-baseline gap-2">
            <span style={{ color: "var(--violet-soft)" }}>##</span>
            <span style={{ color: "var(--text-primary)" }}>experience</span>
          </h2>
          <Timeline />
        </section>

        {/* Back to home */}
        <div className="pt-10" style={{ borderTop: "1px solid var(--gray-800)" }}>
          <Link
            href="/#about"
            className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            ← back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
