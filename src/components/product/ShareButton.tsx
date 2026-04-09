"use client";

import { useState } from "react";

interface Props {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export default function ShareButton({ title, description, imageUrl, url }: Props) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    const shortDesc = description.length > 120 ? description.slice(0, 117) + "…" : description;
    const shareText = `${shortDesc}\n\n🔗 ${url}`;

    // Intentar con imagen si el navegador lo soporta
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const absImageUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `${window.location.origin}${imageUrl}`;

        let files: File[] | undefined;
        try {
          const res = await fetch(absImageUrl);
          const blob = await res.blob();
          const file = new File([blob], "producto.jpg", { type: blob.type });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            files = [file];
          }
        } catch {
          // no se pudo obtener la imagen, continuar sin ella
        }

        await navigator.share({
          title,
          text: shortDesc,
          url,
          ...(files ? { files } : {}),
        });
        return;
      } catch (err: unknown) {
        // El usuario canceló el share — no hacer nada
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    // Fallback: copiar URL al portapapeles
    try {
      await navigator.clipboard.writeText(`${title}\n\n${shareText}`);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      // último recurso
      prompt("Copia este enlace:", url);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant text-on-surface-muted hover:bg-surface-container hover:text-on-surface transition text-sm font-medium w-fit mx-auto"
      title="Compartir producto"
    >
      <span
        className="material-symbol"
        style={{
          fontSize: "18px",
          fontVariationSettings: state === "copied" ? "'FILL' 1" : "'FILL' 0",
          ...(state === "copied"
            ? { color: "#22c55e" }
            : {
                background: "linear-gradient(135deg, #6366f1, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }),
        }}
      >
        {state === "copied" ? "check_circle" : "share"}
      </span>
      {state === "copied" ? "¡Enlace copiado!" : "Compartir"}
    </button>
  );
}
