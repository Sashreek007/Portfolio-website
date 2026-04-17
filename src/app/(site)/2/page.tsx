import Link from "next/link";
import AboutVariantSwitcher from "@/components/site/AboutVariantSwitcher";

// Variant 2 — IDE Buffer
// Neovim-style left file tree + editor buffer with line numbers.
// Three "files" stacked: about.md, stack.yaml, experience.log.

export const metadata = { title: "About v2 — IDE" };

type TreeNode = { name: string; kind: "dir" | "file"; active?: boolean; children?: TreeNode[] };

const tree: TreeNode[] = [
  {
    name: "about/",
    kind: "dir",
    children: [
      { name: "bio.md",         kind: "file", active: true },
      { name: "stack.yaml",     kind: "file", active: true },
      { name: "experience.log", kind: "file", active: true },
      { name: "photo.webp",     kind: "file" },
    ],
  },
  { name: "README.md",   kind: "file" },
  { name: "resume.pdf",  kind: "file" },
];

function Tree({ nodes, indent = 0 }: { nodes: TreeNode[]; indent?: number }) {
  return (
    <div className="flex flex-col">
      {nodes.map((n) => (
        <div key={n.name}>
          <div
            className="flex items-center gap-[6px] py-[2px]"
            style={{
              paddingLeft: 8 + indent * 12,
              color: n.active
                ? "var(--violet-pale)"
                : n.kind === "dir"
                  ? "var(--text-secondary)"
                  : "var(--text-muted)",
              background: n.active ? "color-mix(in srgb, var(--violet-dim) 35%, transparent)" : "transparent",
            }}
          >
            <span style={{ color: n.kind === "dir" ? "var(--amber-bright)" : "var(--gray-600)" }}>
              {n.kind === "dir" ? "▾" : "●"}
            </span>
            <span>{n.name}</span>
          </div>
          {n.children && <Tree nodes={n.children} indent={indent + 1} />}
        </div>
      ))}
    </div>
  );
}

function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span
        className="text-right select-none w-[22px] shrink-0"
        style={{ color: "var(--gray-600)" }}
      >
        {n}
      </span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function FileHeader({ name, lang }: { name: string; lang: string }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-[6px] mt-6 first:mt-0"
      style={{
        background: "var(--bg-elevated)",
        borderTop: "1px solid var(--gray-800)",
        borderBottom: "1px solid var(--gray-800)",
      }}
    >
      <span className="font-mono text-[12px]" style={{ color: "var(--violet-pale)" }}>
        {name}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
        {lang}
      </span>
    </div>
  );
}

const K = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "var(--violet-soft)" }}>{children}</span>
);
const S = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "var(--green-bright)" }}>{children}</span>
);
const N = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "var(--amber-bright)" }}>{children}</span>
);
const C = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{children}</span>
);

export default function AboutVariant2() {
  return (
    <div
      className="min-h-screen w-full py-16 px-[4vw] flex items-start justify-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="w-full max-w-[1100px] rounded-lg overflow-hidden grid"
        style={{
          gridTemplateColumns: "220px 1fr",
          border: "1px solid var(--gray-800)",
          background: "var(--bg-surface)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          minHeight: "75vh",
        }}
      >
        {/* Left — file tree */}
        <aside
          className="py-4 font-mono text-[12px]"
          style={{
            background: "var(--bg-elevated)",
            borderRight: "1px solid var(--gray-800)",
          }}
        >
          <p
            className="px-3 pb-3 text-[10px] tracking-[0.14em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            NVIM · ~/about
          </p>
          <Tree nodes={tree} />
          <div
            className="mt-6 pt-3 px-3 flex flex-col gap-1"
            style={{ borderTop: "1px solid var(--gray-800)", color: "var(--text-muted)" }}
          >
            <span>— status —</span>
            <span>
              <span style={{ color: "var(--green-bright)" }}>●</span> available · ai + systems
            </span>
          </div>
        </aside>

        {/* Right — editor */}
        <main className="font-mono text-[13px]" style={{ color: "var(--text-primary)" }}>
          {/* Tabs */}
          <div
            className="flex items-center px-2 h-[34px]"
            style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--gray-800)" }}
          >
            {[
              { n: "bio.md", active: true },
              { n: "stack.yaml" },
              { n: "experience.log" },
            ].map((t) => (
              <div
                key={t.n}
                className="px-3 h-full flex items-center gap-2 text-[12px]"
                style={{
                  color: t.active ? "var(--violet-pale)" : "var(--text-muted)",
                  borderBottom: t.active ? "2px solid var(--violet-mid)" : "2px solid transparent",
                  background: t.active ? "var(--bg-surface)" : "transparent",
                }}
              >
                <span style={{ color: "var(--amber-bright)" }}>●</span>
                {t.n}
              </div>
            ))}
          </div>

          {/* bio.md */}
          <FileHeader name="~/about/bio.md" lang="markdown" />
          <div className="px-4 py-4 leading-[1.8]">
            <Line n={1}><span style={{ color: "var(--violet-pale)" }}># sashreek addanki</span></Line>
            <Line n={2}><C>&gt; computing science @ ualberta · ai + systems</C></Line>
            <Line n={3}>&nbsp;</Line>
            <Line n={4}>
              <span style={{ color: "var(--text-secondary)" }}>
                My work spans backend systems, low-level programming, and AI-driven
                features that move beyond research demos into usable software.
              </span>
            </Line>
            <Line n={5}>&nbsp;</Line>
            <Line n={6}>
              <span style={{ color: "var(--text-secondary)" }}>
                I learn bottom-up — the mechanism before the abstraction.
                Kurose &amp; Ross before FastAPI. RISC-V before operating systems.
              </span>
            </Line>
            <Line n={7}><C>// second year · co-op stream · graduating 2028</C></Line>
          </div>

          {/* stack.yaml */}
          <FileHeader name="~/about/stack.yaml" lang="yaml" />
          <div className="px-4 py-4 leading-[1.8]">
            {[
              { n: 1, k: "languages", v: "python, go, c++, typescript, rust, c" },
              { n: 2, k: "ml_ai",     v: "pytorch, langchain, langgraph, mcp, huggingface, ollama" },
              { n: 3, k: "infra",     v: "docker, redis, postgres, supabase, fastapi, linux" },
              { n: 4, k: "systems",   v: "risc-v, neovim, go-stdlib, opencv, mediapipe" },
            ].map(({ n, k, v }) => (
              <Line key={n} n={n}>
                <K>{k}</K>
                <span style={{ color: "var(--text-secondary)" }}>: </span>
                <S>[{v.split(", ").map((t, i, a) => (
                  <span key={t}>{`"${t}"`}{i < a.length - 1 ? ", " : ""}</span>
                ))}]</S>
              </Line>
            ))}
          </div>

          {/* experience.log */}
          <FileHeader name="~/about/experience.log" lang="log" />
          <div className="px-4 py-4 leading-[1.8] pb-8">
            {[
              {
                date: "2025-09",
                level: "CURRENT",
                color: "var(--green-bright)",
                msg: "project lead · undergrad ai society · clubmate ai + spam-detection bot",
              },
              {
                date: "2025-09",
                level: "INFO",
                color: "var(--violet-soft)",
                msg: "teaching assistant · cmput 274 · 200+ students in linux + python",
              },
              {
                date: "2025-01",
                level: "INFO",
                color: "var(--violet-soft)",
                msg: "nathacks ecotech · fluxatlas auction engine (fastapi + c++)",
              },
            ].map((e, i) => (
              <Line key={i} n={i + 1}>
                <N>[{e.date}]</N>{" "}
                <span style={{ color: e.color }}>{e.level}</span>{" "}
                <span style={{ color: "var(--text-secondary)" }}>{e.msg}</span>
              </Line>
            ))}
            <Line n={4}>&nbsp;</Line>
            <Line n={5}>
              <C>// </C>
              <Link
                href="/about"
                className="underline underline-offset-2"
                style={{ color: "var(--violet-pale)" }}
              >
                :open full bio
              </Link>
              <span
                className="ml-[6px] inline-block w-[8px] h-[13px] align-middle"
                style={{
                  background: "var(--violet-pale)",
                  animation: "blink-cursor 1s steps(1) infinite",
                }}
              />
            </Line>
          </div>

          {/* Status bar */}
          <div
            className="px-4 py-[6px] flex items-center justify-between text-[11px]"
            style={{
              background: "var(--violet-dim)",
              color: "var(--violet-pale)",
              borderTop: "1px solid var(--gray-800)",
            }}
          >
            <span>NORMAL · ~/about/bio.md</span>
            <span>markdown · utf-8 · unix · 7:1</span>
          </div>
        </main>
      </div>

      <AboutVariantSwitcher current={2} />
    </div>
  );
}
