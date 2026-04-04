"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface Props {
  images: string[];
  title: string;
}

function isVideo(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

function ImageModal({
  src, alt, onClose, onPrev, onNext,
}: {
  src: string; alt: string; onClose: () => void;
  onPrev?: () => void; onNext?: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
        <span className="material-symbol text-white" style={{ fontSize: "22px" }}>close</span>
      </button>
      {onPrev && (
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
          <span className="material-symbol text-white" style={{ fontSize: "22px" }}>chevron_left</span>
        </button>
      )}
      {onNext && (
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
          <span className="material-symbol text-white" style={{ fontSize: "22px" }}>chevron_right</span>
        </button>
      )}
      <div className="relative w-full max-w-3xl max-h-[90vh] aspect-square" onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt={alt} fill className="object-contain" sizes="(max-width: 768px) 100vw, 80vw" />
      </div>
    </div>
  );
}

function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm"
        >
          <span className="material-symbol" style={{ fontSize: "20px" }}>close</span>
          Cerrar
        </button>
        <video
          ref={videoRef}
          src={src}
          controls
          autoPlay
          className="w-full rounded-2xl"
          style={{ maxHeight: "80vh" }}
        />
      </div>
    </div>
  );
}

export default function ImageGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const nonVideoImages = images.filter((img) => !isVideo(img));

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-surface-container rounded-2xl flex items-center justify-center">
        <span className="material-symbol text-outline" style={{ fontSize: "64px" }}>image</span>
      </div>
    );
  }

  const activeMedia = images[active];
  const activeIsVideo = isVideo(activeMedia);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main media */}
        <div
          className={`relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container group ${activeIsVideo ? "cursor-pointer" : "cursor-zoom-in"}`}
          onClick={() => activeIsVideo ? setVideoModal(activeMedia) : setLightbox(true)}
        >
          {activeIsVideo ? (
            <div className="w-full h-full bg-black/90 flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center hover:bg-white/20 transition">
                <span className="material-symbol text-white" style={{ fontSize: "44px", fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </div>
              <p className="text-white/60 text-sm">Toca para ver el video</p>
            </div>
          ) : (
            <>
              <Image
                src={activeMedia}
                alt={`${title} - imagen ${active + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <span className="material-symbol text-white opacity-0 group-hover:opacity-80 transition drop-shadow" style={{ fontSize: "36px" }}>zoom_in</span>
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((media, i) => {
              const thumbIsVideo = isVideo(media);
              return (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === active ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {thumbIsVideo ? (
                    <div className="w-full h-full bg-black/80 flex items-center justify-center">
                      <span className="material-symbol text-white" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                  ) : (
                    <Image src={media} alt={`Miniatura ${i + 1}`} fill className="object-cover" sizes="64px" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {videoModal && <VideoModal src={videoModal} onClose={() => setVideoModal(null)} />}
      {lightbox && (
        <ImageModal
          src={activeMedia}
          alt={`${title} - imagen ${active + 1}`}
          onClose={() => setLightbox(false)}
          onPrev={active > 0 ? () => setActive((a) => a - 1) : undefined}
          onNext={active < nonVideoImages.length - 1 ? () => { setActive((a) => a + 1); } : undefined}
        />
      )}
    </>
  );
}
