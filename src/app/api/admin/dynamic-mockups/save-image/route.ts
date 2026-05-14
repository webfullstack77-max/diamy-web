import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const { url } = await req.json() as { url?: string };
  if (!url || !url.startsWith("http")) return NextResponse.json({ error: "URL inválida" }, { status: 400 });

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: `No se pudo descargar la imagen (${res.status})` }, { status: 502 });

  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `mockup-dm-${Date.now()}.png`;
  const dest = path.join(process.cwd(), "public", "uploads", filename);
  await fs.writeFile(dest, buf);

  return NextResponse.json({ imageUrl: `/uploads/${filename}` });
}
