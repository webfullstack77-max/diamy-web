import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, title, description, price, originalPrice, images, materials, categoryId, subcategoryId, isActive, isFeatured, isCollection, variablePrice } = body;

  if (!slug || !title || !description || (!price && !variablePrice) || !categoryId) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
  }

  const product = await prisma.product.create({
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
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      isCollection: isCollection ?? false,
      variablePrice: variablePrice ?? false,
    },
    include: { category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
