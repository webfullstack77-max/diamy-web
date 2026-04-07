"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import type { Product, Category } from "@/types";
import ProductModal from "@/components/product/ProductModal";

type ProductWithCategory = Product & { category?: Category };

// ── Carrusel ─────────────────────────────────────────────────────────────────
export default function FeaturedCarousel({ products }: { products: ProductWithCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [cursorGrabbing, setCursorGrabbing] = useState(false);
  const [selected, setSelected] = useState<ProductWithCategory | null>(null);

  // Refs para drag (evitan stale closures)
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Auto-scroll
  const pausedRef = useRef(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const pauseAutoScroll = useCallback((ms = 3000) => {
    pausedRef.current = true;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => { pausedRef.current = false; }, ms);
  }, []);

  // Auto-scroll continuo
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const SPEED = 0.6;
    const step = () => {
      if (!pausedRef.current && track) {
        track.scrollLeft += SPEED;
        // Cuando llega a la mitad exacta (fin del set original), salta al inicio sin salto visible
        const half = track.scrollWidth / 2;
        if (track.scrollLeft >= half) {
          track.scrollLeft -= half;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Eventos touch y mouse via listeners nativos (evitan problemas de passive/preventDefault)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const startDrag = (clientX: number) => {
      isDragging.current = true;
      dragMoved.current = false;
      startX.current = clientX;
      scrollLeftStart.current = track.scrollLeft;
      pauseAutoScroll(8000);
      setCursorGrabbing(true);
    };

    const moveDrag = (clientX: number) => {
      if (!isDragging.current) return;
      const walk = (clientX - startX.current) * 1.2;
      if (Math.abs(walk) > 4) dragMoved.current = true;
      track.scrollLeft = scrollLeftStart.current - walk;
    };

    const endDrag = () => {
      isDragging.current = false;
      setCursorGrabbing(false);
    };

    // Mouse
    const onMouseDown = (e: MouseEvent) => startDrag(e.clientX);
    const onMouseMove = (e: MouseEvent) => { if (isDragging.current) { e.preventDefault(); moveDrag(e.clientX); } };
    const onMouseUp = () => endDrag();
    const onMouseLeave = () => endDrag();
    const onMouseEnter = () => pauseAutoScroll(60000);
    const onMouseOut = () => { if (!isDragging.current) pausedRef.current = false; };

    // Touch
    const onTouchStart = (e: TouchEvent) => startDrag(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => { if (isDragging.current) moveDrag(e.touches[0].clientX); };
    const onTouchEnd = () => endDrag();

    track.addEventListener("mousedown", onMouseDown);
    track.addEventListener("mousemove", onMouseMove, { passive: false });
    track.addEventListener("mouseup", onMouseUp);
    track.addEventListener("mouseleave", onMouseLeave);
    track.addEventListener("mouseenter", onMouseEnter);
    track.addEventListener("mouseout", onMouseOut);
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: true });
    track.addEventListener("touchend", onTouchEnd);

    return () => {
      track.removeEventListener("mousedown", onMouseDown);
      track.removeEventListener("mousemove", onMouseMove);
      track.removeEventListener("mouseup", onMouseUp);
      track.removeEventListener("mouseleave", onMouseLeave);
      track.removeEventListener("mouseenter", onMouseEnter);
      track.removeEventListener("mouseout", onMouseOut);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", onTouchEnd);
    };
  }, [pauseAutoScroll]);

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    pauseAutoScroll(4000);
    trackRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <>
      <div className="relative group/carousel">
        {/* Flecha izquierda */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface shadow-md border border-outline-variant flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition hover:bg-surface-container -translate-x-3"
        >
          <span className="material-symbol" style={{ fontSize: "20px" }}>chevron_left</span>
        </button>

        {/* Track — productos duplicados para loop infinito */}
        <div
          ref={trackRef}
          className={`flex gap-4 overflow-x-auto pb-2 select-none
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            ${cursorGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
        >
          {[...products, ...products].map((product, idx) => {
            const img = product.images[0] ?? null;
            const isClone = idx >= products.length;
            return (
              <div
                key={`${product.id}-${idx}`}
                onClick={() => { if (!dragMoved.current) setSelected(product); dragMoved.current = false; }}
                aria-hidden={isClone}
                className="shrink-0 w-52 rounded-2xl overflow-hidden border border-outline-variant bg-surface hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Imagen */}
                <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
                  {img ? (
                    <Image
                      src={img}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="208px"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbol text-outline" style={{ fontSize: "40px" }}>image</span>
                    </div>
                  )}
                  {product.originalPrice && (
                    <span className="absolute top-2 left-2 bg-secondary text-on-secondary text-xs font-bold px-2 py-0.5 rounded-full">
                      Oferta
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="material-symbol text-white drop-shadow" style={{ fontSize: "32px" }}>zoom_in</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1">
                  {product.category && (
                    <span className="text-xs text-primary font-medium uppercase tracking-wide mb-0.5">
                      {product.category.name}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-on-surface line-clamp-2 leading-snug mb-auto">
                    {product.title}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-bold text-on-surface text-sm">
                      ${product.price.toLocaleString("es-MX")}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-on-surface-muted line-through">
                        ${product.originalPrice.toLocaleString("es-MX")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface shadow-md border border-outline-variant flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition hover:bg-surface-container translate-x-3"
        >
          <span className="material-symbol" style={{ fontSize: "20px" }}>chevron_right</span>
        </button>
      </div>

      {/* Modal */}
      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
