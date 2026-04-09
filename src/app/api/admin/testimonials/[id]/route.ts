import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.testimonial.update({
    where: { id },
    data: {
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      ...(body.orderNote !== undefined && { orderNote: body.orderNote }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
