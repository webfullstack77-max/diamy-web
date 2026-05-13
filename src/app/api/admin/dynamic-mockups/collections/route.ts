import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DM_BASE = "https://app.dynamicmockups.com/api/v1";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const apiKey = process.env.DYNAMIC_MOCKUPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "DYNAMIC_MOCKUPS_API_KEY no configurado" }, { status: 500 });

  const res = await fetch(`${DM_BASE}/collections`, {
    headers: { "x-api-key": apiKey, Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("DM collections error:", res.status, txt);
    return NextResponse.json({ error: "Error al obtener colecciones de Dynamic Mockups" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
