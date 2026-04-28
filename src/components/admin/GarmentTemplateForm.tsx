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

interface Props {
  template?: {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
    controlPoints: ControlPoints;
    garmentArea?: ControlPoints | null;
    maskUrl?: string | null;
  };
}

type EditingMode = "print" | "garment";

const CATEGORIES = ["hombre", "mujer", "niño", "niña", "sudadera"];

export default function GarmentTemplateForm({ template }: Props) {
  const router = useRouter();
  const isEdit = !!template;

  const [name, setName] = useState(template?.name ?? "");
  const [category, setCategory] = useState(template?.category ?? "hombre");
  const [imageUrl, setImageUrl] = useState(template?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [controlPoints, setControlPoints] = useState<ControlPoints>(
    template?.controlPoints ?? {
      tl: { x: 35, y: 25 },
      tr: { x: 65, y: 25 },
      br: { x: 65, y: 50 },
      bl: { x: 35, y: 50 },
    }
  );

  const [garmentArea, setGarmentArea] = useState<ControlPoints>(
    template?.garmentArea ?? {
      tl: { x: 25, y: 15 },
      tr: { x: 75, y: 15 },
      br: { x: 78, y: 65 },
      bl: { x: 22, y: 65 },
    }
  );

  const [editingMode, setEditingMode] = useState<EditingMode>("print");
  const [dragging, setDragging] = useState<keyof ControlPoints | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 });
  const [maskUrl, setMaskUrl] = useState<string | null>(template?.maskUrl ?? null);
  const [generatingMask, setGeneratingMask] = useState(false);

  async function handleGenerateMask() {
    if (!imageUrl) return;
    setGeneratingMask(true);
    setError("");
    try {
      const res = await fetch("/api/admin/segment-garment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (res.ok && data.maskUrl) {
        setMaskUrl(data.maskUrl);
      } else {
        setError(data.error ?? "Error generando máscara con IA");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generando máscara");
    }
    setGeneratingMask(false);
  }

  const activePoints = editingMode === "print" ? controlPoints : garmentArea;
  const setActivePoints = editingMode === "print" ? setControlPoints : setGarmentArea;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDims({ width: img.naturalWidth, height: img.naturalHeight });
  };

  async function uploadImage(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    const file = files[0];

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setImageUrl(url);
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al subir imagen");
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    uploadImage(files);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    uploadImage(files);
    e.target.value = "";
  }

  function handleMouseDown(point: keyof ControlPoints) {
    setDragging(point);
  }

  useEffect(() => {
    if (!dragging || !containerRef.current) return;

    const draggingPoint: keyof ControlPoints = dragging;
    const container = containerRef.current;
    const updateFn = setActivePoints;

    function handleMouseMove(e: MouseEvent) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      updateFn((prev) => ({
        ...prev,
        [draggingPoint]: {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        },
      }));
    }

    function handleMouseUp() {
      setDragging(null);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, setActivePoints]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!name || !imageUrl) {
      setError("Completa todos los campos");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      category,
      imageUrl,
      controlPoints,
      garmentArea,
      maskUrl,
    };

    const url = isEdit
      ? `/api/admin/garment-templates/${template.id}`
      : "/api/admin/garment-templates";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/plantillas");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
    }
    setSaving(false);
  }

  const pointLabels: Record<keyof ControlPoints, string> = {
    tl: "Arriba-Izquierda",
    tr: "Arriba-Derecha",
    br: "Abajo-Derecha",
    bl: "Abajo-Izquierda",
  };

  const pointOrder = ["tl", "tr", "br", "bl"] as const;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Básico */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
        <h2 className="font-semibold text-on-surface">Información básica</h2>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">
            Nombre de la plantilla
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej: Playera Hombre Blanca"
            required
            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Foto del modelo */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
        <h2 className="font-semibold text-on-surface">Foto del modelo</h2>

        {imageUrl ? (
          <div className="space-y-2">
            <p className="text-xs text-on-surface-muted">Foto actual:</p>
            <div className="relative w-full max-w-sm mx-auto">
              <Image src={imageUrl} alt="modelo" width={400} height={500} className="rounded-lg" />
            </div>
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="text-xs text-error hover:underline"
            >
              Cambiar foto
            </button>
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl border-2 border-dashed cursor-pointer transition ${
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
              style={{ fontSize: "32px" }}
            >
              {uploading ? "hourglass_empty" : "upload_file"}
            </span>
            <p className="text-sm font-medium text-on-surface">
              {uploading
                ? "Subiendo..."
                : "Arrastra la foto aquí o haz clic"}
            </p>
            <p className="text-xs text-on-surface-muted">JPG, PNG, WebP</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Máscara IA */}
      {imageUrl && (
        <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbol text-primary" style={{ fontSize: "20px" }}>
                  auto_awesome
                </span>
                Máscara con IA
              </h2>
              <p className="text-xs text-on-surface-muted mt-1">
                Detecta automáticamente la prenda para que el cambio de color se vea perfecto
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateMask}
              disabled={generatingMask}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-60 flex items-center gap-2"
            >
              <span className="material-symbol" style={{ fontSize: "18px" }}>
                {generatingMask ? "hourglass_empty" : "auto_fix_high"}
              </span>
              {generatingMask ? "Procesando..." : maskUrl ? "Regenerar" : "Generar máscara"}
            </button>
          </div>

          {maskUrl && (
            <div className="space-y-2">
              <p className="text-xs text-on-surface-muted">Máscara generada (blanco = prenda):</p>
              <div className="relative w-full max-w-sm mx-auto bg-checkered rounded-lg overflow-hidden border border-outline-variant">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={maskUrl} alt="máscara" className="w-full" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor de puntos de control */}
      {imageUrl && (
        <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-outline-variant">
            <button
              type="button"
              onClick={() => setEditingMode("print")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                editingMode === "print"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-muted hover:text-on-surface"
              }`}
            >
              <span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle" style={{ backgroundColor: "#6366F1" }} />
              Área del estampado
            </button>
            <button
              type="button"
              onClick={() => setEditingMode("garment")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                editingMode === "garment"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-muted hover:text-on-surface"
              }`}
            >
              <span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle" style={{ backgroundColor: "#10B981" }} />
              Área de la prenda (para color)
            </button>
          </div>

          <p className="text-xs text-on-surface-muted">
            {editingMode === "print"
              ? "Arrastra los 4 puntos azules para definir dónde irá el diseño. Orden: ↖ → ↗ → ↘ → ↙"
              : "Arrastra los 4 puntos verdes para marcar el contorno de la prenda. El cambio de color SOLO se aplicará dentro de esta área."}
          </p>

          <div
            ref={containerRef}
            className="relative w-full max-w-lg mx-auto rounded-lg overflow-hidden border-2 border-outline-variant"
            style={{ aspectRatio: "3/4" }}
          >
            <img
              src={imageUrl}
              alt="modelo"
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
            />

            {/* SVG con ambos polígonos */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            >
              {/* Polígono de prenda (verde) */}
              <polygon
                points={`${garmentArea.tl.x}%,${garmentArea.tl.y}% ${garmentArea.tr.x}%,${garmentArea.tr.y}% ${garmentArea.br.x}%,${garmentArea.br.y}% ${garmentArea.bl.x}%,${garmentArea.bl.y}%`}
                fill={editingMode === "garment" ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.05)"}
                stroke="rgb(16, 185, 129)"
                strokeWidth={editingMode === "garment" ? "2" : "1.5"}
                strokeDasharray={editingMode === "garment" ? "0" : "4 2"}
              />
              {/* Polígono de estampado (azul) */}
              <polygon
                points={`${controlPoints.tl.x}%,${controlPoints.tl.y}% ${controlPoints.tr.x}%,${controlPoints.tr.y}% ${controlPoints.br.x}%,${controlPoints.br.y}% ${controlPoints.bl.x}%,${controlPoints.bl.y}%`}
                fill={editingMode === "print" ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.05)"}
                stroke="rgb(99, 102, 241)"
                strokeWidth={editingMode === "print" ? "2" : "1.5"}
                strokeDasharray={editingMode === "print" ? "0" : "4 2"}
              />
            </svg>

            {/* Puntos arrastrables del área activa */}
            {pointOrder.map((point) => (
              <div
                key={point}
                onMouseDown={() => handleMouseDown(point)}
                className="absolute w-6 h-6 border-2 border-white rounded-full cursor-grab active:cursor-grabbing shadow-lg hover:w-8 hover:h-8 transition"
                style={{
                  left: `${activePoints[point].x}%`,
                  top: `${activePoints[point].y}%`,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: editingMode === "print" ? "rgb(99, 102, 241)" : "rgb(16, 185, 129)",
                }}
                title={pointLabels[point]}
              />
            ))}
          </div>

          {/* Información de puntos */}
          <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-muted bg-surface-container p-3 rounded-lg">
            {pointOrder.map((point) => (
              <div key={point}>
                <span className="font-medium">{pointLabels[point]}:</span>
                <br />
                {activePoints[point].x.toFixed(1)}%, {activePoints[point].y.toFixed(1)}%
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !imageUrl}
          className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-dark transition disabled:opacity-60"
        >
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear plantilla"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
