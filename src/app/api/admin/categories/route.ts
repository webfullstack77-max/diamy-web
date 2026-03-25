import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      children: { select: { id: true, name: true, slug: true, _count: { select: { products: true } } } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, name, description, image, parentId, promoMode, promoImage, promoDescription } = body;

  if (!slug || !name) {
    return NextResponse.json({ error: "Slug y nombre son requeridos" }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: { slug, name, description: description ?? null, image: image ?? null, parentId: parentId ?? null, promoMode: promoMode ?? false, promoImage: promoImage ?? null, promoDescription: promoDescription ?? null },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una categoría con ese slug" }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message ?? "Error al crear categoría" }, { status: 500 });
  }
}
