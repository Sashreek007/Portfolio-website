import { getBestProjects } from "@/lib/projects.server";
import Hero from "@/components/site/Hero";
import SectionKicker from "@/components/site/SectionKicker";
import CopyHandle from "@/components/site/CopyHandle";
import { type Project } from "@/components/site/ProjectCard";
import CaseStudy from "@/components/site/CaseStudy";
import ExperienceSection from "@/components/site/ExperienceSection";
import BlackHole from "@/components/site/BlackHole";
import AsteroidRider from "@/components/site/AsteroidRider";
import TickerBand from "@/components/site/TickerBand";
import RevealSections from "@/components/site/RevealSections";
import Link from "next/link";

const divider = <div className="gradient-divider" />;

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  // Falls back to the shared seed list when Supabase is unreachable.
  const bestProjects: Project[] = await getBestProjects(4);

  // Ticker + header meta derived from the data on the page.
  const tickerItems = Array.from(new Set(bestProjects.flatMap((p) => p.stack)));
  const years = bestProjects
    .map((p) => p.year)
    .filter((y): y is number => y !== null);
  const yearRange =
    years.length > 0
      ? Math.min(...years) === Math.max(...years)
        ? `${Math.min(...years)}`
        : `${Math.min(...years)}–${Math.max(...years)}`
      : null;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── Stack ticker — living band between hero and the case files ──── */}
      <TickerBand items={tickerItems} />

      {/* ── Experience — roles as branch diagrams, ahead of the work ─────── */}
      {/* Deliberately upstream of the black hole at #contact: the two space
          objects are never on screen together, so there is only ever one of
          them costing anything. overflow-hidden clips the asteroid's bleed
          instead of letting it widen the page. */}
      <section
        id="experience"
        className="section-hidden relative overflow-hidden px-[6vw] pt-24 pb-20"
      >
        {/* Anchored to the CONTENT column, not the viewport.
            A right offset in viewport percent keeps walking further out as the
            screen grows — on a 32" display the asteroid had left the page
            entirely. This rail matches ExperienceSection's max-w-[1000px], so
            the asteroid stays beside the roles at any width and the gutter
            just gets emptier around it.
            Unlike the black hole this needs no blend mode: the sprite carries
            real alpha. */}
        {/* px-[6vw] matches the section's own padding. Without it `inset-0`
            spans the padding box — the full section width — so the rail was
            wider than the text column and the asteroid hung off THAT instead.
            Invisible at large widths, where max-w-[1000px] caps the rail
            anyway; at 960px the rail was 960 against a 844px column and the
            rock sat ~58px too far right, which is what clipped it. */}
        <div className="pointer-events-none absolute inset-0 z-0 flex justify-center px-[6vw]">
          <div className="relative h-full w-full max-w-[1000px]">
            {/* Size and overhang are both continuous rather than stepped.
                The overhang is derived from the gutter itself —
                (100vw - column) / 2, where column is min(1000px, 88vw) because
                the section pads 6vw a side — so the rock hangs exactly as far
                as there is room and cannot clip at any width. Capped at 380px
                so it stops drifting outward forever on very wide screens.

                Stepped breakpoints were the first attempt and failed twice.
                Obviously, by clipping when a translate sized for a 780px
                gutter at 2560 ran off-screen at 1280 where the gutter is 140.
                And silently: at 1920 both `2xl:` and `min-[1800px]:` match,
                the named variant wins on rule order, and the large tier simply
                never applied. Deriving from the viewport sidesteps variant
                ordering entirely.

                Hidden under md — there is no gutter there at all, and it would
                only crowd the roles. */}
            <AsteroidRider className="hidden md:block absolute top-1/2 right-0 -translate-y-1/2 w-[clamp(190px,26vw,500px)] translate-x-[min(380px,calc((100vw_-_min(1000px,88vw))_/_2))] opacity-40 lg:opacity-55 xl:opacity-75 2xl:opacity-90" />
          </div>
        </div>

        <div className="relative z-10">
          <SectionKicker label="EXPERIENCE" meta="roles.md" />
          <ExperienceSection />
        </div>
      </section>

      {divider}

      {/* ── Selected Work — editorial case-study chapters ─────────────────── */}
      <section id="work" className="section-hidden px-[6vw] pt-24 pb-28">
        <SectionKicker label="WORK" meta="selected.md" />
        <div className="max-w-[1320px] mx-auto">
          {/* Poster header */}
          <div className="reveal-child flex items-end justify-between flex-wrap gap-6 mb-6">
            <div>
              <h2
                className="font-medium"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(44px, 6.5vw, 92px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.024em",
                }}
              >
                Selected{" "}
                <span style={{ color: "var(--violet-pale)" }}>projects</span>
              </h2>
              <p
                className="mt-6 text-[16px] lg:text-[17px] leading-[1.7] max-w-[560px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Four picks I&apos;d bring up in an interview — shipping, research,
                and things I built end-to-end.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 font-mono text-[12px] tracking-[0.16em] uppercase pb-2">
              <span style={{ color: "var(--amber-bright)" }}>
                {String(bestProjects.length).padStart(2, "0")} case files
              </span>
              {yearRange && (
                <span style={{ color: "var(--text-muted)" }}>{yearRange}</span>
              )}
              <Link
                href="/work"
                className="transition-colors duration-150 hover:text-[var(--violet-pale)] normal-case tracking-normal text-[13px]"
                style={{ color: "var(--violet-soft)" }}
              >
                view all <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Chapter strips */}
          <div style={{ borderBottom: "1px solid var(--gray-800)" }}>
            {bestProjects.map((project, i) => (
              <div
                key={project.id}
                className="reveal-child"
                style={{ "--ri": Math.min(i + 1, 3) } as React.CSSProperties}
              >
                <CaseStudy project={project} index={i} />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-16">
            <Link
              href="/work"
              className="pill-primary font-mono text-[14px] px-[24px] py-[12px]"
            >
              view all projects <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {divider}

      {/* ── Contact (/4 dossier layout, centered) ────────────────────────── */}
      {/* The black hole gets its own band between the kicker and the heading
          rather than sitting under the text — the disc is bright enough that
          anything on top of it stops being readable. It relies on
          .section-visible resolving `transform: none`, otherwise the section's
          stacking context traps mix-blend-mode and the video's black shows as
          a rectangle. */}
      {/* overflow-hidden clips the disc's bleed instead of letting it push the
          page wider — it does not create a stacking context, so the blend
          still escapes. */}
      <section id="contact" className="section-hidden relative overflow-hidden px-[6vw] pt-10 pb-12">
        {/* kicker carries a shared mb-14; half of it back, locally */}
        <div className="-mb-7">
          <SectionKicker label="CONTACT" meta="reach.md" />
        </div>

        {/* Right-anchored and bleeding off the edge: the channel rows keep the
            left column to themselves, so the disc never has to be dimmed into
            a smudge to stay out of their way. Opacity drops on small screens,
            where the single column runs under it. */}
        <BlackHole className="bh-veil pointer-events-none absolute z-0 top-1/2 -translate-y-1/2 -right-[42%] sm:-right-[28%] lg:-right-[16%] w-[520px] sm:w-[760px] lg:w-[1020px] h-[293px] sm:h-[428px] lg:h-[574px]" />

        <div className="relative z-10 max-w-[960px] mx-auto flex flex-col">
          <h2
            className="reveal-child text-[28px] lg:text-[36px] leading-[1.1] font-medium tracking-[-0.02em] mb-6"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            How to reach me, in{" "}
            <span style={{ color: "var(--violet-pale)" }}>one page</span>.
          </h2>

          <div className="w-full flex flex-col items-stretch">
            <h3
              className="reveal-child font-mono text-[14px] flex items-baseline gap-2 mb-4"
              style={{ "--ri": 1 } as React.CSSProperties}
            >
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>channels</span>
            </h3>

            <div
              className="reveal-child flex flex-col"
              style={{ borderTop: "1px solid var(--gray-800)", "--ri": 2 } as React.CSSProperties}
            >
              {[
                {
                  n: "01",
                  label: "email",
                  value: "sashreek.addanki@gmail.com",
                  blurb:
                    "Fastest route — long or short, I read everything. Mark [urgent] in the subject if it actually is.",
                  href: "mailto:sashreek.addanki@gmail.com",
                },
                {
                  n: "02",
                  label: "github",
                  value: "Sashreek007",
                  blurb:
                    "Projects, half-finished experiments, and the occasional issue reply. Pull requests welcome.",
                  href: "https://github.com/Sashreek007",
                  ext: true,
                },
                {
                  n: "03",
                  label: "linkedin",
                  value: "sashreek-addanki",
                  blurb:
                    "Recruiter-facing. The place for formal intros, referrals, and co-op conversations.",
                  href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
                  ext: true,
                },
              ].map(({ n, label, value, blurb, href, ext }) => (
                <a
                  key={label}
                  href={href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noreferrer noopener" : undefined}
                  className="contact-row group grid gap-5 py-[13px] text-left"
                  style={{
                    gridTemplateColumns: "60px 1fr 50px",
                    borderBottom: "1px solid var(--gray-800)",
                  }}
                >
                  <span
                    className="font-mono text-[13px] tracking-[0.2em] uppercase pt-[8px] font-medium"
                    style={{ color: "var(--amber-bright)" }}
                  >
                    {n}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <span
                        className="font-mono text-[12px] tracking-[0.22em] uppercase font-medium"
                        style={{ color: "var(--violet-soft)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-[18px] lg:text-[21px] leading-[1.2] tracking-[-0.012em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                    <p
                      className="text-[13.5px] leading-[1.5] max-w-[780px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {blurb}
                    </p>
                  </div>
                  <span
                    className="font-mono text-[22px] pt-[8px] transition-transform duration-200 group-hover:translate-x-[4px]"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    {ext ? "↗" : "→"}
                  </span>
                </a>
              ))}

              {/* 04 · discord — copy-on-click, matches the editorial row pattern */}
              <CopyHandle
                value="sashreek"
                copiedLabel="copied to clipboard"
                className="contact-row group grid gap-5 py-[13px] w-full text-left"
                style={{
                  gridTemplateColumns: "60px 1fr 50px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--gray-800)",
                }}
              >
                <span
                  className="font-mono text-[13px] tracking-[0.2em] uppercase pt-[8px] font-medium"
                  style={{ color: "var(--amber-bright)" }}
                >
                  04
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <span
                      className="font-mono text-[12px] tracking-[0.22em] uppercase font-medium"
                      style={{ color: "var(--violet-soft)" }}
                    >
                      discord
                    </span>
                    <span
                      className="text-[18px] lg:text-[21px] leading-[1.2] tracking-[-0.012em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      sashreek
                    </span>
                  </div>
                  <p
                    className="text-[13.5px] leading-[1.5] max-w-[780px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Quick DMs. Click the handle to copy — Discord has no
                    canonical profile URL to link out to.
                  </p>
                </div>
                <span
                  className="font-mono text-[22px] pt-[8px]"
                  style={{ color: "var(--violet-soft)" }}
                >
                  ⧉
                </span>
              </CopyHandle>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section reveal observer (client component — re-runs on every mount) ── */}
      <RevealSections />
    </>
  );
}
