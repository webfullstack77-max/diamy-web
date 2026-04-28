"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ControlPoints {
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  br: { x: number; y: number };
  bl: { x: number; y: number };
}

interface Template {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  controlPoints: ControlPoints;
  garmentArea?: ControlPoints | null;
  maskUrl?: string | null;
}

const COLOR_PALETTE = [
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Negro", hex: "#000000" },
  { name: "Gris", hex: "#808080" },
  { name: "Azul marino", hex: "#001F3F" },
  { name: "Rojo", hex: "#FF4136" },
  { name: "Verde", hex: "#2ECC40" },
  { name: "Rosa", hex: "#F012BE" },
  { name: "Amarillo", hex: "#FFDC00" },
  { name: "Morado", hex: "#B10DC9" },
  { name: "Café", hex: "#8B4513" },
];

export default function MockupGenerator({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    templates.length > 0 ? templates[0] : null
  );
  const [designUrl, setDesignUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].hex);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  function openLightbox() {
    if (!canvasRef.current) return;
    setLightboxImage(canvasRef.current.toDataURL("image/png"));
    setLightboxOpen(true);
  }

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    if (lightboxOpen) {
      document.addEventListener("keydown", handleKeydown);
      return () => document.removeEventListener("keydown", handleKeydown);
    }
  }, [lightboxOpen]);

  async function uploadDesign(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);

    const file = files[0];
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload?design=true", {
      method: "POST",
      body: fd,
    });

    if (res.ok) {
      const { url } = await res.json();
      setDesignUrl(url);
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al subir diseño");
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    uploadDesign(files);
  }

  function handleDesignUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    uploadDesign(files);
    e.target.value = "";
  }

  // Renderizar mockup en canvas cuando cambien template, diseño o color
  useEffect(() => {
    if (!selectedTemplate || !designUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderMockup = async () => {
      // Cargar imagen del modelo
      const modelImg = new window.Image();
      modelImg.src = selectedTemplate.imageUrl;

      // Cargar máscara IA si existe
      let maskImg: HTMLImageElement | null = null;
      if (selectedTemplate.maskUrl) {
        await new Promise<void>((resolve) => {
          maskImg = new window.Image();
          maskImg.onload = () => resolve();
          maskImg.onerror = () => {
            maskImg = null;
            resolve();
          };
          maskImg.src = selectedTemplate.maskUrl!;
        });
      }

      modelImg.onload = async () => {
        // Cargar diseño transparente
        const designImg = new window.Image();
        designImg.src = designUrl;

        designImg.onload = () => {
          // Redimensionar canvas al tamaño del modelo
          canvas.width = modelImg.width;
          canvas.height = modelImg.height;

          // Layer 1: Dibujar modelo
          ctx.drawImage(modelImg, 0, 0);

          // Layer 2: Cambiar color usando máscara IA si está disponible
          if (
            selectedColor.toUpperCase() !== "#FFFFFF" &&
            maskImg
          ) {
            const targetRgb = hexToRgb(selectedColor);

            // Renderizar la máscara en un canvas auxiliar al tamaño correcto
            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            const maskCtx = maskCanvas.getContext("2d");
            if (maskCtx) {
              maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
              const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              const mData = maskData.data;

              for (let i = 0; i < data.length; i += 4) {
                // La máscara es blanco (255) donde está la prenda
                // Usamos el canal R como intensidad de máscara
                const maskValue = mData[i] / 255;

                if (maskValue > 0.1) {
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];

                  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

                  // Aplicar color preservando luminance (sombras y pliegues)
                  const newR = targetRgb.r * luminance * 1.15;
                  const newG = targetRgb.g * luminance * 1.15;
                  const newB = targetRgb.b * luminance * 1.15;

                  // Mezclar usando la máscara como factor (transición suave en bordes)
                  data[i] = Math.min(255, newR * maskValue + r * (1 - maskValue));
                  data[i + 1] = Math.min(255, newG * maskValue + g * (1 - maskValue));
                  data[i + 2] = Math.min(255, newB * maskValue + b * (1 - maskValue));
                }
              }

              ctx.putImageData(imageData, 0, 0);
            }
          } else if (
            selectedColor.toUpperCase() !== "#FFFFFF" &&
            selectedTemplate.garmentArea
          ) {
            const targetRgb = hexToRgb(selectedColor);
            const ga = selectedTemplate.garmentArea;
            // Convertir % a píxeles del polígono de la prenda
            const polygon: Array<[number, number]> = [
              [(ga.tl.x / 100) * canvas.width, (ga.tl.y / 100) * canvas.height],
              [(ga.tr.x / 100) * canvas.width, (ga.tr.y / 100) * canvas.height],
              [(ga.br.x / 100) * canvas.width, (ga.br.y / 100) * canvas.height],
              [(ga.bl.x / 100) * canvas.width, (ga.bl.y / 100) * canvas.height],
            ];

            // Bounding box para optimizar (no checar todos los píxeles)
            const minX = Math.max(0, Math.floor(Math.min(...polygon.map((p) => p[0]))));
            const maxX = Math.min(canvas.width, Math.ceil(Math.max(...polygon.map((p) => p[0]))));
            const minY = Math.max(0, Math.floor(Math.min(...polygon.map((p) => p[1]))));
            const maxY = Math.min(canvas.height, Math.ceil(Math.max(...polygon.map((p) => p[1]))));

            const imageData = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
            const data = imageData.data;
            const w = maxX - minX;

            for (let py = 0; py < maxY - minY; py++) {
              for (let px = 0; px < w; px++) {
                const absX = px + minX;
                const absY = py + minY;

                if (!pointInPolygon(absX, absY, polygon)) continue;

                const i = (py * w + px) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
                const saturation = max === 0 ? 0 : (max - min) / max;

                // Detectar píxeles blancos/claros dentro del polígono de la prenda
                if (luminance > 0.5 && saturation < 0.25) {
                  const whiteness = Math.min(
                    1,
                    (luminance - 0.5) / 0.3 + (0.25 - saturation) / 0.25
                  );
                  const blendStrength = Math.min(1, whiteness);

                  const newR = (targetRgb.r * luminance) / 0.85;
                  const newG = (targetRgb.g * luminance) / 0.85;
                  const newB = (targetRgb.b * luminance) / 0.85;

                  data[i] = Math.min(255, newR * blendStrength + r * (1 - blendStrength));
                  data[i + 1] = Math.min(255, newG * blendStrength + g * (1 - blendStrength));
                  data[i + 2] = Math.min(255, newB * blendStrength + b * (1 - blendStrength));
                }
              }
            }

            ctx.putImageData(imageData, minX, minY);
          }

          // Layer 3: Dibujar diseño con perspectiva
          // Asegurar que el contexto está en estado limpio
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1;

          const cp = selectedTemplate.controlPoints;

          // Convertir % a píxeles
          const srcW = designImg.width;
          const srcH = designImg.height;

          const dstTL = {
            x: (cp.tl.x / 100) * canvas.width,
            y: (cp.tl.y / 100) * canvas.height,
          };
          const dstTR = {
            x: (cp.tr.x / 100) * canvas.width,
            y: (cp.tr.y / 100) * canvas.height,
          };
          const dstBR = {
            x: (cp.br.x / 100) * canvas.width,
            y: (cp.br.y / 100) * canvas.height,
          };
          const dstBL = {
            x: (cp.bl.x / 100) * canvas.width,
            y: (cp.bl.y / 100) * canvas.height,
          };

          // Usar triangle mesh para mejor performance
          const gridSize = 16;
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const u0 = col / gridSize;
              const v0 = row / gridSize;
              const u1 = (col + 1) / gridSize;
              const v1 = (row + 1) / gridSize;

              // Interpolar esquinas 4D
              const p00 = lerp2D(dstTL, dstTR, dstBL, dstBR, u0, v0);
              const p10 = lerp2D(dstTL, dstTR, dstBL, dstBR, u1, v0);
              const p01 = lerp2D(dstTL, dstTR, dstBL, dstBR, u0, v1);
              const p11 = lerp2D(dstTL, dstTR, dstBL, dstBR, u1, v1);

              // Triángulo 1
              drawTriangle(
                ctx,
                designImg,
                p00,
                p10,
                p01,
                { x: u0 * srcW, y: v0 * srcH },
                { x: u1 * srcW, y: v0 * srcH },
                { x: u0 * srcW, y: v1 * srcH }
              );

              // Triángulo 2
              drawTriangle(
                ctx,
                designImg,
                p10,
                p11,
                p01,
                { x: u1 * srcW, y: v0 * srcH },
                { x: u1 * srcW, y: v1 * srcH },
                { x: u0 * srcW, y: v1 * srcH }
              );
            }
          }
        };
      };
    };

    renderMockup();
  }, [selectedTemplate, designUrl, selectedColor]);

  async function handleSaveToProduct() {
    if (!canvasRef.current) return;
    setSaving(true);
    setError("");

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) throw new Error("No se pudo crear imagen");

        const fd = new FormData();
        fd.append("file", blob, "mockup.png");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          const { url } = await res.json();
          // Redirigir a productos con la URL pre-cargada
          router.push(`/admin/productos/nuevo?image=${encodeURIComponent(url)}`);
        } else {
          const data = await res.json();
          setError(data.error ?? "Error al guardar");
        }
        setSaving(false);
      }, "image/png");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setSaving(false);
    }
  }

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `mockup-${Date.now()}.png`;
    link.click();
  }

  async function handleSendToAds() {
    if (!canvasRef.current) return;
    setSaving(true);
    setError("");

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) throw new Error("No se pudo crear imagen");

        const fd = new FormData();
        fd.append("file", blob, "mockup.png");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          const { url } = await res.json();
          router.push(`/admin/publicidad?image=${encodeURIComponent(url)}`);
        } else {
          const data = await res.json();
          setError(data.error ?? "Error al guardar");
        }
        setSaving(false);
      }, "image/png");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Opciones */}
        <div className="lg:col-span-1 space-y-6">
          {/* Seleccionar plantilla */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
            <h3 className="font-semibold text-on-surface">Plantilla de prenda</h3>

            {templates.length === 0 ? (
              <p className="text-xs text-on-surface-muted">
                No hay plantillas. Ve a <a href="/admin/plantillas" className="text-primary hover:underline">Plantillas</a> para crear una.
              </p>
            ) : (
              <select
                value={selectedTemplate?.id ?? ""}
                onChange={(e) => {
                  const t = templates.find((t) => t.id === e.target.value);
                  setSelectedTemplate(t ?? null);
                }}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subir diseño */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
            <h3 className="font-semibold text-on-surface">Diseño (PNG transparente)</h3>

            {designUrl ? (
              <div className="space-y-2">
                <div className="relative h-24 bg-surface-container rounded-lg overflow-hidden border border-outline-variant">
                  <Image src={designUrl} alt="diseño" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setDesignUrl("")}
                  className="text-xs text-error hover:underline w-full text-center"
                >
                  Cambiar diseño
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 w-full py-4 rounded-lg border-2 border-dashed cursor-pointer transition ${
                  dragOver
                    ? "border-primary bg-primary-container/30"
                    : "border-outline-variant hover:border-primary/60"
                } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span
                  className="material-symbol text-primary"
                  style={{ fontSize: "24px" }}
                >
                  {uploading ? "hourglass_empty" : "upload_file"}
                </span>
                <p className="text-xs font-medium text-on-surface">
                  {uploading ? "Subiendo..." : "Sube tu diseño"}
                </p>
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleDesignUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Color de prenda */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
            <h3 className="font-semibold text-on-surface">Color de prenda</h3>

            <div className="grid grid-cols-2 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                    selectedColor === color.hex
                      ? "bg-primary text-on-primary border-2 border-primary"
                      : "border border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded border border-outline"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Canvas + acciones */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTemplate && designUrl ? (
            <>
              <div className="bg-surface rounded-2xl border border-outline-variant p-4">
                <div className="flex flex-col items-center justify-center bg-surface-container rounded-lg p-4 gap-3">
                  <canvas
                    ref={canvasRef}
                    onClick={openLightbox}
                    className="w-full max-w-2xl rounded-lg shadow-lg cursor-zoom-in hover:opacity-95 transition"
                    style={{ height: "auto" }}
                    title="Click para ver en grande"
                  />
                  <button
                    type="button"
                    onClick={openLightbox}
                    className="text-sm text-primary hover:underline flex items-center gap-1.5 font-medium"
                  >
                    <span className="material-symbol" style={{ fontSize: "18px" }}>
                      zoom_in
                    </span>
                    Ver mockup en pantalla completa
                  </button>
                </div>
              </div>

              {/* Info del diseño actual para debug */}
              <div className="bg-surface rounded-xl border border-outline-variant p-3 text-xs space-y-1">
                <p className="text-on-surface-muted">
                  <span className="font-medium">Diseño:</span>{" "}
                  <a href={designUrl} target="_blank" rel="noopener" className="text-primary hover:underline break-all">
                    {designUrl}
                  </a>
                </p>
                <p className="text-on-surface-muted">
                  <span className="font-medium">Plantilla:</span> {selectedTemplate.name}
                  {!selectedTemplate.garmentArea && (
                    <span className="ml-2 text-orange-600">⚠ Sin área de prenda definida — el color no se aplicará</span>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSaveToProduct}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <span className="material-symbol" style={{ fontSize: "20px" }}>
                    save
                  </span>
                  Guardar en producto
                </button>

                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-semibold hover:bg-outline-variant/30 transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbol" style={{ fontSize: "20px" }}>
                    download
                  </span>
                  Descargar PNG
                </button>

                <button
                  onClick={handleSendToAds}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-semibold hover:bg-outline-variant/30 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <span className="material-symbol" style={{ fontSize: "20px" }}>
                    send
                  </span>
                  Enviar a publicidad
                </button>
              </div>
            </>
          ) : (
            <div className="bg-surface rounded-2xl border border-outline-variant p-12 text-center text-on-surface-muted">
              <p>Selecciona una plantilla y sube un diseño para ver el preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center"
            title="Cerrar (Esc)"
          >
            <span className="material-symbol" style={{ fontSize: "24px" }}>
              close
            </span>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Mockup en grande"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// Ray-casting algorithm para verificar si un punto está dentro de un polígono
function pointInPolygon(
  x: number,
  y: number,
  polygon: Array<[number, number]>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function lerp2D(
  tl: { x: number; y: number },
  tr: { x: number; y: number },
  bl: { x: number; y: number },
  br: { x: number; y: number },
  u: number,
  v: number
) {
  const top = { x: tl.x + (tr.x - tl.x) * u, y: tl.y + (tr.y - tl.y) * u };
  const bottom = { x: bl.x + (br.x - bl.x) * u, y: bl.y + (br.y - bl.y) * u };
  return {
    x: top.x + (bottom.x - top.x) * v,
    y: top.y + (bottom.y - top.y) * v,
  };
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  uv0: { x: number; y: number },
  uv1: { x: number; y: number },
  uv2: { x: number; y: number }
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.clip();

  // Affine transform para este triángulo
  const dx0 = p1.x - p0.x,
    dy0 = p1.y - p0.y;
  const dx1 = p2.x - p0.x,
    dy1 = p2.y - p0.y;
  const du0 = uv1.x - uv0.x,
    dv0 = uv1.y - uv0.y;
  const du1 = uv2.x - uv0.x,
    dv1 = uv2.y - uv0.y;

  const det = du0 * dv1 - du1 * dv0;
  if (det === 0) {
    ctx.restore();
    return;
  }

  const a = (dv1 * dx0 - dv0 * dx1) / det;
  const b = (dv1 * dy0 - dv0 * dy1) / det;
  const c = (du0 * dx1 - du1 * dx0) / det;
  const d = (du0 * dy1 - du1 * dy0) / det;
  const e = p0.x - a * uv0.x - c * uv0.y;
  const f = p0.y - b * uv0.x - d * uv0.y;

  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}
