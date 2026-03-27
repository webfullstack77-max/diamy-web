import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [lastProduct, lastCategory] = await Promise.all([
    prisma.product.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.category.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
  ]);

  const version = Math.max(
    lastProduct?.updatedAt?.getTime() ?? 0,
    lastCategory?.updatedAt?.getTime() ?? 0
  );

  return NextResponse.json({ version });
}
