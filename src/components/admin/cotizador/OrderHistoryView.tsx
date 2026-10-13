"use client";

import React, { useState, useEffect } from "react";
import { PuntoTextilOrder, PuntoTextilOrderStatus } from "@/lib/punto-textil-orders-store";
import { downloadPuntoTextilPdf, formatOrderForWhatsApp } from "@/lib/generate-punto-textil-pdf";

interface Props {
  onLoadOrderToCart: (order: PuntoTextilOrder) => void;
}

const STATUS_LABELS: Record<PuntoTextilOrderStatus, { label: string; bg: string; text: string }> = {
  borrador: { label: "Borrador", bg: "bg-slate-100", text: "text-slate-700" },
  enviado_proveedor: { label: "Enviado a Proveedor", bg: "bg-blue-100", text: "text-blue-800" },
  pagado: { label: "Pagado / En Proceso", bg: "bg-amber-100", text: "text-amber-800" },
  recibido: { label: "Recibido en Taller", bg: "bg-emerald-100", text: "text-emerald-800" },
  cancelado: { label: "Cancelado", bg: "bg-red-100", text: "text-red-800" },
};

export default function OrderHistoryView({ onLoadOrderToCart }: Props) {
  const [orders, setOrders] = useState<PuntoTextilOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PuntoTextilOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/punto-textil/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: PuntoTextilOrderStatus) => {
    try {
      const res = await fetch(`/api/admin/punto-textil/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        if (selectedOrder?.id === id) {
          setSelectedOrder(updated);
        }
        showToast("Estado actualizado correctamente");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar estado");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este pedido del historial?")) return;
    try {
      const res = await fetch(`/api/admin/punto-textil/orders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        if (selectedOrder?.id === id) setSelectedOrder(null);
        showToast("Pedido eliminado del historial");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al eliminar pedido");
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant p-4 lg:p-6 shadow-xs">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-surface px-4 py-3 rounded-xl shadow-lg border border-outline-variant text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="material-symbol text-primary text-base">check_circle</span>
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant mb-6">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbol text-primary text-xl">history</span>
            Historial de Pedidos Punto Textil
          </h2>
          <p className="text-xs text-on-surface-muted">
            Registro de todas las órdenes de compra generadas para tu proveedor
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 text-xs font-semibold bg-surface-container hover:bg-surface-container-high rounded-xl border border-outline-variant transition flex items-center gap-1.5 text-on-surface self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbol text-sm">refresh</span>
          Actualizar Historial
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-on-surface-muted">
          <span className="material-symbol text-3xl animate-spin mb-2 block">progress_activity</span>
          <p className="text-xs font-semibold">Cargando pedidos guardados...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 border-2 border-dashed border-outline-variant rounded-2xl text-center text-on-surface-muted">
          <span className="material-symbol text-4xl mb-2 block text-outline">inventory</span>
          <p className="text-sm font-semibold">Aún no hay pedidos en el historial.</p>
          <p className="text-xs text-on-surface-muted mt-1 max-w-sm mx-auto">
            Cuando armes una cotización y hagas clic en &quot;Guardar en Historial&quot;, aparecerá aquí registrada para seguimiento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lista de Pedidos */}
          <div className="lg:col-span-7 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {orders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              const statusCfg = STATUS_LABELS[ord.status] || STATUS_LABELS.borrador;
              const dateStr = new Date(ord.createdAt).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-primary/5 border-primary shadow-xs ring-2 ring-primary/20"
                      : "bg-surface hover:bg-surface-container border-outline-variant"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {ord.folio}
                      </span>
                      <span className="text-xs text-on-surface-muted">{dateStr}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-on-surface block">
                        {ord.totalPieces} prendas
                      </span>
                      <span className="text-[10px] text-on-surface-muted">
                        Tarifa: {ord.pricingTier.toUpperCase()} · {ord.items.length} modelos
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-primary block">
                        ${ord.total.toFixed(2)} MXN
                      </span>
                      <span className="text-[10px] text-on-surface-muted">IVA incluido</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel de Detalle del Pedido Seleccionado */}
          <div className="lg:col-span-5 bg-surface-container/30 border border-outline-variant rounded-2xl p-4 lg:p-5 flex flex-col justify-between">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                  <div>
                    <span className="font-mono font-black text-sm text-primary block">
                      {selectedOrder.folio}
                    </span>
                    <span className="text-[11px] text-on-surface-muted">
                      {new Date(selectedOrder.createdAt).toLocaleString("es-MX")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="w-8 h-8 rounded-lg hover:bg-error/10 text-on-surface-muted hover:text-error transition flex items-center justify-center cursor-pointer"
                    title="Eliminar pedido"
                  >
                    <span className="material-symbol text-base">delete</span>
                  </button>
                </div>

                {/* Cambio de Estado */}
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">
                    Estado del Pedido:
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleUpdateStatus(selectedOrder.id, e.target.value as PuntoTextilOrderStatus)
                    }
                    className="w-full text-xs font-semibold py-1.5 px-2.5 bg-surface rounded-xl border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="borrador">Borrador</option>
                    <option value="enviado_proveedor">Enviado a Proveedor</option>
                    <option value="pagado">Pagado / En Proceso</option>
                    <option value="recibido">Recibido en Taller</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                {/* Resumen de contenido */}
                <div className="bg-surface rounded-xl p-3 border border-outline-variant space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-muted">Total de prendas:</span>
                    <strong className="text-on-surface">{selectedOrder.totalPieces} pzas</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-muted">Tarifa aplicada:</span>
                    <strong className="text-on-surface uppercase">
                      {selectedOrder.pricingTier}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-muted">Subtotal:</span>
                    <span className="text-on-surface">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-muted">IVA (16% inc.):</span>
                    <span className="text-on-surface">${selectedOrder.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-outline-variant font-black text-sm">
                    <span className="text-on-surface">Total:</span>
                    <span className="text-primary">${selectedOrder.total.toFixed(2)} MXN</span>
                  </div>
                </div>

                {/* Notas */}
                {selectedOrder.notes && (
                  <div className="p-2.5 bg-surface rounded-xl border border-outline-variant text-xs">
                    <span className="font-bold text-on-surface-muted block mb-0.5 text-[10px] uppercase">
                      Notas del Pedido:
                    </span>
                    <p className="text-on-surface">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Lista de Modelos en el Pedido */}
                <div>
                  <span className="text-xs font-bold text-on-surface block mb-1.5">
                    Prendas en la orden ({selectedOrder.items.length}):
                  </span>
                  <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1 text-xs">
                    {selectedOrder.items.map((it) => (
                      <div
                        key={it.id}
                        className="p-2 bg-surface rounded-lg border border-outline-variant/60 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: it.color.hex }}
                          />
                          <span className="truncate">
                            <strong>[{it.styleCode}]</strong> {it.modelName} ({it.color.name})
                          </span>
                        </div>
                        <span className="font-black text-primary ml-2 shrink-0">
                          {it.totalPieces} pzas
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => downloadPuntoTextilPdf(selectedOrder)}
                      className="px-3 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold transition hover:opacity-95 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbol text-base">picture_as_pdf</span>
                      Re-descargar PDF
                    </button>

                    <button
                      onClick={() => {
                        const txt = formatOrderForWhatsApp(selectedOrder);
                        navigator.clipboard.writeText(txt);
                        showToast("¡Pedido copiado para WhatsApp!");
                      }}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold transition hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbol text-base">chat</span>
                      Copiar WhatsApp
                    </button>
                  </div>

                  <button
                    onClick={() => onLoadOrderToCart(selectedOrder)}
                    className="w-full py-2 bg-surface hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface border border-outline-variant transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbol text-base">sync</span>
                    Cargar de nuevo en el Cotizador
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-on-surface-muted my-auto">
                <span className="material-symbol text-3xl mb-1 block">info</span>
                <p className="text-xs font-semibold">
                  Selecciona un pedido de la lista para ver su detalle, descargar su PDF o pasarlo a WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
