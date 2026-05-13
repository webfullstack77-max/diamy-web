import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DM_BASE = "https://app.dynamicmockups.com/api/v1";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const apiKey = process.env.DYNAMIC_MOCKUPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "DYNAMIC_MOCKUPS_API_KEY no configurado" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") ?? "";
  const page = searchParams.get("page") ?? "1";

  const qs = new URLSearchParams();
  qs.set("include_all_catalogs", "true"); // incluye todos los templates pre-hechos de DM
  qs.set("page", page);
  qs.set("per_page", "48");
  if (name) qs.set("name", name);

  const res = await fetch(`${DM_BASE}/mockups?${qs}`, {
    headers: { "x-api-key": apiKey, Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("DM mockups error:", res.status, txt);
    return NextResponse.json({ error: `Error DM ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
