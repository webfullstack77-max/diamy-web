"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type RawMockup = Record<string, unknown>;
interface Catalog { uuid: string; name: string; mockups_count?: number; }
interface SmartObject { uuid: string; name: string; }
type Step = "catalogs" | "mockups" | "design" | "result";

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as unknown[];
    for (const key of ["catalogs", "mockups", "collections", "items", "results"]) {
      if (Array.isArray(d[key])) return d[key] as unknown[];
    }
  }
  return [];
}

function getThumbnail(m: RawMockup): string {
  if (typeof m.thumbnail === "string" && m.thumbnail.startsWith("http")) return m.thumbnail;
  if (m.thumbnail && typeof m.thumbnail === "object") {
    const t = m.thumbnail as Record<string, unknown>;
    if (typeof t.src === "string") return t.src;
    if (typeof t.url === "string") return t.url;
  }
  if (Array.isArray(m.thumbnails) && m.thumbnails.length > 0) {
    const first = m.thumbnails[0] as Record<string, unknown>;
    if (typeof first.url === "string") return first.url;
  }
  return "";
}

function getSmartObjects(m: RawMockup): SmartObject[] {
  if (!Array.isArray(m.smart_objects)) return [];
  const all = m.smart_objects as SmartObject[];
  const garment = all.filter((s) => !s.name?.toLowerCase().includes("background") && !s.name?.toLowerCase().includes("dm:ai"));
  return garment.length > 0 ? garment : all;
}

const getName = (m: RawMockup) => (m.name ?? m.title ?? "Sin nombre") as string;
const getUuid = (m: RawMockup) => (m.uuid ?? m.id ?? "") as string;

export default function MockupsDMPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [step, setStep] = useState<Step>("catalogs");

  // Catálogos
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [catalogsError, setCatalogsError] = useState("");
  const [catalogsDebug, setCatalogsDebug] = useState("");

  // Mockups
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [mockups, setMockups] = useState<RawMockup[]>([]);
  const [loadingMockups, setLoadingMockups] = useState(false);
  const [mockupsError, setMockupsError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [firstMockupDebug, setFirstMockupDebug] = useState("");

  // Diseño
  const [selectedMockup, setSelectedMockup] = useState<RawMockup | null>(null);
  const [smartObjects, setSmartObjects] = useState<SmartObject[]>([]);
  const [selectedSO, setSelectedSO] = useState("");
  const [designUrl, setDesignUrl] = useState("");
  const [uploadingDesign, setUploadingDesign] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState("");

  // Resultado
  const [resultUrl, setResultUrl] = useState("");

  // ── Cargar catálogos ──
  useEffect(() => {
    fetch("/api/admin/dynamic-mockups/collections")
      .then((r) => r.json())
      .then((d) => {
        setCatalogsDebug(JSON.stringify(d).slice(0, 600));
        if (d?.error) { setCatalogsError(d.error); return; }
        const arr = extractArray(d) as Catalog[];
        setCatalogs(arr);
        if (arr.length === 0) setCatalogsError("Sin catálogos disponibles en tu cuenta de Dynamic Mockups.");
      })
      .catch((e) => setCatalogsError(`Error: ${e.message}`))
      .finally(() => setLoadingCatalogs(false));
  }, []);

  // ── Cargar mockups de un catálogo ──
  const fetchMockups = useCallback(async (catalogUuid: string, q: string, p: number, append = false) => {
    setLoadingMockups(true);
    setMockupsError("");
    try {
      const qs = new URLSearchParams({ catalog_uuid: catalogUuid, page: String(p) });
      if (q) qs.set("name", q);
      const r = await fetch(`/api/admin/dynamic-mockups/mockups?${qs}`);
      const d = await r.json();
      if (d?.error) { setMockupsError(d.error); return; }
      const arr = extractArray(d) as RawMockup[];
      setMockups((prev) => append ? [...prev, ...arr] : arr);
      setHasMore(arr.length === 48);
      if (arr.length > 0 && !append) setFirstMockupDebug(JSON.stringify(arr[0]).slice(0, 800));
    } catch (e: unknown) {
      setMockupsError(`Error: ${(e as Error).message}`);
    } finally {
      setLoadingMockups(false);
    }
  }, []);

  function selectCatalog(cat: Catalog) {
    setSelectedCatalog(cat);
    setSearch("");
    setPage(1);
    setMockups([]);
    setFirstMockupDebug("");
    setStep("mockups");
    fetchMockups(cat.uuid, "", 1);
  }

  function handleSearch(q: string) {
    setSearch(q);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (selectedCatalog) fetchMockups(selectedCatalog.uuid, q, 1);
    }, 400);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    if (selectedCatalog) fetchMockups(selectedCatalog.uuid, search, next, true);
  }

  function selectMockup(m: RawMockup) {
    const sos = getSmartObjects(m);
    setSelectedMockup(m);
    setSmartObjects(sos);
    setSelectedSO(sos[0]?.uuid ?? "");
    setDesignUrl("");
    setRenderError("");
    setStep("design");
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
          mockup_uuid: getUuid(selectedMockup),
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
    setMockups([]);
    setSearch("");
    setDesignUrl("");
    setResultUrl("");
    setRenderError("");
  }

  const STEPS = ["Catálogo", "Template", "Diseño", "Resultado"];
  const STEP_IDX: Record<Step, number> = { catalogs: 0, mockups: 1, design: 2, result: 3 };

  return (
    <div className="max-w-4xl space-y-6">
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
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const cur = STEP_IDX[step]; const done = i < cur; const active = i === cur;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-primary text-on-primary" : active ? "bg-primary text-on-primary ring-2 ring-primary/30" : "bg-surface-container text-on-surface-muted"}`}>
                  {done ? <span className="material-symbol" style={{ fontSize: 14 }}>check</span> : i + 1}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${active ? "text-primary font-semibold" : "text-on-surface-muted"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 mb-4 rounded-full ${done ? "bg-primary" : "bg-outline-variant"}`} />}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Catálogos ── */}
      {step === "catalogs" && (
        <div className="space-y-4">
          {loadingCatalogs && (
            <div className="flex items-center justify-center py-16 text-on-surface-muted text-sm gap-2">
              <span className="material-symbol animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              Cargando catálogos…
            </div>
          )}
          {catalogsError && (
            <div className="bg-error-container/20 border border-error/20 rounded-2xl p-5 space-y-3">
              <p className="text-sm text-error font-medium">{catalogsError}</p>
              {catalogsError.includes("no configurado") && (
                <p className="text-xs text-on-surface-muted">
                  Agrega <code className="bg-surface-container px-1 rounded">DYNAMIC_MOCKUPS_API_KEY</code> en <code className="bg-surface-container px-1 rounded">.env.production</code> y recarga.
                </p>
              )}
              <details className="text-xs">
                <summary className="cursor-pointer text-on-surface-muted hover:text-on-surface">Ver respuesta API (debug)</summary>
                <pre className="mt-2 bg-surface-container rounded p-2 overflow-x-auto whitespace-pre-wrap break-all text-on-surface">{catalogsDebug}</pre>
              </details>
            </div>
          )}
          {!loadingCatalogs && catalogs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catalogs.map((cat) => (
                <button key={cat.uuid} onClick={() => selectCatalog(cat)}
                  className="bg-surface border border-outline-variant rounded-2xl p-5 text-left hover:border-primary/50 hover:shadow-sm transition group">
                  <span className="material-symbol text-primary group-hover:scale-110 transition-transform inline-block" style={{ fontSize: 28 }}>style</span>
                  <p className="font-semibold text-on-surface text-sm mt-2">{cat.name}</p>
                  {cat.mockups_count != null && <p className="text-xs text-on-surface-muted mt-0.5">{cat.mockups_count} templates</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Mockups ── */}
      {step === "mockups" && (
        <div className="space-y-4">
          <button onClick={() => setStep("catalogs")} className="flex items-center gap-1 text-sm text-on-surface-muted hover:text-on-surface transition">
            <span className="material-symbol" style={{ fontSize: 16 }}>arrow_back</span>
            <span className="ml-1 font-semibold text-on-surface">{selectedCatalog?.name}</span>
          </button>

          {/* Buscador dentro del catálogo */}
          <div className="relative">
            <span className="material-symbol absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted" style={{ fontSize: 18 }}>search</span>
            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar: hoodie, mug, tumbler, t-shirt…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>

          {mockupsError && <p className="text-sm text-error bg-error-container/20 rounded-xl px-4 py-2">{mockupsError}</p>}

          {loadingMockups && mockups.length === 0 && (
            <div className="flex items-center justify-center py-16 text-on-surface-muted text-sm gap-2">
              <span className="material-symbol animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              Cargando templates…
            </div>
          )}
          {!loadingMockups && mockups.length === 0 && !mockupsError && (
            <p className="text-center py-12 text-on-surface-muted text-sm">
              {search ? `Sin resultados para "${search}".` : "Sin templates en este catálogo."}
            </p>
          )}
          {mockups.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mockups.map((m, idx) => {
                  const thumb = getThumbnail(m);
                  const name = getName(m);
                  const uuid = getUuid(m);
                  return (
                    <button key={uuid || idx} onClick={() => selectMockup(m)}
                      className="bg-surface border border-outline-variant rounded-2xl overflow-hidden text-left hover:border-primary/50 hover:shadow-sm transition">
                      {thumb
                        ? <img src={thumb} alt={name} className="w-full aspect-square object-cover" /> // eslint-disable-line @next/next/no-img-element
                        : <div className="w-full aspect-square bg-surface-container flex items-center justify-center"><span className="material-symbol text-outline-variant" style={{ fontSize: 40 }}>image</span></div>}
                      <div className="p-2.5"><p className="text-xs font-medium text-on-surface line-clamp-2">{name}</p></div>
                    </button>
                  );
                })}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button onClick={loadMore} disabled={loadingMockups}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition disabled:opacity-50">
                    {loadingMockups ? <><span className="material-symbol animate-spin" style={{ fontSize: 16 }}>progress_activity</span>Cargando…</> : "Cargar más"}
                  </button>
                </div>
              )}
              {firstMockupDebug && (
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer text-on-surface-muted hover:text-on-surface">Ver estructura del primer template (debug)</summary>
                  <pre className="mt-2 bg-surface-container rounded p-3 overflow-x-auto whitespace-pre-wrap break-all text-on-surface">{firstMockupDebug}</pre>
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
            <span className="ml-1">{getName(selectedMockup)}</span>
          </button>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-surface-container rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              {getThumbnail(selectedMockup)
                ? <img src={getThumbnail(selectedMockup)} alt={getName(selectedMockup)} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                : <span className="material-symbol text-outline-variant" style={{ fontSize: 64 }}>image</span>}
            </div>
            <div className="space-y-5">
              {smartObjects.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  No se detectaron capas editables en este template. Prueba con otro.
                </div>
              )}
              {smartObjects.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Capa a reemplazar</label>
                  <select value={selectedSO} onChange={(e) => setSelectedSO(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {smartObjects.map((so) => <option key={so.uuid} value={so.uuid}>{so.name || so.uuid}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Tu diseño <span className="text-on-surface-muted font-normal text-xs">(PNG con fondo transparente)</span>
                </label>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUploadDesign} className="hidden" />
                {!designUrl
                  ? <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingDesign}
                      className="w-full border-2 border-dashed border-outline-variant hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center gap-2 transition disabled:opacity-50">
                      <span className="material-symbol text-on-surface-muted" style={{ fontSize: 36 }}>{uploadingDesign ? "progress_activity" : "upload"}</span>
                      <span className="text-sm text-on-surface-muted">{uploadingDesign ? "Subiendo…" : "Subir diseño"}</span>
                    </button>
                  : <div className="flex items-center gap-4">
                      <img src={designUrl} alt="diseño" className="w-20 h-20 object-contain rounded-xl border border-outline-variant bg-surface-container" /> {/* eslint-disable-line @next/next/no-img-element */}
                      <div className="flex-1">
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <span className="material-symbol" style={{ fontSize: 16 }}>check_circle</span>Diseño listo
                        </p>
                        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingDesign} className="text-xs text-primary hover:underline mt-1">Cambiar diseño</button>
                      </div>
                    </div>}
              </div>
              {renderError && <p className="text-sm text-error bg-error-container/20 rounded-xl px-4 py-2">{renderError}</p>}
              <button onClick={handleRender} disabled={!designUrl || rendering || smartObjects.length === 0}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2">
                {rendering
                  ? <><span className="material-symbol animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Generando…</>
                  : <><span className="material-symbol" style={{ fontSize: 18 }}>auto_awesome</span>Generar mockup</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Resultado ── */}
      {step === "result" && resultUrl && (
        <div className="space-y-6">
          <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
            <img src={resultUrl} alt="Mockup generado" className="w-full max-h-[600px] object-contain" /> {/* eslint-disable-line @next/next/no-img-element */}
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
