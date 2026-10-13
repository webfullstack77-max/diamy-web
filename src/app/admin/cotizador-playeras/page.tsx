"use client";

import React, { useState, useEffect } from "react";
import {
  PuntoTextilModel,
  PUNTO_TEXTIL_MODELS,
  calculateUnitPrice,
} from "@/data/punto-textil-catalog";
import { PuntoTextilOrderItem, PuntoTextilOrder } from "@/lib/punto-textil-orders-store";
import ModelCatalogSection from "@/components/admin/cotizador/ModelCatalogSection";
import QuickSizeMatrix from "@/components/admin/cotizador/QuickSizeMatrix";
import ShoppingListTable from "@/components/admin/cotizador/ShoppingListTable";
import OrderHistoryView from "@/components/admin/cotizador/OrderHistoryView";

export default function CotizadorPlayerasAdminPage() {
  const [activeTab, setActiveTab] = useState<"cotizador" | "historial">("cotizador");
  const [selectedModel, setSelectedModel] = useState<PuntoTextilModel>(
    PUNTO_TEXTIL_MODELS[0] || ({} as PuntoTextilModel)
  );

  const [cartItems, setCartItems] = useState<PuntoTextilOrderItem[]>([]);
  const [tierMode, setTierMode] = useState<"auto" | "force_mayoreo" | "force_menudeo">("auto");
  const [historyCount, setHistoryCount] = useState<number>(0);

  // Load draft from localStorage on initial mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("diamy_punto_textil_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load draft from localStorage", e);
    }
  }, []);

  // Save draft to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem("diamy_punto_textil_draft", JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Could not save draft to localStorage", e);
    }
  }, [cartItems]);

  // Fetch count of orders in history
  const refreshHistoryCount = async () => {
    try {
      const res = await fetch("/api/admin/punto-textil/orders");
      if (res.ok) {
        const orders = await res.json();
        setHistoryCount(orders.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshHistoryCount();
  }, []);

  // Total pieces in order
  const totalPieces = cartItems.reduce((acc, it) => acc + it.totalPieces, 0);

  // Determine effective pricing tier
  const pricingTier: "menudeo" | "mayoreo" =
    tierMode === "force_mayoreo"
      ? "mayoreo"
      : tierMode === "force_menudeo"
      ? "menudeo"
      : totalPieces >= 10
      ? "mayoreo"
      : "menudeo";

  // When pricingTier changes, recalculate line totals of existing cart items
  useEffect(() => {
    setCartItems((prevItems) => {
      let changed = false;
      const updated = prevItems.map((item) => {
        const model = PUNTO_TEXTIL_MODELS.find((m) => m.id === item.modelId);
        if (!model) return item;

        const newUnitPrices: Record<string, number> = {};
        let newLineTotal = 0;

        Object.keys(item.sizes).forEach((size) => {
          const uPrice = calculateUnitPrice(model, item.color.name, size, pricingTier);
          newUnitPrices[size] = uPrice;
          newLineTotal += (item.sizes[size] || 0) * uPrice;
        });

        if (newLineTotal !== item.lineTotal) {
          changed = true;
          return {
            ...item,
            unitPrices: newUnitPrices,
            lineTotal: newLineTotal,
          };
        }
        return item;
      });

      return changed ? updated : prevItems;
    });
  }, [pricingTier]);

  const handleAddItem = (newItem: PuntoTextilOrderItem) => {
    setCartItems((prev) => {
      // Check if identical model and color already exists in cart, if so merge sizes
      const existingIdx = prev.findIndex(
        (it) => it.modelId === newItem.modelId && it.color.name === newItem.color.name
      );

      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        const mergedSizes = { ...existing.sizes };
        Object.entries(newItem.sizes).forEach(([sz, qty]) => {
          mergedSizes[sz] = (mergedSizes[sz] || 0) + qty;
        });

        const mergedPieces = Object.values(mergedSizes).reduce((a, b) => a + b, 0);
        const model = PUNTO_TEXTIL_MODELS.find((m) => m.id === existing.modelId);
        let mergedLineTotal = 0;
        const newUnitPrices: Record<string, number> = {};

        if (model) {
          Object.keys(mergedSizes).forEach((size) => {
            const uPrice = calculateUnitPrice(model, existing.color.name, size, pricingTier);
            newUnitPrices[size] = uPrice;
            mergedLineTotal += (mergedSizes[size] || 0) * uPrice;
          });
        }

        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          sizes: mergedSizes,
          totalPieces: mergedPieces,
          unitPrices: newUnitPrices,
          lineTotal: mergedLineTotal,
        };
        return updated;
      }

      return [newItem, ...prev];
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearItems = () => {
    if (confirm("¿Seguro que deseas vaciar la lista de compras actual?")) {
      setCartItems([]);
      localStorage.removeItem("diamy_punto_textil_draft");
    }
  };

  const handleSaveOrderSuccess = (_order: PuntoTextilOrder) => {
    refreshHistoryCount();
  };

  const handleLoadOrderToCart = (order: PuntoTextilOrder) => {
    setCartItems(order.items);
    setActiveTab("cotizador");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-surface rounded-3xl border border-outline-variant p-6 lg:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Punto Textil · Playerytees 2026
              </span>
              <span className="text-xs text-on-surface-muted">Precios IVA incluido</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight font-serif">
              Cotizador & Pedidos de Playeras
            </h1>
            <p className="text-xs lg:text-sm text-on-surface-muted mt-1 max-w-2xl">
              Arma pedidos para tu proveedor Punto Textil, calcula costos de mayoreo y menudeo con las tarifas
              oficiales y exporta órdenes de compra en PDF listas para producción o WhatsApp.
            </p>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex items-center bg-surface-container p-1 rounded-2xl border border-outline-variant shrink-0">
            <button
              onClick={() => setActiveTab("cotizador")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "cotizador"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface hover:text-primary"
              }`}
            >
              <span className="material-symbol text-base">shopping_cart</span>
              Cotizador
              {totalPieces > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center">
                  {totalPieces}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "historial"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface hover:text-primary"
              }`}
            >
              <span className="material-symbol text-base">history</span>
              Historial
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Vista de Cotizador */}
      {activeTab === "cotizador" && (
        <div className="space-y-6">
          {/* Paso 1: Catálogo y Modelos */}
          <ModelCatalogSection
            selectedModel={selectedModel}
            onSelectModel={(model) => setSelectedModel(model)}
          />

          {/* Grid de 2 Columnas: Matriz de Captura (Izq) y Lista de Compras (Der) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Paso 2 y 3: Captura por Color y Talla */}
            <div className="lg:col-span-6 space-y-6">
              <QuickSizeMatrix
                model={selectedModel}
                pricingTier={pricingTier}
                onAddItem={handleAddItem}
              />
            </div>

            {/* Paso 4: Lista de Compras, Totales y Exportación PDF */}
            <div className="lg:col-span-6 space-y-6">
              <ShoppingListTable
                items={cartItems}
                pricingTier={pricingTier}
                tierMode={tierMode}
                onSetTierMode={setTierMode}
                onRemoveItem={handleRemoveItem}
                onClearItems={handleClearItems}
                onSaveOrderSuccess={handleSaveOrderSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Vista de Historial */}
      {activeTab === "historial" && (
        <OrderHistoryView onLoadOrderToCart={handleLoadOrderToCart} />
      )}
    </div>
  );
}
