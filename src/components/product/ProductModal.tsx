"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product, Category } from "@/types";

export type ProductWithCategory = Product & { category?: Category };

function isVideo(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

export default function ProductModal({
  product,
  onClose,
}: {
  product: ProductWithCategory;
  onClose: () => void;
}) {
  const imageOnly = product.images.filter((src) => !isVideo(src));
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const img = imageOnly[activeImg] ?? null;

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
        {imageOnly.length > 1 && (
          <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
            {imageOnly.map((src, i) => (
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
            {product.variablePrice ? (
              <span className="text-lg font-semibold text-primary">Precio variable</span>
            ) : (
              <>
                <span className="text-2xl font-bold text-on-surface">
                  ${product.price.toLocaleString("es-MX")} <span className="text-xs font-normal text-outline">MXN</span>
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-on-surface-muted line-through">
                    ${product.originalPrice.toLocaleString("es-MX")}
                  </span>
                )}
              </>
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

          {product.category && (
            <Link
              href={`/catalogo?categoria=${product.category.slug}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-xl border border-primary/40 text-primary text-sm font-medium hover:bg-primary-container transition"
            >
              <span className="material-symbol" style={{ fontSize: "16px" }}>grid_view</span>
              Ver catálogo completo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
