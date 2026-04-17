import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePublicPages } from "@/lib/revalidate";

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
  const body = await request.json();
  const { slug, name, description, image, parentId, promoMode, promoImage, promoDescription } = body;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { slug, name, description: description ?? null, image: image ?? null, parentId: parentId ?? null, promoMode: promoMode ?? false, promoImage: promoImage ?? null, promoDescription: promoDescription ?? null },
    });
    revalidatePublicPages();
    return NextResponse.json(category);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una categoría con ese slug" }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message ?? "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  revalidatePublicPages();
  return NextResponse.json({ ok: true });
}
