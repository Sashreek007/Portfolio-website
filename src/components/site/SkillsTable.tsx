"use client";

import { useState } from "react";
import {
  SiPython, SiGo, SiCplusplus, SiTypescript, SiRust,
  SiPytorch, SiLangchain, SiHuggingface,
  SiDocker, SiRedis, SiPostgresql, SiFastapi, SiLinux,
  SiNeovim, SiReact, SiNextdotjs, SiSupabase,
  SiTailwindcss,
} from "react-icons/si";
import { IconType } from "react-icons";

// Brand colors for each tech (hex without #)
const TECH_META: Record<string, { icon: IconType; color: string }> = {
  Python:       { icon: SiPython,      color: "#3776AB" },
  Go:           { icon: SiGo,          color: "#00ADD8" },
  "C++":        { icon: SiCplusplus,   color: "#00599C" },
  TypeScript:   { icon: SiTypescript,  color: "#3178C6" },
  Rust:         { icon: SiRust,        color: "#CE422B" },
  PyTorch:      { icon: SiPytorch,     color: "#EE4C2C" },
  LangChain:    { icon: SiLangchain,   color: "#1C3C3C" },
  "Hugging Face": { icon: SiHuggingface, color: "#FFD21E" },
  Docker:       { icon: SiDocker,      color: "#2496ED" },
  Redis:        { icon: SiRedis,       color: "#FF4438" },
  PostgreSQL:   { icon: SiPostgresql,  color: "#4169E1" },
  FastAPI:      { icon: SiFastapi,     color: "#009688" },
  Linux:        { icon: SiLinux,       color: "#FCC624" },
  Neovim:       { icon: SiNeovim,      color: "#57A143" },
  React:        { icon: SiReact,       color: "#61DAFB" },
  "Next.js":    { icon: SiNextdotjs,   color: "#E8E6DF" },
  Supabase:     { icon: SiSupabase,    color: "#3ECF8E" },
  TailwindCSS:  { icon: SiTailwindcss, color: "#06B6D4" },
};

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

function SkillChip({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  const meta = TECH_META[label];
  const Icon = meta?.icon;
  const brandColor = meta?.color ?? "var(--text-muted)";

  return (
    <span
      className="inline-flex items-center gap-[6px] px-3 py-[6px] font-mono text-[12px] cursor-default select-none transition-all duration-200"
      style={{
        borderRadius: "5px",
        border: `1px solid ${hovered ? `color-mix(in srgb, ${brandColor} 40%, transparent)` : "var(--gray-800)"}`,
        background: hovered
          ? `color-mix(in srgb, ${brandColor} 8%, var(--bg-elevated))`
          : "var(--bg-elevated)",
        color: hovered ? brandColor : "var(--text-secondary)",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {Icon && (
        <Icon
          size={13}
          style={{
            color: hovered ? brandColor : "var(--text-muted)",
            flexShrink: 0,
            transition: "color 200ms",
          }}
        />
      )}
      {label}
    </span>
  );
}

export default function SkillsTable() {
  return (
    <div className="flex flex-col gap-6">
      {skills.map(({ category, items }) => (
        <div key={category}>
          <p
            className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            {category}
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <SkillChip key={item} label={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
