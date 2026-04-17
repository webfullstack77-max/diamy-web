import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePublicPages } from "@/lib/revalidate";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "0");

  const products = await prisma.product.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    ...(limit > 0 ? { take: limit } : {}),
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
  const { slug, title, description, price, originalPrice, images, materials, categoryId, subcategoryId, isActive, isFeatured, isCollection, isMassiveGallery, variablePrice } = body;

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
      isMassiveGallery: isMassiveGallery ?? false,
      variablePrice: variablePrice ?? false,
    },
    include: { category: true },
  });

  revalidatePublicPages();
  return NextResponse.json(product, { status: 201 });
}
