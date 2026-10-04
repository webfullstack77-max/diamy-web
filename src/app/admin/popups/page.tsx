"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { PopupConfig, PopupSlide, PopupTheme } from "@/types/popup";
import { POPUP_THEMES } from "@/lib/popup-themes";
import ThemedPopup from "@/components/popups/ThemedPopup";

interface ProductOption {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: string[];
  category?: { name: string } | null;
}

export default function AdminPopupsPage() {
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Selector modal de catálogo
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlideIndex, setPickerSlideIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  // Subida de imagen
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetUploadSlide = useRef<number | null>(null);

  // Cargar datos
  useEffect(() => {
    fetch("/api/admin/popup")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar configuración:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-on-surface-muted">
          <span className="material-symbol animate-spin" style={{ fontSize: "36px" }}>progress_activity</span>
          <p className="text-sm">Cargando configuración de popups...</p>
        </div>
      </div>
    );
  }

  // Guardar configuración
  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        alert("Error al guardar la configuración");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión al guardar");
    } finally {
      setSaving(false);
    }
  }

  // Manejo de slides
  function updateSlide(index: number, updates: Partial<PopupSlide>) {
    if (!config) return;
    const newSlides = [...config.slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setConfig({ ...config, slides: newSlides });
  }

  function addSlide() {
    if (!config) return;
    const newSlide: PopupSlide = {
      id: `slide-${Date.now()}`,
      title: "Nuevo Producto Destacado",
      subtitle: "Personalizado con grabado láser y envío",
      badge: "⭐ Destacado",
      imageUrl: products[0]?.images?.[0] || "/logo.png",
      linkUrl: products[0] ? `/producto/${products[0].slug}` : "/catalogo",
    };
    setConfig({ ...config, slides: [...config.slides, newSlide] });
  }

  function removeSlide(index: number) {
    if (!config || config.slides.length <= 1) {
      alert("Debes mantener al menos 1 slide en el popup.");
      return;
    }
    const newSlides = config.slides.filter((_, i) => i !== index);
    setConfig({ ...config, slides: newSlides });
  }

  // Abrir picker de catálogo para un slide
  function openProductPicker(index: number) {
    setPickerSlideIndex(index);
    setPickerSearch("");
    setPickerOpen(true);
  }

  function selectProductForSlide(prod: ProductOption) {
    if (pickerSlideIndex === null || !config) return;
    const firstImg = prod.images?.[0] || "/logo.png";
    updateSlide(pickerSlideIndex, {
      title: prod.title,
      subtitle: prod.category?.name ? `Categoría: ${prod.category.name} · $${prod.price} MXN` : `$${prod.price} MXN`,
      imageUrl: firstImg,
      linkUrl: `/producto/${prod.slug}`,
      badge: config.theme === "halloween" ? "🎃 Spooky Pick" : "⭐ Recomendado",
    });
    setPickerOpen(false);
    setPickerSlideIndex(null);
  }

  // Subir imagen para slide
  function triggerUpload(index: number) {
    targetUploadSlide.current = index;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const index = targetUploadSlide.current;
    if (!file || index === null) return;

    setUploadingIndex(index);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        updateSlide(index, { imageUrl: data.url });
      } else {
        alert("Error al subir imagen");
      }
    } catch {
      alert("Error de conexión al subir imagen");
    } finally {
      setUploadingIndex(null);
    }
  }

  // Filtrado de productos para picker
  const filteredProducts = products.filter((p) => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  });

  const activeTheme = POPUP_THEMES[config.theme] || POPUP_THEMES.halloween;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Input de archivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner de Éxito al guardar */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl animate-fade-in">
          <span className="material-symbol" style={{ fontSize: "22px" }}>check_circle</span>
          <span className="text-sm font-semibold">¡Configuración de Popup guardada con éxito!</span>
        </div>
      )}

      {/* Header Principal con Botones de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-3xl border border-outline-variant shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbol text-primary" style={{ fontSize: "28px" }}>featured_seasonal_and_gifts</span>
            <h1 className="font-serif text-2xl font-bold text-on-surface">Ventanas Popups Promocionales</h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-muted mt-1 max-w-xl">
            Crea ventanas emergentes festivas prediseñadas (Halloween, Navidad, Día de Reyes, etc.) con carrusel de productos interactivo al entrar al sitio.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary-container transition"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>visibility</span>
            Vista Previa
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-lg shadow-primary/25 transition disabled:opacity-50"
          >
            {saving ? (
              <span className="material-symbol animate-spin" style={{ fontSize: "18px" }}>progress_activity</span>
            ) : (
              <span className="material-symbol" style={{ fontSize: "18px" }}>save</span>
            )}
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      {/* Control Maestro: Activar / Desactivar Popup */}
      <div className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-neutral-500/15 text-neutral-400"}`}>
            <span className="material-symbol" style={{ fontSize: "28px" }}>
              {config.isActive ? "campaign" : "notifications_off"}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-base text-on-surface">
              Estado del Popup: <span className={config.isActive ? "text-emerald-600" : "text-neutral-500"}>{config.isActive ? "ACTIVO (Visible para clientes)" : "DESACTIVADO"}</span>
            </h2>
            <p className="text-xs text-on-surface-muted mt-0.5">
              Si está activo, aparecerá cuando las personas ingresen a la tienda online.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.isActive}
            onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Selector de Temas Prediseñados */}
      <div className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-sm space-y-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2">
            <span>🎨</span>
            <span>Elige el Tema Gráfico Prediseñado</span>
          </h2>
          <p className="text-xs text-on-surface-muted mt-0.5">
            Cada tema incluye marcos luminosos, adornos vectoriales, colores y estilos decorativos automáticos.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(POPUP_THEMES) as PopupTheme[]).map((themeKey) => {
            const t = POPUP_THEMES[themeKey];
            const isSelected = config.theme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => setConfig({ ...config, theme: themeKey })}
                className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary-container/40 ring-2 ring-primary/40 shadow-md scale-[1.02]"
                    : "border-outline-variant hover:border-primary/50 hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-2xl">{t.emoji}</span>
                  {isSelected && (
                    <span className="material-symbol text-primary text-base">check_circle</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">{t.name}</div>
                  <div className="text-[10px] text-on-surface-muted truncate mt-0.5">{t.defaultBadge}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ajustes Generales del Contenido */}
      <div className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-sm space-y-4">
        <h2 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2">
          <span>✏️</span>
          <span>Textos Principales & Frecuencia</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Título del Popup *
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Ej: ¡Especial Spooky Halloween! 🎃"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Texto del Botón de Acción
            </label>
            <input
              type="text"
              value={config.buttonText || ""}
              onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
              placeholder="Ej: Ver Producto"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-on-surface mb-1">
              Subtítulo / Mensaje Promocional (Opcional)
            </label>
            <input
              type="text"
              value={config.subtitle || ""}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              placeholder="Ej: Playeras exclusivas y decoración en corte láser con envío a todo México"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Frecuencia de aparición */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Frecuencia de Aparición
            </label>
            <select
              value={config.displayFrequency}
              onChange={(e) => setConfig({ ...config, displayFrequency: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="always">Siempre al entrar (Recomendado para pruebas)</option>
              <option value="once_session">Una vez por sesión del navegador</option>
              <option value="once_day">Una vez al día por visitante</option>
            </select>
          </div>

          {/* Cambio automático de slides */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Cambio Automático de Imagen (Segundos)
            </label>
            <select
              value={config.autoPlayInterval}
              onChange={(e) => setConfig({ ...config, autoPlayInterval: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value={0}>Desactivado (Solo manual con flechas)</option>
              <option value={3}>Rápido (Cada 3 segundos)</option>
              <option value={4}>Estándar (Cada 4 segundos)</option>
              <option value={6}>Tranquilo (Cada 6 segundos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor de Slides del Carrusel */}
      <div className="bg-surface p-6 rounded-3xl border border-outline-variant shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2">
              <span>🖼️</span>
              <span>Carrusel de Productos ({config.slides.length} imágenes)</span>
            </h2>
            <p className="text-xs text-on-surface-muted mt-0.5">
              Cada slide es interactivo: al darle clic, el cliente viajará directamente a ese producto o sección.
            </p>
          </div>

          <button
            type="button"
            onClick={addSlide}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container hover:bg-primary-container text-on-surface hover:text-primary text-xs font-bold border border-outline-variant transition"
          >
            <span className="material-symbol" style={{ fontSize: "16px" }}>add</span>
            Agregar Slide
          </button>
        </div>

        {/* Lista de Slides */}
        <div className="space-y-4">
          {config.slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant relative flex flex-col md:flex-row gap-5 items-start"
            >
              {/* Badge número */}
              <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center z-10 shadow-sm">
                {index + 1}
              </div>

              {/* Miniatura y Acciones de Imagen */}
              <div className="shrink-0 w-full md:w-44 flex flex-col gap-2 pt-4 md:pt-0">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/10 border border-outline-variant">
                  {slide.imageUrl ? (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-muted text-xs">
                      Sin imagen
                    </div>
                  )}

                  {uploadingIndex === index && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs gap-1.5">
                      <span className="material-symbol animate-spin" style={{ fontSize: "18px" }}>progress_activity</span>
                      Subiendo...
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openProductPicker(index)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-1"
                  >
                    <span className="material-symbol" style={{ fontSize: "14px" }}>inventory_2</span>
                    Catálogo
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerUpload(index)}
                    className="py-1.5 px-2 rounded-lg bg-surface border border-outline-variant text-on-surface text-xs font-medium hover:bg-surface-container transition flex items-center justify-center"
                    title="Subir archivo propio"
                  >
                    <span className="material-symbol" style={{ fontSize: "15px" }}>upload</span>
                  </button>
                </div>
              </div>

              {/* Campos del Slide */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-on-surface-muted mb-0.5">
                    Título del Producto / Slide *
                  </label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateSlide(index, { title: e.target.value })}
                    placeholder="Ej: Playera Demon Hunters Semitonos"
                    className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-muted mb-0.5">
                    Etiqueta / Badge (Opcional)
                  </label>
                  <input
                    type="text"
                    value={slide.badge || ""}
                    onChange={(e) => updateSlide(index, { badge: e.target.value })}
                    placeholder="Ej: 🎃 Más Pedida, Oferta, Nuevo..."
                    className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-muted mb-0.5">
                    Enlace de Destino (Al dar clic) *
                  </label>
                  <input
                    type="text"
                    value={slide.linkUrl}
                    onChange={(e) => updateSlide(index, { linkUrl: e.target.value })}
                    placeholder="Ej: /producto/playerasdhsemi o /catalogo"
                    className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-on-surface-muted mb-0.5">
                    Subtítulo / Breve descripción
                  </label>
                  <input
                    type="text"
                    value={slide.subtitle || ""}
                    onChange={(e) => updateSlide(index, { subtitle: e.target.value })}
                    placeholder="Ej: Estampado DTF de alta duración en playera negra"
                    className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Botón eliminar slide */}
              <button
                type="button"
                onClick={() => removeSlide(index)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Eliminar este slide"
              >
                <span className="material-symbol" style={{ fontSize: "18px" }}>delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Selector de Productos del Catálogo */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-3xl border border-outline-variant shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface">Seleccionar Producto del Catálogo</h3>
                <p className="text-xs text-on-surface-muted">Haz clic en cualquier producto para vincular su imagen, título y enlace al slide.</p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface"
              >
                <span className="material-symbol">close</span>
              </button>
            </div>

            {/* Buscador */}
            <div className="p-4 border-b border-outline-variant bg-surface-container/50">
              <div className="relative">
                <span className="material-symbol absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted" style={{ fontSize: "18px" }}>
                  search
                </span>
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Buscar playeras, termos, tazas, corte láser..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
              </div>
            </div>

            {/* Grid de productos */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => selectProductForSlide(p)}
                  className="p-2.5 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary-container/20 transition cursor-pointer flex flex-col group"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container mb-2">
                    {p.images?.[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.title}
                        fill
                        className="object-contain p-1 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-muted">Sin foto</div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-on-surface line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-primary font-semibold mt-0.5">${p.price} MXN</div>
                  {p.category?.name && (
                    <div className="text-[10px] text-on-surface-muted truncate mt-0.5">{p.category.name}</div>
                  )}
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-on-surface-muted text-sm">
                  No se encontraron productos que coincidan con la búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa en Vivo */}
      {previewOpen && (
        <ThemedPopup
          previewConfig={config}
          onClosePreview={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
