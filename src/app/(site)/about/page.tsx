import SectionLabel from "@/components/site/SectionLabel";
import SkillsTable from "@/components/site/SkillsTable";
import Timeline from "@/components/site/Timeline";

export const metadata = {
  title: "About | Sashreek Addanki",
};

export default function AboutPage() {
  return (
    <div className="px-[6vw] py-16 max-w-[1100px] mx-auto w-full">
      {/* Intro */}
      <section className="mb-16 max-w-[680px]">
        <SectionLabel>About</SectionLabel>
        <h1
          className="text-[28px] font-medium leading-[1.35] mb-6"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Computing science student at UAlberta, building at the intersection of
          AI and systems.
        </h1>
        <div
          className="flex flex-col gap-4 text-[15px] leading-[1.75]"
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

      {/* Skills */}
      <section className="mb-16">
        <SectionLabel>Stack</SectionLabel>
        <SkillsTable />
      </section>

      {/* Experience */}
      <section>
        <SectionLabel>Experience</SectionLabel>
        <Timeline />
      </section>
    </div>
  );
}
