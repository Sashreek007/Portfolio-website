import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Admin | Sashreek Addanki" };

export default async function AdminDashboard() {
  let projectCount = 0;
  let publishedCount = 0;
  let draftCount = 0;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();
      const [{ count: pc }, { count: pub }, { count: draft }] =
        await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("is_published", true),
          supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("is_published", false),
        ]);
      projectCount = pc ?? 0;
      publishedCount = pub ?? 0;
      draftCount = draft ?? 0;
    } catch {
      // silence
    }
  }

  const stats = [
    { label: "projects", value: projectCount, href: "/admin/projects" },
    { label: "published posts", value: publishedCount, href: "/admin/blog" },
    { label: "drafts", value: draftCount, href: "/admin/blog" },
  ];

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <p
          className="font-mono text-[11px] tracking-[0.12em] uppercase mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Dashboard
        </p>
        <h1
          className="text-[24px] font-medium"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Admin
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="glass flex flex-col gap-1 p-5 transition-transform duration-200 hover:-translate-y-[2px]"
          >
            <span
              className="font-mono text-[32px] font-medium tabular-nums"
              style={{ color: "var(--amber-bright)" }}
            >
              {value}
            </span>
            <span
              className="font-mono text-[11px] tracking-[0.08em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link
          href="/admin/projects/new"
          className="font-mono text-[13px] px-[18px] py-[9px] transition-all duration-200 hover:-translate-y-[1px]"
          style={{
            color: "var(--violet-pale)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--violet-mid) 95%, white 5%), var(--violet-mid))",
            borderRadius: "999px",
            border:
              "1px solid color-mix(in srgb, var(--violet-soft) 40%, transparent)",
            boxShadow:
              "inset 0 1px 0 color-mix(in srgb, white 18%, transparent), 0 10px 24px -12px color-mix(in srgb, var(--violet-mid) 80%, transparent)",
          }}
        >
          + add project
        </Link>
        <Link
          href="/admin/blog/new"
          className="glass-pill font-mono text-[13px] px-[18px] py-[9px]"
          style={{ color: "var(--text-primary)" }}
        >
          + new post
        </Link>
      </div>
    </div>
  );
}
