import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collections = await prisma.designCollection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        designs: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(
      { collections },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching public design collections:", error);
    return NextResponse.json({ error: "Error al cargar colecciones de diseños" }, { status: 500 });
  }
}
