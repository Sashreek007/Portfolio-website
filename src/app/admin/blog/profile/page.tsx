import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { BLOG_PROFILE_DEFAULT } from "@/lib/blog-profile";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Blog profile · Admin" };

export default async function AdminBlogProfilePage() {
  let initial = { ...BLOG_PROFILE_DEFAULT };

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("blog_profile")
        .select("heading, body")
        .eq("id", 1)
        .maybeSingle();
      if (data)
        initial = {
          heading: data.heading ?? "",
          body: data.body ?? "",
        };
    } catch {
      // fall through to default
    }
  }

  return (
    <div className="max-w-[900px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="font-mono text-[11px] tracking-[0.12em] uppercase mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Admin / Blog / Profile
          </p>
          <h1
            className="text-[22px] font-medium"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            About block
          </h1>
          <p
            className="text-[13px] mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Edit the heading and body that appear under{" "}
            <span className="font-mono">## about</span> on /blog.
          </p>
        </div>
        <Link
          href="/admin/blog"
          className="font-mono text-[12px] px-3 py-2 transition-colors duration-150"
          style={{
            color: "var(--text-muted)",
            border: "1px solid var(--gray-800)",
            borderRadius: "4px",
          }}
        >
          ← back
        </Link>
      </div>

      <ProfileForm initial={initial} />
    </div>
  );
}
