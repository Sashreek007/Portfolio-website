const skills = [
  {
    category: "Languages",
    items: ["Python", "Go", "C++", "TypeScript", "Rust", "C"],
  },
  {
    category: "ML / AI",
    items: ["PyTorch", "LangChain", "LangGraph", "MCP", "Hugging Face", "Ollama"],
  },
  {
    category: "Infra",
    items: ["Docker", "Redis", "PostgreSQL", "Supabase", "FastAPI", "Linux"],
  },
  {
    category: "Systems",
    items: ["RISC-V", "Neovim", "Go stdlib", "OpenCV", "MediaPipe"],
  },
];

export default function SkillsTable() {
  return (
    <div
      className="overflow-hidden rounded-[8px]"
      style={{ border: "1px solid var(--gray-800)" }}
    >
      {skills.map(({ category, items }, i) => (
        <div
          key={category}
          className="grid gap-4 px-5 py-4 md:grid-cols-[112px_minmax(0,1fr)] md:gap-6"
          style={{
            borderBottom:
              i < skills.length - 1 ? "1px solid var(--gray-800)" : "none",
          }}
        >
          <p
            className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {category}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 font-mono text-[12px]"
                style={{ color: "var(--text-primary)" }}
              >
                <span
                  className="h-[4px] w-[4px] rounded-full"
                  style={{ background: "var(--violet-mid)" }}
                />
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
