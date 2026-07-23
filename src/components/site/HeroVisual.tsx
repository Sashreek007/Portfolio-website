"use client";

// HeroVisual — switchable hero illustration. Default stays the Mint
// system schematic; "fig. 02" swaps in the Lumon MDR terminal. Choice
// persists in localStorage. Crossfade via Motion.

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import SystemSchematic from "@/components/site/SystemSchematic";
import MdrTerminal from "@/components/site/MdrTerminal";

type Mode = "schematic" | "mdr";
const STORAGE_KEY = "hero-fig";

export default function HeroVisual({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("schematic");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "mdr") setMode("mdr");
  }, []);

  const pick = (m: Mode) => {
    setMode(m);
    try {
      window.localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // storage unavailable — session-only switch
    }
  };

  return (
    <div className={className}>
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {mode === "schematic" ? (
          <SystemSchematic className="w-full" />
        ) : (
          <MdrTerminal className="w-full" />
        )}
      </motion.div>

      <div className="hv-toggle" role="group" aria-label="hero illustration switcher">
        {(
          [
            ["schematic", "fig. 01 · schematic"],
            ["mdr", "fig. 02 · mdr"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => pick(m)}
            className={`hv-toggle-btn${mode === m ? " on" : ""}`}
            aria-pressed={mode === m}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
