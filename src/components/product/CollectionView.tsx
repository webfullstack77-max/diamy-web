"use client";

import { useState } from "react";
import Link from "next/link";
import ModelSelector from "./ModelSelector";
import WhatsAppButton from "./WhatsAppButton";

interface Category {
  name: string;
  slug: string;
}

interface Props {
  product: {
    title: string;
    price: number;
    originalPrice: number | null;
    variablePrice?: boolean;
    images: string[];
    materials: string[];
    description: string;
    category: Category | null;
  };
  productUrl: string;
}

function isVideo(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

export default function CollectionView({ product, productUrl }: Props) {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);

  const modelImages = product.images.filter((img) => !isVideo(img));
  const videos = product.images.filter((img) => isVideo(img));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Model Selector */}
      <ModelSelector
        images={modelImages}
        videos={videos}
        title={product.title}
        onModelSelect={setSelectedModel}
      />

      {/* Right: Details */}
      <div className="md:sticky md:top-24 md:self-start space-y-0">
        {product.category && (
          <Link
            href={`/catalogo?categoria=${product.category.slug}`}
            className="text-xs text-primary font-semibold uppercase tracking-widest hover:underline"
          >
            {product.category.name}
          </Link>
        )}

        <h1 className="font-serif text-3xl font-bold text-on-surface mt-2 leading-tight">
          {product.title}
        </h1>

        <p className="mt-2 text-sm text-on-surface-muted flex items-center gap-1.5">
          <span className="material-symbol text-primary" style={{ fontSize: "16px" }}>grid_view</span>
          {modelImages.length} modelo{modelImages.length !== 1 ? "s" : ""} disponible{modelImages.length !== 1 ? "s" : ""} — elige el tuyo a la izquierda
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-3 mt-4">
          {product.variablePrice ? (
            <div className="flex items-center gap-2 bg-primary-container rounded-xl px-4 py-2">
              <span className="material-symbol text-primary" style={{ fontSize: "18px" }}>sell</span>
              <span className="text-sm font-medium text-on-primary-container">El precio cambia de acuerdo al modelo, pide tu cotización</span>
            </div>
          ) : (
            <>
              <span className="text-3xl font-bold text-on-surface">
                ${product.price.toLocaleString("es-MX")} <span className="text-sm font-normal text-outline">MXN</span>
              </span>
              {product.originalPrice && (
                <span className="text-lg text-on-surface-muted line-through">
                  ${product.originalPrice.toLocaleString("es-MX")}
                </span>
              )}
            </>
          )}
        </div>

        {/* Materials */}
        {product.materials.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-muted mb-2">Materiales</p>
            <div className="flex flex-wrap gap-2">
              {product.materials.map((m) => (
                <span key={m} className="px-3 py-1 bg-surface-container rounded-full text-sm text-on-surface border border-outline-variant">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-muted mb-2">Descripción</p>
          <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>

        {/* Badges */}
        <div className="flex gap-3 mt-6">
          <div className="flex flex-col items-center gap-1 flex-1 bg-surface-container rounded-xl p-3">
            <span className="material-symbol text-primary" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            <span className="text-xs text-on-surface-muted text-center leading-tight font-medium">Envío incluido</span>
            <span className="text-xs text-outline text-center leading-tight">En pedidos mayores a $500 MXN, solo México</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 bg-surface-container rounded-xl p-3">
            <span className="material-symbol text-primary" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-xs text-on-surface-muted text-center leading-tight">Calidad garantizada</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <WhatsAppButton
            productTitle={product.title}
            productUrl={productUrl}
            selectedModel={selectedModel ?? undefined}
          />
          {!selectedModel && (
            <p className="text-xs text-center text-on-surface-muted mt-2">
              💡 Selecciona un modelo para incluirlo en tu mensaje
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
