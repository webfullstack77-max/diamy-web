import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  // DYNAMIC_MOCKUPS_WEBSITE_KEY = clave de embed (generada en DM dashboard > Embed)
  // DYNAMIC_MOCKUPS_API_KEY     = clave de API server-side (usada en otros routes)
  const websiteKey = process.env.DYNAMIC_MOCKUPS_WEBSITE_KEY ?? process.env.DYNAMIC_MOCKUPS_API_KEY;
  if (!websiteKey) return NextResponse.json({ error: "DYNAMIC_MOCKUPS_WEBSITE_KEY no configurado" }, { status: 500 });

  return NextResponse.json({ websiteKey });
}
