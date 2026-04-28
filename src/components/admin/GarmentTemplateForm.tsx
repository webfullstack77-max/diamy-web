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
  };
}

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
      tl: { x: 20, y: 20 },
      tr: { x: 80, y: 20 },
      br: { x: 80, y: 80 },
      bl: { x: 20, y: 80 },
    }
  );

  const [dragging, setDragging] = useState<keyof ControlPoints | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 });

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

    function handleMouseMove(e: MouseEvent) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setControlPoints((prev) => ({
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
  }, [dragging]);

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

      {/* Editor de puntos de control */}
      {imageUrl && (
        <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4">
          <h2 className="font-semibold text-on-surface">
            Área de estampado
          </h2>
          <p className="text-xs text-on-surface-muted">
            Arrastra los 4 puntos para definir el área donde irá el diseño. Orden: ↖ → ↗ → ↘ → ↙
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

            {/* SVG para dibujar el polígono */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            >
              <polygon
                points={`${controlPoints.tl.x}%,${controlPoints.tl.y}% ${controlPoints.tr.x}%,${controlPoints.tr.y}% ${controlPoints.br.x}%,${controlPoints.br.y}% ${controlPoints.bl.x}%,${controlPoints.bl.y}%`}
                fill="rgba(99, 102, 241, 0.1)"
                stroke="rgb(99, 102, 241)"
                strokeWidth="2"
              />
            </svg>

            {/* Puntos arrastrables */}
            {pointOrder.map((point) => (
              <div
                key={point}
                onMouseDown={() => handleMouseDown(point)}
                className="absolute w-6 h-6 bg-primary border-2 border-white rounded-full cursor-grab active:cursor-grabbing shadow-lg hover:w-8 hover:h-8 transition"
                style={{
                  left: `${controlPoints[point].x}%`,
                  top: `${controlPoints[point].y}%`,
                  transform: "translate(-50%, -50%)",
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
                {controlPoints[point].x.toFixed(1)}%, {controlPoints[point].y.toFixed(1)}%
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
