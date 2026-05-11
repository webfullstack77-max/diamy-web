import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 3);
  tomorrow.setHours(23, 59, 59, 999);

  const [monthOrders, monthPayments, activeOrders, upcomingOrders] = await Promise.all([
    prisma.order.findMany({
      where: { status: { notIn: ["CANCELLED"] }, createdAt: { gte: startOfMonth } },
      select: { totalAmount: true },
    }),
    prisma.payment.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { amount: true },
    }),
    prisma.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    prisma.order.count({
      where: {
        status: { notIn: ["DELIVERED", "CANCELLED"] },
        deliveryDate: { lte: tomorrow },
      },
    }),
  ]);

  const thisMonthTotal = monthOrders.reduce((s, o) => s + o.totalAmount, 0);
  const thisMonthCollected = monthPayments.reduce((s, p) => s + p.amount, 0);

  // Ventas por día — últimos 7 días
  const dailySales = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayOrders = await prisma.order.findMany({
      where: {
        status: { notIn: ["CANCELLED"] },
        createdAt: { gte: day, lt: nextDay },
      },
      select: { totalAmount: true },
    });

    dailySales.push({
      date: day.toISOString().split("T")[0],
      label: day.toLocaleDateString("es-MX", { weekday: "short" }),
      amount: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
    });
  }

  return NextResponse.json({
    thisMonth: { total: thisMonthTotal, collected: thisMonthCollected },
    activeOrders,
    upcomingDeliveries: upcomingOrders,
    dailySales,
  });
}
