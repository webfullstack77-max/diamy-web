"use client";

import { useState, useEffect, useRef } from "react";

type Tone = "promocional" | "festivo" | "informativo";
type Channel = "whatsapp" | "facebook" | "instagram";

interface Product {
  id: string;
  title: string;
  slug: string;
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
  errorLog: string | null;
  fbPostId: string | null;
  igPostId: string | null;
  videoUrl: string | null;
  imageUrls: string | null;
}

interface AutoConfig {
  id: string;
  enabled: boolean;
  channels: string;
  nextPublishDate: string | null;
  lastPublishedAt: string | null;
  lastProductTitle: string | null;
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoPredictionId, setVideoPredictionId] = useState<string | null>(null);
  const [useVideo, setUseVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const [igTest, setIgTest] = useState<{ ok: boolean; username?: string; accountType?: string; error?: string } | null>(null);
  const [testingIg, setTestingIg] = useState(false);

  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoChannels, setAutoChannels] = useState<Channel[]>(["whatsapp"]);
  const [autoNextPublishDate, setAutoNextPublishDate] = useState<string | null>(null);
  const [autoLastPublishedAt, setAutoLastPublishedAt] = useState<string | null>(null);
  const [autoLastProductTitle, setAutoLastProductTitle] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoConfigId, setAutoConfigId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []));
    loadHistory();
    loadAutoConfig();
  }, []);

  async function loadAutoConfig() {
    const res = await fetch("/api/admin/auto-publish");
    if (!res.ok) return;
    const d = await res.json();
    const c: AutoConfig = d.config;
    setAutoConfigId(c.id);
    setAutoEnabled(c.enabled);
    try { setAutoChannels(JSON.parse(c.channels) as Channel[]); } catch { setAutoChannels(["whatsapp"]); }
    setAutoNextPublishDate(c.nextPublishDate);
    setAutoLastPublishedAt(c.lastPublishedAt);
    setAutoLastProductTitle(c.lastProductTitle);
  }

  async function handleSaveAutoConfig() {
    setAutoSaving(true);
    let nextDate = autoNextPublishDate;
    if (autoEnabled && !nextDate) {
      nextDate = new Date().toISOString().split("T")[0];
    }
    await fetch("/api/admin/auto-publish", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: autoEnabled, channels: autoChannels, nextPublishDate: nextDate }),
    });
    await loadAutoConfig();
    setAutoSaving(false);
  }

  function toggleAutoChannel(ch: Channel) {
    setAutoChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  async function loadHistory() {
    const res = await fetch("/api/admin/ads");
    if (res.ok) {
      const d = await res.json();
      setHistory(d.ads ?? []);
    }
  }

  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleResend(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/ads/${id}/resend`, { method: "POST" });
    if (res.ok) await loadHistory();
    setBusyId(null);
  }

  async function handleTestIg() {
    setTestingIg(true);
    setIgTest(null);
    const res = await fetch("/api/admin/test-instagram");
    const d = await res.json();
    setIgTest(d);
    setTestingIg(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este anuncio del historial?")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    if (res.ok) await loadHistory();
    setBusyId(null);
  }

  function handleProductSelect(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setSelectedProduct(p);
    // No pre-cargar imagen por defecto de catálogo para dar total libertad de subir JPEGs
    setImageUrl("");
    setImagePreview("");
    setImageUrls([]);
    setCaption("");
    setHashtags("");
    resetVideo();
  }

  function removeImage(index: number) {
    if (index === 0) {
      if (imageUrls.length > 0) {
        const nextPrimary = imageUrls[0];
        setImageUrl(nextPrimary);
        setImagePreview(nextPrimary);
        setImageUrls((prev) => prev.slice(1));
      } else {
        setImageUrl("");
        setImagePreview("");
      }
    } else {
      setImageUrls((prev) => prev.filter((_, idx) => idx !== index - 1));
    }
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
      if (!imageUrl) {
        setImageUrl(url);
        setImagePreview(url);
        setSelectedProduct(null);
      } else {
        // Agregar al carrusel (máx 10)
        setImageUrls((prev) => prev.length < 9 ? [...prev, url] : prev);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCarouselUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (res.ok) {
      const { url } = await res.json();
      setImageUrls((prev) => prev.length < 9 ? [...prev, url] : prev);
    }
    setUploading(false);
    if (carouselInputRef.current) carouselInputRef.current.value = "";
  }

  function resetVideo() {
    if (videoPollingRef.current) clearInterval(videoPollingRef.current);
    setVideoUrl(null);
    setVideoPredictionId(null);
    setVideoGenerating(false);
    setUseVideo(false);
    setVideoError(null);
  }

  async function handleGenerateVideo() {
    if (!imageUrl) return;
    resetVideo();
    setVideoGenerating(true);
    setVideoError(null);
    const res = await fetch("/api/admin/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    const d = await res.json();
    if (!res.ok || !d.predictionId) {
      setVideoError(d.error ?? "Error al iniciar la generación");
      setVideoGenerating(false);
      return;
    }
    setVideoPredictionId(d.predictionId);
    // Polling cada 5 segundos
    videoPollingRef.current = setInterval(async () => {
      const poll = await fetch(`/api/admin/generate-video/${d.predictionId}`);
      const pd = await poll.json();
      if (pd.status === "done") {
        clearInterval(videoPollingRef.current!);
        setVideoUrl(pd.videoUrl);
        setVideoGenerating(false);
        setUseVideo(true);
      } else if (pd.status === "error") {
        clearInterval(videoPollingRef.current!);
        setVideoError(pd.error ?? "La generación falló");
        setVideoGenerating(false);
      }
    }, 5000);
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
    const allImages = [imageUrl, ...imageUrls].filter(Boolean);
    const body = {
      title: selectedProduct?.title ?? "Anuncio personalizado",
      imageUrl,
      caption,
      hashtags,
      channels,
      scheduleTime: scheduleNow ? null : scheduleTime || null,
      productUrl: selectedProduct?.slug ? `/producto/${selectedProduct.slug}` : null,
      videoUrl: useVideo && videoUrl ? videoUrl : null,
      imageUrls: allImages.length > 1 ? allImages : null,
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
        setImageUrls([]);
        setSelectedProduct(null);
        setChannels(["whatsapp"]);
        setScheduleNow(true);
        setScheduleTime("");
        resetVideo();
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
        {/* Autopiloto */}
        <section className="bg-surface rounded-2xl border border-outline-variant p-6">
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbol" style={{ fontSize: "22px" }}>smart_toy</span>
            Autopiloto de Publicación
          </h2>

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-on-surface">Publicación automática</p>
              <p className="text-xs text-on-surface-muted mt-0.5">
                Publica un producto al azar en días alternos a las 9 PM
              </p>
            </div>
            <button
              onClick={() => setAutoEnabled((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${autoEnabled ? "bg-primary" : "bg-outline-variant"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoEnabled ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-on-surface mb-2">Canales:</p>
            <div className="flex flex-wrap gap-2">
              {(["whatsapp", "facebook", "instagram"] as Channel[]).map((ch) => (
                <button
                  key={ch}
                  onClick={() => toggleAutoChannel(ch)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition ${
                    autoChannels.includes(ch)
                      ? "bg-primary/10 text-primary border-primary"
                      : "border-outline-variant text-on-surface-muted hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbol" style={{ fontSize: "16px" }}>{CHANNEL_ICONS[ch]}</span>
                  {CHANNEL_LABELS[ch]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-muted mb-5">
            {autoNextPublishDate ? (
              <span className="flex items-center gap-1">
                <span className="material-symbol" style={{ fontSize: "14px" }}>event</span>
                Próxima: {new Date(autoNextPublishDate + "T12:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-on-surface-muted/60">
                <span className="material-symbol" style={{ fontSize: "14px" }}>event</span>
                Sin fecha programada
              </span>
            )}
            {autoLastProductTitle && autoLastPublishedAt && (
              <span className="flex items-center gap-1">
                <span className="material-symbol" style={{ fontSize: "14px" }}>check_circle</span>
                Última: &ldquo;{autoLastProductTitle}&rdquo; — {new Date(autoLastPublishedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
              </span>
            )}
          </div>

          <button
            onClick={handleSaveAutoConfig}
            disabled={autoSaving || !autoConfigId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-dark transition disabled:opacity-50"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>save</span>
            {autoSaving ? "Guardando..." : "Guardar configuración"}
          </button>
        </section>

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
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <input ref={carouselInputRef} type="file" accept="image/*" className="hidden" onChange={handleCarouselUpload} />
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

          {/* Vista previa imagen principal */}
          {imagePreview && (
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Principal" className="w-20 h-20 object-cover rounded-xl border-2 border-primary" />
                  <span className="absolute -top-1.5 -left-1.5 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</span>
                  <button
                    onClick={() => removeImage(0)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                  >✕</button>
                </div>
                {imageUrls.map((u, i) => (
                  <div key={u} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt={`img ${i + 2}`} className="w-20 h-20 object-cover rounded-xl border border-outline-variant" />
                    <button
                      onClick={() => removeImage(i + 1)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                    >✕</button>
                  </div>
                ))}
                {([imageUrl].filter(Boolean).length + imageUrls.length) < 10 && (
                  <button
                    onClick={() => carouselInputRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-muted hover:border-primary hover:text-primary transition flex flex-col items-center justify-center gap-1 text-xs disabled:opacity-50"
                  >
                    <span className="material-symbol" style={{ fontSize: "22px" }}>add_photo_alternate</span>
                    Añadir
                  </button>
                )}
              </div>
              {imageUrls.length > 0 && (
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <span className="material-symbol" style={{ fontSize: "14px" }}>view_carousel</span>
                  Carrusel ({1 + imageUrls.length} imágenes)
                </p>
              )}
            </div>
          )}

          {/* Video IA */}
          {imageUrl && (
            <div className="mt-4 pt-4 border-t border-outline-variant">
              <p className="text-sm font-medium text-on-surface mb-2 flex items-center gap-1.5">
                <span className="material-symbol" style={{ fontSize: "18px" }}>movie</span>
                Generar Video IA (Reel)
              </p>
              {!videoGenerating && !videoUrl && (
                <button
                  onClick={handleGenerateVideo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition"
                >
                  <span className="material-symbol" style={{ fontSize: "18px" }}>auto_awesome</span>
                  Generar Video con IA (~3 min)
                </button>
              )}
              {videoGenerating && (
                <div className="flex items-center gap-3 text-sm text-on-surface-muted">
                  <span className="material-symbol animate-spin" style={{ fontSize: "20px" }}>progress_activity</span>
                  <span>Generando video con IA… puede tardar 2-4 minutos</span>
                </div>
              )}
              {videoError && (
                <p className="text-xs text-red-500 mt-1">{videoError}</p>
              )}
              {videoUrl && (
                <div className="space-y-2">
                  <video src={videoUrl} controls className="w-full max-w-xs rounded-xl border border-outline-variant" />
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="mediaType" checked={!useVideo} onChange={() => setUseVideo(false)} />
                      Usar imagen
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-primary font-medium">
                      <input type="radio" name="mediaType" checked={useVideo} onChange={() => setUseVideo(true)} />
                      Usar video (Reel)
                    </label>
                  </div>
                  <button onClick={handleGenerateVideo} className="text-xs text-on-surface-muted hover:text-primary transition">
                    Regenerar video
                  </button>
                </div>
              )}
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

          {channels.includes("instagram") && (
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleTestIg}
                disabled={testingIg}
                className="flex items-center gap-1.5 text-xs text-on-surface-muted hover:text-primary transition disabled:opacity-50"
              >
                <span className="material-symbol" style={{ fontSize: "16px" }}>verified</span>
                {testingIg ? "Verificando..." : "Probar conexión IG"}
              </button>
              {igTest && (
                <span className={`text-xs font-medium ${igTest.ok ? "text-green-600" : "text-red-600"}`}>
                  {igTest.ok ? `✓ @${igTest.username}` : `✗ ${igTest.error}`}
                </span>
              )}
            </div>
          )}

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
                    <div className="relative shrink-0">
                      {ad.videoUrl ? (
                        <video src={ad.videoUrl} className="w-12 h-12 object-cover rounded-lg" muted />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={ad.imageUrl.startsWith("/") ? ad.imageUrl : `/${ad.imageUrl}`} alt={ad.title} className="w-12 h-12 object-cover rounded-lg" />
                      )}
                      {ad.videoUrl && (
                        <span className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-0.5">
                          <span className="material-symbol" style={{ fontSize: "10px" }}>play_arrow</span>
                        </span>
                      )}
                      {ad.imageUrls && !ad.videoUrl && (
                        <span className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-0.5">
                          <span className="material-symbol" style={{ fontSize: "10px" }}>view_carousel</span>
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{ad.title}</p>
                      <p className="text-xs text-on-surface-muted flex flex-wrap gap-x-1">
                        {adChannels.map((c) => {
                          const hasSuccess =
                            (c === "facebook" && ad.fbPostId) ||
                            (c === "instagram" && ad.igPostId);
                          return (
                            <span key={c} className={hasSuccess ? "text-green-600" : ""}>
                              {hasSuccess ? "✓ " : ""}{CHANNEL_LABELS[c as Channel] ?? c}
                            </span>
                          );
                        })}
                        <span>· {new Date(ad.scheduleTime).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </p>
                      {ad.errorLog && (
                        <p className="text-xs text-red-500 mt-0.5 truncate" title={ad.errorLog}>{ad.errorLog}</p>
                      )}
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[ad.status] ?? STATUS_STYLES.scheduled}`}>
                      {STATUS_LABELS[ad.status] ?? ad.status}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleResend(ad.id)}
                        disabled={busyId === ad.id}
                        title="Reenviar"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-muted hover:bg-primary/10 hover:text-primary transition disabled:opacity-40"
                      >
                        <span className="material-symbol" style={{ fontSize: "20px" }}>
                          {busyId === ad.id ? "hourglass_empty" : "send"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        disabled={busyId === ad.id}
                        title="Eliminar"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-muted hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
                      >
                        <span className="material-symbol" style={{ fontSize: "20px" }}>delete</span>
                      </button>
                    </div>
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
