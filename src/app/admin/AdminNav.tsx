"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSignOut from "./AdminSignOut";

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header
      className="glass-nav sticky top-0 z-40 flex items-center justify-between px-6 py-4"
    >
      <div className="flex items-center gap-6">
        <Link
          href="/admin"
          className="font-mono text-[12px] font-medium"
          style={{ color: "var(--violet-soft)" }}
        >
          SA / admin
        </Link>
        <nav className="flex gap-5">
          {[
            { href: "/admin/projects", label: "projects" },
            { href: "/admin/blog", label: "blog" },
            { href: "/admin/analytics", label: "analytics" },
          ].map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="font-mono text-[12px] transition-colors duration-150"
                style={{
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="font-mono text-[11px] transition-colors duration-150"
          style={{ color: "var(--text-muted)" }}
        >
          ← site
        </Link>
        <AdminSignOut />
      </div>
    </header>
  );
}
