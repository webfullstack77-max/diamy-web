import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const items = await prisma.productOfMonthItem.findMany({
    orderBy: { order: "asc" },
    include: { product: { include: { category: true } } },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { image, text, link, order, productId } = await request.json();

  if (!image) {
    return NextResponse.json({ error: "La imagen es requerida" }, { status: 400 });
  }

  const item = await prisma.productOfMonthItem.create({
    data: { image, text: text || null, link: link || null, order: order ?? 0, productId: productId || null },
    include: { product: { include: { category: true } } },
  });

  return NextResponse.json(item, { status: 201 });
}
