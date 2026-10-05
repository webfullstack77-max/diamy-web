import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const works = await prisma.clientWork.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json(works);
  } catch (error) {
    console.error("Error in GET /api/client-works:", error);
    return NextResponse.json({ error: "Error al obtener trabajos reales" }, { status: 500 });
  }
}
