import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const { id: orderId } = await params;
  const body = await req.json().catch(() => ({}));
  const { amount, method, receiptUrl, note } = body;

  if (!amount || !method) {
    return NextResponse.json({ error: "Monto y método requeridos" }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      orderId,
      amount: Number(amount),
      method: method as PaymentMethod,
      receiptUrl: receiptUrl || null,
      note: note || null,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
