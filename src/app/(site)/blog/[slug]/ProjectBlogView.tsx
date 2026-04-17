import Link from "next/link";
import type { Project } from "@/components/site/ProjectCard";

const statusTone = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
} as const;

function DemoFrame({ project: p }: { project: Project }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 9",
        background:
          "radial-gradient(1400px circle at 20% 0%, color-mix(in srgb, var(--violet-dim) 14%, transparent), transparent 55%), var(--bg-surface)",
        border: "1px solid var(--gray-800)",
        borderRadius: "8px",
      }}
    >
      {p.video_url ? (
        <video
          src={p.video_url}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : p.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image_url}
          alt={p.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          {[
            { top: 14, left: 14 },
            { top: 14, right: 14 },
            { bottom: 14, left: 14 },
            { bottom: 14, right: 14 },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute w-4 h-4"
              style={{
                ...pos,
                borderTop:
                  pos.top !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderBottom:
                  pos.bottom !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderLeft:
                  pos.left !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderRight:
                  pos.right !== undefined ? "1px solid var(--gray-600)" : undefined,
              }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="font-mono text-[11px] tracking-[0.22em] uppercase px-4 py-[7px]"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--gray-800)",
                borderRadius: "999px",
                background: "color-mix(in srgb, var(--bg-base) 70%, transparent)",
              }}
            >
              demo reel · coming soon
            </div>
            <div
              className="font-mono text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              ▶ video walkthrough pending
            </div>
          </div>
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--gray-800) 1px, transparent 1px), linear-gradient(90deg, var(--gray-800) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              mixBlendMode: "screen",
            }}
          />
        </>
      )}
    </div>
  );
}

type Props = {
  project: Project;
  index: number;
  total: number;
  prevSlug: string | null;
  prevName: string | null;
  nextSlug: string | null;
  nextName: string | null;
};

export default function ProjectBlogView({
  project: p,
  index,
  prevSlug,
  prevName,
  nextSlug,
  nextName,
}: Props) {
  return (
    <div
      className="min-h-screen w-full px-[6vw] py-16"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-[960px] mx-auto">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 font-mono text-[12px] mb-10 transition-colors duration-150 hover:text-[var(--text-primary)]"
          style={{ color: "var(--text-muted)" }}
        >
          ← all projects
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            PROJECT · {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            case file
          </span>
        </div>

        <div className="flex items-center gap-3 mb-5 font-mono text-[11px] tracking-[0.08em] uppercase">
          <span
            className="w-[7px] h-[7px] rounded-full"
            style={{
              background: statusTone[p.status],
              boxShadow:
                p.status === "active"
                  ? `0 0 8px ${statusTone[p.status]}`
                  : "none",
            }}
          />
          <span style={{ color: statusTone[p.status] }}>{p.status}</span>
          <span style={{ color: "var(--gray-800)" }}>/</span>
          {p.year && (
            <span style={{ color: "var(--green-bright)" }}>{p.year}</span>
          )}
        </div>

        <h1
          className="font-medium leading-[1.08] tracking-[-0.02em] mb-6"
          style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {p.name}
        </h1>

        <div className="h-px w-12 mb-10" style={{ background: "var(--violet-mid)" }} />

        <div className="mb-12">
          <DemoFrame project={p} />
        </div>

        <section className="mb-16">
          <h2 className="font-mono text-[14px] mb-5 flex items-baseline gap-2">
            <span style={{ color: "var(--violet-soft)" }}>##</span>
            <span style={{ color: "var(--text-primary)" }}>overview</span>
          </h2>
          <p
            className="text-[16px] leading-[1.8] max-w-[720px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {p.description}
          </p>
        </section>

        {p.stack.length > 0 && (
          <section className="mb-16">
            <h2 className="font-mono text-[14px] mb-5 flex items-baseline gap-2">
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>stack</span>
            </h2>
            <div className="flex flex-wrap gap-x-5 gap-y-2 max-w-[720px]">
              {p.stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[12px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {(p.github_url || p.demo_url) && (
          <section className="mb-16">
            <h2 className="font-mono text-[14px] mb-5 flex items-baseline gap-2">
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>links</span>
            </h2>
            <div
              className="flex flex-col max-w-[560px]"
              style={{ border: "1px solid var(--gray-800)", borderRadius: "6px" }}
            >
              {p.demo_url && (
                <a
                  href={p.demo_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center justify-between px-5 py-4 transition-colors duration-150"
                  style={{
                    borderBottom: p.github_url ? "1px solid var(--gray-800)" : "none",
                  }}
                >
                  <span
                    className="font-mono text-[11px] tracking-[0.1em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    live demo
                  </span>
                  <span
                    className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                  >
                    open ↗
                  </span>
                </a>
              )}
              {p.github_url && (
                <a
                  href={p.github_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center justify-between px-5 py-4 transition-colors duration-150"
                >
                  <span
                    className="font-mono text-[11px] tracking-[0.1em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    source
                  </span>
                  <span
                    className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                  >
                    github ↗
                  </span>
                </a>
              )}
            </div>
          </section>
        )}

        <nav
          className="flex items-center justify-between pt-8 mt-8 gap-4"
          style={{ borderTop: "1px solid var(--gray-800)" }}
        >
          <div className="flex-1">
            {prevSlug && (
              <Link
                href={`/blog/${prevSlug}`}
                className="group flex flex-col gap-1"
              >
                <span
                  className="font-mono text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  ← previous
                </span>
                <span
                  className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                >
                  {prevName}
                </span>
              </Link>
            )}
          </div>
          <div className="flex-1 text-right">
            {nextSlug && (
              <Link
                href={`/blog/${nextSlug}`}
                className="group flex flex-col gap-1 items-end"
              >
                <span
                  className="font-mono text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  next →
                </span>
                <span
                  className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                >
                  {nextName}
                </span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
