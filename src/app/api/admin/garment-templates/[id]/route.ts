import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const template = await prisma.garmentTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template) {
    return NextResponse.json(
      { error: "Plantilla no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(template);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const data = await request.json();
  const { name, category, imageUrl, controlPoints } = data;

  const template = await prisma.garmentTemplate.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(category && { category }),
      ...(imageUrl && { imageUrl }),
      ...(controlPoints && { controlPoints }),
    },
  });

  return NextResponse.json(template);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await prisma.garmentTemplate.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
