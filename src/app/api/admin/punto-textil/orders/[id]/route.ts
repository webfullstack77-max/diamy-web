import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getOrderById, updateOrder, deleteOrder } from "@/lib/punto-textil-orders-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateOrder(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const { id } = await params;
  const deleted = deleteOrder(id);

  if (!deleted) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Pedido eliminado correctamente" });
}
