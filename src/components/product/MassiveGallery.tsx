"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, useCallback } from "react";
import ShareButton from "./ShareButton";

interface Props {
  images: string[];
  title: string;
  price: number;
  originalPrice: number | null;
  variablePrice?: boolean;
  description: string;
  materials: string[];
  slug: string;
  category?: { name: string; slug: string } | null;
  productUrl: string;
  whatsappNumber?: string;
  showModelGuide?: boolean;
}

// Deriva el nombre del diseño desde la URL del archivo
// /uploads/mario-bros-mockup.jpg → "Mario Bros"
function nameFromUrl(url: string): string {
  const file = url.split("/").pop() ?? "";
  const noExt = file.replace(/\.[^.]+$/, "");
  const cleaned = noExt
    .replace(/[-_]/g, " ")
    .replace(/\s*(mockup|preview|img|image|photo|diamy)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ── Modal de detalle ─────────────────────────────────────────────────────────
function DesignModal({
  src,
  name,
  productTitle,
  productUrl,
  whatsappNumber,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  src: string;
  name: string;
  productTitle: string;
  productUrl: string;
  whatsappNumber?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose, onNext, onPrev]);

  const waText = encodeURIComponent(
    `Hola! Me interesa el diseño "${name}" del producto ${productTitle}. ¿Está disponible? ${productUrl}`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
        >
          <span className="material-symbol" style={{ fontSize: "18px" }}>close</span>
        </button>

        {/* Imagen */}
        <div className="relative w-full aspect-square bg-surface-container">
          <Image src={src} alt={name} fill className="object-cover" sizes="448px" priority />

          {/* Flechas de navegación */}
          {hasPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
            >
              <span className="material-symbol" style={{ fontSize: "20px" }}>chevron_left</span>
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
            >
              <span className="material-symbol" style={{ fontSize: "20px" }}>chevron_right</span>
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-serif text-lg font-bold text-on-surface mb-1">{name}</h3>
          <p className="text-xs text-on-surface-muted mb-4">Diseño de {productTitle}</p>

          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.534 5.876L0 24l6.29-1.516A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.596-.477-5.112-1.312l-.368-.217-3.73.899.939-3.618-.24-.381A9.972 9.972 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
              Pedir este diseño por WhatsApp
            </a>
          )}

          <Link
            href={productUrl}
            className="flex items-center justify-center gap-1 mt-2 text-xs text-on-surface-muted hover:text-primary transition"
          >
            Ver todos los diseños
            <span className="material-symbol" style={{ fontSize: "14px" }}>arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function MassiveGallery({
  images,
  title,
  price,
  originalPrice,
  variablePrice,
  description,
  materials,
  slug,
  category,
  productUrl,
  whatsappNumber,
  showModelGuide,
}: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  // Construir lista de diseños con nombre derivado
  const designs = useMemo(
    () => images.map((url, i) => ({ url, name: nameFromUrl(url), index: i })),
    [images]
  );

  // Filtrar por búsqueda
  const filtered = useMemo(() => {
    if (!query.trim()) return designs;
    const q = query.toLowerCase();
    return designs.filter((d) => d.name.toLowerCase().includes(q));
  }, [designs, query]);

  const openModal = useCallback((filteredIdx: number) => {
    setSelected(filteredIdx);
  }, []);

  const closeModal = useCallback(() => setSelected(null), []);

  const goPrev = useCallback(() => {
    setSelected((s) => (s !== null && s > 0 ? s - 1 : s));
  }, []);

  const goNext = useCallback(() => {
    setSelected((s) => (s !== null && s < filtered.length - 1 ? s + 1 : s));
  }, [filtered.length]);

  const current = selected !== null ? filtered[selected] : null;

  return (
    <>
      <div className="space-y-6">
        {/* Header del producto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info izquierda */}
          <div className="space-y-4">
            {category && (
              <Link href={`/catalogo?categoria=${category.slug}`} className="text-xs text-primary font-semibold uppercase tracking-widest hover:underline">
                {category.name}
              </Link>
            )}
            <h1 className="font-serif text-3xl font-bold text-on-surface leading-tight">{title}</h1>

            <div className="flex items-baseline gap-3">
              {variablePrice ? (
                <div className="flex items-center gap-2 bg-primary-container rounded-xl px-4 py-2">
                  <span className="material-symbol text-primary" style={{ fontSize: "18px" }}>sell</span>
                  <span className="text-sm font-medium text-on-primary-container">El precio cambia de acuerdo al diseño, pide tu cotización</span>
                </div>
              ) : (
                <>
                  <span className="text-3xl font-bold text-on-surface">${price.toLocaleString("es-MX")}</span><span className="text-sm font-normal text-outline ml-1">MXN</span>
                  {originalPrice && (
                    <span className="text-lg text-on-surface-muted line-through">${originalPrice.toLocaleString("es-MX")}</span>
                  )}
                </>
              )}
            </div>

            <p className="text-sm text-on-surface leading-relaxed">{description}</p>

            {materials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {materials.map((m) => (
                  <span key={m} className="px-3 py-1 bg-surface-container rounded-full text-sm text-on-surface border border-outline-variant">{m}</span>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1 flex-1 bg-surface-container rounded-xl p-3">
                <span className="material-symbol text-primary" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                <span className="text-xs text-on-surface-muted text-center font-medium">Envío incluido</span>
                <span className="text-xs text-outline text-center">En pedidos mayores a $500 MXN</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1 bg-surface-container rounded-xl p-3">
                <span className="material-symbol text-primary" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>palette</span>
                <span className="text-xs text-on-surface-muted text-center font-medium">{images.length} diseños</span>
                <span className="text-xs text-outline text-center">Elige el que más te guste</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1 bg-surface-container rounded-xl p-3">
                <span className="material-symbol text-primary" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-xs text-on-surface-muted text-center font-medium">Calidad</span>
                <span className="text-xs text-outline text-center">Garantizada</span>
              </div>
            </div>

            {showModelGuide && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/3ModelosFinal.PNG"
                alt="Guía de modelos disponibles"
                className="w-1/2 mx-auto rounded-2xl"
              />
            )}

            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Me interesa uno de los diseños de ${title}. ¿Pueden ayudarme? ${productUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.534 5.876L0 24l6.29-1.516A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.596-.477-5.112-1.312l-.368-.217-3.73.899.939-3.618-.24-.381A9.972 9.972 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                </svg>
                Cotizar por WhatsApp
              </a>
            )}
            <ShareButton
              title={title}
              description={description}
              imageUrl={images[0] ?? ""}
              url={productUrl}
            />
          </div>

          {/* Preview de la primera imagen (derecha) */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-container border border-outline-variant hidden md:block">
            {images[0] && (
              <Image
                src={images[0]}
                alt={title}
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
            )}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
                <p className="text-white text-xs font-medium">{images.length} diseños disponibles — explóralos abajo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Galería masiva */}
        <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-outline-variant flex items-center gap-3">
            <div className="relative flex-1">
              <span className="material-symbol absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted" style={{ fontSize: "18px" }}>search</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar diseño..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-primary transition"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface transition"
                >
                  <span className="material-symbol" style={{ fontSize: "16px" }}>close</span>
                </button>
              )}
            </div>
            <span className="text-xs text-on-surface-muted whitespace-nowrap shrink-0">
              {filtered.length} de {images.length}
            </span>
          </div>

          {/* Grid de diseños */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbol text-outline mb-3" style={{ fontSize: "48px" }}>search_off</span>
              <p className="font-medium text-on-surface">Sin resultados para &ldquo;{query}&rdquo;</p>
              <button onClick={() => setQuery("")} className="mt-2 text-sm text-primary hover:underline">
                Ver todos los diseños
              </button>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filtered.map((design, i) => (
                <button
                  key={design.index}
                  onClick={() => openModal(i)}
                  className="group flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant group-hover:border-primary group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
                    <Image
                      src={design.url}
                      alt={design.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                    />
                    {/* Overlay al hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <span className="material-symbol text-white opacity-0 group-hover:opacity-100 transition drop-shadow" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>zoom_in</span>
                    </div>
                  </div>
                  <span className="text-xs text-on-surface-muted group-hover:text-primary transition line-clamp-1 w-full">
                    {design.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {current && (
        <DesignModal
          src={current.url}
          name={current.name}
          productTitle={title}
          productUrl={productUrl}
          whatsappNumber={whatsappNumber}
          onClose={closeModal}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={selected! > 0}
          hasNext={selected! < filtered.length - 1}
        />
      )}
    </>
  );
}
