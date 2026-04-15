"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "home" },
  { href: "/about", label: "about" },
  { href: "/work", label: "work" },
  { href: "/blog", label: "writing" },
  { href: "/contact", label: "contact" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-[6vw] py-5"
      style={{
        background: "color-mix(in srgb, var(--bg-base) 85%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--gray-800)",
      }}
    >
      <Link
        href="/"
        className="font-mono text-[13px] font-medium tracking-[0.12em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        SA
      </Link>
      <nav className="flex items-center gap-6">
        {links.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative font-mono text-[13px] transition-colors duration-200"
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {label}
              {isActive && (
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
