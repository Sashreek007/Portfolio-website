"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/components/site/ProjectCard";
import { useProjectModal } from "@/components/site/ProjectModalProvider";

// Overlay variant of the /projects/[id] detail view — same vocabulary
// (## section markers, mono labels, violet accent, the existing glass
// system) just hosted inside a dismissible sheet instead of a route.
export default function ProjectModal({ project: p }: { project: Project }) {
  const { close } = useProjectModal();
  const dialogRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sheetRef.current?.focus();
  }, []);

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) close();
  };

  const idx = String(p.sort_order + 1).padStart(2, "0");
  const statusLabel =
    p.status === "shipped"
      ? "shipped"
      : p.status === "active"
        ? "live"
        : "building";
  const statusColor =
    p.status === "shipped"
      ? "var(--green-bright)"
      : p.status === "active"
        ? "var(--amber-bright)"
        : "var(--violet-soft)";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onMouseDown={onBackdropClick}
      className="project-modal-backdrop"
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="project-modal-sheet glass-strong"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Kicker strip */}
        <header className="project-modal-head">
          <div className="project-modal-kicker">
            <span>PROJECT · {idx}</span>
            <span className="project-modal-kicker-rule" />
            <span className="project-modal-status">
              <span
                className="project-modal-status-dot"
                style={{ background: statusColor }}
              />
              {statusLabel}
            </span>
            {p.year && (
              <>
                <span className="project-modal-kicker-rule" />
                <span>{p.year}</span>
              </>
            )}
          </div>
          <button
            type="button"
            className="project-modal-close"
            onClick={close}
            aria-label="Close project"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </header>

        {/* Title */}
        <h2 id="project-modal-title" className="project-modal-title">
          {p.name}
        </h2>
        <div className="project-modal-underline" />

        {/* Overview */}
        <section className="project-modal-section">
          <h3 className="project-modal-section-h">
            <span style={{ color: "var(--violet-soft)" }}>##</span>
            <span style={{ color: "var(--text-primary)" }}>overview</span>
          </h3>
          <p className="project-modal-prose">{p.description}</p>
        </section>

        {/* Stack */}
        {p.stack.length > 0 && (
          <section className="project-modal-section">
            <h3 className="project-modal-section-h">
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>stack</span>
            </h3>
            <div className="project-modal-stack">
              {p.stack.map((tech) => (
                <span key={tech} className="project-modal-stack-item">
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Links */}
        {(p.github_url || p.demo_url) && (
          <section className="project-modal-section">
            <h3 className="project-modal-section-h">
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>links</span>
            </h3>
            <div className="project-modal-links">
              {p.demo_url && (
                <a
                  href={p.demo_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="project-modal-link"
                >
                  <span className="project-modal-link-label">live demo</span>
                  <span className="project-modal-link-value">open ↗</span>
                </a>
              )}
              {p.github_url && (
                <a
                  href={p.github_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="project-modal-link"
                >
                  <span className="project-modal-link-label">source</span>
                  <span className="project-modal-link-value">github ↗</span>
                </a>
              )}
            </div>
          </section>
        )}

        <footer className="project-modal-footer">
          <a
            href={`/projects/${p.id}`}
            className="project-modal-footer-link"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) return;
              e.preventDefault();
              close();
            }}
            target="_blank"
            rel="noreferrer noopener"
          >
            open as full page ↗
          </a>
          <span className="project-modal-footer-hint">esc to close</span>
        </footer>
      </div>
    </div>
  );
}
