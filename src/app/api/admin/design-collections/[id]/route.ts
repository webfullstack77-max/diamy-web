import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, icon, coverImage, order, isActive } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (slug !== undefined) data.slug = slug.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (icon !== undefined) data.icon = icon?.trim() || "📁";
    if (coverImage !== undefined) data.coverImage = coverImage || null;
    if (order !== undefined) data.order = Number(order);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const collection = await prisma.designCollection.update({
      where: { id },
      data,
      include: { designs: true },
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error updating design collection:", error);
    return NextResponse.json({ error: "Error al actualizar colección" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.designCollection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting design collection:", error);
    return NextResponse.json({ error: "Error al eliminar colección" }, { status: 500 });
  }
}
