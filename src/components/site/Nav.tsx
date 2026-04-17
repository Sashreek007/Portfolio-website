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

function getNavItemStyle(active: boolean): React.CSSProperties {
  return {
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    border: active
      ? "1px solid color-mix(in srgb, var(--violet-soft) 28%, transparent)"
      : "1px solid color-mix(in srgb, var(--gray-800) 0%, transparent)",
    background: active
      ? "color-mix(in srgb, var(--violet-dim) 14%, transparent)"
      : "transparent",
  };
}

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [activeSection, setActiveSection] = useState("");
  const logoActive = isHome && (activeSection === "" || activeSection === "hero");

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
      className="sticky top-0 z-50 px-[4vw] py-4 lg:px-[6vw]"
      style={headerStyle}
    >
      <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between gap-5">
        <a
          href={logoHref}
          aria-current={logoActive ? "location" : undefined}
          className="font-mono text-[12px] font-medium tracking-[0.12em] uppercase transition-colors duration-200"
          style={{ color: logoActive ? "var(--text-primary)" : "var(--text-muted)" }}
        >
          SA
        </a>

        <nav className="flex items-center gap-2 lg:gap-3">
          {isHome
            ? homeLinks.map(({ href, label, id }) => {
                const active = activeSection === id;
                return (
                  <a
                    key={href}
                    href={href}
                    aria-current={active ? "location" : undefined}
                    className="inline-flex items-center rounded-[999px] px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 lg:text-[12px]"
                    style={getNavItemStyle(active)}
                  >
                    {label}
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
                    className="inline-flex items-center rounded-[999px] px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 lg:text-[12px]"
                    style={getNavItemStyle(active)}
                  >
                    {label}
                  </Link>
                );
              })}
        </nav>
      </div>
    </header>
  );
}
