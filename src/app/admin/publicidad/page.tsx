"use client";

import { useState, useEffect, useRef } from "react";

type Tone = "promocional" | "festivo" | "informativo";
type Channel = "whatsapp" | "facebook" | "instagram";

interface Product {
  id: string;
  title: string;
  images: string[];
}

interface AdRecord {
  id: string;
  title: string;
  imageUrl: string;
  caption: string;
  channels: string;
  scheduleTime: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

const CHANNEL_ICONS: Record<Channel, string> = {
  whatsapp: "chat",
  facebook: "thumb_up",
  instagram: "photo_camera",
};

const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  sent: "bg-green-50 text-green-700 border-green-200",
  partial: "bg-yellow-50 text-yellow-700 border-yellow-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  sent: "Enviado",
  partial: "Parcial",
  failed: "Error",
};

export default function PublicidadPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const [tone, setTone] = useState<Tone>("promocional");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [generating, setGenerating] = useState(false);

  const [channels, setChannels] = useState<Channel[]>(["whatsapp"]);
  const [scheduleNow, setScheduleNow] = useState(true);
  const [scheduleTime, setScheduleTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [history, setHistory] = useState<AdRecord[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []));
    loadHistory();
  }, []);

  async function loadHistory() {
    const res = await fetch("/api/admin/ads");
    if (res.ok) {
      const d = await res.json();
      setHistory(d.ads ?? []);
    }
  }

  function handleProductSelect(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setSelectedProduct(p);
    const img = p.images?.[0] ?? "";
    setImageUrl(img);
    setImagePreview(img);
    setCaption("");
    setHashtags("");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (res.ok) {
      const { url } = await res.json();
      setImageUrl(url);
      setImagePreview(url);
      setSelectedProduct(null);
    }
    setUploading(false);
  }

  async function handleGenerate() {
    if (!imageUrl && !selectedProduct) return;
    setGenerating(true);
    setCaption("");
    setHashtags("");
    const res = await fetch("/api/admin/generate-ad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl,
        productName: selectedProduct?.title ?? "producto personalizado",
        tone,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setCaption(d.caption ?? "");
      setHashtags(d.hashtags ?? "");
    }
    setGenerating(false);
  }

  function toggleChannel(ch: Channel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  async function handleSubmit() {
    if (!imageUrl || !caption || channels.length === 0) return;
    setSubmitting(true);
    const body = {
      title: selectedProduct?.title ?? "Anuncio personalizado",
      imageUrl,
      caption,
      hashtags,
      channels,
      scheduleTime: scheduleNow ? null : scheduleTime || null,
    };
    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setSuccess(true);
      await loadHistory();
      setTimeout(() => {
        setSuccess(false);
        setCaption("");
        setHashtags("");
        setImageUrl("");
        setImagePreview("");
        setSelectedProduct(null);
        setChannels(["whatsapp"]);
        setScheduleNow(true);
        setScheduleTime("");
      }, 2500);
    }
    setSubmitting(false);
  }

  const fullText = [caption, hashtags].filter(Boolean).join("\n\n");
  const canGenerate = !!(imageUrl || selectedProduct);
  const canSubmit = !!(imageUrl && caption && channels.length > 0);

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-2">Publicidad</h1>
      <p className="text-on-surface-muted text-sm mb-8">
        Genera anuncios con IA y publícalos en WhatsApp, Facebook e Instagram.
      </p>

      <div className="space-y-6">
        {/* Paso 1 */}
        <section className="bg-surface rounded-2xl border border-outline-variant p-6">
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">1</span>
            Imagen del producto
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Seleccionar del catálogo
            </label>
            <select
              value={selectedProduct?.id ?? ""}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              <option value="">— Elegir producto —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <div className="text-xs text-on-surface-muted text-center mb-2">— o sube una foto —</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-3 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-muted text-sm hover:border-primary hover:text-primary transition disabled:opacity-50"
            >
              {uploading ? "Subiendo..." : (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbol" style={{ fontSize: "20px" }}>upload</span>
                  Subir imagen
                </span>
              )}
            </button>
          </div>

          {imagePreview && (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-40 h-40 object-cover rounded-xl border border-outline-variant"
              />
            </div>
          )}
        </section>

        {/* Paso 2 */}
        <section className="bg-surface rounded-2xl border border-outline-variant p-6">
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">2</span>
            Generar texto con IA
          </h2>

          <div className="flex gap-2 mb-4">
            {(["promocional", "festivo", "informativo"] as Tone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                  tone === t
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className="mb-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-dark transition disabled:opacity-50"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>
              {generating ? "hourglass_empty" : "auto_awesome"}
            </span>
            {generating ? "Generando..." : "Generar anuncio con IA"}
          </button>

          {(caption || generating) && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-on-surface-muted mb-1">Texto del anuncio</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                  placeholder={generating ? "Generando..." : ""}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-muted mb-1">Hashtags</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="#laser #personalizado #regalo"
                />
              </div>
              <p className="text-xs text-on-surface-muted">
                Puedes editar el texto antes de publicar.{" "}
                <span className="font-medium">{fullText.split(/\s+/).filter(Boolean).length} palabras</span>
              </p>
            </div>
          )}
        </section>

        {/* Paso 3 */}
        <section className="bg-surface rounded-2xl border border-outline-variant p-6">
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">3</span>
            Canales y programación
          </h2>

          <div className="mb-5">
            <p className="text-sm font-medium text-on-surface mb-3">Publicar en:</p>
            <div className="flex flex-wrap gap-3">
              {(["whatsapp", "facebook", "instagram"] as Channel[]).map((ch) => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                    channels.includes(ch)
                      ? "bg-primary/10 text-primary border-primary"
                      : "border-outline-variant text-on-surface-muted hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbol" style={{ fontSize: "18px" }}>
                    {CHANNEL_ICONS[ch]}
                  </span>
                  {CHANNEL_LABELS[ch]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-on-surface mb-2">Hora de envío:</p>
            <div className="flex gap-3">
              <button
                onClick={() => setScheduleNow(true)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  scheduleNow
                    ? "bg-primary/10 text-primary border-primary"
                    : "border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
              >
                Ahora
              </button>
              <button
                onClick={() => setScheduleNow(false)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  !scheduleNow
                    ? "bg-primary/10 text-primary border-primary"
                    : "border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
              >
                Programar
              </button>
            </div>
            {!scheduleNow && (
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="mt-3 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            )}
          </div>

          {success ? (
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 text-green-700 border border-green-200 font-semibold text-sm">
              <span className="material-symbol" style={{ fontSize: "18px" }}>check_circle</span>
              ¡Anuncio programado correctamente!
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-dark transition disabled:opacity-50"
            >
              <span className="material-symbol" style={{ fontSize: "18px" }}>send</span>
              {submitting ? "Guardando..." : "Programar publicación"}
            </button>
          )}
        </section>

        {/* Historial */}
        {history.length > 0 && (
          <section>
            <h2 className="font-semibold text-on-surface mb-3">Historial reciente</h2>
            <div className="space-y-2">
              {history.map((ad) => {
                const adChannels: string[] = (() => {
                  try { return JSON.parse(ad.channels); } catch { return []; }
                })();
                return (
                  <div key={ad.id} className="bg-surface rounded-xl border border-outline-variant p-4 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ad.imageUrl.startsWith("/") ? ad.imageUrl : `/${ad.imageUrl}`}
                      alt={ad.title}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{ad.title}</p>
                      <p className="text-xs text-on-surface-muted">
                        {adChannels.map((c) => CHANNEL_LABELS[c as Channel] ?? c).join(", ")}
                        {" · "}
                        {new Date(ad.scheduleTime).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[ad.status] ?? STATUS_STYLES.scheduled}`}>
                      {STATUS_LABELS[ad.status] ?? ad.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
