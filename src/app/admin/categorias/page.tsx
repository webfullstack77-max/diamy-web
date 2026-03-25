"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface SubCat {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  promoMode: boolean;
  promoImage: string | null;
  promoDescription: string | null;
  parentId: string | null;
  children: SubCat[];
  _count: { products: number };
}

const emptyForm = { id: "", slug: "", name: "", description: "", image: "", parentId: "", promoMode: false, promoImage: "", promoDescription: "" };

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [promoUploading, setPromoUploading] = useState(false);
  const [promoGenerating, setPromoGenerating] = useState(false);
  const promoFileRef = useRef<HTMLInputElement>(null);

  // Formulario principal (categorías padre)
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Modal de subcategoría
  const [modal, setModal] = useState<{ parentId: string; parentName: string } | null>(null);
  const [modalForm, setModalForm] = useState({ id: "", slug: "", name: "", description: "", image: "" });
  const [modalSaving, setModalSaving] = useState(false);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalError, setModalError] = useState("");
  const modalFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const parentOptions = categories.filter((c) => !c.parentId);

  function startNew() {
    setForm(emptyForm);
    setEditing(true);
    setError("");
  }

  function startEdit(cat: Category) {
    setForm({ id: cat.id, slug: cat.slug, name: cat.name, description: cat.description ?? "", image: cat.image ?? "", parentId: cat.parentId ?? "", promoMode: cat.promoMode ?? false, promoImage: cat.promoImage ?? "", promoDescription: cat.promoDescription ?? "" });
    setEditing(true);
    setError("");
  }

  async function handlePromoImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPromoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((p) => ({ ...p, promoImage: data.url }));
    setPromoUploading(false);
  }

  async function handleGeneratePromoDescription() {
    if (!form.name) return;
    setPromoGenerating(true);
    const res = await fetch("/api/admin/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.name, images: form.promoImage ? [form.promoImage] : [] }),
    });
    const data = await res.json();
    if (data.description) setForm((p) => ({ ...p, promoDescription: data.description }));
    setPromoGenerating(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((p) => ({ ...p, image: data.url }));
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const isNew = !form.id;
    const res = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories/${form.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: form.slug, name: form.name, description: form.description || null, image: form.image || null, parentId: form.parentId || null, promoMode: form.promoMode, promoImage: form.promoImage || null, promoDescription: form.promoDescription || null }),
    });
    if (res.ok) { setEditing(false); load(); }
    else { const d = await res.json(); setError(d.error ?? "Error al guardar"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  // ── Modal subcategoría ──────────────────────────────────────
  function openModal(parentId: string, parentName: string, sub?: SubCat) {
    setModal({ parentId, parentName });
    setModalForm(sub ? { id: sub.id, slug: sub.slug, name: sub.name, description: "", image: "" } : { id: "", slug: "", name: "", description: "", image: "" });
    setModalError("");
  }

  function closeModal() { setModal(null); }

  async function handleModalImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setModalUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setModalForm((p) => ({ ...p, image: data.url }));
    setModalUploading(false);
  }

  async function handleModalSave(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setModalSaving(true);
    setModalError("");
    const isNew = !modalForm.id;
    const res = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories/${modalForm.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: modalForm.slug, name: modalForm.name, description: modalForm.description || null, image: modalForm.image || null, parentId: modal.parentId }),
    });
    if (res.ok) { closeModal(); load(); }
    else { const d = await res.json(); setModalError(d.error ?? "Error al guardar"); }
    setModalSaving(false);
  }

  const parentCats = categories.filter((c) => !c.parentId);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-on-surface">Categorías</h1>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary-dark transition">
          <span className="material-symbol" style={{ fontSize: "18px" }}>add</span>
          Nueva categoría
        </button>
      </div>

      {/* Formulario categoría padre */}
      {editing && (
        <form onSubmit={handleSave} className="bg-surface rounded-2xl border border-primary/30 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-on-surface">{form.id ? "Editar categoría" : "Nueva categoría"}</h2>
          {error && <p className="text-sm text-error">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-on-surface">Categoría padre <span className="text-on-surface-muted font-normal">(dejar vacío si es categoría principal)</span></label>
            <select value={form.parentId} onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))} className={cls}>
              <option value="">— Categoría principal —</option>
              {parentOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-on-surface">Nombre</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className={cls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-on-surface">Slug</label>
              <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required pattern="[a-z0-9-]+" className={cls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-on-surface">Descripción</label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-on-surface">Imagen</label>
            <div className="flex items-start gap-4">
              {form.image && <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-outline-variant shrink-0"><Image src={form.image} alt="preview" fill className="object-cover" /></div>}
              <div className="flex-1">
                <input type="text" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="URL o sube un archivo" className={cls} />
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50">
                  <span className="material-symbol" style={{ fontSize: "16px" }}>upload</span>
                  {uploading ? "Subiendo..." : "Subir imagen"}
                </button>
              </div>
            </div>
          </div>
          {/* Modo promocional */}
          <div className="border border-outline-variant rounded-xl p-4 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.promoMode} onChange={(e) => setForm((p) => ({ ...p, promoMode: e.target.checked }))} className="mt-0.5 w-4 h-4 accent-primary" />
              <div>
                <span className="text-sm font-semibold text-on-surface">Modo promocional</span>
                <p className="text-xs text-outline mt-0.5">En lugar del catálogo de productos, muestra un anuncio con imagen, descripción y botón de cotización</p>
              </div>
            </label>
            {form.promoMode && (
              <div className="space-y-3 pl-7">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-on-surface">Imagen del anuncio <span className="text-outline font-normal">(16:9 PNG recomendado)</span></label>
                  <div className="flex items-start gap-4">
                    {form.promoImage && (
                      <div className="relative w-32 h-18 rounded-xl overflow-hidden border border-outline-variant shrink-0" style={{ height: "72px" }}>
                        <Image src={form.promoImage} alt="promo" fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input type="text" value={form.promoImage} onChange={(e) => setForm((p) => ({ ...p, promoImage: e.target.value }))} placeholder="URL de imagen" className={cls} />
                      <input ref={promoFileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePromoImageUpload} className="hidden" />
                      <button type="button" onClick={() => promoFileRef.current?.click()} disabled={promoUploading} className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50">
                        <span className="material-symbol" style={{ fontSize: "16px" }}>upload</span>
                        {promoUploading ? "Subiendo..." : "Subir imagen 16:9"}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-on-surface">Descripción del anuncio</label>
                    <button
                      type="button"
                      onClick={handleGeneratePromoDescription}
                      disabled={promoGenerating || !form.name}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition disabled:opacity-50"
                    >
                      <span className="material-symbol" style={{ fontSize: "14px" }}>auto_awesome</span>
                      {promoGenerating ? "Generando..." : "Generar con IA"}
                    </button>
                  </div>
                  <textarea value={form.promoDescription} onChange={(e) => setForm((p) => ({ ...p, promoDescription: e.target.value }))} rows={3} placeholder="Describe los servicios de esta categoría..." className={`${cls} resize-none`} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving || uploading} className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-60">{saving ? "..." : form.id ? "Guardar" : "Crear"}</button>
            <button type="button" onClick={() => setEditing(false)} className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition">Cancelar</button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-on-surface-muted text-sm">Cargando...</p>
      ) : (
        <div className="space-y-4">
          {parentCats.map((cat) => (
            <div key={cat.id} className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/50">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container shrink-0 flex items-center justify-center">
                  {cat.image ? <Image src={cat.image} alt={cat.name} width={40} height={40} className="object-cover w-full h-full" /> : <span className="material-symbol text-outline-variant" style={{ fontSize: "20px" }}>image</span>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{cat.name}</p>
                  <p className="text-xs text-on-surface-muted">{cat.slug} · {cat._count.products} productos directos</p>
                </div>
                <button onClick={() => openModal(cat.id, cat.name)} className="text-xs text-secondary hover:underline font-medium flex items-center gap-1">
                  <span className="material-symbol" style={{ fontSize: "14px" }}>add</span>
                  Subcategoría
                </button>
                <button onClick={() => startEdit(cat)} className="text-sm text-primary hover:underline font-medium">Editar</button>
                <button onClick={() => handleDelete(cat.id)} className="text-sm text-error hover:underline font-medium">Eliminar</button>
              </div>

              {cat.children.length > 0 ? (
                cat.children.map((sub, i) => (
                  <div key={sub.id} className={`flex items-center gap-3 px-5 py-3 pl-10 ${i < cat.children.length - 1 ? "border-b border-outline-variant/30" : ""} bg-surface-container/30`}>
                    <span className="material-symbol text-outline-variant" style={{ fontSize: "16px" }}>subdirectory_arrow_right</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">{sub.name}</p>
                      <p className="text-xs text-on-surface-muted">{sub.slug} · {sub._count.products} productos</p>
                    </div>
                    <button onClick={() => openModal(cat.id, cat.name, sub)} className="text-sm text-primary hover:underline font-medium">Editar</button>
                    <button onClick={() => handleDelete(sub.id)} className="text-sm text-error hover:underline font-medium">Eliminar</button>
                  </div>
                ))
              ) : (
                <div className="px-10 py-3 bg-surface-container/20">
                  <p className="text-xs text-on-surface-muted italic">Sin subcategorías — <button onClick={() => openModal(cat.id, cat.name)} className="text-primary hover:underline">agregar una</button></p>
                </div>
              )}
            </div>
          ))}
          {parentCats.length === 0 && <p className="text-center text-on-surface-muted text-sm py-8">Sin categorías</p>}
        </div>
      )}

      {/* ── Modal subcategoría ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Panel */}
          <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-on-surface text-lg">
                  {modalForm.id ? "Editar subcategoría" : "Nueva subcategoría"}
                </h2>
                <p className="text-xs text-on-surface-muted mt-0.5">dentro de <span className="font-medium text-primary">{modal.parentName}</span></p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-surface-container transition text-on-surface-muted">
                <span className="material-symbol" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            <form onSubmit={handleModalSave} className="space-y-4">
              {modalError && <p className="text-sm text-error">{modalError}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-on-surface">Nombre</label>
                  <input value={modalForm.name} onChange={(e) => setModalForm((p) => ({ ...p, name: e.target.value }))} required className={cls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-on-surface">Slug</label>
                  <input value={modalForm.slug} onChange={(e) => setModalForm((p) => ({ ...p, slug: e.target.value }))} required pattern="[a-z0-9_-]+" className={cls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-on-surface">Descripción <span className="text-on-surface-muted font-normal">(opcional)</span></label>
                <input value={modalForm.description} onChange={(e) => setModalForm((p) => ({ ...p, description: e.target.value }))} className={cls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-on-surface">Imagen <span className="text-on-surface-muted font-normal">(opcional)</span></label>
                <div className="flex items-start gap-3">
                  {modalForm.image && <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-outline-variant shrink-0"><Image src={modalForm.image} alt="preview" fill className="object-cover" /></div>}
                  <div className="flex-1">
                    <input type="text" value={modalForm.image} onChange={(e) => setModalForm((p) => ({ ...p, image: e.target.value }))} placeholder="URL de imagen" className={cls} />
                    <input ref={modalFileRef} type="file" accept="image/*" onChange={handleModalImageUpload} className="hidden" />
                    <button type="button" onClick={() => modalFileRef.current?.click()} disabled={modalUploading} className="mt-1.5 flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50">
                      <span className="material-symbol" style={{ fontSize: "15px" }}>upload</span>
                      {modalUploading ? "Subiendo..." : "Subir imagen"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={modalSaving || modalUploading} className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-60">
                  {modalSaving ? "Guardando..." : modalForm.id ? "Guardar cambios" : "Crear subcategoría"}
                </button>
                <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const cls = "w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";
