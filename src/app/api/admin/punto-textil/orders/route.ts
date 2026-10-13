import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllOrders, createOrder } from "@/lib/punto-textil-orders-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const orders = getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener pedidos Punto Textil:", error);
    return NextResponse.json({ error: "Error interno al obtener pedidos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const { items, totalPieces, pricingTier, subtotal, iva, total, notes, status } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "El pedido debe contener al menos una prenda" }, { status: 400 });
    }

    const newOrder = createOrder({
      items,
      totalPieces: Number(totalPieces) || 0,
      pricingTier: pricingTier === "menudeo" ? "menudeo" : "mayoreo",
      subtotal: Number(subtotal) || 0,
      iva: Number(iva) || 0,
      total: Number(total) || 0,
      notes: notes || "",
      status: status || "borrador",
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error al crear pedido Punto Textil:", error);
    return NextResponse.json({ error: "Error al guardar el pedido" }, { status: 500 });
  }
}
