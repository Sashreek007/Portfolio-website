"use client";

import { useState } from "react";

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

function SkillItem({ label }: { label: string }) {
  const [flashing, setFlashing] = useState(false);

  const handleMouseEnter = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 400);
  };

  return (
    <span
      className="text-[14px] transition-colors duration-300 cursor-default select-none"
      style={{
        color: flashing ? "var(--amber-bright)" : "var(--text-primary)",
        fontFamily: "var(--font-body)",
      }}
      onMouseEnter={handleMouseEnter}
    >
      {label}
    </span>
  );
}

export default function SkillsTable() {
  return (
    <div className="grid gap-4">
      {skills.map(({ category, items }) => (
        <div key={category} className="grid grid-cols-[120px_1fr] gap-4 items-start">
          <span
            className="font-mono text-[11px] font-medium tracking-[0.10em] uppercase pt-[3px]"
            style={{ color: "var(--text-muted)" }}
          >
            {category}
          </span>
          <div className="flex flex-wrap gap-x-1 gap-y-1 items-center">
            {items.map((item, i) => (
              <span key={item} className="flex items-center gap-1">
                <SkillItem label={item} />
                {i < items.length - 1 && (
                  <span
                    className="font-mono text-[13px]"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
