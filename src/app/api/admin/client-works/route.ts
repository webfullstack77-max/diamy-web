import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const items = await prisma.clientWork.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error in GET /api/admin/client-works:", error);
    return NextResponse.json({ error: "Error al obtener trabajos reales" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Título e imagen son requeridos" },
        { status: 400 }
      );
    }

    const count = await prisma.clientWork.count();

    const created = await prisma.clientWork.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl,
        category: category?.trim() || null,
        clientName: clientName?.trim() || null,
        badge: badge?.trim() || "Trabajo Real",
        order: typeof order === "number" ? order : count,
        isActive: isActive !== false,
        productId: productId || null,
        link: link?.trim() || null,
      },
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
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/client-works:", error);
    return NextResponse.json({ error: "Error al guardar trabajo real" }, { status: 500 });
  }
}
