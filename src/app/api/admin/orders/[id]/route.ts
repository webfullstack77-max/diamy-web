import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { payments: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const totalPaid = order.payments.reduce((s, p) => s + p.amount, 0);
  return NextResponse.json({ ...order, totalPaid, balance: order.totalAmount - totalPaid });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status as OrderStatus;
  if (body.clientName !== undefined) data.clientName = body.clientName;
  if (body.clientPhone !== undefined) data.clientPhone = body.clientPhone || null;
  if (body.description !== undefined) data.description = body.description;
  if (body.totalAmount !== undefined) data.totalAmount = Number(body.totalAmount);
  if (body.deliveryDate !== undefined) data.deliveryDate = new Date(body.deliveryDate);
  if (body.notes !== undefined) data.notes = body.notes || null;

  const order = await prisma.order.update({
    where: { id },
    data,
    include: { payments: { orderBy: { createdAt: "asc" } } },
  });

  const totalPaid = order.payments.reduce((s, p) => s + p.amount, 0);
  return NextResponse.json({ ...order, totalPaid, balance: order.totalAmount - totalPaid });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
