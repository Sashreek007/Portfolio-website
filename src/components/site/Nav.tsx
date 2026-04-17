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

const railLinks = [
  { href: "#hero",    label: "top",     id: "hero" },
  { href: "#about",   label: "about",   id: "about" },
  { href: "#work",    label: "work",    id: "work" },
  { href: "#writing", label: "writing", id: "writing" },
  { href: "#contact", label: "contact", id: "contact" },
];

function getNavItemStyle(active: boolean): React.CSSProperties {
  return {
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    border: active
      ? "1px solid color-mix(in srgb, var(--violet-soft) 38%, transparent)"
      : "1px solid transparent",
    background: active
      ? "color-mix(in srgb, var(--violet-dim) 16%, transparent)"
      : "transparent",
  };
}

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [activeSection, setActiveSection] = useState("");
  const [showRail, setShowRail] = useState(false);
  const logoActive = isHome && (activeSection === "" || activeSection === "hero");

  useEffect(() => {
    if (!isHome) {
      setActiveSection("");
      setShowRail(false);
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
      setShowRail(window.scrollY > window.innerHeight * 0.38);
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
        aria-current={logoActive ? "location" : undefined}
        className="inline-flex items-center rounded-[999px] px-3 py-1.5 font-mono text-[13px] font-medium tracking-[0.12em] uppercase transition-colors duration-200"
        style={getNavItemStyle(logoActive)}
      >
        SA
      </a>

      <nav className="flex items-center gap-6">
        {isHome
          ? homeLinks.map(({ href, label, id }) => {
              return (
                <a
                  key={href}
                  href={href}
                  className="inline-flex items-center font-mono text-[13px] transition-colors duration-200"
                  style={{ color: activeSection === id ? "var(--text-primary)" : "var(--text-muted)" }}
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
                  className="inline-flex items-center rounded-[999px] px-3 py-1.5 font-mono text-[13px] transition-colors duration-200"
                  style={getNavItemStyle(active)}
                >
                  {label}
                </Link>
              );
            })}
      </nav>

      {isHome && (
        <aside
          className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
          style={{
            opacity: showRail ? 1 : 0,
            transform: `translateY(-50%) translateX(${showRail ? "0" : "8px"})`,
            transition: "opacity 220ms ease, transform 220ms ease",
          }}
        >
          <div
            className="pointer-events-auto flex flex-col gap-2 rounded-[10px] p-2"
            style={{
              border: "1px solid color-mix(in srgb, var(--gray-800) 88%, transparent)",
              background: "color-mix(in srgb, var(--bg-base) 82%, transparent)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {railLinks.map(({ href, label, id }) => {
              const active = activeSection === id;
              return (
                <a
                  key={href}
                  href={href}
                  aria-current={active ? "location" : undefined}
                  className="inline-flex min-w-[84px] items-center justify-between gap-3 rounded-[999px] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-200"
                  style={getNavItemStyle(active)}
                >
                  <span>{label}</span>
                  <span
                    className="h-[6px] w-[6px] rounded-full"
                    style={{
                      background: active ? "var(--violet-soft)" : "var(--gray-600)",
                    }}
                  />
                </a>
              );
            })}
          </div>
        </aside>
      )}
    </header>
  );
}
