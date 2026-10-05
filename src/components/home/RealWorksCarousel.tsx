"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface ClientWork {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string | null;
  clientName: string | null;
  badge: string | null;
  order: number;
  isActive: boolean;
  link: string | null;
  productId?: string | null;
  product?: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: string[];
  } | null;
}

interface Props {
  initialWorks?: ClientWork[];
}

const INTERVAL_MS = 5000; // 5 segundos exactos según solicitado

export default function RealWorksCarousel({ initialWorks = [] }: Props) {
  const [works, setWorks] = useState<ClientWork[]>(initialWorks);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<ClientWork | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Cargar trabajos si no vinieron en props
  useEffect(() => {
    if (initialWorks.length === 0) {
      fetch("/api/client-works")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setWorks(data);
          }
        })
        .catch(() => {});
    }
  }, [initialWorks]);

  const count = works.length;

  const goTo = useCallback(
    (index: number) => {
      if (count <= 1 || isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((index + count) % count);
      setProgress(0);
      setTimeout(() => setIsTransitioning(false), 450);
    },
    [count, isTransitioning]
  );

  const next = useCallback(() => {
    goTo(current + 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo(current - 1);
  }, [current, goTo]);

  // Manejo de timer de 5s y barra de progreso fluida
  useEffect(() => {
    if (count <= 1 || isPaused) return;

    setProgress(0);
    const tickInterval = 50; // cada 50ms para 100 ticks = 5000ms
    const step = 100 / (INTERVAL_MS / tickInterval);

    progressTimerRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 100;
        }
        return prevProgress + step;
      });
    }, tickInterval);

    timerRef.current = setInterval(() => {
      next();
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [count, isPaused, next]);

  // Soporte para gestos touch en móviles
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      next();
    } else if (diff < -45) {
      prev();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  if (count === 0) return null;

  const currentWork = works[current] || works[0];
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "527777961193";
  const quoteText = encodeURIComponent(
    `¡Hola Diamy! Vi en su galería el trabajo real de "${currentWork.title}" y me gustaría cotizar un proyecto similar.`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${quoteText}`;

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-surface via-surface-container/30 to-background overflow-hidden">
      {/* Resplandor ambiental de fondo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] rounded-full blur-[130px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-primary, #6b46c1) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Cabecera de la sección */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Galería de Trabajos Reales
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight leading-tight">
            Hecho con Amor en <span className="text-primary italic">Diamy</span>
          </h2>
          <p className="mt-3 text-on-surface-muted text-sm sm:text-base leading-relaxed">
            De la vista nace el amor. Aquí no hay renders: son fotografías de piezas reales
            fabricadas en nuestro taller para clientes y eventos especiales.
          </p>
        </div>

        {/* Contenedor Principal del Carrusel */}
        <div
          className="relative rounded-3xl bg-surface/90 border border-outline-variant/80 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Barra superior de progreso de 5 segundos */}
          <div className="h-1.5 w-full bg-outline-variant/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container transition-all ease-linear"
              style={{
                width: `${progress}%`,
                transitionDuration: isPaused ? "0ms" : "50ms",
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] md:min-h-[500px]">
            {/* Viewport de la Foto */}
            <div className="lg:col-span-7 relative bg-black/5 overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
              {/* Imagen con transición suave */}
              <div
                className={`relative w-full h-full min-h-[320px] sm:min-h-[440px] transition-all duration-500 transform ${
                  isTransitioning ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
                }`}
              >
                <Image
                  src={currentWork.imageUrl}
                  alt={currentWork.title}
                  fill
                  priority
                  className="object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-700"
                  onClick={() => setLightboxImage(currentWork)}
                />

                {/* Gradiente sutil para legibilidad en móviles */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 lg:hidden" />

                {/* Botón Flotante para Ampliar / Zoom */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage(currentWork);
                  }}
                  className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow-lg"
                  aria-label="Ver foto en tamaño completo"
                >
                  <span className="material-symbol" style={{ fontSize: "16px" }}>
                    zoom_in
                  </span>
                  Ampliar foto
                </button>

                {/* Badges superiores sobre la imagen */}
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                  {currentWork.badge && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/25 shadow-md">
                      {currentWork.badge}
                    </span>
                  )}
                  {currentWork.category && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/90 text-white backdrop-blur-md shadow-md">
                      {currentWork.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Panel Lateral con Información del Trabajo */}
            <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-surface/80 border-t lg:border-t-0 lg:border-l border-outline-variant/60">
              <div className="space-y-4">
                {/* Meta info: cliente y técnica */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="material-symbol text-primary" style={{ fontSize: "16px" }}>
                      verified
                    </span>
                    {currentWork.clientName || "Trabajo Personalizado"}
                  </span>

                  <span className="text-xs font-mono text-on-surface-muted bg-surface-container px-2 py-0.5 rounded-md">
                    {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                  </span>
                </div>

                {/* Título Principal */}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface leading-snug">
                  {currentWork.title}
                </h3>

                {/* Descripción / Acabados */}
                <p className="text-on-surface-muted text-sm sm:text-base leading-relaxed">
                  {currentWork.description ||
                    "Pieza personalizada fabricada a la medida con materiales seleccionados y atención a cada milímetro de corte y ensamble."}
                </p>

                {/* Detalles de calidad Diamy */}
                <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-on-surface-muted border-t border-outline-variant/40">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbol text-primary" style={{ fontSize: "16px" }}>
                      precision_manufacturing
                    </span>
                    <span>Corte láser de precisión</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbol text-primary" style={{ fontSize: "16px" }}>
                      palette
                    </span>
                    <span>Colores y tintas UV durables</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbol text-primary" style={{ fontSize: "16px" }}>
                      local_shipping
                    </span>
                    <span>Envíos a todo México</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbol text-primary" style={{ fontSize: "16px" }}>
                      thumb_up
                    </span>
                    <span>Satisfacción garantizada</span>
                  </div>
                </div>
              </div>

              {/* Acciones: Cotizar por WhatsApp o Ver en Catálogo */}
              <div className="mt-8 pt-6 border-t border-outline-variant/60 flex flex-col sm:flex-row items-stretch gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span className="material-symbol" style={{ fontSize: "20px" }}>
                    chat
                  </span>
                  Quiero uno igual (Cotizar)
                </a>

                {currentWork.link && (
                  <Link
                    href={currentWork.link}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-outline-variant hover:bg-surface-container text-on-surface text-sm font-medium transition"
                  >
                    <span>Ver detalles</span>
                    <span className="material-symbol" style={{ fontSize: "16px" }}>
                      arrow_forward
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Flechas de Navegación Glassmorphism (Adelante y Atrás) */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-surface/90 hover:bg-surface text-on-surface border border-outline-variant/80 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 z-20"
                aria-label="Trabajo anterior"
              >
                <span className="material-symbol" style={{ fontSize: "22px" }}>
                  chevron_left
                </span>
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-surface/90 hover:bg-surface text-on-surface border border-outline-variant/80 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 z-20"
                aria-label="Siguiente trabajo"
              >
                <span className="material-symbol" style={{ fontSize: "22px" }}>
                  chevron_right
                </span>
              </button>
            </>
          )}
        </div>

        {/* Tira inferior de Miniaturas y Puntos Interactivos */}
        {count > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {works.map((work, idx) => (
              <button
                key={work.id}
                onClick={() => goTo(idx)}
                className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
                  current === idx
                    ? "ring-2 ring-primary ring-offset-2 scale-105 shadow-md w-14 sm:w-20 h-10 sm:h-12"
                    : "opacity-50 hover:opacity-100 hover:scale-100 w-10 sm:w-16 h-8 sm:h-10"
                }`}
                title={work.title}
                aria-label={`Ver trabajo ${idx + 1}`}
              >
                <Image src={work.imageUrl} alt={work.title} fill className="object-cover" />
                {current === idx && (
                  <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal de Foto en Pantalla Completa */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition"
              aria-label="Cerrar vista completa"
            >
              <span className="material-symbol" style={{ fontSize: "24px" }}>
                close
              </span>
            </button>

            {/* Imagen grande */}
            <div className="relative w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
              <Image
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Pie de foto en modal */}
            <div className="mt-4 text-center text-white">
              <p className="font-serif text-lg font-bold">{lightboxImage.title}</p>
              {lightboxImage.clientName && (
                <p className="text-xs text-white/70 mt-0.5">
                  Proyecto realizado para: {lightboxImage.clientName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
