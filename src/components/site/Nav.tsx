"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const homeLinks = [
  { href: "#about",   label: "about",   id: "about" },
  { href: "#work",    label: "work",    id: "work" },
  { href: "#writing", label: "writing", id: "writing" },
  { href: "#contact", label: "contact", id: "contact" },
];

const pageLinks = [
  { href: "/",        label: "home" },
  { href: "/about",   label: "about" },
  { href: "/work",    label: "work" },
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

  useEffect(() => {
    if (!isHome) {
      setActiveSection("");
      return;
    }

    const ids = ["hero", "about", "work", "writing", "contact"];

    const update = () => {
      const threshold = window.scrollY + 120;
      let current = ids[0];

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (threshold >= el.offsetTop) current = id;
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = ids[ids.length - 1];
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  const logoHref = isHome ? "#hero" : "/";

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-[6vw] py-5"
      style={headerStyle}
    >
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
                  aria-current={active ? "location" : undefined}
                  className="relative inline-flex pb-2 font-mono text-[13px] transition-colors duration-200"
                  style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: "var(--violet-mid)" }}
                    />
                  )}
                </a>
              );
            })
          : pageLinks.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="relative inline-flex pb-2 font-mono text-[13px] transition-colors duration-200"
                  style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
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
