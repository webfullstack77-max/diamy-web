"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Catalog { uuid: string; name: string; mockups_count?: number; collections_count?: number; }
interface Mockup { uuid: string; name: string; thumbnail?: { src?: string }; }
interface SmartObject { uuid: string; name: string; }
interface MockupDetail extends Mockup { smart_objects: SmartObject[]; }

type Step = "catalogs" | "mockups" | "design" | "result";

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as unknown[];
    // Algunos endpoints de DM devuelven { catalogs: [...] } o { mockups: [...] }
    for (const key of ["catalogs", "collections", "mockups", "items", "results"]) {
      if (Array.isArray(d[key])) return d[key] as unknown[];
    }
  }
  return [];
}

function extractItem(data: unknown): unknown {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    return d.data ?? d.mockup ?? data;
  }
  return data;
}

function getThumbnail(m: Mockup): string {
  if (m.thumbnail?.src) return m.thumbnail.src;
  // Algunos mockups de DM usan otras claves
  const raw = m as unknown as Record<string, unknown>;
  if (typeof raw.preview_url === "string") return raw.preview_url;
  if (typeof raw.image_url === "string") return raw.image_url;
  return "";
}

export default function MockupsDMPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("catalogs");
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [catalogsError, setCatalogsError] = useState("");
  const [rawCatalogsResponse, setRawCatalogsResponse] = useState<string>("");

  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [loadingMockups, setLoadingMockups] = useState(false);

  const [selectedMockup, setSelectedMockup] = useState<MockupDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSO, setSelectedSO] = useState<string>("");

  const [designUrl, setDesignUrl] = useState("");
  const [uploadingDesign, setUploadingDesign] = useState(false);

  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  // Step 1: cargar catálogos
  useEffect(() => {
    fetch("/api/admin/dynamic-mockups/collections")
      .then((r) => r.json())
      .then((d) => {
        setRawCatalogsResponse(JSON.stringify(d).slice(0, 500));
        if (d?.error) { setCatalogsError(d.error); return; }
        const arr = extractArray(d) as Catalog[];
        setCatalogs(arr);
        if (arr.length === 0) setCatalogsError("Sin catálogos disponibles.");
      })
      .catch((e) => setCatalogsError(`Error: ${e.message}`))
      .finally(() => setLoadingCatalogs(false));
  }, []);

  // Step 2: cargar mockups de un catálogo
  async function selectCatalog(cat: Catalog) {
    setSelectedCatalog(cat);
    setMockups([]);
    setLoadingMockups(true);
    setStep("mockups");
    try {
      const r = await fetch(`/api/admin/dynamic-mockups/mockups?catalog_uuid=${cat.uuid}`);
      const d = await r.json();
      setMockups(extractArray(d) as Mockup[]);
    } catch {
      setMockups([]);
    } finally {
      setLoadingMockups(false);
    }
  }

  // Step 3: obtener detalle del mockup
  async function selectMockup(m: Mockup) {
    setLoadingDetail(true);
    setDesignUrl("");
    setRenderError("");
    try {
      const r = await fetch(`/api/admin/dynamic-mockups/mockup/${m.uuid}`);
      const d = await r.json();
      const detail = extractItem(d) as MockupDetail;
      setSelectedMockup(detail);
      setSelectedSO(detail.smart_objects?.[0]?.uuid ?? "");
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

  function reset() {
    setStep("catalogs");
    setSelectedCatalog(null);
    setSelectedMockup(null);
    setDesignUrl("");
    setResultUrl("");
    setRenderError("");
  }

  const STEPS = ["Catálogo", "Template", "Diseño", "Resultado"];
  const STEP_INDEX: Record<Step, number> = { catalogs: 0, mockups: 1, design: 2, result: 3 };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-on-surface">Mockups Pro</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">Powered by Dynamic Mockups</p>
        </div>
        {step !== "catalogs" && (
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

      {/* ── Step 1: Catálogos ── */}
      {step === "catalogs" && (
        <div>
          {loadingCatalogs && (
            <div className="flex items-center justify-center py-16 text-on-surface-muted text-sm gap-2">
              <span className="material-symbol animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              Cargando catálogos…
            </div>
          )}
          {catalogsError && (
            <div className="bg-error-container/20 border border-error/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbol" style={{ fontSize: 24 }}>error</span>
                <p className="text-sm font-medium">{catalogsError}</p>
              </div>
              {catalogsError.includes("no configurado") && (
                <p className="text-xs text-on-surface-muted">
                  Agrega <code className="bg-surface-container px-1 rounded">DYNAMIC_MOCKUPS_API_KEY</code> en{" "}
                  <code className="bg-surface-container px-1 rounded">.env.production</code> y recarga el servidor.{" "}
                  Crea tu cuenta gratis en{" "}
                  <a href="https://dynamicmockups.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">dynamicmockups.com</a>.
                </p>
              )}
              {/* Debug: mostrar respuesta cruda de la API */}
              {rawCatalogsResponse && (
                <details className="text-xs text-on-surface-muted">
                  <summary className="cursor-pointer hover:text-on-surface">Ver respuesta API (debug)</summary>
                  <pre className="mt-2 bg-surface-container rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">{rawCatalogsResponse}</pre>
                </details>
              )}
            </div>
          )}
          {!loadingCatalogs && catalogs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catalogs.map((cat) => (
                <button
                  key={cat.uuid}
                  onClick={() => selectCatalog(cat)}
                  className="bg-surface border border-outline-variant rounded-2xl p-5 text-left hover:border-primary/50 hover:shadow-sm transition group"
                >
                  <span className="material-symbol text-primary group-hover:scale-110 transition-transform inline-block" style={{ fontSize: 28 }}>style</span>
                  <p className="font-semibold text-on-surface text-sm mt-2">{cat.name}</p>
                  {(cat.mockups_count ?? cat.collections_count) != null && (
                    <p className="text-xs text-on-surface-muted mt-0.5">
                      {cat.mockups_count ?? cat.collections_count} templates
                    </p>
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
            <button onClick={() => setStep("catalogs")} className="flex items-center gap-1 text-sm text-on-surface-muted hover:text-on-surface transition">
              <span className="material-symbol" style={{ fontSize: 16 }}>arrow_back</span>
              Catálogos
            </button>
            <span className="text-on-surface-muted">/</span>
            <span className="text-sm font-semibold text-on-surface">{selectedCatalog?.name}</span>
          </div>
          {loadingMockups && (
            <div className="flex items-center justify-center py-16 text-on-surface-muted text-sm gap-2">
              <span className="material-symbol animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              Cargando templates…
            </div>
          )}
          {!loadingMockups && mockups.length === 0 && (
            <div className="text-center py-12 text-on-surface-muted text-sm">Sin templates en este catálogo.</div>
          )}
          {!loadingMockups && mockups.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockups.map((m) => {
                const thumb = getThumbnail(m);
                return (
                  <button
                    key={m.uuid}
                    onClick={() => selectMockup(m)}
                    disabled={loadingDetail}
                    className="bg-surface border border-outline-variant rounded-2xl overflow-hidden text-left hover:border-primary/50 hover:shadow-sm transition group disabled:opacity-60"
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={m.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-surface-container flex items-center justify-center">
                        <span className="material-symbol text-outline-variant" style={{ fontSize: 40 }}>image</span>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs font-medium text-on-surface line-clamp-2">{m.name}</p>
                    </div>
                  </button>
                );
              })}
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
              {selectedCatalog?.name}
            </button>
            <span className="text-on-surface-muted">/</span>
            <span className="text-sm font-semibold text-on-surface line-clamp-1">{selectedMockup.name}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-surface-container rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              {getThumbnail(selectedMockup) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getThumbnail(selectedMockup)} alt={selectedMockup.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbol text-outline-variant" style={{ fontSize: 64 }}>image</span>
              )}
            </div>

            <div className="space-y-5">
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

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Tu diseño <span className="text-on-surface-muted font-normal text-xs">(PNG con fondo transparente)</span>
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
                    <img src={designUrl} alt="diseño" className="w-20 h-20 object-contain rounded-xl border border-outline-variant bg-surface-container" />
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
              onClick={() => router.push(`/admin/productos/nuevo?image=${encodeURIComponent(resultUrl)}`)}
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
              onClick={() => router.push(`/admin/publicidad?image=${encodeURIComponent(resultUrl)}`)}
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
