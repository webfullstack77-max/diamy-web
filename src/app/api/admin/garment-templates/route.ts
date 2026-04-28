import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const templates = await prisma.garmentTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const data = await request.json();

  const { name, category, imageUrl, controlPoints } = data;

  if (!name || !category || !imageUrl || !controlPoints) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  const template = await prisma.garmentTemplate.create({
    data: {
      name,
      category,
      imageUrl,
      controlPoints,
    },
  });

  return NextResponse.json(template);
}
