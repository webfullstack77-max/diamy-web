import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  await requireAdmin();

  const { orderNote } = await req.json().catch(() => ({}));

  const testimonial = await prisma.testimonial.create({
    data: { orderNote: orderNote || null },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diamylasercut.com.mx";
  const url = `${baseUrl}/feedback/${testimonial.token}`;

  return NextResponse.json({ testimonial, url }, { status: 201 });
}
