import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }
  const promos = await prisma.dailyPromo.findMany({ orderBy: { activeDate: "desc" } });
  return NextResponse.json(promos);
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }
  const { imageUrl, activeDate } = await request.json();
  if (!imageUrl || !activeDate) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  const promo = await prisma.dailyPromo.create({
    data: { imageUrl, activeDate: new Date(activeDate) },
  });
  return NextResponse.json(promo, { status: 201 });
}
