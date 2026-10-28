"use client";

import React, { useState, useMemo } from "react";
import {
  PuntoTextilModel,
  PUNTO_TEXTIL_CATEGORIES,
  ALL_CATALOG_MODELS,
  BONES_MODELS,
  PUNTO_TEXTIL_MODELS,
  CatalogCategory,
  CatalogGender,
  CatalogBrand,
} from "@/data/punto-textil-catalog";

interface Props {
  selectedModel: PuntoTextilModel;
  onSelectModel: (model: PuntoTextilModel) => void;
  selectedBrand?: CatalogBrand | "todas";
  onSelectBrand?: (brand: CatalogBrand | "todas") => void;
}

export default function ModelCatalogSection({
  selectedModel,
  onSelectModel,
  selectedBrand: propBrand,
  onSelectBrand: propOnSelectBrand,
}: Props) {
  // Brand selection state (internal fallback if not passed as prop)
  const [internalBrand, setInternalBrand] = useState<CatalogBrand | "todas">("bones");
  const selectedBrand = propBrand ?? internalBrand;
  const setSelectedBrand = propOnSelectBrand ?? setInternalBrand;

  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | "todas">("todas");
  const [selectedBonesFabric, setSelectedBonesFabric] = useState<string>("todos");
  const [selectedGender, setSelectedGender] = useState<CatalogGender | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Bones specific fabric groupings
  const BONES_FABRIC_FILTERS = [
    { id: "todos", label: "Todos los Tejidos" },
    { id: "3700", label: "100% Algodón (3700)" },
    { id: "3704", label: "Blend 50/50 (3704)" },
    { id: "3705", label: "Slub (3705)" },
    { id: "3707", label: "Elastano (3707)" },
    { id: "3710", label: "Triblend (3710)" },
    { id: "3706", label: "Rayón (3706U)" },
    { id: "3712", label: "Garment Dye (3712U)" },
    { id: "3725", label: "Pañalero (3725 B)" },
  ];

  const filteredModels = useMemo(() => {
    return ALL_CATALOG_MODELS.filter((model) => {
      // Brand filter
      const modelBrand = model.brand || "playerytees";
      if (selectedBrand !== "todas" && modelBrand !== selectedBrand) {
        return false;
      }

      // Playerytees category filter
      if (selectedBrand === "playerytees") {
        if (selectedCategory !== "todas" && model.category !== selectedCategory) {
          return false;
        }
      }

      // Bones fabric filter
      if (selectedBrand === "bones" && selectedBonesFabric !== "todos") {
        if (!model.styleCode.includes(selectedBonesFabric)) {
          return false;
        }
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
        const matchBrand = (model.brand || "").toLowerCase().includes(q);
        return matchCode || matchName || matchComp || matchBrand;
      }

      return true;
    });
  }, [selectedBrand, selectedCategory, selectedBonesFabric, selectedGender, searchQuery]);

  // When switching brands, make sure active model stays coherent or pick first of brand
  const handleBrandChange = (brand: CatalogBrand | "todas") => {
    setSelectedBrand(brand);
    if (brand === "bones") {
      const firstBones = BONES_MODELS[0];
      if (firstBones && selectedModel.brand !== "bones") {
        onSelectModel(firstBones);
      }
    } else if (brand === "playerytees") {
      const firstPT = PUNTO_TEXTIL_MODELS[0];
      if (firstPT && selectedModel.brand !== "playerytees") {
        onSelectModel(firstPT);
      }
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant p-4 lg:p-5 shadow-xs">
      {/* Brand Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbol text-primary text-xl">view_in_ar</span>
            <h2 className="text-base font-bold text-on-surface">1. Selecciona Marca & Modelo</h2>
          </div>
          <p className="text-xs text-on-surface-muted mt-0.5">
            {selectedBrand === "bones"
              ? "Catálogo Bones Combed Ring Spun 2026 (17 estilos) · Menudeo 1-11 | Mayoreo +12"
              : selectedBrand === "playerytees"
              ? "Catálogo Playerytees 2026 (49 estilos) · Menudeo 1-9 | Mayoreo +10"
              : "Catálogo General Punto Textil (66 estilos disponibles)"}
          </p>
        </div>

        {/* Brand Tabs */}
        <div className="flex items-center bg-surface-container p-1 rounded-xl border border-outline-variant shrink-0">
          <button
            type="button"
            onClick={() => handleBrandChange("bones")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedBrand === "bones"
                ? "bg-stone-900 text-stone-100 shadow-xs dark:bg-stone-100 dark:text-stone-900"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <span>🦴</span>
            <span>Playeras Bones</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/20 text-primary font-black">
              17
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleBrandChange("playerytees")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedBrand === "playerytees"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <span>👕</span>
            <span>Playerytees</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-container-high text-on-surface font-black">
              49
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleBrandChange("todas")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              selectedBrand === "todas"
                ? "bg-surface-container-high text-on-surface shadow-xs font-black"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <span>✨</span>
            <span>Todas (66)</span>
          </button>
        </div>
      </div>

      {/* Sub-Header: Search & Sub-filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        {/* Specific Filters for Bones vs Playerytees */}
        {selectedBrand === "bones" ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {BONES_FABRIC_FILTERS.map((fab) => (
              <button
                key={fab.id}
                type="button"
                onClick={() => setSelectedBonesFabric(fab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedBonesFabric === fab.id
                    ? "bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900 font-bold"
                    : "text-on-surface-muted hover:bg-surface-container"
                }`}
              >
                {fab.label}
              </button>
            ))}
          </div>
        ) : selectedBrand === "playerytees" ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("todas")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === "todas"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-muted hover:bg-surface-container"
              }`}
            >
              Todas ({PUNTO_TEXTIL_MODELS.length})
            </button>
            {PUNTO_TEXTIL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary text-on-primary font-bold shadow-xs"
                    : "text-on-surface-muted hover:bg-surface-container"
                }`}
              >
                <span className="material-symbol text-xs">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-medium text-on-surface-muted">
            Mostrando todos los modelos disponibles de ambas marcas.
          </div>
        )}

        {/* Buscador */}
        <div className="relative w-full md:w-64 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar modelo, código o tela..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-container rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
          />
          <span className="material-symbol absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-muted text-base">
            search
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filtro por Género / Corte */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-xs border-b border-outline-variant/50">
        <span className="text-on-surface-muted mr-1 font-semibold text-[11px]">Corte:</span>
        {[
          { id: "todos", label: "Todos" },
          { id: "caballero", label: "Caballero" },
          { id: "dama", label: "Dama" },
          { id: "kids", label: "Niños / Kids" },
          { id: "unisex", label: "Unisex" },
          { id: "bebe", label: "Bebé / Pañalero" },
        ].map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setSelectedGender(g.id as any)}
            className={`px-2.5 py-0.5 rounded-lg text-xs transition cursor-pointer ${
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
        {filteredModels.map((model) => {
          const isSelected = selectedModel.id === model.id;
          const minMayoreoPrice = model.pricing.standard.white.mayoreo;
          const isBones = model.brand === "bones";

          return (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelectModel(model)}
              className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? "bg-primary/5 border-primary shadow-xs ring-2 ring-primary/20"
                  : "bg-surface hover:bg-surface-container border-outline-variant"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-primary text-on-primary"
                        : isBones
                        ? "bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900"
                        : "bg-surface-container text-on-surface group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    {model.styleCode}
                  </span>
                  <span className="text-[9px] text-on-surface-muted uppercase font-bold tracking-wider">
                    {model.gender === "bebe" ? "BEBÉ" : model.gender.slice(0, 3)}
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
                <span className="text-on-surface-muted text-[10px] font-medium">
                  {model.colors.length} col.
                </span>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-primary">
                    ${minMayoreoPrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-on-surface-muted block leading-none">
                    {isBones ? "+12 mayoreo" : "+10 mayoreo"}
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
