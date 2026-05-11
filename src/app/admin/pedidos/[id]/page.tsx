"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

type OrderStatus = "PENDING" | "PRODUCTION" | "READY" | "DELIVERED" | "CANCELLED";
type PaymentMethod = "CASH" | "TRANSFER" | "CARD" | "OTHER";

interface Payment {
  id: string; amount: number; method: PaymentMethod;
  receiptUrl: string | null; note: string | null; createdAt: string;
}
interface Order {
  id: string; clientName: string; clientPhone: string | null;
  description: string; totalAmount: number; deliveryDate: string;
  status: OrderStatus; notes: string | null;
  payments: Payment[]; totalPaid: number; balance: number;
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "PENDING", label: "Nuevo", icon: "pending" },
  { key: "PRODUCTION", label: "Producción", icon: "manufacturing" },
  { key: "READY", label: "Listo", icon: "inventory" },
  { key: "DELIVERED", label: "Entregado", icon: "check_circle" },
];
const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "PRODUCTION", PRODUCTION: "READY", READY: "DELIVERED", DELIVERED: null, CANCELLED: null,
};
const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Efectivo", TRANSFER: "Transferencia", CARD: "Tarjeta", OTHER: "Otro",
};
const METHOD_ICON: Record<PaymentMethod, string> = {
  CASH: "payments", TRANSFER: "swap_horiz", CARD: "credit_card", OTHER: "more_horiz",
};

function fmt(n: number) { return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0 })}`; }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
}

export default function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [waCopied, setWaCopied] = useState(false);
  // Payment form
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("TRANSFER");
  const [payNote, setPayNote] = useState("");
  const [payReceipt, setPayReceipt] = useState("");
  const [payUploading, setPayUploading] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [deletingPayId, setDeletingPayId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/orders/${id}`);
    if (res.ok) setOrder(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleAdvance() {
    if (!order) return;
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setAdvancing(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await load();
    setAdvancing(false);
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar este pedido?")) return;
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    await load();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este pedido permanentemente?")) return;
    setDeleting(true);
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    router.push("/admin/pedidos");
  }

  async function handleUploadReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPayUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) { const d = await res.json(); setPayReceipt(d.url); }
    setPayUploading(false);
  }

  async function handleAddPayment() {
    if (!payAmount || !order) return;
    setPayBusy(true);
    await fetch(`/api/admin/orders/${id}/payments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(payAmount), method: payMethod, receiptUrl: payReceipt || null, note: payNote || null }),
    });
    setPayAmount(""); setPayNote(""); setPayReceipt("");
    if (fileRef.current) fileRef.current.value = "";
    await load();
    setPayBusy(false);
  }

  async function handleDeletePayment(payId: string) {
    if (!confirm("¿Eliminar este pago?")) return;
    setDeletingPayId(payId);
    await fetch(`/api/admin/payments/${payId}`, { method: "DELETE" });
    await load();
    setDeletingPayId(null);
  }

  function buildWaMessage() {
    if (!order) return "";
    const statusMsg = order.status === "READY" ? "¡ya está listo para entrega!" : "está en proceso de elaboración.";
    return `¡Hola ${order.clientName}! 👋

Tu pedido en Diamy Laser Cut ${statusMsg}

📦 ${order.description}
📅 Fecha de entrega: ${fmtDate(order.deliveryDate)}
💰 Total: ${fmt(order.totalAmount)} MXN${order.totalPaid > 0 ? `\n✅ Anticipo recibido: ${fmt(order.totalPaid)} MXN` : ""}${order.balance > 0 ? `\n💳 Saldo pendiente: ${fmt(order.balance)} MXN` : ""}

¡Muchas gracias por tu confianza! ✨`;
  }

  async function handleCopyWa() {
    await navigator.clipboard.writeText(buildWaMessage());
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2000);
  }

  if (loading) return <div className="flex justify-center py-16 text-on-surface-muted">Cargando...</div>;
  if (!order) return <div className="p-8 text-on-surface-muted">Pedido no encontrado.</div>;

  const pct = order.totalAmount > 0 ? Math.min((order.totalPaid / order.totalAmount) * 100, 100) : 0;
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/pedidos" className="text-on-surface-muted hover:text-on-surface">
          <span className="material-symbol" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-on-surface font-serif truncate">{order.clientName}</h1>
          {order.clientPhone && (
            <a href={`tel:${order.clientPhone}`} className="text-xs text-primary flex items-center gap-1">
              <span className="material-symbol" style={{ fontSize: 14 }}>phone</span>{order.clientPhone}
            </a>
          )}
        </div>
      </div>

      {/* Status pipeline */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-4 space-y-3">
        <div className="flex items-center gap-1">
          {STATUS_STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  i < currentStepIdx ? "bg-primary/20 text-primary" :
                  i === currentStepIdx ? "bg-primary text-on-primary" :
                  "bg-outline-variant/40 text-on-surface-muted"
                }`}>
                  <span className="material-symbol" style={{ fontSize: 16 }}>{step.icon}</span>
                </div>
                <span className="text-xs text-on-surface-muted whitespace-nowrap">{step.label}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStepIdx ? "bg-primary/40" : "bg-outline-variant/30"}`} />
              )}
            </div>
          ))}
        </div>
        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
          <div className="flex gap-2">
            {nextStatus && (
              <button
                onClick={handleAdvance} disabled={advancing}
                className="flex-1 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <span className="material-symbol" style={{ fontSize: 16 }}>arrow_forward</span>
                Marcar como {STATUS_STEPS.find((s) => s.key === nextStatus)?.label}
              </button>
            )}
            <button
              onClick={handleCancel}
              className="px-3 py-2 rounded-xl border border-outline-variant text-sm text-on-surface-muted hover:bg-surface-container"
            >
              Cancelar
            </button>
          </div>
        )}
        {order.status === "CANCELLED" && (
          <p className="text-xs text-red-500 text-center">Pedido cancelado</p>
        )}
      </div>

      {/* Resumen financiero */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-4 space-y-2">
        <h2 className="text-sm font-semibold text-on-surface">Resumen financiero</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-outline-variant/30 rounded-full h-2">
            <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-on-surface-muted shrink-0">{Math.round(pct)}%</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-container rounded-xl p-2">
            <p className="text-xs text-on-surface-muted">Total</p>
            <p className="text-sm font-bold text-on-surface">{fmt(order.totalAmount)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-2">
            <p className="text-xs text-green-700">Pagado</p>
            <p className="text-sm font-bold text-green-700">{fmt(order.totalPaid)}</p>
          </div>
          <div className={`rounded-xl p-2 ${order.balance > 0 ? "bg-amber-50" : "bg-surface-container"}`}>
            <p className={`text-xs ${order.balance > 0 ? "text-amber-700" : "text-on-surface-muted"}`}>Resta</p>
            <p className={`text-sm font-bold ${order.balance > 0 ? "text-amber-700" : "text-on-surface-muted"}`}>{fmt(order.balance)}</p>
          </div>
        </div>
      </div>

      {/* Pagos */}
      <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
        <h2 className="text-sm font-semibold text-on-surface px-4 py-3 border-b border-outline-variant">
          Pagos registrados
        </h2>
        {order.payments.length === 0 ? (
          <p className="text-xs text-on-surface-muted px-4 py-3">Sin pagos registrados aún.</p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {order.payments.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-primary/10`}>
                  <span className="material-symbol text-primary" style={{ fontSize: 16 }}>{METHOD_ICON[p.method]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{fmt(p.amount)}</p>
                  <p className="text-xs text-on-surface-muted">
                    {METHOD_LABEL[p.method]}
                    {p.note && ` · ${p.note}`}
                    {" · "}{new Date(p.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                {p.receiptUrl && (
                  <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-primary hover:opacity-70">
                    <span className="material-symbol" style={{ fontSize: 18 }}>image</span>
                  </a>
                )}
                <button
                  onClick={() => handleDeletePayment(p.id)}
                  disabled={deletingPayId === p.id}
                  className="text-on-surface-muted hover:text-error disabled:opacity-40"
                >
                  <span className="material-symbol" style={{ fontSize: 18 }}>
                    {deletingPayId === p.id ? "hourglass_empty" : "delete"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Agregar pago */}
        <div className="border-t border-outline-variant px-4 py-4 space-y-3 bg-surface-container/30">
          <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wide">Registrar pago</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-sm">$</span>
              <input
                type="number" min="1" step="0.01" placeholder="Monto" value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["CASH", "TRANSFER", "CARD", "OTHER"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setPayMethod(m)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  payMethod === m ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface-muted hover:bg-surface"
                }`}
              >
                <span className="material-symbol" style={{ fontSize: 14 }}>{METHOD_ICON[m]}</span>
                {METHOD_LABEL[m]}
              </button>
            ))}
          </div>
          <input
            type="text" placeholder="Nota (opcional)" value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUploadReceipt} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={payUploading}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                payReceipt ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface-muted hover:bg-surface"
              }`}
            >
              <span className="material-symbol" style={{ fontSize: 16 }}>{payReceipt ? "check" : "attach_file"}</span>
              {payUploading ? "Subiendo..." : payReceipt ? "Comprobante listo" : "Comprobante"}
            </button>
            <button
              onClick={handleAddPayment}
              disabled={payBusy || !payAmount}
              className="flex-1 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <span className="material-symbol" style={{ fontSize: 16 }}>{payBusy ? "hourglass_empty" : "add"}</span>
              {payBusy ? "Guardando..." : "Registrar pago"}
            </button>
          </div>
        </div>
      </div>

      {/* Descripción y notas */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Descripción</p>
          <p className="text-sm text-on-surface">{order.description}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Fecha de entrega</p>
          <p className="text-sm text-on-surface">{fmtDate(order.deliveryDate)}</p>
        </div>
        {order.notes && (
          <div>
            <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Notas internas</p>
            <p className="text-sm text-on-surface-muted">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={() => setWaOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition"
        >
          <span className="material-symbol text-green-600" style={{ fontSize: 18 }}>chat</span>
          Mensaje para cliente
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2.5 rounded-xl border border-outline-variant text-sm text-error hover:bg-error/10 transition disabled:opacity-40"
        >
          <span className="material-symbol" style={{ fontSize: 18 }}>{deleting ? "hourglass_empty" : "delete"}</span>
        </button>
      </div>

      {/* Modal WA */}
      {waOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setWaOpen(false)}>
          <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
              <h3 className="font-semibold text-on-surface text-sm flex items-center gap-2">
                <span className="material-symbol text-green-600" style={{ fontSize: 18 }}>chat</span>
                Mensaje para WhatsApp
              </h3>
              <button onClick={() => setWaOpen(false)} className="text-on-surface-muted hover:text-on-surface">
                <span className="material-symbol" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <pre className="px-4 py-3 text-sm text-on-surface whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-auto">
              {buildWaMessage()}
            </pre>
            <div className="px-4 pb-4">
              <button
                onClick={handleCopyWa}
                className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2"
              >
                <span className="material-symbol" style={{ fontSize: 16 }}>{waCopied ? "check" : "content_copy"}</span>
                {waCopied ? "¡Copiado!" : "Copiar mensaje"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
