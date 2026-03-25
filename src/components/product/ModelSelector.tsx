"use client";

import { useState } from "react";
import Image from "next/image";

const PAGE_SIZE = 10;

interface Props {
  images: string[];
  title: string;
  onModelSelect: (modelNumber: number | null) => void;
}

export default function ModelSelector({ images, title, onModelSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(images.length / PAGE_SIZE);
  const pageImages = images.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSelect(globalIndex: number) {
    const modelNumber = globalIndex + 1;
    if (selected === modelNumber) {
      setSelected(null);
      onModelSelect(null);
    } else {
      setSelected(modelNumber);
      onModelSelect(modelNumber);
    }
  }

  function goToPage(p: number) {
    setPage(Math.max(0, Math.min(p, totalPages - 1)));
  }

  // Si el modelo seleccionado no está en la página actual, saltar a su página
  function handleSelectAndJump(globalIndex: number) {
    const targetPage = Math.floor(globalIndex / PAGE_SIZE);
    if (targetPage !== page) setPage(targetPage);
    handleSelect(globalIndex);
  }

  const mainImage = selected ? images[selected - 1] : images[0];

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-container border border-outline-variant">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={selected ? `${title} — Modelo #${selected}` : title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbol text-outline" style={{ fontSize: "64px" }}>image</span>
          </div>
        )}
        {selected && (
          <div className="absolute top-3 left-3 bg-primary text-on-primary text-xs font-bold px-2.5 py-1 rounded-full shadow">
            Modelo #{selected}
          </div>
        )}
      </div>

      {/* Selector de modelos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-on-surface">
            {selected
              ? <span>Seleccionaste: <span className="text-primary font-semibold">Modelo #{selected}</span> — toca otro para cambiar</span>
              : "Elige tu modelo:"}
          </p>
          {totalPages > 1 && (
            <span className="text-xs text-outline">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, images.length)} de {images.length}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {pageImages.map((img, i) => {
            const globalIndex = page * PAGE_SIZE + i;
            const modelNum = globalIndex + 1;
            const isActive = selected === modelNum;
            return (
              <button
                key={globalIndex}
                type="button"
                onClick={() => handleSelectAndJump(globalIndex)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                  isActive
                    ? "border-primary scale-105 shadow-md"
                    : "border-outline-variant hover:border-primary/50"
                }`}
              >
                <Image
                  src={img}
                  alt={`Modelo ${modelNum}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <div className={`absolute bottom-0 inset-x-0 py-0.5 text-center text-xs font-bold ${
                  isActive ? "bg-primary text-on-primary" : "bg-black/40 text-white"
                }`}>
                  #{modelNum}
                </div>
              </button>
            );
          })}
        </div>

        {/* Paginador */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-outline-variant text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
            >
              <span className="material-symbol" style={{ fontSize: "16px" }}>chevron_left</span>
              Anterior
            </button>

            {/* Puntos de página */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`w-2 h-2 rounded-full transition-all duration-150 ${
                    p === page ? "bg-primary w-4" : "bg-outline-variant hover:bg-outline"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-outline-variant text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
            >
              Siguiente
              <span className="material-symbol" style={{ fontSize: "16px" }}>chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
