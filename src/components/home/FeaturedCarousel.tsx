"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useCallback, useEffect } from "react";
import type { Product, Category } from "@/types";

type ProductWithCategory = Product & { category?: Category };

// ── Modal ────────────────────────────────────────────────────────────────────
function ProductModal({
  product,
  onClose,
}: {
  product: ProductWithCategory;
  onClose: () => void;
}) {
  const [activeImg, setActiveImg] = useState(0);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const img = product.images[activeImg] ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-outline-variant transition"
        >
          <span className="material-symbol" style={{ fontSize: "18px" }}>close</span>
        </button>

        {/* Imagen principal */}
        <div className="relative w-full aspect-[4/3] bg-surface-container rounded-t-2xl overflow-hidden">
          {img ? (
            <Image
              src={img}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbol text-outline" style={{ fontSize: "48px" }}>image</span>
            </div>
          )}
          {product.originalPrice && (
            <span className="absolute top-3 left-3 bg-secondary text-on-secondary text-xs font-bold px-2.5 py-1 rounded-full">
              Oferta
            </span>
          )}
        </div>

        {/* Miniaturas */}
        {product.images.length > 1 && (
          <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                  i === activeImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" width={56} height={56} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="p-5">
          {product.category && (
            <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
              {product.category.name}
            </p>
          )}
          <h2 className="font-serif text-xl font-bold text-on-surface mb-2">{product.title}</h2>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-on-surface">
              ${product.price.toLocaleString("es-MX")}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-on-surface-muted line-through">
                ${product.originalPrice.toLocaleString("es-MX")}
              </span>
            )}
          </div>

          <p className="text-sm text-on-surface-muted leading-relaxed mb-4">{product.description}</p>

          {product.materials.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {product.materials.map((m) => (
                <span key={m} className="text-xs bg-surface-container text-on-surface-muted px-2.5 py-1 rounded-full">
                  {m}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/producto/${product.slug}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-dark transition"
          >
            Ver producto completo
            <span className="material-symbol" style={{ fontSize: "18px" }}>arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Carrusel ─────────────────────────────────────────────────────────────────
export default function FeaturedCarousel({ products }: { products: ProductWithCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selected, setSelected] = useState<ProductWithCategory | null>(null);
  const dragMoved = useRef(false);
  const pausedRef = useRef(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Auto-scroll continuo de derecha a izquierda, se reinicia al llegar al final
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const SPEED = 0.6; // px por frame

    const step = () => {
      if (!pausedRef.current && track) {
        track.scrollLeft += SPEED;
        // Al llegar al final, vuelve al inicio suavemente
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) {
          track.scrollLeft = 0;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Pausa temporal: detiene el auto-scroll X segundos y luego lo reanuda
  const pauseAutoScroll = useCallback((ms = 3000) => {
    pausedRef.current = true;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => { pausedRef.current = false; }, ms);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    pauseAutoScroll(5000);
    setIsDragging(true);
    dragMoved.current = false;
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  }, [pauseAutoScroll]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    if (Math.abs(walk) > 4) dragMoved.current = true;
    trackRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  const onMouseEnter = useCallback(() => pauseAutoScroll(60000), []); // pausa al hacer hover
  const onMouseLeave = useCallback(() => { setIsDragging(false); pausedRef.current = false; }, []);

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

        {/* Track */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={`flex gap-4 overflow-x-auto scroll-smooth pb-2 select-none
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          {products.map((product) => {
            const img = product.images[0] ?? null;
            return (
              <div
                key={product.id}
                onClick={() => { if (!dragMoved.current) setSelected(product); }}
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
