import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VISITOR_COOKIE = "vid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Paths we don't count as public traffic.
function isTrackable(path: string) {
  if (!path || typeof path !== "string") return false;
  if (path.startsWith("/admin")) return false;
  if (path.startsWith("/api")) return false;
  if (path.startsWith("/_next")) return false;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path : null;
    const referrer = typeof body.referrer === "string" ? body.referrer : null;

    if (!path) return NextResponse.json({ ok: false }, { status: 400 });
    if (!isTrackable(path)) return NextResponse.json({ ok: true });

    const existingId = req.cookies.get(VISITOR_COOKIE)?.value;
    const visitorId = existingId || crypto.randomUUID();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && serviceKey) {
      const supabase = createClient(url, serviceKey, {
        auth: { persistSession: false },
      });
      await supabase.from("page_views").insert({
        visitor_id: visitorId,
        path,
        user_agent: req.headers.get("user-agent") ?? null,
        referrer,
      });
    }

    const res = NextResponse.json({ ok: true });
    if (!existingId) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
