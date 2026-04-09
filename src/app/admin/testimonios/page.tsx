"use client";

import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  token: string;
  author: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  text: string | null;
  rating: number;
  orderNote: string | null;
  isPublished: boolean;
  isSubmitted: boolean;
  submittedAt: string | null;
  createdAt: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className="material-symbol text-secondary-dark"
          style={{ fontSize: 16, fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function TestimoniosAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderNote, setOrderNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/testimonials");
    const data = await res.json();
    setTestimonials(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleGenerate() {
    setGenerating(true);
    setGeneratedUrl("");
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNote }),
    });
    const data = await res.json();
    setGeneratedUrl(data.url);
    setOrderNote("");
    setGenerating(false);
    load();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPublished: !current } : t))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este testimonio?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }

  const submitted = testimonials.filter((t) => t.isSubmitted);
  const pending = testimonials.filter((t) => !t.isSubmitted);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Testimonios de clientes</h1>

      {/* Generar enlace */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-5 mb-8">
        <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbol text-primary" style={{ fontSize: 20 }}>link</span>
          Generar enlace de reseña
        </h2>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="Nota del pedido (opcional) — ej: Tazas boda Laura"
            className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? "Generando..." : "Generar enlace"}
          </button>
        </div>

        {generatedUrl && (
          <div className="mt-4 flex items-center gap-3 bg-primary-container/30 rounded-xl px-4 py-3">
            <span className="text-sm text-on-surface flex-1 break-all font-mono">{generatedUrl}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:opacity-90 flex items-center gap-1"
            >
              <span className="material-symbol" style={{ fontSize: 14 }}>
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        )}
      </div>

      {/* Reseñas recibidas */}
      <h2 className="text-base font-semibold text-on-surface mb-3">
        Reseñas recibidas{submitted.length > 0 && <span className="ml-2 text-xs bg-primary text-on-primary rounded-full px-2 py-0.5">{submitted.length}</span>}
      </h2>

      {loading ? (
        <p className="text-on-surface-muted text-sm">Cargando...</p>
      ) : submitted.length === 0 ? (
        <p className="text-on-surface-muted text-sm bg-surface rounded-2xl border border-outline-variant p-5">
          Aún no hay reseñas recibidas. Genera un enlace y compártelo con tus clientes.
        </p>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {submitted.map((t) => (
            <div key={t.id} className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-on-surface">{t.author || "—"}</span>
                    {t.role && <span className="text-xs text-on-surface-muted">· {t.role}</span>}
                    <StarDisplay rating={t.rating} />
                  </div>
                  {t.orderNote && (
                    <span className="text-xs bg-surface-container text-on-surface-muted rounded-full px-2 py-0.5 inline-block mb-1">
                      {t.orderNote}
                    </span>
                  )}
                  <p className="text-sm text-on-surface-muted line-clamp-2">{t.text}</p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-xs text-on-surface-muted whitespace-nowrap">Mostrar en página</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={t.isPublished}
                        onChange={() => togglePublish(t.id, t.isPublished)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                    </div>
                  </label>
                  <button
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                    className="text-on-surface-muted hover:text-on-surface"
                    title="Ver detalle"
                  >
                    <span className="material-symbol" style={{ fontSize: 18 }}>
                      {expanded === t.id ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-error hover:opacity-70"
                    title="Eliminar"
                  >
                    <span className="material-symbol" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Detalle expandido */}
              {expanded === t.id && (
                <div className="border-t border-outline-variant px-4 py-3 bg-surface-container/40 text-sm grid grid-cols-2 gap-x-6 gap-y-2">
                  <div><span className="text-on-surface-muted text-xs">Correo</span><p className="text-on-surface">{t.email || "—"}</p></div>
                  <div><span className="text-on-surface-muted text-xs">Celular</span><p className="text-on-surface">{t.phone || "—"}</p></div>
                  <div className="col-span-2"><span className="text-on-surface-muted text-xs">Comentario completo</span><p className="text-on-surface">{t.text}</p></div>
                  <div><span className="text-on-surface-muted text-xs">Fecha de envío</span><p className="text-on-surface">{t.submittedAt ? new Date(t.submittedAt).toLocaleDateString("es-MX") : "—"}</p></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pendientes */}
      {pending.length > 0 && (
        <>
          <h2 className="text-base font-semibold text-on-surface mb-3">
            Pendientes de respuesta
            <span className="ml-2 text-xs bg-surface-container text-on-surface-muted rounded-full px-2 py-0.5">{pending.length}</span>
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map((t) => (
              <div key={t.id} className="bg-surface rounded-2xl border border-outline-variant px-4 py-3 flex items-center gap-3">
                <span className="material-symbol text-on-surface-muted" style={{ fontSize: 18 }}>schedule</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-on-surface-muted">
                    {t.orderNote || "Sin nota"} · generado el {new Date(t.createdAt).toLocaleDateString("es-MX")}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-error hover:opacity-70"
                  title="Eliminar enlace"
                >
                  <span className="material-symbol" style={{ fontSize: 18 }}>delete</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
