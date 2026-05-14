"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { initDynamicMockupsIframe } from "@dynamic-mockups/mockup-editor-sdk";
import type { IframeResponse, DynamicAiShopAddToCartResponse, DmSessionIdResponse } from "@dynamic-mockups/mockup-editor-sdk";

interface SavedMockup {
  imageUrl: string;
  label: string | null;
}

type Phase = "editor" | "saving" | "result";

export default function MockupsDMPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [phase, setPhase] = useState<Phase>("editor");
  const [keyError, setKeyError] = useState("");
  const [results, setResults] = useState<SavedMockup[]>([]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/dynamic-mockups/config")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) { setKeyError(d.error); return; }

        initDynamicMockupsIframe({
          iframeId: "dm-editor-iframe",
          data: { "x-website-key": d.websiteKey },
          mode: "custom",
          callback: async (response: IframeResponse | DynamicAiShopAddToCartResponse | DmSessionIdResponse) => {
            const res = response as IframeResponse;
            // Collect all exported mockup paths
            const exports: Array<{ export_path: string; export_label: string | null }> = [];
            if (res.mockupsExport?.length) {
              exports.push(...res.mockupsExport);
            } else if (res.mockupsAndPrintFilesExport?.mockupsExport?.length) {
              exports.push(...res.mockupsAndPrintFilesExport.mockupsExport);
            }
            if (exports.length === 0) return;

            setPhase("saving");
            setSaveError("");

            try {
              const saved: SavedMockup[] = await Promise.all(
                exports.map(async (exp, i) => {
                  const r = await fetch("/api/admin/dynamic-mockups/save-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: exp.export_path }),
                  });
                  const data = await r.json();
                  if (!r.ok || data.error) throw new Error(data.error ?? `Error al guardar mockup ${i + 1}`);
                  return { imageUrl: data.imageUrl, label: exp.export_label };
                })
              );
              setResults(saved);
              setPhase("result");
            } catch (e: unknown) {
              setSaveError((e as Error).message ?? "Error al guardar los mockups.");
              setPhase("editor");
            }
          },
        });
      })
      .catch((e: unknown) => { if (!cancelled) setKeyError(`Error: ${(e as Error).message}`); });

    return () => { cancelled = true; };
  }, []);

  function reset() {
    setPhase("editor");
    setResults([]);
    setSaveError("");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-serif text-2xl font-bold text-on-surface">Mockups Pro</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">Powered by Dynamic Mockups</p>
        </div>
        {phase === "result" && (
          <button onClick={reset} className="flex items-center gap-1.5 text-sm text-on-surface-muted hover:text-on-surface transition">
            <span className="material-symbol" style={{ fontSize: 16 }}>arrow_back</span>
            Volver al editor
          </button>
        )}
      </div>

      {/* API Key error */}
      {keyError && (
        <div className="bg-error-container/20 border border-error/20 rounded-2xl p-5 space-y-2">
          <p className="text-sm text-error font-medium">{keyError}</p>
          {keyError.includes("configurado") && (
            <p className="text-xs text-on-surface-muted">
              Agrega <code className="bg-surface-container px-1 rounded">DYNAMIC_MOCKUPS_API_KEY</code> en{" "}
              <code className="bg-surface-container px-1 rounded">.env.production</code> y recarga la página.
            </p>
          )}
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <div className="bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 text-sm text-error">
          {saveError}
        </div>
      )}

      {/* Saving overlay */}
      {phase === "saving" && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-muted">
          <span className="material-symbol animate-spin text-primary" style={{ fontSize: 36 }}>progress_activity</span>
          <p className="text-sm">Guardando mockups…</p>
        </div>
      )}

      {/* Results */}
      {phase === "result" && results.length > 0 && (
        <div className="space-y-6">
          {results.length === 1 ? (
            /* Single result — full layout */
            <div className="space-y-4">
              <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={results[0].imageUrl} alt="Mockup generado" className="w-full max-h-[600px] object-contain" />
              </div>
              <ResultActions imageUrl={results[0].imageUrl} onBack={reset} router={router} />
            </div>
          ) : (
            /* Multiple results — grid */
            <div className="space-y-4">
              <p className="text-sm text-on-surface-muted">{results.length} mockups generados</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((r, i) => (
                  <div key={i} className="space-y-2">
                    <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.imageUrl} alt={r.label ?? `Mockup ${i + 1}`} className="w-full aspect-square object-contain" />
                    </div>
                    {r.label && <p className="text-xs text-on-surface-muted text-center">{r.label}</p>}
                    <div className="flex gap-2">
                      <a
                        href={r.imageUrl}
                        download={`mockup-${i + 1}.png`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-outline-variant text-on-surface text-xs font-medium hover:bg-surface-container transition"
                      >
                        <span className="material-symbol" style={{ fontSize: 14 }}>download</span>
                        Descargar
                      </a>
                      <button
                        onClick={() => router.push(`/admin/productos/nuevo?image=${encodeURIComponent(r.imageUrl)}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-medium hover:opacity-90 transition"
                      >
                        <span className="material-symbol" style={{ fontSize: 14 }}>inventory_2</span>
                        Producto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-2">
                <button onClick={reset} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <span className="material-symbol" style={{ fontSize: 16 }}>add_photo_alternate</span>
                  Crear otro mockup
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DM Editor iframe — always mounted so SDK can attach to it */}
      <div
        className="rounded-2xl overflow-hidden border border-outline-variant"
        style={{ display: phase === "editor" ? "block" : "none" }}
      >
        <iframe
          ref={iframeRef}
          id="dm-editor-iframe"
          src="https://embed.dynamicmockups.com"
          style={{ width: "100%", height: "calc(100vh - 180px)", minHeight: "600px", border: "none", display: "block" }}
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}

function ResultActions({
  imageUrl,
  onBack,
  router,
}: {
  imageUrl: string;
  onBack: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <button
          onClick={() => router.push(`/admin/productos/nuevo?image=${encodeURIComponent(imageUrl)}`)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition"
        >
          <span className="material-symbol" style={{ fontSize: 18 }}>inventory_2</span>
          Guardar en producto
        </button>
        <a
          href={imageUrl}
          download="mockup.png"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition"
        >
          <span className="material-symbol" style={{ fontSize: 18 }}>download</span>
          Descargar PNG
        </a>
        <button
          onClick={() => router.push(`/admin/publicidad?image=${encodeURIComponent(imageUrl)}`)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition"
        >
          <span className="material-symbol" style={{ fontSize: 18 }}>campaign</span>
          Enviar a publicidad
        </button>
      </div>
      <div className="flex justify-center">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-primary hover:underline">
          <span className="material-symbol" style={{ fontSize: 16 }}>add_photo_alternate</span>
          Crear otro mockup
        </button>
      </div>
    </div>
  );
}
