import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      category,
      clientName,
      badge,
      order,
      isActive,
      productId,
      link,
    } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (category !== undefined) data.category = category ? category.trim() : null;
    if (clientName !== undefined) data.clientName = clientName ? clientName.trim() : null;
    if (badge !== undefined) data.badge = badge ? badge.trim() : null;
    if (order !== undefined) data.order = Number(order);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (productId !== undefined) data.productId = productId || null;
    if (link !== undefined) data.link = link ? link.trim() : null;

    const updated = await prisma.clientWork.update({
      where: { id },
      data,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
          },
        },
      },
    });

    revalidatePath("/");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PUT /api/admin/client-works/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar trabajo real" }, { status: 500 });
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

  const { id } = await params;
  try {
    await prisma.clientWork.delete({
      where: { id },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/client-works/[id]:", error);
    return NextResponse.json({ error: "Error al eliminar trabajo real" }, { status: 500 });
  }
}
