"use client";

// Nav — hidden while at the hero, slides down once you scroll past it.
// On the homepage, section links are in-page anchors (#work, #about, …).
// On other pages they route back to the home page's section anchors
// (/#work, /#about, …) so the nav always returns to the main site flow.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return p;
}

function useScrolledPastHero(threshold = 0.6) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const update = () => setPast(window.scrollY > window.innerHeight * threshold);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return past;
}

const homeLinks = [
  { href: "#work",    label: "work",    id: "work" },
  { href: "#about",   label: "about",   id: "about" },
  { href: "#writing", label: "writing", id: "writing" },
  { href: "#contact", label: "contact", id: "contact" },
];

// On non-home pages, nav links route back to the home page's section anchors
// rather than to the standalone sub-pages (/work, /about, /blog, /contact).
const pageLinks = [
  { href: "/",         label: "home" },
  { href: "/#work",    label: "work" },
  { href: "/#about",   label: "about" },
  { href: "/#writing", label: "writing" },
  { href: "/#contact", label: "contact" },
];

export default function Nav() {
  const pathname = usePathname();

  // /blog is a self-contained sub-site — it renders its own nav in
  // blog/layout.tsx. Hide the portfolio nav there so the two don't stack.
  if (pathname?.startsWith("/blog")) return null;

  const isHome = pathname === "/";
  const [activeSection, setActiveSection] = useState("");
  const progress = useScrollProgress();
  // On the home page, hide the nav until past the hero. On other pages, always show.
  const scrolledPastHero = useScrolledPastHero(0.6);
  const visible = isHome ? scrolledPastHero : true;

  useEffect(() => {
    if (!isHome) return;
    const ids = ["hero", "work", "about", "writing", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(e.target.id);
        }
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  const logoHref = isHome ? "#hero" : "/";

  return (
    <header
      className="top-0 left-0 right-0 z-50 flex items-center justify-between px-[6vw] py-5 overflow-hidden"
      style={{
        // On home: fixed so it doesn't reserve space (hero fills full viewport).
        // On other pages: sticky so it occupies the top of the document normally.
        position: isHome ? "fixed" : "sticky",
        background: "color-mix(in srgb, var(--bg-base) 85%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--gray-800)",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] pointer-events-none"
        style={{
          width: `${progress * 100}%`,
          background: "var(--violet-mid)",
          transition: "width 80ms linear",
          opacity: progress > 0.01 ? 1 : 0,
        }}
      />
      <a
        href={logoHref}
        className="font-mono text-[13px] font-medium tracking-[0.12em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        SA
      </a>

      <nav className="flex items-center gap-6">
        {isHome
          ? homeLinks.map(({ href, label, id }) => {
              const active = activeSection === id;
              return (
                <a
                  key={href}
                  href={href}
                  className="relative font-mono text-[13px] transition-colors duration-200"
                  style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute -bottom-[21px] left-0 right-0 h-[2px]"
                      style={{ background: "var(--violet-mid)" }}
                    />
                  )}
                </a>
              );
            })
          : pageLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative font-mono text-[13px] transition-colors duration-200 hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </Link>
            ))}
      </nav>
    </header>
  );
}
