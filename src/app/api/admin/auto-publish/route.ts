import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

async function getOrCreateConfig() {
  const existing = await prisma.autoPublishConfig.findFirst();
  if (existing) return existing;
  return prisma.autoPublishConfig.create({ data: {} });
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const config = await getOrCreateConfig();
  return NextResponse.json({ config });
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { enabled, channels, nextPublishDate } = await request.json();

  const config = await getOrCreateConfig();

  const updated = await prisma.autoPublishConfig.update({
    where: { id: config.id },
    data: {
      ...(enabled !== undefined && { enabled }),
      ...(channels !== undefined && { channels: JSON.stringify(channels) }),
      ...(nextPublishDate !== undefined && { nextPublishDate }),
    },
  });

  return NextResponse.json({ config: updated });
}
