"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Collection { uuid: string; name: string; mockups_count?: number; }
interface Mockup { uuid: string; name: string; thumbnail?: { src?: string }; categories?: string[]; }
interface SmartObject { uuid: string; name: string; }
interface MockupDetail extends Mockup { smart_objects: SmartObject[]; }

type Step = "collections" | "mockups" | "design" | "result";

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as unknown[];
  }
  return [];
}

function extractItem(data: unknown): unknown {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    return d.data ?? data;
  }
  return data;
}

export default function MockupsDMPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("collections");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [collectionsError, setCollectionsError] = useState("");

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [loadingMockups, setLoadingMockups] = useState(false);

  const [selectedMockup, setSelectedMockup] = useState<MockupDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSO, setSelectedSO] = useState<string>(""); // smart object uuid

  const [designUrl, setDesignUrl] = useState("");
  const [uploadingDesign, setUploadingDesign] = useState(false);

  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  // Step 1: cargar colecciones
  useEffect(() => {
    fetch("/api/admin/dynamic-mockups/collections")
      .then((r) => r.json())
      .then((d) => {
        const arr = extractArray(d) as Collection[];
        setCollections(arr);
        if (arr.length === 0 && !d?.error) setCollectionsError("No se encontraron colecciones.");
        if (d?.error) setCollectionsError(d.error);
      })
      .catch(() => setCollectionsError("Error de conexión con Dynamic Mockups."))
      .finally(() => setLoadingCollections(false));
  }, []);

  // Step 2: cargar mockups de una colección
  async function selectCollection(col: Collection) {
    setSelectedCollection(col);
    setMockups([]);
    setLoadingMockups(true);
    setStep("mockups");
    try {
      const r = await fetch(`/api/admin/dynamic-mockups/mockups?collection_uuid=${col.uuid}`);
      const d = await r.json();
      setMockups(extractArray(d) as Mockup[]);
    } catch {
      setMockups([]);
    } finally {
      setLoadingMockups(false);
    }
  }

  // Step 3: obtener detalle del mockup (smart objects)
  async function selectMockup(m: Mockup) {
    setLoadingDetail(true);
    setDesignUrl("");
    setRenderError("");
    try {
      const r = await fetch(`/api/admin/dynamic-mockups/mockup/${m.uuid}`);
      const d = await r.json();
      const detail = extractItem(d) as MockupDetail;
      setSelectedMockup(detail);
      const firstSO = detail.smart_objects?.[0]?.uuid ?? "";
      setSelectedSO(firstSO);
      setStep("design");
    } catch {
      setSelectedMockup({ ...m, smart_objects: [] });
      setStep("design");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleUploadDesign(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDesign(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (d.url) setDesignUrl(d.url);
    setUploadingDesign(false);
  }

  async function handleRender() {
    if (!selectedMockup || !designUrl || !selectedSO) return;
    setRendering(true);
    setRenderError("");
    try {
      const r = await fetch("/api/admin/dynamic-mockups/renders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mockup_uuid: selectedMockup.uuid,
          smart_objects: [{ uuid: selectedSO, asset_url: `${window.location.origin}${designUrl}` }],
        }),
      });
      const d = await r.json();
      if (!r.ok || d.error) { setRenderError(d.error ?? "Error al generar"); return; }
      setResultUrl(d.imageUrl);
      setStep("result");
    } catch {
      setRenderError("Error de conexión al generar mockup.");
    } finally {
      setRendering(false);
    }
  }

  function handleSaveToProduct() {
    router.push(`/admin/productos/nuevo?image=${encodeURIComponent(resultUrl)}`);
  }

  function handleSendToAds() {
    router.push(`/admin/publicidad?image=${encodeURIComponent(resultUrl)}`);
  }

  function reset() {
    setStep("collections");
    setSelectedCollection(null);
    setSelectedMockup(null);
    setDesignUrl("");
    setResultUrl("");
    setRenderError("");
  }

  const STEPS = ["Colección", "Template", "Diseño", "Resultado"];
  const STEP_INDEX: Record<Step, number> = { collections: 0, mockups: 1, design: 2, result: 3 };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-on-surface">Mockups Pro</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">Powered by Dynamic Mockups</p>
        </div>
        {step !== "collections" && (
          <button onClick={reset} className="flex items-center gap-1.5 text-sm text-on-surface-muted hover:text-on-surface transition">
            <span className="material-symbol" style={{ fontSize: 16 }}>restart_alt</span>
            Empezar de nuevo
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const current = STEP_INDEX[step];
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done ? "bg-primary text-on-primary" : active ? "bg-primary text-on-primary ring-2 ring-primary/30" : "bg-surface-container text-on-surface-muted"
                }`}>
                  {done ? <span className="material-symbol" style={{ fontSize: 14 }}>check</span> : i + 1}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${active ? "text-primary font-semibold" : "text-on-surface-muted"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 mb-4 rounded-full ${done ? "bg-primary" : "bg-outline-variant"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Colecciones ── */}
      {step === "collections" && (
        <div>
          {loadingCollections && (
            <div className="flex items-center justify-center py-16 text-on-surface-muted text-sm gap-2">
              <span className="material-symbol animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              Cargando colecciones…
            </div>
          )}
          {collectionsError && (
            <div className="bg-error-container/20 border border-error/20 rounded-2xl p-6 text-center">
              <span className="material-symbol text-error" style={{ fontSize: 32 }}>error</span>
              <p className="text-sm text-error mt-2">{collectionsError}</p>
              {collectionsError.includes("no configurado") && (
                <p className="text-xs text-on-surface-muted mt-3 max-w-sm mx-auto">
                  Agrega <code className="bg-surface-container px-1 rounded">DYNAMIC_MOCKUPS_API_KEY</code> en tus variables de entorno. Crea tu cuenta gratis en{" "}
                  <a href="https://dynamicmockups.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">dynamicmockups.com</a>.
                </p>
              )}
            </div>
          )}
          {!loadingCollections && collections.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {collections.map((col) => (
                <button
                  key={col.uuid}
                  onClick={() => selectCollection(col)}
                  className="bg-surface border border-outline-variant rounded-2xl p-5 text-left hover:border-primary/50 hover:shadow-sm transition group"
                >
                  <span className="material-symbol text-primary group-hover:scale-110 transition-transform inline-block" style={{ fontSize: 28 }}>style</span>
                  <p className="font-semibold text-on-surface text-sm mt-2">{col.name}</p>
                  {col.mockups_count != null && (
                    <p className="text-xs text-on-surface-muted mt-0.5">{col.mockups_count} templates</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Mockups ── */}
      {step === "mockups" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("collections")} className="flex items-center gap-1 text-sm text-on-surface-muted hover:text-on-surface transition">
              <span className="material-symbol" style={{ fontSize: 16 }}>arrow_back</span>
              Colecciones
            </button>
            <span className="text-on-surface-muted">/</span>
            <span className="text-sm font-semibold text-on-surface">{selectedCollection?.name}</span>
          </div>
          {loadingMockups && (
            <div className="flex items-center justify-center py-16 text-on-surface-muted text-sm gap-2">
              <span className="material-symbol animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              Cargando templates…
            </div>
          )}
          {!loadingMockups && mockups.length === 0 && (
            <div className="text-center py-12 text-on-surface-muted text-sm">Sin templates en esta colección.</div>
          )}
          {!loadingMockups && mockups.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockups.map((m) => (
                <button
                  key={m.uuid}
                  onClick={() => selectMockup(m)}
                  disabled={loadingDetail}
                  className="bg-surface border border-outline-variant rounded-2xl overflow-hidden text-left hover:border-primary/50 hover:shadow-sm transition group disabled:opacity-60"
                >
                  {m.thumbnail?.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.thumbnail.src} alt={m.name} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-surface-container flex items-center justify-center">
                      <span className="material-symbol text-outline-variant" style={{ fontSize: 40 }}>image</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs font-medium text-on-surface line-clamp-2">{m.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Diseño ── */}
      {step === "design" && selectedMockup && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("mockups")} className="flex items-center gap-1 text-sm text-on-surface-muted hover:text-on-surface transition">
              <span className="material-symbol" style={{ fontSize: 16 }}>arrow_back</span>
              {selectedCollection?.name}
            </button>
            <span className="text-on-surface-muted">/</span>
            <span className="text-sm font-semibold text-on-surface line-clamp-1">{selectedMockup.name}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Preview del template */}
            <div className="bg-surface-container rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              {selectedMockup.thumbnail?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedMockup.thumbnail.src} alt={selectedMockup.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbol text-outline-variant" style={{ fontSize: 64 }}>image</span>
              )}
            </div>

            {/* Panel de configuración */}
            <div className="space-y-5">
              {/* Smart objects */}
              {selectedMockup.smart_objects && selectedMockup.smart_objects.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Capa a reemplazar</label>
                  <select
                    value={selectedSO}
                    onChange={(e) => setSelectedSO(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {selectedMockup.smart_objects.map((so) => (
                      <option key={so.uuid} value={so.uuid}>{so.name || so.uuid}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Upload diseño */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Tu diseño <span className="text-on-surface-muted font-normal text-xs">(PNG con fondo transparente recomendado)</span>
                </label>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUploadDesign} className="hidden" />
                {!designUrl ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingDesign}
                    className="w-full border-2 border-dashed border-outline-variant hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center gap-2 transition disabled:opacity-50"
                  >
                    <span className="material-symbol text-on-surface-muted" style={{ fontSize: 36 }}>{uploadingDesign ? "progress_activity" : "upload"}</span>
                    <span className="text-sm text-on-surface-muted">{uploadingDesign ? "Subiendo…" : "Subir diseño"}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={designUrl} alt="diseño" className="w-20 h-20 object-contain rounded-xl border border-outline-variant bg-surface-container" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23e5e7eb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e7eb'/%3E%3C/svg%3E\")" }} />
                    <div className="flex-1">
                      <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <span className="material-symbol" style={{ fontSize: 16 }}>check_circle</span>
                        Diseño listo
                      </p>
                      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingDesign} className="text-xs text-primary hover:underline mt-1">
                        Cambiar diseño
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {renderError && (
                <p className="text-sm text-error bg-error-container/20 rounded-xl px-4 py-2">{renderError}</p>
              )}

              <button
                onClick={handleRender}
                disabled={!designUrl || !selectedSO || rendering}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {rendering ? (
                  <>
                    <span className="material-symbol animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                    Generando…
                  </>
                ) : (
                  <>
                    <span className="material-symbol" style={{ fontSize: 18 }}>auto_awesome</span>
                    Generar mockup
                  </>
                )}
              </button>

              {!designUrl && (
                <p className="text-xs text-on-surface-muted text-center">Sube tu diseño para poder generar el mockup</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Resultado ── */}
      {step === "result" && resultUrl && (
        <div className="space-y-6">
          <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Mockup generado" className="w-full max-h-[600px] object-contain" />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={handleSaveToProduct}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition"
            >
              <span className="material-symbol" style={{ fontSize: 18 }}>inventory_2</span>
              Guardar en producto
            </button>
            <a
              href={resultUrl}
              download="mockup.png"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition"
            >
              <span className="material-symbol" style={{ fontSize: 18 }}>download</span>
              Descargar PNG
            </a>
            <button
              onClick={handleSendToAds}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition"
            >
              <span className="material-symbol" style={{ fontSize: 18 }}>campaign</span>
              Enviar a publicidad
            </button>
          </div>

          <div className="flex justify-center">
            <button onClick={reset} className="flex items-center gap-2 text-sm text-primary hover:underline">
              <span className="material-symbol" style={{ fontSize: 16 }}>add_photo_alternate</span>
              Crear otro mockup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
