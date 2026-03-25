"use client";

import { useState } from "react";
import ImageGallery from "./ImageGallery";
import ModelSelector from "./ModelSelector";
import WhatsAppButton from "./WhatsAppButton";

interface Props {
  images: string[];
  title: string;
  productUrl: string;
  isCollection: boolean;
}

export default function ProductGalleryWithCTA({ images, title, productUrl, isCollection }: Props) {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);

  return (
    <>
      {/* Gallery / Model selector */}
      {isCollection ? (
        <ModelSelector
          images={images}
          title={title}
          onModelSelect={setSelectedModel}
        />
      ) : (
        <ImageGallery images={images} title={title} />
      )}

      {/* WhatsApp CTA — sticky en mobile */}
      <div className="mt-6 md:hidden">
        <WhatsAppButton
          productTitle={title}
          productUrl={productUrl}
          selectedModel={selectedModel ?? undefined}
        />
      </div>
    </>
  );
}
