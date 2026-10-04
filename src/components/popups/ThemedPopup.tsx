"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PopupConfig, PopupSlide } from "@/types/popup";
import { POPUP_THEMES } from "@/lib/popup-themes";
import ThemeDecorations from "./ThemeDecorations";

interface Props {
  previewConfig?: PopupConfig | null; // For admin live preview
  onClosePreview?: () => void;
}

export default function ThemedPopup({ previewConfig, onClosePreview }: Props) {
  const [config, setConfig] = useState<PopupConfig | null>(previewConfig || null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from API if not in preview mode
  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
      setIsOpen(true);
      return;
    }

    fetch("/api/popup")
      .then((res) => res.json())
      .then((data: PopupConfig) => {
        if (!data || !data.isActive || !data.slides || data.slides.length === 0) {
          return;
        }

        // Frequency check
        const todayStr = new Date().toISOString().slice(0, 10);
        if (data.displayFrequency === "once_session") {
          if (sessionStorage.getItem("diamy_popup_seen")) return;
        } else if (data.displayFrequency === "once_day") {
          if (localStorage.getItem("diamy_popup_seen_date") === todayStr) return;
        }

        setConfig(data);
        // Small delay so page content appears first, then smooth modal entrance
        const showTimeout = setTimeout(() => {
          setIsOpen(true);
        }, 600);

        return () => clearTimeout(showTimeout);
      })
      .catch((err) => console.error("Error loading popup:", err));
  }, [previewConfig]);

  // Close handler with frequency storage
  const handleClose = useCallback(() => {
    if (onClosePreview) {
      onClosePreview();
      return;
    }

    if (config) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (config.displayFrequency === "once_session") {
        sessionStorage.setItem("diamy_popup_seen", "true");
      } else if (config.displayFrequency === "once_day") {
        localStorage.setItem("diamy_popup_seen_date", todayStr);
      }
    }
    setIsOpen(false);
  }, [config, onClosePreview]);

  // Keyboard navigation & Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Slides count
  const slides = config?.slides || [];
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay timer
  useEffect(() => {
    if (!isOpen || isPaused || !config?.autoPlayInterval || totalSlides <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, config.autoPlayInterval * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, config?.autoPlayInterval, nextSlide, totalSlides]);

  if (!isOpen || !config || slides.length === 0) return null;

  const themeInfo = POPUP_THEMES[config.theme] || POPUP_THEMES.halloween;
  const slide = slides[currentSlide] as PopupSlide | undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={config.title}
    >
      <div
        className={`relative w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${themeInfo.borderStyle} ${themeInfo.modalGlow} ${themeInfo.bodyBg}`}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Graphical Ornaments on Header & Corners */}
        <ThemeDecorations theme={config.theme} />

        {/* Botón de cierre en esquina superior derecha */}
        <button
          onClick={handleClose}
          aria-label="Cerrar ventana promocional"
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <span className="material-symbol" style={{ fontSize: "19px" }}>close</span>
        </button>

        {/* Modal Header */}
        <div className={`relative px-5 pt-6 pb-4 bg-gradient-to-r ${themeInfo.headerGradient} border-b border-white/10 text-center`}>
          {/* Badge de temporada */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm mb-2"
            style={{
              backgroundColor: `${themeInfo.accentColor}25`,
              color: themeInfo.accentColor,
              borderColor: `${themeInfo.accentColor}50`,
              borderWidth: "1px",
            }}
          >
            <span>{themeInfo.emoji}</span>
            <span>{slide?.badge || themeInfo.defaultBadge}</span>
          </div>

          <h3 className={`font-serif text-xl sm:text-2xl font-bold tracking-tight text-white`}>
            {config.title}
          </h3>

          {config.subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-white/70 line-clamp-2 max-w-sm mx-auto">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Slideshow Container */}
        {slide && (
          <div className="relative p-4 sm:p-5">
            {/* Clickable Image Slide Area */}
            <Link
              href={slide.linkUrl || "/catalogo"}
              onClick={handleClose}
              className="group block relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-inner"
            >
              {/* Product Image */}
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                sizes="(max-width: 640px) 90vw, 440px"
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                priority
              />

              {/* Hover Overlay Prompt */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-4">
                <span className="text-white text-base sm:text-lg font-bold leading-snug drop-shadow-md">
                  {slide.title}
                </span>

                {slide.subtitle && (
                  <span className="text-white/80 text-xs sm:text-sm mt-0.5 line-clamp-1 drop-shadow-sm">
                    {slide.subtitle}
                  </span>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${themeInfo.buttonGradient} shadow-md group-hover:shadow-lg transition-all`}
                  >
                    <span>{config.buttonText || "Ver Producto"}</span>
                    <span className="material-symbol" style={{ fontSize: "15px" }}>arrow_forward</span>
                  </span>

                  <span className="text-[11px] text-white/60 group-hover:text-white/90 transition-colors">
                    Clic para ver detalles
                  </span>
                </div>
              </div>
            </Link>

            {/* Navigation Arrows (if > 1 slide) */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  aria-label="Slide anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white/90 hover:text-white border border-white/20 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbol" style={{ fontSize: "20px" }}>chevron_left</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  aria-label="Siguiente slide"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white/90 hover:text-white border border-white/20 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbol" style={{ fontSize: "20px" }}>chevron_right</span>
                </button>
              </>
            )}

            {/* Slide Dots Indicator */}
            {totalSlides > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Ir al slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? "w-6 bg-white"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                    style={{
                      backgroundColor: idx === currentSlide ? themeInfo.accentColor : undefined,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
