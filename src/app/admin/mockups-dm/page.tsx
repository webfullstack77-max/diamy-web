"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Collection { uuid: string; name: string; mockup_count?: number; }
// Mockup raw puede tener cualquier estructura — lo guardamos como Record
type RawMockup = Record<string, unknown>;

interface SmartObject { uuid: string; name: string; }

type Step = "collections" | "mockups" | "design" | "result";

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as unknown[];
    for (const key of ["collections", "collections", "mockups", "items", "results", "templates"]) {
      if (Array.isArray(d[key])) return d[key] as unknown[];
    }
  }
  return [];
}

function getField(obj: RawMockup, ...keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function getThumbnail(m: RawMockup): string {
  // thumbnail es un string directo en la API de DM
  const direct = getField(m, "thumbnail", "thumbnail_url", "preview_url", "image_url", "preview", "image");
  if (typeof direct === "string" && direct.startsWith("http")) return direct;
  // thumbnail como objeto { src } o { url }
  if (m.thumbnail && typeof m.thumbnail === "object") {
    const t = m.thumbnail as Record<string, unknown>;
    if (typeof t.src === "string") return t.src;
    if (typeof t.url === "string") return t.url;
  }
  // thumbnails array: [{ url, width }]
  if (Array.isArray(m.thumbnails) && m.thumbnails.length > 0) {
    const first = m.thumbnails[0] as Record<string, unknown>;
    if (typeof first.url === "string") return first.url;
  }
  return "";
}

function getSmartObjects(m: RawMockup): SmartObject[] {
  const so = getField(m, "smart_objects", "smartObjects", "layers", "print_areas");
  if (!Array.isArray(so)) return [];
  const all = so as SmartObject[];
  // Preferir capas que NO sean de fondo/background (son las de la prenda)
  const garment = all.filter((s) => !s.name?.toLowerCase().includes("background") && !s.name?.toLowerCase().includes("dm:ai"));
  return garment.length > 0 ? garment : all;
}

function getMockupName(m: RawMockup): string {
  return (getField(m, "name", "title", "label") as string) ?? "Sin nombre";
}

function getMockupUuid(m: RawMockup): string {
  return (getField(m, "uuid", "id", "_id") as string) ?? "";
}

export default function MockupsDMPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("collections");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [collectionsError, setCollectionsError] = useState("");
  const [collectionsDebug, setCollectionsDebug] = useState("");

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [mockups, setMockups] = useState<RawMockup[]>([]);
  const [loadingMockups, setLoadingMockups] = useState(false);
  const [mockupsDebug, setMockupsDebug] = useState("");

  const [selectedMockup, setSelectedMockup] = useState<RawMockup | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSO, setSelectedSO] = useState<string>("");
  const [smartObjects, setSmartObjects] = useState<SmartObject[]>([]);

  const [designUrl, setDesignUrl] = useState("");
  const [uploadingDesign, setUploadingDesign] = useState(false);

  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  useEffect(() => {
    fetch("/api/admin/dynamic-mockups/collections")
      .then((r) => r.json())
      .then((d) => {
        setCollectionsDebug(JSON.stringify(d).slice(0, 800));
        if (d?.error) { setCollectionsError(d.error); return; }
        const arr = extractArray(d) as Collection[];
        setCollections(arr);
        if (arr.length === 0) setCollectionsError("Sin catálogos disponibles.");
      })
      .catch((e) => setCollectionsError(`Error: ${e.message}`))
      .finally(() => setLoadingCollections(false));
  }, []);

  async function selectCollection(cat: Collection) {
    setSelectedCollection(cat);
    setMockups([]);
    setLoadingMockups(true);
    setStep("mockups");
    try {
      const r = await fetch(`/api/admin/dynamic-mockups/mockups?collection_uuid=${cat.uuid}`);
      const d = await r.json();
      const arr = extractArray(d) as RawMockup[];
      setMockups(arr);
      // Guardar debug del primer mockup para ver su estructura
      if (arr.length > 0) setMockupsDebug(JSON.stringify(arr[0]).slice(0, 1000));
    } catch {
      setMockups([]);
    } finally {
      setLoadingMockups(false);
    }
  }

  async function selectMockup(m: RawMockup) {
    setLoadingDetail(true);
    setDesignUrl("");
    setRenderError("");

    // Primero intentar obtener smart_objects del propio objeto de la lista
    let sos = getSmartObjects(m);

    // Si no hay, intentar fetch de detalle
    if (sos.length === 0) {
      try {
        const uuid = getMockupUuid(m);
        const r = await fetch(`/api/admin/dynamic-mockups/mockup/${uuid}`);
        if (r.ok) {
          const d = await r.json();
          const detail = (d?.data ?? d) as RawMockup;
          sos = getSmartObjects(detail);
          // Enriquecer m con datos del detalle
          Object.assign(m, detail);
        }
      } catch { /* continuar con lo que tenemos */ }
    }

    setSelectedMockup(m);
    setSmartObjects(sos);
    setSelectedSO(sos[0]?.uuid ?? "");
    setStep("design");
    setLoadingDetail(false);
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
    if (!selectedMockup) return;
    if (!designUrl) { setRenderError("Sube tu diseño primero."); return; }

    const mockup_uuid = getMockupUuid(selectedMockup);

    // Si no tenemos smart object UUID, intentar renderizar sin él
    // (algunos servicios aceptan solo mockup_uuid + imagen)
    const soUuid = selectedSO || smartObjects[0]?.uuid || "";
    if (!soUuid) {
      setRenderError("No se encontraron capas editables (smart objects) para este template. Prueba con otro.");
      return;
    }

    setRendering(true);
    setRenderError("");
    try {
      const r = await fetch("/api/admin/dynamic-mockups/renders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mockup_uuid,
          smart_objects: [{ uuid: soUuid, asset_url: `${window.location.origin}${designUrl}` }],
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
    setStep("collections");
    setSelectedCollection(null);
    setSelectedMockup(null);
    setSmartObjects([]);
    setDesignUrl("");
    setResultUrl("");
    setRenderError("");
  }

  const STEPS = ["Colección", "Template", "Diseño", "Resultado"];
  const STEP_INDEX: Record<Step, number> = { collections: 0, mockups: 1, design: 2, result: 3 };

  return (
    <div className="max-w-4xl space-y-6">
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
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 mb-4 rounded-full ${done ? "bg-primary" : "bg-outline-variant"}`} />}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Coleccións ── */}
      {step === "collections" && (
        <div>
          {loadingCollections && (
            <div className="flex items-center justify-center py-16 text-on-surface-muted text-sm gap-2">
              <span className="material-symbol animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              Cargando catálogos…
            </div>
          )}
          {collectionsError && (
            <div className="bg-error-container/20 border border-error/20 rounded-2xl p-5 space-y-3">
              <p className="text-sm text-error font-medium">{collectionsError}</p>
              {collectionsError.includes("no configurado") && (
                <p className="text-xs text-on-surface-muted">
                  Agrega <code className="bg-surface-container px-1 rounded">DYNAMIC_MOCKUPS_API_KEY</code> en <code className="bg-surface-container px-1 rounded">.env.production</code> y recarga el servidor.
                </p>
              )}
              {collectionsDebug && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-on-surface-muted hover:text-on-surface">Ver respuesta API (debug)</summary>
                  <pre className="mt-2 bg-surface-container rounded p-2 overflow-x-auto whitespace-pre-wrap break-all text-on-surface">{collectionsDebug}</pre>
                </details>
              )}
            </div>
          )}
          {!loadingCollections && collections.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {collections.map((cat) => (
                <button key={cat.uuid} onClick={() => selectCollection(cat)}
                  className="bg-surface border border-outline-variant rounded-2xl p-5 text-left hover:border-primary/50 hover:shadow-sm transition group">
                  <span className="material-symbol text-primary group-hover:scale-110 transition-transform inline-block" style={{ fontSize: 28 }}>style</span>
                  <p className="font-semibold text-on-surface text-sm mt-2">{cat.name}</p>
                  {cat.mockup_count != null && (
                    <p className="text-xs text-on-surface-muted mt-0.5">{cat.mockup_count} templates</p>
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
          <button onClick={() => setStep("collections")} className="flex items-center gap-1 text-sm text-on-surface-muted hover:text-on-surface transition">
            <span className="material-symbol" style={{ fontSize: 16 }}>arrow_back</span>
            Coleccións / <span className="font-semibold text-on-surface ml-1">{selectedCollection?.name}</span>
          </button>

          {loadingMockups && (
            <div className="flex items-center justify-center py-16 text-on-surface-muted text-sm gap-2">
              <span className="material-symbol animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              Cargando templates…
            </div>
          )}
          {!loadingMockups && mockups.length === 0 && (
            <p className="text-center py-12 text-on-surface-muted text-sm">Sin templates en este catálogo.</p>
          )}
          {!loadingMockups && mockups.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mockups.map((m, idx) => {
                  const thumb = getThumbnail(m);
                  const name = getMockupName(m);
                  const uuid = getMockupUuid(m);
                  return (
                    <button key={uuid || idx} onClick={() => selectMockup(m)} disabled={loadingDetail}
                      className="bg-surface border border-outline-variant rounded-2xl overflow-hidden text-left hover:border-primary/50 hover:shadow-sm transition disabled:opacity-60">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={name} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-surface-container flex items-center justify-center">
                          <span className="material-symbol text-outline-variant" style={{ fontSize: 40 }}>image</span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs font-medium text-on-surface line-clamp-2">{name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Debug: estructura del primer mockup */}
              {mockupsDebug && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-on-surface-muted hover:text-on-surface">Ver estructura API del primer template (debug)</summary>
                  <pre className="mt-2 bg-surface-container rounded p-3 overflow-x-auto whitespace-pre-wrap break-all text-on-surface text-xs">{mockupsDebug}</pre>
                </details>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Step 3: Diseño ── */}
      {step === "design" && selectedMockup && (
        <div className="space-y-5">
          <button onClick={() => setStep("mockups")} className="flex items-center gap-1 text-sm text-on-surface-muted hover:text-on-surface transition">
            <span className="material-symbol" style={{ fontSize: 16 }}>arrow_back</span>
            {selectedCollection?.name} / <span className="font-semibold text-on-surface ml-1 line-clamp-1">{getMockupName(selectedMockup)}</span>
          </button>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-surface-container rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              {getThumbnail(selectedMockup) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getThumbnail(selectedMockup)} alt={getMockupName(selectedMockup)} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbol text-outline-variant" style={{ fontSize: 64 }}>image</span>
              )}
            </div>

            <div className="space-y-5">
              {smartObjects.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  No se detectaron capas editables. El template puede no ser compatible o requiere
                  configuración adicional en Dynamic Mockups.
                </div>
              )}

              {smartObjects.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Capa a reemplazar</label>
                  <select value={selectedSO} onChange={(e) => setSelectedSO(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {smartObjects.map((so) => (
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
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingDesign}
                    className="w-full border-2 border-dashed border-outline-variant hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center gap-2 transition disabled:opacity-50">
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

              {renderError && <p className="text-sm text-error bg-error-container/20 rounded-xl px-4 py-2">{renderError}</p>}

              <button onClick={handleRender} disabled={!designUrl || rendering || smartObjects.length === 0}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2">
                {rendering ? (
                  <><span className="material-symbol animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Generando…</>
                ) : (
                  <><span className="material-symbol" style={{ fontSize: 18 }}>auto_awesome</span>Generar mockup</>
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
            <button onClick={() => router.push(`/admin/productos/nuevo?image=${encodeURIComponent(resultUrl)}`)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition">
              <span className="material-symbol" style={{ fontSize: 18 }}>inventory_2</span>Guardar en producto
            </button>
            <a href={resultUrl} download="mockup.png"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition">
              <span className="material-symbol" style={{ fontSize: 18 }}>download</span>Descargar PNG
            </a>
            <button onClick={() => router.push(`/admin/publicidad?image=${encodeURIComponent(resultUrl)}`)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition">
              <span className="material-symbol" style={{ fontSize: 18 }}>campaign</span>Enviar a publicidad
            </button>
          </div>
          <div className="flex justify-center">
            <button onClick={reset} className="flex items-center gap-2 text-sm text-primary hover:underline">
              <span className="material-symbol" style={{ fontSize: 16 }}>add_photo_alternate</span>Crear otro mockup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
