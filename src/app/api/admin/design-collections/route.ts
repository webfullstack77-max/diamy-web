import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const collections = await prisma.designCollection.findMany({
      orderBy: { order: "asc" },
      include: {
        designs: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching admin design collections:", error);
    return NextResponse.json({ error: "Error al obtener colecciones" }, { status: 500 });
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
    const { name, description, icon, coverImage, order, isActive } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    // Generate slug
    let slug = body.slug || name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) slug = `coleccion-${Date.now()}`;

    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.designCollection.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const collection = await prisma.designCollection.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        icon: icon?.trim() || "📁",
        coverImage: coverImage || null,
        order: typeof order === "number" ? order : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        designs: true,
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Error creating design collection:", error);
    return NextResponse.json({ error: "Error al crear colección" }, { status: 500 });
  }
}
