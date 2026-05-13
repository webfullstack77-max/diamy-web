import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

const DM_BASE = "https://app.dynamicmockups.com/api/v1";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const apiKey = process.env.DYNAMIC_MOCKUPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "DYNAMIC_MOCKUPS_API_KEY no configurado" }, { status: 500 });

  const { mockup_uuid, smart_objects } = await req.json().catch(() => ({}));
  if (!mockup_uuid || !Array.isArray(smart_objects) || smart_objects.length === 0) {
    return NextResponse.json({ error: "mockup_uuid y smart_objects requeridos" }, { status: 400 });
  }

  const dmRes = await fetch(`${DM_BASE}/renders`, {
    method: "POST",
    headers: { "x-api-key": apiKey, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      mockup_uuid,
      smart_objects: smart_objects.map(({ uuid, asset_url }: { uuid: string; asset_url: string }) => ({
        uuid,
        asset: { url: asset_url },
      })),
    }),
  });

  if (!dmRes.ok) {
    const txt = await dmRes.text().catch(() => "");
    console.error("DM render error:", dmRes.status, txt);
    return NextResponse.json({ error: `Error al renderizar (${dmRes.status})` }, { status: dmRes.status });
  }

  const dmData = await dmRes.json();
  const exportPath: string | undefined = dmData?.data?.export_path ?? dmData?.export_path;
  if (!exportPath) {
    console.error("DM render sin export_path:", JSON.stringify(dmData));
    return NextResponse.json({ error: "Respuesta inesperada de Dynamic Mockups" }, { status: 500 });
  }

  // Descargar y guardar permanentemente para que la URL no expire en 24h
  const imgRes = await fetch(exportPath);
  if (!imgRes.ok) return NextResponse.json({ error: "Error al descargar imagen renderizada" }, { status: 500 });

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const filename = `mockup-dm-${Date.now()}.png`;
  await writeFile(join(process.cwd(), "public", "uploads", filename), buffer);

  return NextResponse.json({ imageUrl: `/uploads/${filename}` });
}
