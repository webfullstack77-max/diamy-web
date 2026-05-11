import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentMethod } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOOLS: Anthropic.Tool[] = [
  {
    name: "register_order",
    description:
      "Registra un nuevo pedido en el sistema. Si el usuario da precio unitario y cantidad, calcula el total antes de llamar.",
    input_schema: {
      type: "object" as const,
      properties: {
        clientName: { type: "string", description: "Nombre del cliente" },
        clientPhone: { type: "string", description: "Teléfono del cliente (opcional)" },
        description: { type: "string", description: "Descripción detallada del pedido" },
        totalAmount: { type: "number", description: "Total en pesos MXN" },
        deliveryDate: { type: "string", description: "Fecha de entrega en formato YYYY-MM-DD" },
        notes: { type: "string", description: "Notas internas opcionales" },
      },
      required: ["clientName", "description", "totalAmount", "deliveryDate"],
    },
  },
  {
    name: "find_order",
    description: "Busca pedidos por nombre del cliente o descripción. Úsalo antes de add_payment o update_order_status si no tienes el ID exacto.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Nombre del cliente o parte de la descripción" },
      },
      required: ["query"],
    },
  },
  {
    name: "add_payment",
    description: "Registra un anticipo o pago en un pedido existente.",
    input_schema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string", description: "ID del pedido" },
        amount: { type: "number", description: "Monto del pago en MXN" },
        method: { type: "string", enum: ["CASH", "TRANSFER", "CARD", "OTHER"], description: "CASH=Efectivo, TRANSFER=Transferencia, CARD=Tarjeta" },
        note: { type: "string", description: "Nota opcional del pago" },
      },
      required: ["orderId", "amount", "method"],
    },
  },
  {
    name: "update_order_status",
    description: "Cambia el estado de un pedido.",
    input_schema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string", description: "ID del pedido" },
        status: {
          type: "string",
          enum: ["PENDING", "PRODUCTION", "READY", "DELIVERED", "CANCELLED"],
          description: "PENDING=Nuevo, PRODUCTION=En producción, READY=Listo, DELIVERED=Entregado, CANCELLED=Cancelado",
        },
      },
      required: ["orderId", "status"],
    },
  },
  {
    name: "edit_order",
    description: "Edita uno o varios campos de un pedido existente. Solo envía los campos que cambian.",
    input_schema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string", description: "ID del pedido" },
        clientName: { type: "string", description: "Nuevo nombre del cliente" },
        clientPhone: { type: "string", description: "Nuevo teléfono" },
        description: { type: "string", description: "Nueva descripción del pedido" },
        totalAmount: { type: "number", description: "Nuevo total en pesos MXN" },
        deliveryDate: { type: "string", description: "Nueva fecha de entrega YYYY-MM-DD" },
        notes: { type: "string", description: "Nuevas notas internas" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "delete_order",
    description: "Elimina permanentemente un pedido y todos sus pagos. Usar solo cuando el usuario confirma que quiere borrar, no cancelar.",
    input_schema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string", description: "ID del pedido a eliminar" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "get_stats",
    description: "Obtiene estadísticas de pedidos: totales del mes, pedidos activos, próximas entregas.",
    input_schema: { type: "object" as const, properties: {} },
  },
];

async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "register_order": {
      const order = await prisma.order.create({
        data: {
          clientName: input.clientName as string,
          clientPhone: (input.clientPhone as string) || null,
          description: input.description as string,
          totalAmount: Number(input.totalAmount),
          deliveryDate: new Date(input.deliveryDate as string),
          notes: (input.notes as string) || null,
        },
      });
      return { ok: true, orderId: order.id, clientName: order.clientName, totalAmount: order.totalAmount };
    }

    case "find_order": {
      const query = input.query as string;
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { clientName: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
          status: { notIn: ["CANCELLED"] },
        },
        include: { payments: true },
        orderBy: { deliveryDate: "asc" },
        take: 5,
      });
      return orders.map((o) => {
        const totalPaid = o.payments.reduce((s, p) => s + p.amount, 0);
        return {
          id: o.id,
          clientName: o.clientName,
          description: o.description,
          totalAmount: o.totalAmount,
          totalPaid,
          balance: o.totalAmount - totalPaid,
          status: o.status,
          deliveryDate: o.deliveryDate.toISOString().split("T")[0],
        };
      });
    }

    case "add_payment": {
      const payment = await prisma.payment.create({
        data: {
          orderId: input.orderId as string,
          amount: Number(input.amount),
          method: input.method as PaymentMethod,
          note: (input.note as string) || null,
        },
      });
      const order = await prisma.order.findUnique({
        where: { id: input.orderId as string },
        include: { payments: true },
      });
      const totalPaid = order?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;
      return {
        ok: true,
        paymentId: payment.id,
        amount: payment.amount,
        totalPaid,
        balance: (order?.totalAmount ?? 0) - totalPaid,
      };
    }

    case "update_order_status": {
      const order = await prisma.order.update({
        where: { id: input.orderId as string },
        data: { status: input.status as OrderStatus },
      });
      return { ok: true, orderId: order.id, status: order.status };
    }

    case "edit_order": {
      const data: Record<string, unknown> = {};
      if (input.clientName !== undefined) data.clientName = input.clientName;
      if (input.clientPhone !== undefined) data.clientPhone = (input.clientPhone as string) || null;
      if (input.description !== undefined) data.description = input.description;
      if (input.totalAmount !== undefined) data.totalAmount = Number(input.totalAmount);
      if (input.deliveryDate !== undefined) data.deliveryDate = new Date(input.deliveryDate as string);
      if (input.notes !== undefined) data.notes = (input.notes as string) || null;

      const order = await prisma.order.update({
        where: { id: input.orderId as string },
        data,
        include: { payments: true },
      });
      const totalPaid = order.payments.reduce((s, p) => s + p.amount, 0);
      return { ok: true, orderId: order.id, clientName: order.clientName, totalAmount: order.totalAmount, balance: order.totalAmount - totalPaid };
    }

    case "delete_order": {
      await prisma.order.delete({ where: { id: input.orderId as string } });
      return { ok: true, deleted: input.orderId };
    }

    case "get_stats": {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 3);

      const [monthOrders, monthPayments, activeCount, upcomingCount] = await Promise.all([
        prisma.order.findMany({
          where: { status: { notIn: ["CANCELLED"] }, createdAt: { gte: startOfMonth } },
          select: { totalAmount: true },
        }),
        prisma.payment.findMany({ where: { createdAt: { gte: startOfMonth } }, select: { amount: true } }),
        prisma.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
        prisma.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] }, deliveryDate: { lte: tomorrow } } }),
      ]);

      return {
        thisMonthTotal: monthOrders.reduce((s, o) => s + o.totalAmount, 0),
        thisMonthCollected: monthPayments.reduce((s, p) => s + p.amount, 0),
        activeOrders: activeCount,
        upcomingDeliveries: upcomingCount,
      };
    }

    default:
      return { error: "Tool desconocida" };
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "No autorizado" }, { status: 401 }); }

  const { messages } = await req.json().catch(() => ({ messages: [] }));

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const systemPrompt = `Eres el asistente de pedidos de Diamy Laser Cut, empresa mexicana de corte láser y grabado personalizado. El administrador te habla por voz mientras trabaja, y tú le respondes en voz alta.

Puedes: registrar pedidos, buscar pedidos, anotar pagos, cambiar estado, editar cualquier campo de un pedido, y borrar pedidos permanentemente.

Reglas estrictas de formato:
- NUNCA uses markdown: sin asteriscos, sin guiones de lista, sin negritas, sin encabezados.
- Responde en oraciones naturales, como si hablaras en una conversación telefónica.
- Confirma en máximo 2 oraciones. Ejemplo: "Listo, registré el pedido de Laura: 4 totebags por 800 pesos, entrega el 20 de mayo." No más.
- Si algo salió mal, dilo en una oración simple.
- Si el usuario menciona precio unitario y cantidad, multiplica antes de llamar register_order.
- Si no tienes el orderId, usa find_order primero.
- Para borrar: confirma verbalmente antes de llamar delete_order. Ejemplo: "Voy a borrar el pedido de Juan, ¿confirmas?" — si el usuario dice sí, entonces borra.
- Español mexicano informal. Sin emojis.
- Hoy es ${today}.`;

  let response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    tools: TOOLS,
    messages,
  });

  // Ejecutar tool calls en un loop (máximo 3 rondas para evitar bucles infinitos)
  let rounds = 0;
  const allMessages = [...messages];

  while (response.stop_reason === "tool_use" && rounds < 3) {
    rounds++;
    const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolUseBlocks) {
      const result = await executeTool(block.name, block.input as Record<string, unknown>);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    allMessages.push({ role: "assistant", content: response.content });
    allMessages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages: allMessages,
    });
  }

  const text = response.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text ?? "Listo.";
  return NextResponse.json({ response: text });
}
