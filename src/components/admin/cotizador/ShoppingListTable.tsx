"use client";

import React, { useState } from "react";
import { PuntoTextilOrderItem, PuntoTextilOrder } from "@/lib/punto-textil-orders-store";
import { downloadPuntoTextilPdf, formatOrderForWhatsApp } from "@/lib/generate-punto-textil-pdf";

interface Props {
  items: PuntoTextilOrderItem[];
  pricingTier: "menudeo" | "mayoreo";
  tierMode: "auto" | "force_mayoreo" | "force_menudeo";
  onSetTierMode: (mode: "auto" | "force_mayoreo" | "force_menudeo") => void;
  onRemoveItem: (id: string) => void;
  onClearItems: () => void;
  onSaveOrderSuccess?: (savedOrder: PuntoTextilOrder) => void;
}

export default function ShoppingListTable({
  items,
  pricingTier,
  tierMode,
  onSetTierMode,
  onRemoveItem,
  onClearItems,
  onSaveOrderSuccess,
}: Props) {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalPieces = items.reduce((acc, it) => acc + it.totalPieces, 0);
  const totalCost = items.reduce((acc, it) => acc + it.lineTotal, 0);

  // Since prices already include 16% IVA:
  // Subtotal = Total / 1.16, IVA = Total - Subtotal
  const subtotal = totalCost / 1.16;
  const iva = totalCost - subtotal;

  // Concentrated size breakdown
  const sizeTotals: Record<string, number> = {};
  items.forEach((it) => {
    Object.entries(it.sizes).forEach(([sz, qty]) => {
      if (qty > 0) {
        sizeTotals[sz] = (sizeTotals[sz] || 0) + qty;
      }
    });
  });

  // Build temporary order object for PDF & WhatsApp
  const currentOrder: PuntoTextilOrder = {
    id: `temp_${Date.now()}`,
    folio: `PT-${new Date().getFullYear()}-TEMP`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalPieces,
    pricingTier,
    subtotal,
    iva,
    total: totalCost,
    notes,
    status: "borrador",
    items,
  };

  const handleDownloadPdf = () => {
    if (items.length === 0) return;
    downloadPuntoTextilPdf(currentOrder);
    showToast("¡PDF generado y descargado con éxito!");
  };

  const handleCopyWhatsApp = () => {
    if (items.length === 0) return;
    const text = formatOrderForWhatsApp(currentOrder);
    navigator.clipboard.writeText(text);
    showToast("¡Pedido copiado al portapapeles listo para WhatsApp!");
  };

  const handleSaveOrder = async () => {
    if (items.length === 0) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/punto-textil/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalPieces,
          pricingTier,
          subtotal,
          iva,
          total: totalCost,
          notes,
          status: "borrador",
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo guardar el pedido");
      }

      const saved: PuntoTextilOrder = await res.json();
      showToast(`¡Pedido guardado con Folio ${saved.folio}!`);
      if (onSaveOrderSuccess) {
        onSaveOrderSuccess(saved);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error al guardar en el servidor");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant p-4 lg:p-5 shadow-xs flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-surface px-4 py-3 rounded-xl shadow-lg border border-outline-variant text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="material-symbol text-primary text-base">check_circle</span>
          {toastMessage}
        </div>
      )}

      <div>
        {/* Encabezado del Carrito */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant mb-4">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbol text-primary text-xl">shopping_cart</span>
              4. Lista de Compras / Pedido Textil
            </h2>
            <p className="text-xs text-on-surface-muted">
              {items.length === 0
                ? "No hay prendas en la lista todavía"
                : `${items.length} modelo(s) agregados · ${totalPieces} piezas en total`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearItems}
              className="text-xs text-error hover:bg-error/10 px-2.5 py-1 rounded-lg transition self-start sm:self-auto flex items-center gap-1 font-semibold"
            >
              <span className="material-symbol text-sm">delete_sweep</span>
              Vaciar Lista
            </button>
          )}
        </div>

        {/* Banner de Estado de Mayoreo */}
        <div className="mb-4 p-3 rounded-xl border transition bg-surface-container/40 border-outline-variant">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                  pricingTier === "mayoreo"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                }`}
              >
                <span className="material-symbol text-lg">
                  {pricingTier === "mayoreo" ? "verified" : "storefront"}
                </span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface">
                    Tarifa aplicada:{" "}
                    <span
                      className={`uppercase font-black ${
                        pricingTier === "mayoreo" ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {pricingTier}
                    </span>
                  </span>
                  <span className="text-[10px] text-on-surface-muted">
                    ({totalPieces} de {items.some((it) => it.brand === "bones") ? 12 : 10} piezas mínimas)
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-muted">
                  {pricingTier === "mayoreo"
                    ? `¡Excelente! Tu pedido califica para mayoreo en Punto Textil (${
                        items.some((it) => it.brand === "bones") ? "12+ piezas para Bones" : "10+ piezas"
                      }).`
                    : `Llevas ${totalPieces} piezas. Te faltan ${Math.max(
                        0,
                        (items.some((it) => it.brand === "bones") ? 12 : 10) - totalPieces
                      )} pieza(s) para activar precios de Mayoreo (${
                        items.some((it) => it.brand === "bones") ? "12+ pzas en Bones" : "10+ pzas"
                      }).`}
                </p>
              </div>
            </div>

            {/* Selector de Forzar Tarifa */}
            <div className="flex items-center gap-1 self-end sm:self-auto text-[11px]">
              <span className="text-on-surface-muted mr-1 font-medium">Modo:</span>
              <button
                type="button"
                onClick={() => onSetTierMode("auto")}
                className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                  tierMode === "auto"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                Auto ({items.some((it) => it.brand === "bones") ? "12+" : "10+"})
              </button>
              <button
                type="button"
                onClick={() => onSetTierMode("force_mayoreo")}
                className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                  tierMode === "force_mayoreo"
                    ? "bg-emerald-600 text-white"
                    : "bg-surface-container text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                Mayoreo
              </button>
              <button
                type="button"
                onClick={() => onSetTierMode("force_menudeo")}
                className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                  tierMode === "force_menudeo"
                    ? "bg-amber-600 text-white"
                    : "bg-surface-container text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                Menudeo
              </button>
            </div>
          </div>

          {/* Barra de Progreso de Mayoreo */}
          {tierMode === "auto" && (
            <div className="mt-2.5 w-full bg-outline-variant/40 rounded-full h-1.5 overflow-hidden">
              {(() => {
                const target = items.some((it) => it.brand === "bones") ? 12 : 10;
                return (
                  <div
                    className={`h-full transition-all duration-300 ${
                      totalPieces >= target ? "bg-emerald-500" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, (totalPieces / target) * 100)}%` }}
                  />
                );
              })()}
            </div>
          )}
        </div>

        {/* Tabla de Artículos */}
        {items.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-outline-variant rounded-2xl text-center text-on-surface-muted">
            <span className="material-symbol text-4xl mb-2 block text-outline">add_shopping_cart</span>
            <p className="text-sm font-semibold">Tu lista de compras está vacía.</p>
            <p className="text-xs text-on-surface-muted mt-1 max-w-sm mx-auto">
              Selecciona un modelo arriba, elige el color, ingresa las cantidades por talla y agrégalas al pedido.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-outline-variant rounded-xl mb-4 max-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container text-on-surface font-bold border-b border-outline-variant sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Modelo / Color</th>
                  <th className="py-2.5 px-3">Desglose Tallas</th>
                  <th className="py-2.5 px-3 text-center">Pzas</th>
                  <th className="py-2.5 px-3 text-right">Importe</th>
                  <th className="py-2.5 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {items.map((it) => {
                  const sizesFormatted = Object.entries(it.sizes)
                    .filter(([_, q]) => q > 0)
                    .map(([s, q]) => (
                      <span
                        key={s}
                        className="inline-block bg-surface-container px-1.5 py-0.5 rounded text-[10px] font-bold mr-1 mb-0.5 text-on-surface"
                      >
                        {s}: <span className="text-primary">{q}</span>
                      </span>
                    ));

                  return (
                    <tr key={it.id} className="hover:bg-surface-container/30 transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: it.color.hex }}
                          />
                          <div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span
                                className={`text-[9px] font-black uppercase px-1 py-0.2 rounded leading-tight ${
                                  it.brand === "bones"
                                    ? "bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {it.brand === "bones" ? "Bones" : "PT"}
                              </span>
                              <span className="font-extrabold text-on-surface">
                                [{it.styleCode}]
                              </span>
                            </div>
                            <span className="font-medium text-on-surface text-xs block leading-tight mt-0.5">
                              {it.modelName}
                            </span>
                            <span className="block text-[10px] text-on-surface-muted">
                              Color: {it.color.name} · {it.gender.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{sizesFormatted}</td>
                      <td className="py-2.5 px-3 text-center font-black text-on-surface whitespace-nowrap">
                        {it.totalPieces} pzas
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-primary whitespace-nowrap">
                        ${it.lineTotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(it.id)}
                          className="w-6 h-6 rounded-md hover:bg-error/10 text-on-surface-muted hover:text-error transition flex items-center justify-center"
                          title="Eliminar este renglón"
                        >
                          <span className="material-symbol text-base">close</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Concentrado por Tallas (si hay items) */}
        {items.length > 0 && Object.keys(sizeTotals).length > 0 && (
          <div className="mb-4 p-3 bg-surface-container/20 rounded-xl border border-outline-variant">
            <span className="text-[11px] font-bold text-on-surface-muted uppercase block mb-1.5">
              Concentrado de Prendas por Talla:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(sizeTotals).map(([sz, qty]) => (
                <div
                  key={sz}
                  className="px-2.5 py-1 bg-surface rounded-lg border border-outline-variant text-xs flex items-center gap-1.5"
                >
                  <span className="font-black text-on-surface">{sz}:</span>
                  <span className="font-bold text-primary">{qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas u observaciones */}
        {items.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-on-surface-muted mb-1 block">
              Notas u observaciones para el pedido / taller:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Recoger en sucursal centro / Pedido para uniformes evento sábado..."
              className="w-full px-3 py-1.5 text-xs bg-surface-container rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
            />
          </div>
        )}
      </div>

      {/* Resumen Financiero y Botones de Acción */}
      {items.length > 0 && (
        <div className="pt-3 border-t border-outline-variant">
          <div className="bg-surface-container/50 p-3 rounded-xl border border-outline-variant mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-muted block">
                Total Prendas: <strong className="text-on-surface">{totalPieces} pzas</strong>
              </span>
              <span className="text-[10px] text-on-surface-muted block">
                Subtotal aprox: ${subtotal.toFixed(2)} · IVA (16% inc.): ${iva.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-on-surface-muted uppercase font-bold block">
                Total Estimado (IVA Inc.)
              </span>
              <span className="text-lg lg:text-xl font-black text-primary">
                ${totalCost.toFixed(2)} MXN
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold transition hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbol text-base">picture_as_pdf</span>
              Descargar PDF
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="px-3 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold transition hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbol text-base">chat</span>
              Copiar WhatsApp
            </button>

            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={isSaving}
              className="px-3 py-2.5 bg-surface-container-high text-on-surface hover:bg-outline-variant/30 rounded-xl text-xs font-bold transition border border-outline-variant flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbol text-base">save</span>
              {isSaving ? "Guardando..." : "Guardar en Historial"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
