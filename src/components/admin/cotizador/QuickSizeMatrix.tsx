"use client";

import React, { useState, useEffect } from "react";
import {
  PuntoTextilModel,
  CatalogColor,
  calculateUnitPrice,
} from "@/data/punto-textil-catalog";
import { PuntoTextilOrderItem } from "@/lib/punto-textil-orders-store";

interface Props {
  model: PuntoTextilModel;
  pricingTier: "menudeo" | "mayoreo";
  onAddItem: (item: PuntoTextilOrderItem) => void;
}

export default function QuickSizeMatrix({ model, pricingTier, onAddItem }: Props) {
  // Selected color defaults to first color in model
  const [selectedColor, setSelectedColor] = useState<CatalogColor>(model.colors[0] || { name: "White", hex: "#FFFFFF" });
  
  // Quantities per size: e.g. { S: 0, M: 0, L: 0 }
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Reset when model changes
  useEffect(() => {
    if (model.colors.length > 0) {
      setSelectedColor(model.colors[0]);
    }
    // initialize all sizes to 0
    const initQty: Record<string, number> = {};
    model.sizes.forEach((s) => {
      initQty[s] = 0;
    });
    setQuantities(initQty);
  }, [model]);

  const handleQtyChange = (size: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setQuantities((prev) => ({
      ...prev,
      [size]: num,
    }));
  };

  const incrementQty = (size: string) => {
    setQuantities((prev) => ({
      ...prev,
      [size]: (prev[size] || 0) + 1,
    }));
  };

  const decrementQty = (size: string) => {
    setQuantities((prev) => ({
      ...prev,
      [size]: Math.max(0, (prev[size] || 0) - 1),
    }));
  };

  // Calculations for current matrix entry
  const totalPiecesInMatrix = Object.values(quantities).reduce((a, b) => a + b, 0);

  const unitPrices: Record<string, number> = {};
  let matrixTotalCost = 0;

  model.sizes.forEach((size) => {
    const uPrice = calculateUnitPrice(model, selectedColor.name, size, pricingTier);
    unitPrices[size] = uPrice;
    const qty = quantities[size] || 0;
    matrixTotalCost += qty * uPrice;
  });

  const handleAdd = () => {
    if (totalPiecesInMatrix === 0) return;

    const newItem: PuntoTextilOrderItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      brand: model.brand || "playerytees",
      modelId: model.id,
      styleCode: model.styleCode,
      modelName: model.name,
      category: model.category,
      gender: model.gender,
      cutType: model.cutType,
      color: selectedColor,
      sizes: { ...quantities },
      totalPieces: totalPiecesInMatrix,
      unitPrices: { ...unitPrices },
      lineTotal: matrixTotalCost,
    };

    onAddItem(newItem);

    // Reset quantities after adding
    const resetQty: Record<string, number> = {};
    model.sizes.forEach((s) => {
      resetQty[s] = 0;
    });
    setQuantities(resetQty);
  };

  const isBones = model.brand === "bones";

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant p-4 lg:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant mb-4">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                isBones
                  ? "bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isBones ? "🦴 Bones" : "👕 Playerytees"}
            </span>
            <span className="text-[10px] font-black tracking-wider uppercase text-primary px-2 py-0.5 bg-primary/10 rounded-md">
              {model.styleCode} · {model.gender.toUpperCase()}
            </span>
          </div>
          <h2 className="text-base font-bold text-on-surface mt-1">{model.name}</h2>
          <p className="text-xs text-on-surface-muted mt-0.5">
            {model.composition} · {model.weight} · {model.cutType}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-[11px] text-on-surface-muted block">Empaque por caja:</span>
          <span className="text-xs font-semibold text-on-surface">{model.boxPcs}</span>
        </div>
      </div>

      {/* Selector de Color */}
      <div className="mb-4">
        <label className="text-xs font-bold text-on-surface mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="material-symbol text-primary text-base">palette</span>
            2. Elige el Color ({model.colors.length} disponibles):
          </span>
          <span className="text-xs text-primary font-black">
            {selectedColor.name} {selectedColor.isWhite ? "(Tarifa Blanco)" : "(Tarifa Color)"}
          </span>
        </label>

        {/* Chips de Colores */}
        <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 p-1 bg-surface-container/50 rounded-xl border border-outline-variant">
          {model.colors.map((color) => {
            const isCurrent = selectedColor.name === color.name;
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                  isCurrent
                    ? "bg-surface text-primary border-primary font-bold shadow-xs ring-2 ring-primary/20"
                    : "bg-surface text-on-surface hover:bg-surface-container border-outline-variant/60"
                }`}
                title={color.name}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="truncate max-w-[110px]">{color.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Matriz Rápida de Tallas */}
      <div className="mb-4">
        <label className="text-xs font-bold text-on-surface mb-2 flex items-center gap-1.5">
          <span className="material-symbol text-primary text-base">straighten</span>
          3. Ingresa las Cantidades por Talla:
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
          {model.sizes.map((size) => {
            const qty = quantities[size] || 0;
            const uPrice = unitPrices[size] || 0;

            return (
              <div
                key={size}
                className={`p-2 rounded-xl border flex flex-col items-center justify-between transition ${
                  qty > 0
                    ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30"
                    : "bg-surface-container/30 border-outline-variant"
                }`}
              >
                <div className="text-center w-full">
                  <span className="text-xs font-black text-on-surface block">{size}</span>
                  <span className="text-[10px] text-primary font-bold block mt-0.5">
                    ${uPrice.toFixed(2)}
                  </span>
                </div>

                {/* Controles de Cantidad */}
                <div className="flex items-center justify-between w-full mt-2 gap-1">
                  <button
                    type="button"
                    onClick={() => decrementQty(size)}
                    className="w-6 h-6 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={qty === 0 ? "" : qty}
                    placeholder="0"
                    onChange={(e) => handleQtyChange(size, e.target.value)}
                    className="w-10 text-center font-bold text-xs py-1 bg-surface rounded-md border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => incrementQty(size)}
                    className="w-6 h-6 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de Acción y Subtotal de la Matriz */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-outline-variant bg-surface-container/20 -mx-4 -mb-4 p-4 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-surface px-3 py-1.5 rounded-xl border border-outline-variant">
            <span className="text-[10px] text-on-surface-muted block leading-tight">Piezas seleccionadas:</span>
            <span className="text-sm font-black text-on-surface">{totalPiecesInMatrix} pzas</span>
          </div>
          <div className="bg-surface px-3 py-1.5 rounded-xl border border-outline-variant">
            <span className="text-[10px] text-on-surface-muted block leading-tight">Costo renglón:</span>
            <span className="text-sm font-black text-primary">${matrixTotalCost.toFixed(2)} MXN</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={totalPiecesInMatrix === 0}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            totalPiecesInMatrix > 0
              ? "bg-primary text-on-primary hover:opacity-95 shadow-md active:scale-98 cursor-pointer"
              : "bg-surface-container text-on-surface-muted opacity-50 cursor-not-allowed"
          }`}
        >
          <span className="material-symbol text-lg">add_shopping_cart</span>
          Agregar al Pedido ({totalPiecesInMatrix} pzas)
        </button>
      </div>
    </div>
  );
}
