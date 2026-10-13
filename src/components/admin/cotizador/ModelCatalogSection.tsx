"use client";

import React, { useState, useMemo } from "react";
import {
  PuntoTextilModel,
  PUNTO_TEXTIL_CATEGORIES,
  PUNTO_TEXTIL_MODELS,
  CatalogCategory,
  CatalogGender,
} from "@/data/punto-textil-catalog";

interface Props {
  selectedModel: PuntoTextilModel;
  onSelectModel: (model: PuntoTextilModel) => void;
}

export default function ModelCatalogSection({ selectedModel, onSelectModel }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | "todas">("playeras");
  const [selectedGender, setSelectedGender] = useState<CatalogGender | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    return PUNTO_TEXTIL_MODELS.filter((model) => {
      // Category filter
      if (selectedCategory !== "todas" && model.category !== selectedCategory) {
        return false;
      }
      // Gender filter
      if (selectedGender !== "todos" && model.gender !== selectedGender) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = model.styleCode.toLowerCase().includes(q);
        const matchName = model.name.toLowerCase().includes(q);
        const matchComp = model.composition.toLowerCase().includes(q);
        return matchCode || matchName || matchComp;
      }
      return true;
    });
  }, [selectedCategory, selectedGender, searchQuery]);

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant p-4 lg:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbol text-primary text-xl">view_in_ar</span>
            1. Selecciona Modelo o Prenda
          </h2>
          <p className="text-xs text-on-surface-muted">
            Catálogo oficial Playerytees 2026 ({PUNTO_TEXTIL_MODELS.length} modelos disponibles)
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar (ej. 410, Polo, Gabardina)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-container rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
          />
          <span className="material-symbol absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-muted text-base">
            search
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs de Categorías */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-outline-variant mb-3">
        <button
          onClick={() => setSelectedCategory("todas")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
            selectedCategory === "todas"
              ? "bg-primary text-on-primary font-bold shadow-xs"
              : "text-on-surface-muted hover:bg-surface-container"
          }`}
        >
          <span className="material-symbol text-sm">apps</span>
          Todos ({PUNTO_TEXTIL_MODELS.length})
        </button>
        {PUNTO_TEXTIL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? "bg-primary text-on-primary font-bold shadow-xs"
                : "text-on-surface-muted hover:bg-surface-container"
            }`}
          >
            <span className="material-symbol text-sm">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filtro por Género */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 text-xs">
        <span className="text-on-surface-muted mr-1 font-medium">Corte:</span>
        {[
          { id: "todos", label: "Todos" },
          { id: "caballero", label: "Caballero" },
          { id: "dama", label: "Dama" },
          { id: "kids", label: "Niños / Kids" },
          { id: "unisex", label: "Unisex" },
        ].map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGender(g.id as any)}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedGender === g.id
                ? "bg-surface-container-high text-primary font-bold border border-primary/30"
                : "text-on-surface-muted hover:bg-surface-container"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Grid de Modelos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredModels.map((model) => {
          const isSelected = selectedModel.id === model.id;
          const minMayoreoPrice = model.pricing.standard.white.mayoreo;
          const minColoresPrice = model.pricing.standard.colores.mayoreo;

          return (
            <button
              key={model.id}
              onClick={() => onSelectModel(model)}
              className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between group ${
                isSelected
                  ? "bg-primary/5 border-primary shadow-xs ring-2 ring-primary/20"
                  : "bg-surface hover:bg-surface-container border-outline-variant"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-xs font-black px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    {model.styleCode}
                  </span>
                  <span className="text-[10px] text-on-surface-muted uppercase font-semibold">
                    {model.gender.slice(0, 3)}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-on-surface line-clamp-2 leading-snug">
                  {model.name}
                </h3>
                <p className="text-[10px] text-on-surface-muted mt-1 line-clamp-1">
                  {model.composition}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px]">
                <span className="text-on-surface-muted text-[10px]">
                  {model.colors.length} col.
                </span>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-primary">
                    ${minMayoreoPrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-on-surface-muted block leading-none">
                    mayoreo
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredModels.length === 0 && (
        <div className="py-12 text-center text-on-surface-muted">
          <span className="material-symbol text-3xl mb-1 block">search_off</span>
          <p className="text-sm font-medium">No se encontraron modelos con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
