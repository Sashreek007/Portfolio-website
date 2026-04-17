import Link from "next/link";
import AboutVariantSwitcher from "@/components/site/AboutVariantSwitcher";

// Variant 1 — Terminal Log
// About as an interactive shell session: whoami, cat, tree, git log, exit.

export const metadata = { title: "About v1 — Terminal" };

function Prompt() {
  return (
    <>
      <span style={{ color: "var(--green-bright)" }}>➜</span>{" "}
      <span style={{ color: "var(--violet-soft)" }}>~/portfolio</span>{" "}
    </>
  );
}

export default function AboutVariant1() {
  return (
    <div
      className="min-h-screen w-full py-24 px-[6vw] flex items-start justify-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="w-full max-w-[920px] rounded-lg overflow-hidden"
        style={{
          border: "1px solid var(--gray-800)",
          background: "var(--bg-surface)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-[7px] px-4 py-[10px]"
          style={{
            background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--gray-800)",
          }}
        >
          <span className="w-[11px] h-[11px] rounded-full" style={{ background: "#FF5F57" }} />
          <span className="w-[11px] h-[11px] rounded-full" style={{ background: "#FEBC2E" }} />
          <span className="w-[11px] h-[11px] rounded-full" style={{ background: "#28C840" }} />
          <span className="ml-3 font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>
            sashreek@portfolio — zsh — 100 × 32
          </span>
        </div>

        {/* Body */}
        <div
          className="px-7 py-6 font-mono text-[13px] leading-[1.85]"
          style={{ color: "var(--text-primary)" }}
        >
          <section className="mb-6">
            <p><Prompt /><span>whoami</span></p>
            <p className="pl-[14px]" style={{ color: "var(--text-secondary)" }}>
              sashreek addanki · computing science @ ualberta · ai + systems
            </p>
          </section>

          <section className="mb-6">
            <p><Prompt /><span>cat bio.txt</span></p>
            <div className="pl-[14px] flex flex-col gap-2" style={{ color: "var(--text-secondary)" }}>
              <p>
                My work spans backend systems, low-level programming, and AI-driven
                features that move beyond research demos into usable software.
              </p>
              <p>
                I learn bottom-up — the mechanism before the abstraction.
                Kurose &amp; Ross before FastAPI. RISC-V before operating systems.
                Using something I don&apos;t understand makes me uncomfortable.
              </p>
              <p style={{ color: "var(--text-muted)" }}>
                # second year, co-op stream, graduating 2028.
              </p>
            </div>
          </section>

          <section className="mb-6">
            <p><Prompt /><span>tree stack/</span></p>
            <div className="pl-[14px] flex flex-col gap-[10px]">
              {[
                { label: "languages/", items: ["python", "go", "c++", "typescript", "rust", "c"] },
                { label: "ml-ai/",     items: ["pytorch", "langchain", "langgraph", "mcp", "huggingface", "ollama"] },
                { label: "infra/",     items: ["docker", "redis", "postgres", "supabase", "fastapi", "linux"] },
                { label: "systems/",   items: ["risc-v", "neovim", "go-stdlib", "opencv", "mediapipe"] },
              ].map(({ label, items }) => (
                <div key={label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="min-w-[110px]" style={{ color: "var(--amber-bright)" }}>
                    ├── {label}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {items.join("   ")}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <p><Prompt /><span>git log --oneline experience/</span></p>
            <div className="pl-[14px] flex flex-col gap-1" style={{ color: "var(--text-secondary)" }}>
              <p>
                <span style={{ color: "var(--amber-bright)" }}>a8f2c1d</span>{" "}
                <span style={{ color: "var(--green-bright)" }}>(HEAD → current)</span>{" "}
                project lead · undergrad ai society · clubmate ai + spam-detection bot
              </p>
              <p>
                <span style={{ color: "var(--amber-bright)" }}>b6e9d02</span>{" "}
                teaching assistant · cmput 274 · 200+ students in linux &amp; python
              </p>
              <p>
                <span style={{ color: "var(--amber-bright)" }}>c3a7140</span>{" "}
                nathacks ecotech · fluxatlas auction engine (fastapi + c++)
              </p>
            </div>
          </section>

          <section>
            <p>
              <Prompt />
              <Link
                href="/about"
                className="underline underline-offset-2 transition-colors"
                style={{ color: "var(--violet-pale)" }}
              >
                open full bio →
              </Link>
              <span
                className="ml-[6px] inline-block w-[9px] h-[15px] align-middle"
                style={{
                  background: "var(--violet-pale)",
                  animation: "blink-cursor 1s steps(1) infinite",
                }}
              />
            </p>
          </section>
        </div>
      </div>

      <AboutVariantSwitcher current={1} />
    </div>
  );
}
