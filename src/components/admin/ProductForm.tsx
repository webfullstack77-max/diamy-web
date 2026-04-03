"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/types";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
}

interface Props {
  categories: Category[];
  product?: Product;
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    slug: product?.slug ?? "",
    title: product?.title ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    originalPrice: product?.originalPrice?.toString() ?? "",
    categoryId: product?.categoryId ?? (categories[0]?.id ?? ""),
    subcategoryId: product?.subcategoryId ?? "",
    materials: product?.materials?.join(", ") ?? "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isCollection: product?.isCollection ?? false,
    variablePrice: (product as any)?.variablePrice ?? false,
    images: product?.images ?? [] as string[],
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function set(key: string, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        uploaded.push(url);
      }
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    setUploading(false);
  }

  function isVideo(url: string) {
    return url.match(/\.(mp4|webm)(\?|$)/i) !== null;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    await uploadFiles(files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type === "video/mp4" || f.type === "video/webm"
    );
    uploadFiles(files);
  }

  function removeImage(index: number) {
    set("images", form.images.filter((_, i) => i !== index));
  }

  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      const file = Array.from(e.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      }
      setUploading(false);
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  async function handleGenerateDescription() {
    if (!form.title) { setError("Escribe el título primero"); return; }
    setGenerating(true);
    setError("");
    const res = await fetch("/api/admin/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, images: form.images }),
    });
    const data = await res.json();
    if (data.description) set("description", data.description);
    else setError(data.error ?? "Error al generar descripción");
    setGenerating(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      slug: form.slug,
      title: form.title,
      description: form.description,
      price: form.variablePrice ? 0 : parseFloat(form.price),
      originalPrice: form.variablePrice ? null : (form.originalPrice ? parseFloat(form.originalPrice) : null),
      categoryId: form.categoryId,
      materials: form.materials.split(",").map((m) => m.trim()).filter(Boolean),
      subcategoryId: form.subcategoryId || null,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isCollection: form.isCollection,
      variablePrice: form.variablePrice,
      images: form.images,
    };

    const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/productos");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!product || !confirm("¿Eliminar este producto?")) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/productos");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Básico */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
        <h2 className="font-semibold text-on-surface">Información básica</h2>
        <Field label="Título">
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Slug (URL)">
          <input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} required pattern="[a-z0-9-]+" className={inputCls} />
          <p className="text-xs text-on-surface-muted mt-1">Solo letras minúsculas, números y guiones</p>
        </Field>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-on-surface">Descripción</label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generating || !form.title}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbol" style={{ fontSize: "14px" }}>
                {generating ? "hourglass_empty" : "auto_awesome"}
              </span>
              {generating ? "Generando..." : "Generar con IA"}
            </button>
          </div>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={4} className={inputCls} />
        </div>
        <Field label="Categoría">
          <select
            value={form.categoryId}
            onChange={(e) => { set("categoryId", e.target.value); set("subcategoryId", ""); }}
            className={inputCls}
          >
            {categories.filter((c) => !c.parentId).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        {/* Subcategoría — solo si la categoría elegida tiene hijos */}
        {(() => {
          const selected = categories.find((c) => c.id === form.categoryId);
          const subs = selected?.children ?? [];
          if (subs.length === 0) return null;
          return (
            <Field label="Subcategoría">
              <select value={form.subcategoryId} onChange={(e) => set("subcategoryId", e.target.value)} className={inputCls}>
                <option value="">— Sin subcategoría —</option>
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          );
        })()}
      </div>

      {/* Precio */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
        <h2 className="font-semibold text-on-surface">Precio</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio ($)">
            <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} required={!form.variablePrice} disabled={form.variablePrice} min="0" step="0.01" className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`} />
          </Field>
          <Field label="Precio original (opcional)">
            <input type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} disabled={form.variablePrice} min="0" step="0.01" className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`} />
          </Field>
        </div>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.variablePrice}
            onChange={(e) => set("variablePrice", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary"
          />
          <div>
            <span className="text-sm font-medium text-on-surface">Precio variable</span>
            <p className="text-xs text-outline mt-0.5">Se mostrará: "El precio cambia de acuerdo al modelo, pide tu cotización"</p>
          </div>
        </label>
      </div>

      {/* Materiales */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
        <h2 className="font-semibold text-on-surface">Materiales</h2>
        <Field label="Materiales (separados por coma)">
          <input type="text" value={form.materials} onChange={(e) => set("materials", e.target.value)} placeholder="Acrílico, Madera, MDF" className={inputCls} />
        </Field>
      </div>

      {/* Imágenes */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
        <h2 className="font-semibold text-on-surface">Imágenes</h2>

        {/* Zona de drag & drop */}
        <label
          className={`flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl border-2 border-dashed cursor-pointer transition ${
            dragOver ? "border-primary bg-primary-container/30" : "border-outline-variant hover:border-primary/60"
          } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span className="material-symbol text-primary" style={{ fontSize: "32px" }}>
            {uploading ? "hourglass_empty" : "upload_file"}
          </span>
          <p className="text-sm font-medium text-on-surface">
            {uploading ? "Subiendo archivos..." : "Arrastra imágenes o videos aquí"}
          </p>
          <p className="text-xs text-on-surface-muted">JPG, PNG, WebP · MP4, WebM (máx 50MB) · puedes elegir varios</p>
          <input type="file" accept="image/*,video/mp4,video/webm" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
        </label>

        {/* Miniaturas */}
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-20 h-20">
                {isVideo(img) ? (
                  <div className="w-full h-full rounded-lg bg-surface-container border border-outline-variant flex flex-col items-center justify-center gap-1">
                    <span className="material-symbol text-primary" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    <span className="text-[9px] text-on-surface-muted font-medium">VIDEO</span>
                  </div>
                ) : (
                  <Image src={img} alt={`img ${i}`} fill className="object-cover rounded-lg" sizes="80px" />
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pegar URL */}
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const url = urlInput.trim();
                if (url) { set("images", [...form.images, url]); setUrlInput(""); }
              }
            }}
            placeholder="Pegar URL de imagen y presionar Enter"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => {
              const url = urlInput.trim();
              if (url) { set("images", [...form.images, url]); setUrlInput(""); }
            }}
            className="px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm hover:bg-primary-container transition shrink-0"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>add_link</span>
          </button>
        </div>
      </div>

      {/* Estado */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="font-medium text-on-surface">Producto activo (visible en el catálogo)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => set("isFeatured", e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="font-medium text-on-surface">Mostrar en "Productos Destacados" del inicio</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isCollection}
            onChange={(e) => set("isCollection", e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <div>
            <span className="font-medium text-on-surface">Mostrar selector de modelos</span>
            <p className="text-xs text-on-surface-muted">Para colecciones con múltiples diseños (tazas, playeras, etc.)</p>
          </div>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-dark transition disabled:opacity-60"
        >
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition"
        >
          Cancelar
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto px-4 py-2.5 rounded-xl text-error border border-error/30 hover:bg-red-50 text-sm font-medium transition"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";
