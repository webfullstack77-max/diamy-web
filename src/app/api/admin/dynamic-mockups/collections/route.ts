import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DM_BASE = "https://app.dynamicmockups.com/api/v1";

// GET /collections?include_all_catalogs=true  →  todas las colecciones de DM (Hoodies, Mugs, etc.)
// GET /collections?catalog_uuid=xxx           →  colecciones de un catálogo específico
export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const apiKey = process.env.DYNAMIC_MOCKUPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "DYNAMIC_MOCKUPS_API_KEY no configurado" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const catalog_uuid = searchParams.get("catalog_uuid") ?? "";

  const qs = new URLSearchParams();
  if (catalog_uuid) qs.set("catalog_uuid", catalog_uuid);
  else qs.set("include_all_catalogs", "true"); // traer todas las colecciones pre-hechas de DM

  const res = await fetch(`${DM_BASE}/collections?${qs}`, {
    headers: { "x-api-key": apiKey, Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("DM collections error:", res.status, txt);
    return NextResponse.json({ error: `Error DM ${res.status}: ${txt.slice(0, 200)}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
