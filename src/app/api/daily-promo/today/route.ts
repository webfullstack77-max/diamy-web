import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const promo = await prisma.dailyPromo.findFirst({
    where: { isActive: true, activeDate: { gte: today, lt: tomorrow } },
  });
  return NextResponse.json(promo ?? null);
}
