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
  const { slug, title, description, price, originalPrice, images, materials, categoryId, subcategoryId, isActive, isFeatured, isCollection, isMassiveGallery, variablePrice, hasDimensions, widthCm, heightCm } = body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      slug,
      title,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      images: images ?? [],
      materials: materials ?? [],
      categoryId,
      subcategoryId: subcategoryId ?? null,
      isActive,
      isFeatured: isFeatured ?? false,
      isCollection: isCollection ?? false,
      isMassiveGallery: isMassiveGallery ?? false,
      variablePrice: variablePrice ?? false,
      hasDimensions: hasDimensions ?? false,
      widthCm: widthCm != null ? Number(widthCm) : null,
      heightCm: heightCm != null ? Number(heightCm) : null,
    },
    include: { category: true },
  });

  revalidatePublicPages();
  return NextResponse.json(product);
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
  await prisma.product.delete({ where: { id } });
  revalidatePublicPages();
  return NextResponse.json({ ok: true });
}
