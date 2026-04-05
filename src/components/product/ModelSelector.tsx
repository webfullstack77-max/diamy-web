"use client";

import { useState } from "react";
import Image from "next/image";

function isVideo(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm">
          <span className="material-symbol" style={{ fontSize: "20px" }}>close</span>
          Cerrar
        </button>
        <video src={src} controls autoPlay className="w-full rounded-2xl" style={{ maxHeight: "80vh" }} />
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

interface Props {
  images: string[];
  videos?: string[];
  title: string;
  onModelSelect: (modelNumber: number | null) => void;
}

export default function ModelSelector({ images, videos = [], title, onModelSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);

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

  const mainMedia = selected ? images[selected - 1] : images[0];
  const mainIsVideo = mainMedia ? isVideo(mainMedia) : false;

  return (
    <>
    <div className="space-y-4">
      {/* Imagen/video principal */}
      <div
        className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-container border border-outline-variant group ${mainIsVideo ? "cursor-pointer" : "cursor-zoom-in"}`}
        onClick={() => { if (mainIsVideo && mainMedia) setVideoModal(mainMedia); else if (mainMedia) setLightbox(true); }}
      >
        {mainMedia ? (
          mainIsVideo ? (
            <div className="w-full h-full bg-black/80 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center hover:bg-white/20 transition">
                <span className="material-symbol text-white" style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </div>
              <p className="text-white/60 text-sm">Toca para ver el video</p>
            </div>
          ) : (
            <>
              <Image
                src={mainMedia}
                alt={selected ? `${title} — Modelo #${selected}` : title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <span className="material-symbol text-white opacity-0 group-hover:opacity-80 transition drop-shadow" style={{ fontSize: "36px" }}>zoom_in</span>
              </div>
            </>
          )
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
            const thumbIsVideo = isVideo(img);
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
                {thumbIsVideo ? (
                  <div className="w-full h-full bg-black/80 flex items-center justify-center">
                    <span className="material-symbol text-white" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  </div>
                ) : (
                  <Image src={img} alt={`Modelo ${modelNum}`} fill className="object-cover" sizes="80px" />
                )}
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

      {/* Botón ver video si hay videos */}
      {videos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {videos.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setVideoModal(v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container hover:bg-primary-container hover:border-primary transition text-sm font-medium text-on-surface"
            >
              <span className="material-symbol text-primary" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              {videos.length > 1 ? `Ver video ${i + 1}` : "Ver video del producto"}
            </button>
          ))}
        </div>
      )}
    </div>
    {videoModal && <VideoModal src={videoModal} onClose={() => setVideoModal(null)} />}
    {lightbox && mainMedia && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={() => setLightbox(false)}
      >
        <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
          <span className="material-symbol text-white" style={{ fontSize: "22px" }}>close</span>
        </button>
        {selected !== null && selected > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); const prev = selected - 2; setSelected(prev + 1); onModelSelect(prev + 1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <span className="material-symbol text-white" style={{ fontSize: "22px" }}>chevron_left</span>
          </button>
        )}
        {selected !== null && selected < images.length && (
          <button
            onClick={(e) => { e.stopPropagation(); const next = selected; setSelected(next + 1); onModelSelect(next + 1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <span className="material-symbol text-white" style={{ fontSize: "22px" }}>chevron_right</span>
          </button>
        )}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainMedia}
            alt={selected ? `${title} — Modelo #${selected}` : title}
            className="block rounded-2xl border-2 border-white/20 shadow-2xl"
            style={{ maxWidth: "min(90vw, 900px)", maxHeight: "85vh", width: "auto", height: "auto" }}
          />
        </div>
      </div>
    )}
    </>
  );
}
