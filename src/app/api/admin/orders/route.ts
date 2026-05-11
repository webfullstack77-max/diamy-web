import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as OrderStatus | null;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { payments: { orderBy: { createdAt: "asc" } } },
    orderBy: { deliveryDate: "asc" },
  });

  const enriched = orders.map((o) => {
    const totalPaid = o.payments.reduce((s, p) => s + p.amount, 0);
    return { ...o, totalPaid, balance: o.totalAmount - totalPaid };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const { clientName, clientPhone, description, totalAmount, deliveryDate, notes } = body;

  if (!clientName || !description || !totalAmount || !deliveryDate) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      clientName,
      clientPhone: clientPhone || null,
      description,
      totalAmount: Number(totalAmount),
      deliveryDate: new Date(deliveryDate),
      notes: notes || null,
    },
    include: { payments: true },
  });

  return NextResponse.json({ ...order, totalPaid: 0, balance: order.totalAmount }, { status: 201 });
}
