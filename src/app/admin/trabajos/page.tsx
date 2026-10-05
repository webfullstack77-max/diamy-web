"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ProductResult {
  id: string;
  title: string;
  images: string[];
  slug: string;
  category?: { name: string };
}

interface ClientWorkItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string | null;
  clientName: string | null;
  badge: string | null;
  order: number;
  isActive: boolean;
  productId: string | null;
  link: string | null;
  product?: { id: string; title: string; slug: string; images: string[] } | null;
}

const CATEGORY_SUGGESTIONS = [
  "Corte Láser MDF",
  "Grabado de Termos",
  "Acrílico & Neón Flex",
  "Estampado de Playeras",
  "Tazas Personalizadas",
  "Stickers & Viniles",
  "Impresión 3D",
  "Invitaciones y Recuerdos",
];

const BADGE_SUGGESTIONS = [
  "✨ Trabajo Real",
  "🪵 Corte Láser",
  "🔥 Más Pedido",
  "⚡ Neón Flex",
  "⭐ 5 Estrellas",
  "🎨 Diseño Exclusivo",
  "☕ Cerámica Premium",
];

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  category: "Corte Láser MDF",
  clientName: "",
  badge: "✨ Trabajo Real",
  order: 0,
  isActive: true,
  productId: "",
  link: "",
};

export default function ClientWorksAdmin() {
  const [items, setItems] = useState<ClientWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selector de producto del catálogo
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/client-works");
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  function handleProductSearchChange(q: string) {
    setProductSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) {
      setProductResults([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      fetch(`/api/admin/products?q=${encodeURIComponent(q)}&limit=8`)
        .then((r) => r.json())
        .then((data) => {
          setProductResults(Array.isArray(data) ? data : data.products ?? []);
        })
        .catch(() => setProductResults([]));
    }, 300);
  }

  function handleSelectProduct(p: ProductResult) {
    setSelectedProduct(p);
    setSearchOpen(false);
    setProductSearch("");
    setForm((f) => ({
      ...f,
      productId: p.id,
      title: f.title || p.title,
      imageUrl: f.imageUrl || (p.images && p.images[0]) || "",
      category: f.category || p.category?.name || "Corte Láser MDF",
      link: `/producto/${p.slug}`,
    }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, imageUrl: data.url }));
      } else {
        alert(data.error || "Error al subir la imagen");
      }
    } catch {
      alert("Error en la conexión al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl) {
      alert("El título y la imagen son obligatorios");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      productId: form.productId || null,
      link: form.link || null,
      clientName: form.clientName || null,
      description: form.description || null,
    };

    try {
      if (editId) {
        const res = await fetch(`/api/admin/client-works/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al actualizar");
      } else {
        const res = await fetch("/api/admin/client-works", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, order: items.length }),
        });
        if (!res.ok) throw new Error("Error al crear");
      }
      setShowModal(false);
      setEditId(null);
      setForm(emptyForm);
      setSelectedProduct(null);
      load();
    } catch (err: unknown) {
      alert((err as Error).message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar el trabajo "${title}" de la galería?`)) return;
    try {
      const res = await fetch(`/api/admin/client-works/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch {
      alert("Error al eliminar");
    }
  }

  async function toggleActive(item: ClientWorkItem) {
    try {
      const res = await fetch(`/api/admin/client-works/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isActive: !item.isActive } : i))
        );
      }
    } catch {
      alert("Error al cambiar estado");
    }
  }

  async function moveOrder(index: number, dir: -1 | 1) {
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[index];
    const targetItem = items[targetIndex];

    const updated = [...items];
    updated[index] = { ...targetItem, order: currentItem.order };
    updated[targetIndex] = { ...currentItem, order: targetItem.order };
    setItems(updated);

    try {
      await Promise.all([
        fetch(`/api/admin/client-works/${currentItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: targetItem.order }),
        }),
        fetch(`/api/admin/client-works/${targetItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: currentItem.order }),
        }),
      ]);
      load();
    } catch {
      load();
    }
  }

  function openEdit(item: ClientWorkItem) {
    setEditId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      imageUrl: item.imageUrl,
      category: item.category ?? "Corte Láser MDF",
      clientName: item.clientName ?? "",
      badge: item.badge ?? "✨ Trabajo Real",
      order: item.order,
      isActive: item.isActive,
      productId: item.productId ?? "",
      link: item.link ?? "",
    });
    setSelectedProduct(
      item.product
        ? {
            id: item.product.id,
            title: item.product.title,
            images: item.product.images,
            slug: item.product.slug,
          }
        : null
    );
    setShowModal(true);
  }

  function openNew() {
    setEditId(null);
    setForm({ ...emptyForm, order: items.length });
    setSelectedProduct(null);
    setShowModal(true);
  }

  const filteredItems = items
    .filter((i) => {
      if (filter === "active") return i.isActive;
      if (filter === "inactive") return !i.isActive;
      return true;
    })
    .filter((i) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        (i.clientName && i.clientName.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q))
      );
    });

  const activeCount = items.filter((i) => i.isActive).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbol text-primary" style={{ fontSize: "28px" }}>
              photo_library
            </span>
            <h1 className="text-2xl font-serif font-bold text-on-surface">
              Galería de Trabajos Reales
            </h1>
          </div>
          <p className="text-on-surface-muted text-sm mt-1">
            Muestra a tus clientes proyectos reales terminados en el nuevo carrusel interactivo
            entre <strong>Nuestras Categorías</strong> y <strong>Producto del Mes</strong>.
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-on-surface-muted">
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {activeCount} en carrusel público
            </span>
            <span>Total: {items.length} trabajos registrados</span>
            <span>Cambia cada 5s automáticamente</span>
          </div>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-dark transition shadow-md shrink-0"
        >
          <span className="material-symbol" style={{ fontSize: "20px" }}>add</span>
          Agregar Trabajo
        </button>
      </div>

      {/* Barra de filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-outline-variant">
        <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1 w-full sm:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === "all" ? "bg-surface text-primary shadow-sm" : "text-on-surface-muted"
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === "active" ? "bg-surface text-primary shadow-sm" : "text-on-surface-muted"
            }`}
          >
            Visibles ({activeCount})
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === "inactive" ? "bg-surface text-primary shadow-sm" : "text-on-surface-muted"
            }`}
          >
            Ocultos ({items.length - activeCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <span
            className="material-symbol absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted pointer-events-none"
            style={{ fontSize: "18px" }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o cliente..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Lista de Trabajos */}
      {loading ? (
        <div className="p-12 text-center text-on-surface-muted">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Cargando galería de trabajos...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center border border-dashed border-outline-variant">
          <span className="material-symbol text-on-surface-muted mx-auto block mb-2" style={{ fontSize: "48px" }}>
            imagesmode
          </span>
          <p className="text-base font-semibold text-on-surface">No se encontraron trabajos reales</p>
          <p className="text-xs text-on-surface-muted mt-1 max-w-sm mx-auto">
            {search
              ? "Prueba cambiando el término de búsqueda."
              : "Comienza subiendo la primera foto de un trabajo entregado a un cliente."}
          </p>
          {!search && (
            <button
              onClick={openNew}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-dark transition"
            >
              <span className="material-symbol" style={{ fontSize: "16px" }}>add</span>
              Agregar Trabajo Ahora
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`bg-surface rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                item.isActive
                  ? "border-outline-variant hover:border-primary/50 shadow-sm hover:shadow-md"
                  : "border-outline-variant/60 opacity-60 bg-surface/50"
              }`}
            >
              {/* Imagen y badges */}
              <div className="relative aspect-[4/3] bg-surface-container overflow-hidden group">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge flotante */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  {item.badge && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/90 text-white backdrop-blur-md shadow-sm">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Orden indicator */}
                <div className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-md backdrop-blur-md font-mono">
                  #{index + 1}
                </div>

                {/* Overlay de acciones rápidas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 py-1.5 rounded-lg bg-white/95 text-on-surface text-xs font-semibold hover:bg-white transition flex items-center justify-center gap-1 shadow"
                  >
                    <span className="material-symbol" style={{ fontSize: "16px" }}>edit</span>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow"
                    title="Eliminar"
                  >
                    <span className="material-symbol" style={{ fontSize: "16px" }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-on-surface line-clamp-1">
                    {item.title}
                  </h3>
                  {item.clientName && (
                    <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                      <span className="material-symbol" style={{ fontSize: "14px" }}>person</span>
                      {item.clientName}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-on-surface-muted mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer de la tarjeta con switch y controles de orden */}
                <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveOrder(index, -1)}
                      disabled={index === 0}
                      className="p-1 rounded-lg hover:bg-surface-container text-on-surface-muted disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Mover arriba"
                    >
                      <span className="material-symbol" style={{ fontSize: "18px" }}>arrow_upward</span>
                    </button>
                    <button
                      onClick={() => moveOrder(index, 1)}
                      disabled={index === items.length - 1}
                      className="p-1 rounded-lg hover:bg-surface-container text-on-surface-muted disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Mover abajo"
                    >
                      <span className="material-symbol" style={{ fontSize: "18px" }}>arrow_downward</span>
                    </button>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-on-surface">
                    <span>{item.isActive ? "Visible" : "Oculto"}</span>
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={() => toggleActive(item)}
                      className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface w-full max-w-2xl rounded-3xl border border-outline-variant shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-5 border-b border-outline-variant flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbol text-primary" style={{ fontSize: "24px" }}>
                  {editId ? "edit" : "add_photo_alternate"}
                </span>
                <h2 className="font-serif font-bold text-lg text-on-surface">
                  {editId ? "Editar Trabajo Real" : "Nuevo Trabajo Real"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-muted"
              >
                <span className="material-symbol" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Opción rápida: Vincular producto del catálogo */}
              <div className="p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbol text-primary" style={{ fontSize: "16px" }}>link</span>
                    Vincular a producto del catálogo (opcional)
                  </label>
                  {selectedProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setForm((f) => ({ ...f, productId: "" }));
                      }}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Desvincular
                    </button>
                  )}
                </div>

                {selectedProduct ? (
                  <div className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-primary/30">
                    {selectedProduct.images?.[0] && (
                      <div className="w-10 h-10 relative rounded-lg overflow-hidden shrink-0">
                        <Image src={selectedProduct.images[0]} alt={selectedProduct.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface truncate">{selectedProduct.title}</p>
                      <p className="text-[11px] text-primary">Vinculado para cotización y clic</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        handleProductSearchChange(e.target.value);
                        setSearchOpen(true);
                      }}
                      onFocus={() => setSearchOpen(true)}
                      placeholder="Escribe el nombre de un producto para autocompletar..."
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:border-primary"
                    />

                    {searchOpen && productResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                        {productResults.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className="p-2 hover:bg-surface-container cursor-pointer flex items-center gap-2.5 border-b border-outline-variant/40 last:border-b-0"
                          >
                            {p.images?.[0] && (
                              <div className="w-8 h-8 relative rounded overflow-hidden shrink-0">
                                <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-on-surface truncate">{p.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Subida o selección de imagen */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Foto del Trabajo Real <span className="text-red-500">*</span>
                </label>

                {form.imageUrl ? (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-outline-variant bg-surface-container group">
                    <Image src={form.imageUrl} alt="Vista previa" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-on-surface text-xs font-semibold shadow hover:bg-white/90"
                      >
                        Cambiar foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold shadow hover:bg-red-700"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-outline-variant hover:border-primary rounded-2xl p-8 text-center cursor-pointer bg-surface-container/30 hover:bg-surface-container/60 transition"
                  >
                    <span className="material-symbol text-primary mx-auto block mb-1" style={{ fontSize: "36px" }}>
                      add_photo_alternate
                    </span>
                    <p className="text-xs font-semibold text-on-surface">Haz clic para subir la foto del trabajo</p>
                    <p className="text-[11px] text-on-surface-muted mt-0.5">JPG, PNG o WebP de alta resolución</p>
                    {uploading && (
                      <p className="text-xs text-primary font-medium mt-2 animate-pulse">
                        Subiendo y optimizando imagen...
                      </p>
                    )}
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFile}
                  className="hidden"
                />
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Título del Proyecto / Pieza <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Letrero Neón Flex para Bar & Grill"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Categoría y Distintivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Técnica / Categoría
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Ej: Corte Láser MDF"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:border-primary mb-1.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    {CATEGORY_SUGGESTIONS.slice(0, 4).map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setForm({ ...form, category: cat })}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface-muted transition"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Distintivo / Badge
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="Ej: ✨ Trabajo Real"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:border-primary mb-1.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    {BADGE_SUGGESTIONS.slice(0, 4).map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setForm({ ...form, badge: b })}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface-muted transition"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cliente / Proyecto y Enlace personalizado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Nombre del Cliente o Ocasión
                  </label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    placeholder="Ej: Boda Carlos & Sofía / Café París"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Enlace de destino (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/catalogo o /producto/slug"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Detalles del acabado / técnica (opcional)
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej: Fabricación multicapa en MDF 6mm con corte láser de alta precisión y acabado en laca mate."
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Switch Activo */}
              <div className="pt-2 flex items-center justify-between border-t border-outline-variant">
                <div>
                  <p className="text-xs font-semibold text-on-surface">Mostrar en el carrusel de la tienda</p>
                  <p className="text-[11px] text-on-surface-muted">
                    Si está activo, aparecerá en el carrusel de la página de inicio.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
                />
              </div>

              {/* Footer Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-muted hover:bg-surface-container transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-dark transition shadow-md disabled:opacity-50"
                >
                  {saving ? "Guardando..." : editId ? "Actualizar Trabajo" : "Guardar Trabajo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
