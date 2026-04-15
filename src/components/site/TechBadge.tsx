"use client";

import {
  SiPython, SiGo, SiCplusplus, SiTypescript, SiRust,
  SiPytorch, SiLangchain, SiHuggingface,
  SiDocker, SiRedis, SiPostgresql, SiFastapi, SiLinux,
  SiNeovim, SiReact, SiNextdotjs, SiSupabase, SiTailwindcss,
  SiOpenai, SiGithub, SiGooglechrome,
} from "react-icons/si";
import { IconType } from "react-icons";

const TECH_META: Record<string, { icon: IconType; color: string }> = {
  Python:         { icon: SiPython,       color: "#3776AB" },
  Go:             { icon: SiGo,           color: "#00ADD8" },
  "C++":          { icon: SiCplusplus,    color: "#00599C" },
  TypeScript:     { icon: SiTypescript,   color: "#3178C6" },
  Rust:           { icon: SiRust,         color: "#CE422B" },
  PyTorch:        { icon: SiPytorch,      color: "#EE4C2C" },
  LangChain:      { icon: SiLangchain,    color: "#1C3C3C" },
  "Hugging Face": { icon: SiHuggingface,  color: "#FFD21E" },
  Docker:         { icon: SiDocker,       color: "#2496ED" },
  Redis:          { icon: SiRedis,        color: "#FF4438" },
  PostgreSQL:     { icon: SiPostgresql,   color: "#4169E1" },
  FastAPI:        { icon: SiFastapi,      color: "#009688" },
  Linux:          { icon: SiLinux,        color: "#FCC624" },
  Neovim:         { icon: SiNeovim,       color: "#57A143" },
  React:          { icon: SiReact,        color: "#61DAFB" },
  "Next.js":      { icon: SiNextdotjs,    color: "#E8E6DF" },
  Supabase:       { icon: SiSupabase,     color: "#3ECF8E" },
  TailwindCSS:    { icon: SiTailwindcss,  color: "#06B6D4" },
  "Gemini API":   { icon: SiOpenai,       color: "#8E75B2" },
  "Chrome Extension": { icon: SiGooglechrome, color: "#4285F4" },
  GitHub:         { icon: SiGithub,       color: "#888780" },
};

export function TechBadge({ label }: { label: string }) {
  const meta = TECH_META[label];
  const Icon = meta?.icon;
  const brandColor = meta?.color;

  return (
    <span
      className="inline-flex items-center gap-[5px] font-mono text-[10px] font-medium tracking-[0.06em] uppercase px-2 py-1"
      style={{
        color: "var(--text-muted)",
        border: "1px solid var(--gray-800)",
        borderRadius: "3px",
        background: "var(--bg-elevated)",
      }}
    >
      {Icon && brandColor && (
        <Icon size={11} style={{ color: brandColor, flexShrink: 0 }} />
      )}
      {label}
    </span>
  );
}
