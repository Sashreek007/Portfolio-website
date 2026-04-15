"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminSignOut() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={signOut}
      className="font-mono text-[11px] transition-colors duration-150"
      style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.color = "oklch(0.704 0.191 22.216)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
      }
    >
      sign out
    </button>
  );
}
