import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { token } });
  if (!testimonial) return NextResponse.json({ error: "invalid" }, { status: 404 });
  if (testimonial.isSubmitted) return NextResponse.json({ status: "submitted" });
  return NextResponse.json({ status: "pending" });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { token } });
  if (!testimonial) return NextResponse.json({ error: "invalid" }, { status: 404 });
  if (testimonial.isSubmitted) return NextResponse.json({ error: "already_submitted" }, { status: 409 });

  const { author, role, email, phone, text, rating } = await req.json();
  if (!author || !email || !text || !rating) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  await prisma.testimonial.update({
    where: { token },
    data: {
      author,
      role: role || null,
      email,
      phone: phone || null,
      text,
      rating: Number(rating),
      isSubmitted: true,
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
