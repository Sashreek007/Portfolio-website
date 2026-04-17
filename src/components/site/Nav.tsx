"use client";

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

const homeLinks = [
  { href: "#work",    label: "work",    id: "work" },
  { href: "#about",   label: "about",   id: "about" },
  { href: "/blog",    label: "writing", id: "" },
  { href: "#contact", label: "contact", id: "contact" },
];

const pageLinks = [
  { href: "/",        label: "home" },
  { href: "/work",    label: "work" },
  { href: "/about",   label: "about" },
  { href: "/blog",    label: "writing" },
  { href: "/contact", label: "contact" },
];

const headerStyle: React.CSSProperties = {
  background: "color-mix(in srgb, var(--bg-base) 85%, transparent)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderBottom: "1px solid var(--gray-800)",
};

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [activeSection, setActiveSection] = useState("");
  const progress = useScrollProgress();

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
      className="sticky top-0 z-50 flex items-center justify-between px-[6vw] py-5 overflow-hidden"
      style={headerStyle}
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
              const isPage = href.startsWith("/");
              const active = !isPage && activeSection === id;
              const Tag = isPage ? Link : "a";
              return (
                <Tag
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
                </Tag>
              );
            })
          : pageLinks.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
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
                </Link>
              );
            })}
      </nav>
    </header>
  );
}
