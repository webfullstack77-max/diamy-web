import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
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
    const collection = await prisma.designCollection.findUnique({ where: { id } });
    if (!collection) {
      return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
    }

    const body = await request.json();

    // Check if bulk array or single object
    if (Array.isArray(body.designs)) {
      const highestOrder = await prisma.designAsset.findFirst({
        where: { collectionId: id },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      let nextOrder = (highestOrder?.order ?? -1) + 1;

      const created = [];
      for (const item of body.designs) {
        if (!item.imageUrl) continue;
        const asset = await prisma.designAsset.create({
          data: {
            title: item.title?.trim() || "Diseño DTF",
            imageUrl: item.imageUrl,
            thumbnailUrl: item.thumbnailUrl || null,
            collectionId: id,
            order: typeof item.order === "number" ? item.order : nextOrder++,
            isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          },
        });
        created.push(asset);
      }
      return NextResponse.json({ designs: created }, { status: 201 });
    } else {
      const { title, imageUrl, thumbnailUrl, order, isActive } = body;
      if (!imageUrl) {
        return NextResponse.json({ error: "La URL de la imagen es obligatoria" }, { status: 400 });
      }

      let designOrder = order;
      if (designOrder === undefined) {
        const highestOrder = await prisma.designAsset.findFirst({
          where: { collectionId: id },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        designOrder = (highestOrder?.order ?? -1) + 1;
      }

      const design = await prisma.designAsset.create({
        data: {
          title: title?.trim() || "Diseño DTF",
          imageUrl,
          thumbnailUrl: thumbnailUrl || null,
          collectionId: id,
          order: Number(designOrder),
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        },
      });

      return NextResponse.json({ design }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating design assets:", error);
    return NextResponse.json({ error: "Error al agregar diseños a la colección" }, { status: 500 });
  }
}
