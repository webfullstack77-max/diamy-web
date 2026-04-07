"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ProductModal, { type ProductWithCategory } from "@/components/product/ProductModal";

interface Item {
  id: string;
  image: string;
  text?: string | null;
  link?: string | null;
  product?: ProductWithCategory | null;
}

interface Props {
  items: Item[];
}

const INTERVAL_MS = 10000;

export default function ProductOfMonth({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [modalProduct, setModalProduct] = useState<ProductWithCategory | null>(null);
  const paused = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 350);
  }, []);

  const next = useCallback(() => goTo((current + 1) % items.length), [current, goTo, items.length]);
  const prev = useCallback(() => goTo((current - 1 + items.length) % items.length), [current, goTo, items.length]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!paused.current) {
        setCurrent((c) => {
          const next = (c + 1) % items.length;
          setVisible(false);
          setTimeout(() => { setCurrent(next); setVisible(true); }, 350);
          return c; // will be overridden by setTimeout
        });
      }
    }, INTERVAL_MS);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [items.length, startTimer]);

  const handleManual = (index: number) => {
    goTo(index);
    startTimer(); // reset timer on manual interaction
  };

  if (items.length === 0) return null;

  const item = items[current];
  const multi = items.length > 1;

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-12 bg-background">
      <div className="max-w-sm mx-auto flex flex-col items-center gap-6">
        {/* Título */}
        <div className="text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">
            Producto del Mes
          </h2>
          <p className="text-on-surface-muted text-sm mt-1">Nuestra selección especial</p>
        </div>

        {/* Slider wrapper */}
        <div
          className="relative w-full flex items-center justify-center gap-2"
          onMouseEnter={() => { paused.current = true; }}
          onMouseLeave={() => { paused.current = false; }}
        >
          {/* Flecha izquierda */}
          {multi && (
            <button
              onClick={() => handleManual((current - 1 + items.length) % items.length)}
              className="shrink-0 w-8 h-8 rounded-full bg-surface border border-outline-variant hover:bg-surface-container flex items-center justify-center transition shadow-sm"
              aria-label="Anterior"
            >
              <span className="material-symbol text-on-surface-muted" style={{ fontSize: "18px" }}>chevron_left</span>
            </button>
          )}

          {/* Marco LED */}
          <div className="led-frame flex-1" style={{ maxWidth: "320px" }}>
            <div
              className={`led-frame-inner ${item.product ? "cursor-pointer group" : ""}`}
              onClick={() => item.product && setModalProduct(item.product)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={item.id}
                src={item.image}
                alt="Producto del mes"
                className="block w-full h-auto rounded-[14px]"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" }}
              />
              {/* Overlay hover si hay producto vinculado */}
              {item.product && (
                <div className="absolute inset-0 rounded-[14px] bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition">
                  <span className="material-symbol text-white opacity-0 group-hover:opacity-90 drop-shadow transition" style={{ fontSize: "36px" }}>open_in_full</span>
                </div>
              )}
              {/* Contador */}
              {multi && (
                <span className="absolute bottom-2 right-3 text-xs font-medium text-white/80 bg-black/30 rounded-full px-2 py-0.5 backdrop-blur-sm">
                  {current + 1} / {items.length}
                </span>
              )}
            </div>
          </div>

          {/* Flecha derecha */}
          {multi && (
            <button
              onClick={() => handleManual((current + 1) % items.length)}
              className="shrink-0 w-8 h-8 rounded-full bg-surface border border-outline-variant hover:bg-surface-container flex items-center justify-center transition shadow-sm"
              aria-label="Siguiente"
            >
              <span className="material-symbol text-on-surface-muted" style={{ fontSize: "18px" }}>chevron_right</span>
            </button>
          )}
        </div>

        {/* Dots */}
        {multi && (
          <div className="flex gap-2 items-center">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => handleManual(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? "w-4 h-2 bg-primary"
                    : "w-2 h-2 bg-outline-variant hover:bg-outline"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Texto */}
        <div
          className="text-center min-h-[2.5rem] flex items-center justify-center"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" }}
        >
          {item.text && (
            <p className="text-on-surface-muted text-sm leading-relaxed max-w-sm">{item.text}</p>
          )}
        </div>

        {/* Botón explorar */}
        <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" }}>
          {item.link && (
            <Link
              href={item.link}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/40 text-primary text-sm font-medium hover:bg-primary-container hover:border-primary transition"
            >
              <span className="material-symbol" style={{ fontSize: "16px" }}>grid_view</span>
              Explorar productos
            </Link>
          )}
        </div>
      </div>

      {modalProduct && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}

      <style>{`
        .led-frame {
          position: relative;
          border-radius: 16px;
          padding: 3px;
          background: conic-gradient(
            from var(--led-angle, 0deg),
            transparent 0deg,
            rgba(82, 85, 169, 0.6) 60deg,
            rgba(147, 112, 219, 0.5) 120deg,
            rgba(255, 255, 255, 0.3) 180deg,
            rgba(147, 112, 219, 0.5) 240deg,
            rgba(82, 85, 169, 0.6) 300deg,
            transparent 360deg
          );
          animation: led-rotate 4s linear infinite;
          box-shadow: 0 0 18px rgba(82, 85, 169, 0.25), 0 4px 24px rgba(0,0,0,0.1);
        }
        .led-frame-inner {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          background: var(--color-surface, #fff);
          width: 100%;
        }
        @property --led-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes led-rotate {
          from { --led-angle: 0deg; }
          to   { --led-angle: 360deg; }
        }
      `}</style>
    </section>
  );
}
