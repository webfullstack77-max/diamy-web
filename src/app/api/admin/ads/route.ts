import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ads = await prisma.adsQueue.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ ads });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { title, imageUrl, caption, hashtags, channels, scheduleTime, productUrl } = await request.json();

  if (!title || !imageUrl || !caption) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const ad = await prisma.adsQueue.create({
    data: {
      title,
      imageUrl,
      caption,
      hashtags: hashtags ?? null,
      channels: JSON.stringify(channels ?? ["whatsapp"]),
      scheduleTime: scheduleTime ? new Date(scheduleTime) : new Date(),
      productUrl: productUrl ?? null,
    },
  });

  return NextResponse.json({ ad }, { status: 201 });
}
