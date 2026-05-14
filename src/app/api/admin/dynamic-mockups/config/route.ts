import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const websiteKey = process.env.DYNAMIC_MOCKUPS_API_KEY;
  if (!websiteKey) return NextResponse.json({ error: "DYNAMIC_MOCKUPS_API_KEY no configurado" }, { status: 500 });

  return NextResponse.json({ websiteKey });
}
