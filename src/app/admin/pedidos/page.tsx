"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type OrderStatus = "PENDING" | "PRODUCTION" | "READY" | "DELIVERED" | "CANCELLED";

interface Payment { id: string; amount: number; method: string; }
interface Order {
  id: string; clientName: string; clientPhone: string | null;
  description: string; totalAmount: number; deliveryDate: string;
  status: OrderStatus; notes: string | null;
  payments: Payment[]; totalPaid: number; balance: number; createdAt: string;
}

interface Stats {
  thisMonth: { total: number; collected: number };
  activeOrders: number; upcomingDeliveries: number;
  dailySales: { date: string; label: string; amount: number }[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Nuevo", PRODUCTION: "En producción", READY: "Listo", DELIVERED: "Entregado", CANCELLED: "Cancelado",
};
const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-blue-100 text-blue-700",
  PRODUCTION: "bg-amber-100 text-amber-700",
  READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-surface-container text-on-surface-muted",
  CANCELLED: "bg-red-100 text-red-500",
};
const TABS: { key: OrderStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todos" }, { key: "PENDING", label: "Nuevos" },
  { key: "PRODUCTION", label: "Producción" }, { key: "READY", label: "Listos" },
  { key: "DELIVERED", label: "Entregados" },
];

function fmt(n: number) { return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0 })}`; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }); }

function isUrgent(deliveryDate: string, status: OrderStatus) {
  if (status === "DELIVERED" || status === "CANCELLED") return false;
  const diff = new Date(deliveryDate).getTime() - Date.now();
  return diff <= 1000 * 60 * 60 * 24 * 2; // 2 días
}

export default function PedidosPage() {
  const [tab, setTab] = useState<OrderStatus | "ALL">("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const url = tab === "ALL" ? "/api/admin/orders" : `/api/admin/orders?status=${tab}`;
    const [ordRes, statsRes] = await Promise.all([fetch(url), fetch("/api/admin/orders/stats")]);
    if (ordRes.ok) setOrders(await ordRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const maxSale = stats ? Math.max(...stats.dailySales.map((d) => d.amount), 1) : 1;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface font-serif">Pedidos</h1>
        <Link
          href="/admin/pedidos/nuevo"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90"
        >
          <span className="material-symbol" style={{ fontSize: 18 }}>add</span>
          Nuevo pedido
        </Link>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
          <button
            onClick={() => setShowStats((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbol text-primary" style={{ fontSize: 18 }}>bar_chart</span>
              Resumen del mes
            </span>
            <span className="material-symbol text-on-surface-muted" style={{ fontSize: 18 }}>
              {showStats ? "expand_less" : "expand_more"}
            </span>
          </button>
          {showStats && (
            <div className="px-4 pb-4 space-y-4 border-t border-outline-variant">
              {/* KPI grid */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                {[
                  { label: "Vendido este mes", value: fmt(stats.thisMonth.total), icon: "trending_up", color: "text-primary" },
                  { label: "Cobrado este mes", value: fmt(stats.thisMonth.collected), icon: "payments", color: "text-green-600" },
                  { label: "Pedidos activos", value: String(stats.activeOrders), icon: "receipt_long", color: "text-amber-600" },
                  { label: "Entregas próximas", value: String(stats.upcomingDeliveries), icon: "schedule", color: "text-red-500" },
                ].map((k) => (
                  <div key={k.label} className="bg-surface-container rounded-xl p-3">
                    <span className={`material-symbol ${k.color}`} style={{ fontSize: 20 }}>{k.icon}</span>
                    <p className="text-xl font-bold text-on-surface mt-1">{k.value}</p>
                    <p className="text-xs text-on-surface-muted">{k.label}</p>
                  </div>
                ))}
              </div>
              {/* Bar chart */}
              <div>
                <p className="text-xs text-on-surface-muted mb-2">Ventas últimos 7 días</p>
                <div className="flex items-end gap-1.5 h-20">
                  {stats.dailySales.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: 56 }}>
                        <div
                          className="w-full rounded-t-sm bg-primary/70"
                          style={{ height: `${Math.max((d.amount / maxSale) * 100, d.amount > 0 ? 4 : 0)}%` }}
                          title={fmt(d.amount)}
                        />
                      </div>
                      <span className="text-xs text-on-surface-muted capitalize">{d.label.replace(".", "")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-none px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              tab === t.key
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-muted hover:bg-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-on-surface-muted text-sm">Cargando...</div>
      ) : orders.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-outline-variant p-8 text-center">
          <span className="material-symbol text-on-surface-muted" style={{ fontSize: 40 }}>inbox</span>
          <p className="text-on-surface-muted text-sm mt-2">Sin pedidos en esta categoría</p>
          <Link href="/admin/pedidos/nuevo" className="inline-flex items-center gap-1 mt-3 text-primary text-sm font-semibold">
            <span className="material-symbol" style={{ fontSize: 16 }}>add</span> Crear pedido
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => {
            const urgent = isUrgent(o.deliveryDate, o.status);
            const pct = o.totalAmount > 0 ? Math.min((o.totalPaid / o.totalAmount) * 100, 100) : 0;
            return (
              <Link
                key={o.id}
                href={`/admin/pedidos/${o.id}`}
                className="block bg-surface rounded-2xl border border-outline-variant hover:border-primary/40 transition overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-on-surface">{o.clientName}</span>
                        {urgent && (
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5">
                            <span className="material-symbol" style={{ fontSize: 12 }}>warning</span>
                            Pronto
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-muted mt-0.5 line-clamp-1">{o.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                      <span className="text-xs text-on-surface-muted">
                        <span className="material-symbol" style={{ fontSize: 12 }}>calendar_today</span>{" "}
                        {fmtDate(o.deliveryDate)}
                      </span>
                    </div>
                  </div>
                  {/* Finance */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 bg-outline-variant/30 rounded-full h-1.5">
                      <div className="bg-primary rounded-full h-1.5" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-on-surface-muted shrink-0">
                      {fmt(o.totalPaid)} / {fmt(o.totalAmount)}
                      {o.balance > 0 && <span className="text-amber-600 ml-1">· resta {fmt(o.balance)}</span>}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
