import { NextRequest, NextResponse } from "next/server";
import { getPopupConfig, savePopupConfig } from "@/lib/popup-storage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PopupConfig } from "@/types/popup";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const config = await getPopupConfig();

    // Traer productos activos para el selector interactivo
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        images: true,
        category: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    return NextResponse.json({ config, products });
  } catch (error) {
    console.error("Error in GET /api/admin/popup:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const body = (await request.json()) as PopupConfig;

    if (!body || !body.slides || !Array.isArray(body.slides)) {
      return NextResponse.json({ error: "Datos de popup inválidos" }, { status: 400 });
    }

    const saved = await savePopupConfig(body);
    return NextResponse.json(saved);
  } catch (error) {
    console.error("Error in POST /api/admin/popup:", error);
    return NextResponse.json({ error: "Error al guardar popup" }, { status: 500 });
  }
}
