"use client";

import { useState, useEffect, useRef } from "react";

interface ProductResult {
  id: string;
  title: string;
  images: string[];
  slug: string;
}

interface Item {
  id: string;
  image: string;
  text: string | null;
  link: string | null;
  order: number;
  isActive: boolean;
  productId: string | null;
  product: { id: string; title: string; images: string[] } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

const emptyForm = { image: "", text: "", link: "", order: 0, isActive: true, productId: "" };

export default function ProductOfMonthAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = () =>
    fetch("/api/admin/product-of-month")
      .then((r) => r.json())
      .then(setItems);

  function handleProductSearchChange(q: string) {
    setProductSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setProductResults([]); return; }
    searchTimer.current = setTimeout(() => {
      fetch(`/api/admin/products?q=${encodeURIComponent(q)}&limit=8`)
        .then((r) => r.json())
        .then((data) => setProductResults(Array.isArray(data) ? data : data.products ?? []));
    }, 300);
  }

  useEffect(() => {
    load();
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data: (Category & { parentId: string | null })[]) =>
        setCategories(data.filter((c) => !c.parentId))
      );
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, image: data.url }));
    setUploading(false);
  }

  async function handleSave() {
    if (!form.image) return;
    setSaving(true);
    const payload = { ...form, productId: form.productId || null };
    if (editId) {
      await fetch(`/api/admin/product-of-month/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/product-of-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, order: items.length }),
      });
    }
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setSelectedProduct(null);
    setProductSearch("");
    setProductResults([]);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto del mes?")) return;
    await fetch(`/api/admin/product-of-month/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleActive(item: Item) {
    await fetch(`/api/admin/product-of-month/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    load();
  }

  async function moveOrder(item: Item, dir: -1 | 1) {
    const newOrder = item.order + dir;
    await fetch(`/api/admin/product-of-month/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder }),
    });
    load();
  }

  function openEdit(item: Item) {
    setEditId(item.id);
    setForm({ image: item.image, text: item.text ?? "", link: item.link ?? "", order: item.order, isActive: item.isActive, productId: item.productId ?? "" });
    setSelectedProduct(item.product ? { id: item.product.id, title: item.product.title, images: item.product.images, slug: "" } : null);
    setProductSearch("");
    setProductResults([]);
    setShowForm(true);
  }

  function openNew() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  // Link options from categories
  const linkOptions: { label: string; value: string }[] = [
    { label: "— Sin botón —", value: "" },
    { label: "Todo el catálogo", value: "/catalogo" },
  ];
  categories.forEach((cat) => {
    linkOptions.push({ label: cat.name, value: `/catalogo?categoria=${cat.slug}` });
    cat.children?.forEach((sub) =>
      linkOptions.push({ label: `  ↳ ${sub.name}`, value: `/catalogo?categoria=${sub.slug}` })
    );
  });

  const inputCls = "w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-serif">Producto del Mes</h1>
          <p className="text-on-surface-muted text-sm mt-1">
            Configura los productos que rotan en la página principal cada 10 segundos.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition"
        >
          <span className="material-symbol" style={{ fontSize: "18px" }}>add</span>
          Agregar
        </button>
      </div>

      {/* Formulario inline */}
      {showForm && (
        <div className="bg-surface rounded-2xl border border-outline-variant p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-on-surface">{editId ? "Editar item" : "Nuevo item"}</h2>

          {/* Imagen */}
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Imagen *</p>
            {form.image ? (
              <div className="relative w-40 rounded-xl overflow-hidden border border-outline-variant">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="" className="w-full h-auto" />
                <button
                  onClick={() => setForm((f) => ({ ...f, image: "" }))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <span className="material-symbol text-white" style={{ fontSize: "14px" }}>close</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="w-40 h-28 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary transition"
              >
                <span className="material-symbol text-outline" style={{ fontSize: "28px" }}>add_photo_alternate</span>
                <p className="text-xs text-outline">Subir imagen</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-outline-variant hover:bg-surface-container transition disabled:opacity-50"
            >
              <span className="material-symbol" style={{ fontSize: "14px" }}>upload</span>
              {uploading ? "Subiendo..." : form.image ? "Cambiar" : "Subir imagen"}
            </button>
          </div>

          {/* Texto */}
          <div>
            <label className="text-sm font-medium text-on-surface block mb-1">Texto (opcional)</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              rows={2}
              placeholder="Descripción breve del producto o promoción..."
              className={inputCls + " resize-none"}
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-sm font-medium text-on-surface block mb-1">Botón "Explorar productos"</label>
            <select
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              className={inputCls}
            >
              {linkOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {form.link && <p className="text-xs text-primary font-mono mt-1">{form.link}</p>}
          </div>

          {/* Producto vinculado */}
          <div>
            <label className="text-sm font-medium text-on-surface block mb-1">
              Producto vinculado <span className="text-outline font-normal">(opcional)</span>
            </label>
            <p className="text-xs text-on-surface-muted mb-2">Al hacer clic en la imagen se abrirá la galería completa del producto.</p>

            {selectedProduct ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary-container/20">
                {selectedProduct.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedProduct.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{selectedProduct.title}</p>
                  <p className="text-xs text-primary">Producto vinculado</p>
                </div>
                <button
                  onClick={() => { setSelectedProduct(null); setForm((f) => ({ ...f, productId: "" })); }}
                  className="text-xs text-outline hover:text-on-surface transition px-2 py-1 rounded-lg hover:bg-surface-container"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => handleProductSearchChange(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Buscar producto por nombre..."
                  className={inputCls}
                />
                {searchOpen && productResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                    {productResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setForm((f) => ({ ...f, productId: p.id }));
                          setProductSearch("");
                          setProductResults([]);
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 hover:bg-surface-container transition text-left"
                      >
                        {p.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        )}
                        <span className="text-sm text-on-surface truncate">{p.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activo */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-on-surface">Visible en la página principal</span>
          </label>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.image}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-40"
            >
              <span className="material-symbol" style={{ fontSize: "16px" }}>save</span>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
              className="px-5 py-2 rounded-xl border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de items */}
      {items.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-outline-variant p-10 text-center">
          <span className="material-symbol text-outline" style={{ fontSize: "48px" }}>star</span>
          <p className="text-on-surface-muted text-sm mt-2">No hay productos del mes configurados.</p>
          <p className="text-on-surface-muted text-xs">Haz clic en "Agregar" para comenzar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id} className="bg-surface rounded-2xl border border-outline-variant p-4 flex gap-4 items-start">
              {/* Thumbnail */}
              <div className="shrink-0 w-20 h-16 rounded-lg overflow-hidden border border-outline-variant bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.isActive ? "bg-primary-container text-primary" : "bg-surface-container text-outline"}`}>
                    {item.isActive ? "Activo" : "Oculto"}
                  </span>
                  <span className="text-xs text-outline">#{i + 1}</span>
                </div>
                {item.text && <p className="text-sm text-on-surface-muted truncate">{item.text}</p>}
                {item.link && <p className="text-xs text-primary font-mono truncate">{item.link}</p>}
                {item.product && (
                  <p className="text-xs text-on-surface-muted mt-0.5 flex items-center gap-1">
                    <span className="material-symbol" style={{ fontSize: "12px" }}>link</span>
                    {item.product.title}
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-1 shrink-0">
                <div className="flex gap-1">
                  <button
                    onClick={() => moveOrder(item, -1)}
                    disabled={i === 0}
                    className="w-7 h-7 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container transition disabled:opacity-30"
                  >
                    <span className="material-symbol" style={{ fontSize: "14px" }}>arrow_upward</span>
                  </button>
                  <button
                    onClick={() => moveOrder(item, 1)}
                    disabled={i === items.length - 1}
                    className="w-7 h-7 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container transition disabled:opacity-30"
                  >
                    <span className="material-symbol" style={{ fontSize: "14px" }}>arrow_downward</span>
                  </button>
                </div>
                <button
                  onClick={() => toggleActive(item)}
                  className="w-full px-2 py-1 rounded-lg border border-outline-variant text-xs hover:bg-surface-container transition"
                >
                  {item.isActive ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="w-full px-2 py-1 rounded-lg border border-outline-variant text-xs hover:bg-surface-container transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-full px-2 py-1 rounded-lg border border-error/30 text-error text-xs hover:bg-error/5 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
