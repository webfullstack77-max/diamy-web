"use client";

import { useState } from "react";

export interface ColorItem {
  name_es: string;
  name_en: string;
  hex: string;
  isNew?: boolean;
  isLight?: boolean;
}

export const PLAYERYTEES_COLORS: Record<"410c" | "410d", ColorItem[]> = {
  "410c": [
    { name_es: "Blanco", name_en: "White", hex: "#FFFFFF", isLight: true },
    { name_es: "Natural", name_en: "Natural", hex: "#ECE4D0", isLight: true },
    { name_es: "Amarillo Canario", name_en: "Canary Yellow", hex: "#F9BA15", isLight: true },
    { name_es: "Palo de Rosa", name_en: "Dusty Pink", hex: "#C9828A" },
    { name_es: "Coral", name_en: "Coral", hex: "#E95A62" },
    { name_es: "Naranja", name_en: "Orange", hex: "#F15423" },
    { name_es: "Rojo", name_en: "Red", hex: "#C81824" },
    { name_es: "Marrón / Tinto", name_en: "Maroon", hex: "#601824" },
    { name_es: "Moca", name_en: "Mocha", hex: "#584234" },
    { name_es: "Verde Manzana", name_en: "Kelly Green", hex: "#1DA649" },
    { name_es: "Verde Arrecife", name_en: "Island Reef", hex: "#4EBFA9", isLight: true },
    { name_es: "Verde Militar", name_en: "Military Green", hex: "#414C38" },
    { name_es: "Azul Pacífico", name_en: "Pacific Blue", hex: "#89CDE3", isLight: true },
    { name_es: "Azul Rey", name_en: "Royal Blue", hex: "#15479E" },
    { name_es: "Azul Marino", name_en: "Navy Blue", hex: "#182C4B" },
    { name_es: "Gris Jaspe", name_en: "Sport Grey", hex: "#B5B8B9", isLight: true },
    { name_es: "Carbón", name_en: "Charcoal", hex: "#3E4143" },
    { name_es: "Negro", name_en: "Black", hex: "#1A1A1A" },
    { name_es: "Caqui Safari", name_en: "Desert Khaki", hex: "#C2B294", isNew: true, isLight: true },
    { name_es: "Rosa", name_en: "Pink", hex: "#F3A9C1", isNew: true, isLight: true },
    { name_es: "Fucsia", name_en: "Fuchsia", hex: "#CF2478", isNew: true },
    { name_es: "Púrpura", name_en: "Purple", hex: "#6C2D7E", isNew: true },
    { name_es: "Gris Ceniza", name_en: "Grey Ash", hex: "#686D74", isNew: true },
  ],
  "410d": [
    { name_es: "Blanco", name_en: "White", hex: "#FFFFFF", isLight: true },
    { name_es: "Natural", name_en: "Natural", hex: "#ECE4D0", isLight: true },
    { name_es: "Palo de Rosa", name_en: "Dusty Pink", hex: "#C9828A" },
    { name_es: "Coral", name_en: "Coral", hex: "#E95A62" },
    { name_es: "Naranja", name_en: "Orange", hex: "#F15423" },
    { name_es: "Rojo", name_en: "Red", hex: "#C81824" },
    { name_es: "Marrón / Tinto", name_en: "Maroon", hex: "#601824" },
    { name_es: "Verde Arrecife", name_en: "Island Reef", hex: "#4EBFA9", isLight: true },
    { name_es: "Azul Pacífico", name_en: "Pacific Blue", hex: "#89CDE3", isLight: true },
    { name_es: "Azul Marino", name_en: "Navy Blue", hex: "#182C4B" },
    { name_es: "Gris Jaspe", name_en: "Sport Grey", hex: "#B5B8B9", isLight: true },
    { name_es: "Negro", name_en: "Black", hex: "#1A1A1A" },
    { name_es: "Amarillo Canario", name_en: "Canary Yellow", hex: "#F9BA15", isNew: true, isLight: true },
    { name_es: "Rosa", name_en: "Pink", hex: "#F3A9C1", isNew: true, isLight: true },
    { name_es: "Fucsia", name_en: "Fuchsia", hex: "#CF2478", isNew: true },
    { name_es: "Púrpura", name_en: "Purple", hex: "#6C2D7E", isNew: true },
    { name_es: "Verde Manzana", name_en: "Kelly Green", hex: "#1DA649", isNew: true },
    { name_es: "Azul Rey", name_en: "Royal Blue", hex: "#15479E", isNew: true },
    { name_es: "Moca", name_en: "Mocha", hex: "#584234", isNew: true },
  ],
};

export default function PlayeraColorsSection() {
  const [activeGender, setActiveGender] = useState<"410c" | "410d">("410c");
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);

  const colors = PLAYERYTEES_COLORS[activeGender];

  return (
    <div className="bg-surface-container/80 border border-outline-variant/60 rounded-2xl p-5 mb-8 shadow-xs backdrop-blur-sm transition-all">
      {/* Header con Título y Selectores de Género */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbol" style={{ fontSize: "22px" }}>palette</span>
          </div>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2">
              Colores Disponibles para Playeras
            </h2>
            <p className="text-xs text-on-surface-muted mt-0.5">
              100% Algodón Chifón 185 g/m² • Calidad Premium para Estampado DTF
            </p>
          </div>
        </div>

        {/* Pestañas Caballero / Dama */}
        <div className="flex bg-surface rounded-xl p-1 border border-outline-variant/60 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveGender("410c");
              setSelectedColor(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeGender === "410c"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-muted hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span>👨</span>
            <span>Caballero (23)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveGender("410d");
              setSelectedColor(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeGender === "410d"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-muted hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span>👩</span>
            <span>Dama (19)</span>
          </button>
        </div>
      </div>

      {/* Info Bar del Modelo Activo */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs text-on-surface-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface">
            {activeGender === "410c" ? "Estilo 410C (Caballero):" : "Estilo 410D (Dama):"}
          </span>
          <span>{colors.length} tonos en catálogo</span>
          <span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
          <span>Tallas: {activeGender === "410c" ? "S – 3XL" : "S – 2XL"}</span>
        </div>

        {selectedColor ? (
          <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-full border border-outline-variant/60 shadow-2xs text-on-surface font-medium">
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <span>
              {selectedColor.name_es} <span className="text-outline font-normal">({selectedColor.name_en})</span>
            </span>
            {selectedColor.isNew && (
              <span className="bg-secondary/15 text-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                NUEVO
              </span>
            )}
          </div>
        ) : (
          <span className="text-outline text-[11px] italic">
            Pasa el mouse o toca un color para ver su nombre
          </span>
        )}
      </div>

      {/* Grid de Muestras de Color (Swatches) */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2.5 pt-2">
        {colors.map((color) => {
          const isSelected = selectedColor?.name_es === color.name_es;
          return (
            <button
              key={color.name_es}
              type="button"
              onClick={() => setSelectedColor(color)}
              onMouseEnter={() => setSelectedColor(color)}
              title={`${color.name_es} (${color.name_en})${color.isNew ? " - Nuevo Color" : ""}`}
              className={`group relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? "bg-surface scale-105 shadow-sm ring-2 ring-primary ring-offset-1"
                  : "hover:bg-surface hover:scale-105 hover:shadow-2xs"
              }`}
            >
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-black/15 shadow-2xs flex items-center justify-center transition-transform relative"
                style={{ backgroundColor: color.hex }}
              >
                {color.isNew && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface" />
                )}
                {isSelected && (
                  <span
                    className={`material-symbol text-xs font-bold ${
                      color.isLight ? "text-black/80" : "text-white"
                    }`}
                    style={{ fontSize: "14px" }}
                  >
                    check
                  </span>
                )}
              </div>
              <span className="text-[10px] text-on-surface-muted truncate max-w-full text-center mt-1 group-hover:text-on-surface font-medium">
                {color.name_es.split("/")[0].trim()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
