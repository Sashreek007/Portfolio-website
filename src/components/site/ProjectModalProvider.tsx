"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/components/site/ProjectCard";
import ProjectModal from "@/components/site/ProjectModal";

// Thin pub/sub around "which project is open" so the card and the
// modal don't have to know about each other. The open state also
// round-trips through a ?project=<id> query param so the modal is
// linkable, survives back/forward, and degrades to the full page
// route when JS is off.
type Ctx = {
  openProject: (p: Project) => void;
  close: () => void;
  active: Project | null;
  register: (projects: Project[]) => void;
};

const ProjectModalCtx = createContext<Ctx | null>(null);

export function useProjectModal() {
  const ctx = useContext(ProjectModalCtx);
  if (!ctx) throw new Error("useProjectModal outside provider");
  return ctx;
}

export default function ProjectModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Project | null>(null);

  // Keep a cache of every project the page has rendered so we can
  // resolve the ?project=<id> query back into a full record without
  // another round-trip.
  const register = useCallback((list: Project[]) => {
    setProjects((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      for (const p of list) byId.set(p.id, p);
      return [...byId.values()];
    });
  }, []);

  const openProject = useCallback(
    (p: Project) => {
      setActive(p);
      // Push ?project=<id> onto the URL so the modal is shareable and
      // the back button closes it. `scroll: false` keeps the current
      // scroll position when Next updates the route.
      const next = new URLSearchParams(searchParams?.toString() ?? "");
      next.set("project", p.id);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const close = useCallback(() => {
    setActive(null);
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.delete("project");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  // URL -> modal state. Handles refresh and deep links that arrive
  // with ?project=<id> already in the URL.
  useEffect(() => {
    const id = searchParams?.get("project");
    if (!id) {
      if (active) setActive(null);
      return;
    }
    const p = projects.find((x) => x.id === id);
    if (p && (!active || active.id !== id)) setActive(p);
  }, [searchParams, projects, active]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  // Escape closes.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  const ctx = useMemo<Ctx>(
    () => ({ openProject, close, active, register }),
    [openProject, close, active, register],
  );

  return (
    <ProjectModalCtx.Provider value={ctx}>
      {children}
      {active && <ProjectModal project={active} />}
    </ProjectModalCtx.Provider>
  );
}
