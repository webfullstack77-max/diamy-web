"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface DailyPromo {
  id: string;
  imageUrl: string;
  activeDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function ImagenDelDiaAdmin() {
  const [promos, setPromos] = useState<DailyPromo[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [activeDate, setActiveDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/admin/daily-promo");
    if (res.ok) setPromos(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setImageUrl(data.url);
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!imageUrl || !activeDate) return;
    setSaving(true);
    await fetch("/api/admin/daily-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, activeDate }),
    });
    setImageUrl("");
    setActiveDate("");
    if (fileRef.current) fileRef.current.value = "";
    await load();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/admin/daily-promo/${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  function isToday(dateStr: string) {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  }

  function isPast(dateStr: string) {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return d < new Date();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-on-surface">Imagen del día</h1>
        <p className="text-sm text-on-surface-muted mt-1">
          Programa una imagen para que aparezca como popup en el inicio ese día.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
        <h2 className="font-semibold text-on-surface">Nueva imagen</h2>

        {/* Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-muted mb-2">
            Imagen
          </label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container hover:bg-primary-container hover:border-primary transition text-sm font-medium text-on-surface disabled:opacity-50"
          >
            <span className="material-symbol text-primary" style={{ fontSize: "18px" }}>upload</span>
            {uploading ? "Subiendo…" : "Seleccionar imagen"}
          </button>
          {imageUrl && (
            <div className="mt-3 relative w-40 h-40 rounded-xl overflow-hidden border border-outline-variant">
              <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="160px" />
            </div>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-muted mb-2">
            Fecha de publicación
          </label>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setActiveDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!imageUrl || !activeDate || saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-40"
        >
          <span className="material-symbol" style={{ fontSize: "18px" }}>save</span>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>

      {/* Historial */}
      <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h2 className="font-semibold text-on-surface">Historial</h2>
        </div>
        {promos.length === 0 ? (
          <div className="px-6 py-10 text-center text-on-surface-muted text-sm">
            Sin imágenes programadas aún.
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {promos.map((p) => {
              const today = isToday(p.activeDate);
              const past = isPast(p.activeDate);
              return (
                <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-outline-variant shrink-0">
                    <Image src={p.imageUrl} alt="Promo" fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface">{formatDate(p.activeDate)}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      today ? "bg-green-100 text-green-700"
                        : past ? "bg-surface-container text-on-surface-muted"
                        : "bg-primary-container text-primary"
                    }`}>
                      <span className="material-symbol" style={{ fontSize: "12px" }}>
                        {today ? "check_circle" : past ? "history" : "schedule"}
                      </span>
                      {today ? "Activa hoy" : past ? "Expirada" : "Próxima"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-muted hover:text-error hover:bg-error/10 transition disabled:opacity-40"
                  >
                    <span className="material-symbol" style={{ fontSize: "18px" }}>
                      {deleting === p.id ? "hourglass_empty" : "delete"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
