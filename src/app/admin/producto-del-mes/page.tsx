"use client";

import { useState, useEffect, useRef } from "react";

export default function ProductOfMonthAdmin() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/product-of-month")
      .then((r) => r.json())
      .then((data) => {
        if (data.imageUrl) setImageUrl(data.imageUrl);
        if (data.text) setText(data.text);
      });
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setImageUrl(data.url);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/product-of-month", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, text }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface font-serif">Producto del Mes</h1>
        <p className="text-on-surface-muted text-sm mt-1">
          La imagen y texto que se muestran en la página principal entre categorías y "¿Cómo funciona?".
        </p>
      </div>

      {/* Preview / Upload */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-5">
        <div>
          <p className="text-sm font-medium text-on-surface mb-3">Imagen</p>
          {imageUrl ? (
            <div className="relative w-full max-w-xs rounded-xl overflow-hidden border border-outline-variant aspect-square bg-surface-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Producto del mes" className="w-full h-full object-cover" />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
              >
                <span className="material-symbol text-white" style={{ fontSize: "16px" }}>close</span>
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full max-w-xs aspect-square rounded-xl border-2 border-dashed border-outline-variant bg-surface-container flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition"
            >
              <span className="material-symbol text-outline" style={{ fontSize: "40px" }}>add_photo_alternate</span>
              <p className="text-sm text-on-surface-muted">Haz clic para subir imagen</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-outline-variant hover:bg-surface-container transition disabled:opacity-50"
          >
            <span className="material-symbol" style={{ fontSize: "16px" }}>upload</span>
            {uploading ? "Subiendo..." : imageUrl ? "Cambiar imagen" : "Subir imagen"}
          </button>
        </div>

        {/* Texto */}
        <div>
          <label className="text-sm font-medium text-on-surface block mb-2">
            Texto debajo de la imagen
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Ej: Este mes tenemos una oferta especial en nuestras tazas personalizadas..."
            className="w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Guardar */}
        <button
          onClick={handleSave}
          disabled={saving || !imageUrl}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbol" style={{ fontSize: "16px" }}>
            {saved ? "check_circle" : "save"}
          </span>
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
