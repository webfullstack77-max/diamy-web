import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const original = await prisma.adsQueue.findUnique({ where: { id } });
  if (!original) {
    return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
  }

  const ad = await prisma.adsQueue.create({
    data: {
      title: original.title,
      imageUrl: original.imageUrl,
      caption: original.caption,
      hashtags: original.hashtags,
      channels: original.channels,
      productUrl: original.productUrl,
      videoUrl: original.videoUrl,
      imageUrls: original.imageUrls,
      scheduleTime: new Date(),
      status: "scheduled",
    },
  });

  return NextResponse.json({ ad }, { status: 201 });
}
