import { createBrowserClient } from "@supabase/ssr";

// Untyped client — replace with generated types via `supabase gen types` after setup
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
