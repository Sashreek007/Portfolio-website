"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/components/site/ProjectCard";
import { useProjectModal } from "@/components/site/ProjectModalProvider";

const STATUS_LABEL: Record<Project["status"], string> = {
  shipped: "DEPLOYED",
  active: "LIVE",
  building: "IN DEVELOPMENT",
};

const STATUS_DOT: Record<Project["status"], string> = {
  shipped: "var(--green-bright)",
  active: "var(--amber-bright)",
  building: "var(--violet-soft)",
};

// Case-file modal — serif title on a navy field, metadata strip up top,
// tech pills, amber section labels. Matches the "project dossier"
// aesthetic the user wanted copied over.
export default function ProjectModal({ project }: { project: Project }) {
  const { close: onClose } = useProjectModal();
  const dialogRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus the sheet on mount so keyboard users land inside the
  // modal rather than at the top of the underlying page.
  useEffect(() => {
    sheetRef.current?.focus();
  }, []);

  // Click on the backdrop (but not the sheet itself) closes.
  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) onClose();
  };

  const idBadge = `ID: ${String(project.sort_order + 1).padStart(2, "0")}`;
  const status = STATUS_LABEL[project.status];
  const dotColor = STATUS_DOT[project.status];

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
        className="project-modal-sheet"
        // Stop the mousedown here from bubbling up to the backdrop,
        // which would otherwise close the modal when the user starts a
        // text selection inside it.
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Masthead strip */}
        <header className="project-modal-head">
          <div className="project-modal-meta">
            <span className="project-modal-status">
              <span
                className="project-modal-status-dot"
                style={{ background: dotColor }}
              />
              {status}
            </span>
            <span className="project-modal-divider" />
            <span className="project-modal-id">{idBadge}</span>
            {project.year && (
              <>
                <span className="project-modal-divider" />
                <span className="project-modal-id">{project.year}</span>
              </>
            )}
          </div>
          <button
            type="button"
            className="project-modal-close"
            onClick={onClose}
            aria-label="Close project"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </header>

        {/* Title + subtitle */}
        <div className="project-modal-hero">
          <h2 id="project-modal-title" className="project-modal-title">
            {project.name}
          </h2>
          <p className="project-modal-subtitle">
            {project.description.split(" — ")[0]}
            {project.description.includes(" — ") &&
              ` — ${project.description.split(" — ").slice(1).join(" — ")}`}
          </p>

          {project.stack.length > 0 && (
            <div className="project-modal-stack">
              {project.stack.map((tech) => (
                <span key={tech} className="project-modal-pill">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="project-modal-rule" />

        {/* Overview section */}
        <section className="project-modal-section">
          <h3 className="project-modal-section-label">
            <StackIcon /> OVERVIEW
          </h3>
          <p className="project-modal-prose">{project.description}</p>
        </section>

        {/* Links section — rendered only if we have any */}
        {(project.github_url || project.demo_url) && (
          <section className="project-modal-section">
            <h3 className="project-modal-section-label">
              <LinkIcon /> LINKS
            </h3>
            <div className="project-modal-links">
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="project-modal-link"
                >
                  <span>live demo</span>
                  <span className="project-modal-link-arrow">↗</span>
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="project-modal-link"
                >
                  <span>source · github</span>
                  <span className="project-modal-link-arrow">↗</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Full-page escape hatch */}
        <footer className="project-modal-footer">
          <a
            href={`/projects/${project.id}`}
            className="project-modal-footer-link"
            onClick={(e) => {
              // Allow cmd/ctrl-click to open full page in a new tab;
              // a plain click stays in the modal (close it so the
              // underlying page is visible again).
              if (e.metaKey || e.ctrlKey) return;
              e.preventDefault();
              onClose();
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

function StackIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M8 2 L14 5 L8 8 L2 5 Z" />
      <path d="M2 8 L8 11 L14 8" />
      <path d="M2 11 L8 14 L14 11" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 9.5a3 3 0 0 0 4.24 0l2.12-2.12a3 3 0 0 0-4.24-4.24l-1 1" />
      <path d="M9.5 6.5a3 3 0 0 0-4.24 0L3.14 8.62a3 3 0 0 0 4.24 4.24l1-1" />
    </svg>
  );
}
