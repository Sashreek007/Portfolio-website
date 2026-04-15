"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="w-full max-w-[360px]">
        <div className="mb-8">
          <p
            className="font-mono text-[11px] tracking-[0.12em] uppercase mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Admin
          </p>
          <h1
            className="text-[24px] font-medium"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            Sign in
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="font-mono text-[11px] tracking-[0.08em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 font-mono text-[14px] outline-none transition-colors duration-150"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--gray-800)",
                borderRadius: "4px",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "var(--gray-800)";
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="font-mono text-[11px] tracking-[0.08em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 font-mono text-[14px] outline-none transition-colors duration-150"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--gray-800)",
                borderRadius: "4px",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "var(--gray-800)";
              }}
            />
          </div>

          {error && (
            <p
              className="font-mono text-[12px]"
              style={{ color: "oklch(0.704 0.191 22.216)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-4 py-3 font-mono text-[13px] font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              background: "var(--violet-mid)",
              color: "var(--violet-pale)",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "signing in..." : "sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
