import fs from "fs";
import path from "path";

export interface PuntoTextilOrderItem {
  id: string;
  brand?: 'playerytees' | 'bones';
  modelId: string;
  styleCode: string;
  modelName: string;
  category: string;
  gender: string;
  cutType: string;
  color: {
    name: string;
    hex: string;
    isWhite?: boolean;
  };
  sizes: Record<string, number>; // ej: { S: 5, M: 10, L: 8 }
  totalPieces: number;
  unitPrices: Record<string, number>; // precio unitario por talla
  lineTotal: number;
}

export type PuntoTextilOrderStatus =
  | "borrador"
  | "enviado_proveedor"
  | "pagado"
  | "recibido"
  | "cancelado";

export interface PuntoTextilOrder {
  id: string;
  folio: string;
  createdAt: string;
  updatedAt: string;
  totalPieces: number;
  pricingTier: "menudeo" | "mayoreo";
  subtotal: number;
  iva: number;
  total: number;
  notes: string;
  status: PuntoTextilOrderStatus;
  items: PuntoTextilOrderItem[];
}

const ORDERS_FILE_PATH = path.join(process.cwd(), "src", "data", "punto-textil-orders.json");

function ensureFileExists(): PuntoTextilOrder[] {
  try {
    if (!fs.existsSync(ORDERS_FILE_PATH)) {
      const dir = path.dirname(ORDERS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const data = fs.readFileSync(ORDERS_FILE_PATH, "utf-8");
    return JSON.parse(data) as PuntoTextilOrder[];
  } catch (error) {
    console.error("Error reading punto-textil-orders.json:", error);
    return [];
  }
}

function writeOrders(orders: PuntoTextilOrder[]): void {
  try {
    const dir = path.dirname(ORDERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing punto-textil-orders.json:", error);
    throw error;
  }
}

export function getAllOrders(): PuntoTextilOrder[] {
  const orders = ensureFileExists();
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(id: string): PuntoTextilOrder | null {
  const orders = ensureFileExists();
  return orders.find((o) => o.id === id) || null;
}

export function createOrder(
  data: Omit<PuntoTextilOrder, "id" | "folio" | "createdAt" | "updatedAt">
): PuntoTextilOrder {
  const orders = ensureFileExists();
  const year = new Date().getFullYear();
  const nextSeq = orders.length + 1;
  const folio = `PT-${year}-${String(nextSeq).padStart(4, "0")}`;
  const now = new Date().toISOString();

  const newOrder: PuntoTextilOrder = {
    ...data,
    id: `pto_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    folio,
    createdAt: now,
    updatedAt: now,
  };

  orders.unshift(newOrder);
  writeOrders(orders);
  return newOrder;
}

export function updateOrder(
  id: string,
  updates: Partial<PuntoTextilOrder>
): PuntoTextilOrder | null {
  const orders = ensureFileExists();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const updated: PuntoTextilOrder = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  orders[index] = updated;
  writeOrders(orders);
  return updated;
}

export function deleteOrder(id: string): boolean {
  const orders = ensureFileExists();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) return false;
  writeOrders(filtered);
  return true;
}
