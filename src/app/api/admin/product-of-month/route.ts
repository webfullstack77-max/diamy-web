import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const config = await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  return NextResponse.json({
    imageUrl: config.productOfMonthImage,
    text: config.productOfMonthText,
  });
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { imageUrl, text } = await request.json();

  const config = await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: {
      ...(imageUrl !== undefined && { productOfMonthImage: imageUrl }),
      ...(text !== undefined && { productOfMonthText: text }),
    },
    create: {
      id: "main",
      productOfMonthImage: imageUrl ?? null,
      productOfMonthText: text ?? null,
    },
  });

  return NextResponse.json({
    imageUrl: config.productOfMonthImage,
    text: config.productOfMonthText,
  });
}
