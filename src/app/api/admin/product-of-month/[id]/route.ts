import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { image, text, link, order, isActive } = await request.json();

  const item = await prisma.productOfMonthItem.update({
    where: { id },
    data: {
      ...(image !== undefined && { image }),
      ...(text !== undefined && { text: text || null }),
      ...(link !== undefined && { link: link || null }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.productOfMonthItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
