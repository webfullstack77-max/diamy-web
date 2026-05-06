import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const igUserId = process.env.IG_USER_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!igUserId || !token) {
    return NextResponse.json({
      ok: false,
      error: "IG_USER_ID o FB_PAGE_ACCESS_TOKEN no están configurados en el servidor",
    });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}?fields=id,username&access_token=${token}`
    );
    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ ok: false, error: data.error.message });
    }
    return NextResponse.json({ ok: true, username: data.username });
  } catch {
    return NextResponse.json({ ok: false, error: "Error de red al contactar Meta" });
  }
}
