import { getBestProjects } from "@/lib/projects.server";
import Hero from "@/components/site/Hero";
import SectionKicker from "@/components/site/SectionKicker";
import CopyHandle from "@/components/site/CopyHandle";
import { type Project } from "@/components/site/ProjectCard";
import CaseStudy from "@/components/site/CaseStudy";
import BlackHole from "@/components/site/BlackHole";
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
