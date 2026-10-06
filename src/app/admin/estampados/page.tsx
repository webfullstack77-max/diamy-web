"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface DesignAsset {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  collectionId: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface DesignCollection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  coverImage?: string | null;
  order: number;
  isActive: boolean;
  designs: DesignAsset[];
  createdAt: string;
}

const POPULAR_ICONS = ["📁", "🎃", "🦅", "💀", "⚡", "👕", "🎸", "🔥", "🎄", "👑", "⭐", "🐉", "🖤", "🚀", "🎨"];

export default function AdminEstampadosPage() {
  const [collections, setCollections] = useState<DesignCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected collection for gallery view
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  // Modals
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<DesignCollection | null>(null);

  // Collection Form
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("📁");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [savingCollection, setSavingCollection] = useState(false);

  // Uploading designs
  const [uploadingDesigns, setUploadingDesigns] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick edit design title
  const [editingDesignId, setEditingDesignId] = useState<string | null>(null);
  const [editingDesignTitle, setEditingDesignTitle] = useState("");

  // Pagination for designs inside a collection
  const [adminPage, setAdminPage] = useState(1);
  const ADMIN_PER_PAGE = 20;

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "collection" | "design";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "collection",
    id: "",
    name: "",
  });
  const [deleting, setDeleting] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/design-collections");
      if (!res.ok) throw new Error("Error al cargar colecciones");
      const data = await res.json();
      setCollections(data.collections || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormName("");
    setFormIcon("📁");
    setFormDescription("");
    setFormIsActive(true);
    setCollectionModalOpen(true);
  };

  const openEditModal = (col: DesignCollection) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormIcon(col.icon || "📁");
    setFormDescription(col.description || "");
    setFormIsActive(col.isActive);
    setCollectionModalOpen(true);
  };

  function notifyCollectionsSync() {
    if (typeof window === "undefined") return;
    try {
      const bc = new BroadcastChannel("diamy_collections_sync");
      bc.postMessage({ type: "SYNC", timestamp: Date.now() });
      bc.close();
    } catch {}
    try {
      localStorage.setItem("diamy_collections_sync", Date.now().toString());
    } catch {}
  }

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      setSavingCollection(true);
      if (editingCollection) {
        // Update
        const res = await fetch(`/api/admin/design-collections/${editingCollection.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            icon: formIcon,
            description: formDescription.trim(),
            isActive: formIsActive,
          }),
        });
        if (!res.ok) throw new Error("Error al actualizar colección");
      } else {
        // Create
        const res = await fetch("/api/admin/design-collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            icon: formIcon,
            description: formDescription.trim(),
            isActive: formIsActive,
            order: collections.length,
          }),
        });
        if (!res.ok) throw new Error("Error al crear colección");
      }

      setCollectionModalOpen(false);
      await fetchCollections();
      notifyCollectionsSync();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSavingCollection(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleting(true);
      if (deleteModal.type === "collection") {
        const res = await fetch(`/api/admin/design-collections/${deleteModal.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar la colección");
        if (activeCollectionId === deleteModal.id) setActiveCollectionId(null);
      } else {
        const res = await fetch(`/api/admin/design-assets/${deleteModal.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar el diseño");
      }
      setDeleteModal({ isOpen: false, type: "collection", id: "", name: "" });
      await fetchCollections();
      notifyCollectionsSync();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Upload designs to active collection
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeCollectionId) return;

    setUploadingDesigns(true);
    setUploadProgress(`Preparando ${files.length} archivo(s)...`);

    try {
      const uploadedDesigns: { title: string; imageUrl: string }[] = [];
      const failedFiles: { name: string; reason: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Subiendo (${i + 1}/${files.length}): ${file.name}`);

        const formData = new FormData();
        formData.append("file", file);

        // Upload to server using preservePng flag
        const uploadRes = await fetch("/api/admin/upload?design=true", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          const reason = errData.error || `Error ${uploadRes.status}: ${uploadRes.statusText}`;
          console.warn(`Error al subir ${file.name}:`, reason);
          failedFiles.push({ name: file.name, reason });
          continue;
        }

        const uploadData = await uploadRes.json();
        const title = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();

        uploadedDesigns.push({
          title: title || "Diseño DTF",
          imageUrl: uploadData.url,
        });
      }

      if (uploadedDesigns.length > 0) {
        setUploadProgress("Registrando diseños en la colección...");
        const res = await fetch(`/api/admin/design-collections/${activeCollectionId}/designs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designs: uploadedDesigns }),
        });
        if (!res.ok) throw new Error("Error al guardar diseños en la colección");
      }

      if (failedFiles.length > 0) {
        alert(
          `Se procesaron ${uploadedDesigns.length} diseños correctamente.\n\n${failedFiles.length} archivo(s) no se pudieron subir:\n` +
            failedFiles.map((f) => `• ${f.name}: ${f.reason}`).join("\n")
        );
      }

      await fetchCollections();
      notifyCollectionsSync();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error durante la subida");
    } finally {
      setUploadingDesigns(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openDeleteDesignModal = (design: DesignAsset) => {
    setDeleteModal({
      isOpen: true,
      type: "design",
      id: design.id,
      name: design.title,
    });
  };

  const handleToggleDesignActive = async (design: DesignAsset) => {
    try {
      const res = await fetch(`/api/admin/design-assets/${design.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !design.isActive }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      await fetchCollections();
      notifyCollectionsSync();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  const handleSaveDesignTitle = async (designId: string) => {
    if (!editingDesignTitle.trim()) return;
    try {
      const res = await fetch(`/api/admin/design-assets/${designId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingDesignTitle.trim() }),
      });
      if (!res.ok) throw new Error("Error al actualizar título");
      setEditingDesignId(null);
      await fetchCollections();
      notifyCollectionsSync();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  const currentCollection = collections.find((c) => c.id === activeCollectionId);
  const adminTotalPages = currentCollection ? Math.ceil(currentCollection.designs.length / ADMIN_PER_PAGE) || 1 : 1;
  const safeAdminPage = Math.min(Math.max(1, adminPage), adminTotalPages);
  const adminStartIndex = (safeAdminPage - 1) * ADMIN_PER_PAGE;
  const adminEndIndex = currentCollection ? Math.min(adminStartIndex + ADMIN_PER_PAGE, currentCollection.designs.length) : 0;
  const paginatedAdminDesigns = currentCollection ? currentCollection.designs.slice(adminStartIndex, adminEndIndex) : [];

  const handleSelectAdminCollection = (colId: string | null) => {
    setActiveCollectionId(colId);
    setAdminPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbol text-primary text-2xl">folder_open</span>
            <h1 className="text-2xl font-serif font-bold text-on-surface">Colecciones y Estampados DTF</h1>
          </div>
          <p className="text-sm text-on-surface-muted mt-1">
            Organiza las carpetas de estampados transparentes para el simulador de playeras y catálogo interactivo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/personalizador"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>visibility</span>
            Ver Personalizador
          </Link>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary/90 transition"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>create_new_folder</span>
            Nueva Carpeta
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchCollections} className="underline text-xs">Reintentar</button>
        </div>
      )}

      {/* Main View: Folders Explorer OR Inside a Folder */}
      {!activeCollectionId ? (
        /* FOLDERS GRID VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbol text-primary text-xl">folder_shared</span>
              Carpetas de Estampados ({collections.length})
            </h2>
            <span className="text-xs text-on-surface-muted">
              Haz clic en cualquier carpeta para ver sus diseños o subir más
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-surface rounded-2xl animate-pulse border border-outline-variant" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-outline-variant p-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-3xl">
                📁
              </div>
              <h3 className="font-bold text-on-surface text-lg">No hay carpetas de estampados creadas</h3>
              <p className="text-sm text-on-surface-muted max-w-md mx-auto mt-1 mb-6">
                Crea tu primera carpeta (ej. &quot;Playeras Halloween&quot;, &quot;Fiestas Patrias&quot;) para que tus clientes puedan explorar diseños en el simulador.
              </p>
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow hover:bg-primary/90"
              >
                Crear Primera Carpeta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections.map((col) => {
                const designCount = col.designs.length;
                return (
                  <div
                    key={col.id}
                    className={`group bg-surface rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
                      col.isActive ? "border-outline-variant hover:border-primary/50" : "border-outline-variant/40 opacity-70"
                    }`}
                  >
                    <div
                      onClick={() => handleSelectAdminCollection(col.id)}
                      className="p-5 cursor-pointer flex-1 select-none"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                          {col.icon || "📁"}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            col.isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-surface-container text-on-surface-muted border border-outline-variant"
                          }`}
                        >
                          {col.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {col.name}
                      </h3>

                      <p className="text-xs text-on-surface-muted mt-1 line-clamp-2 min-h-[32px]">
                        {col.description || "Sin descripción adicional"}
                      </p>

                      <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
                        <span className="text-on-surface font-semibold flex items-center gap-1.5">
                          <span className="material-symbol text-primary" style={{ fontSize: "16px" }}>image</span>
                          {designCount} {designCount === 1 ? "diseño" : "diseños"}
                        </span>
                        <span className="text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          Abrir <span className="material-symbol" style={{ fontSize: "14px" }}>arrow_forward</span>
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 py-2.5 bg-surface-container/50 border-t border-outline-variant rounded-b-2xl flex items-center justify-between text-xs">
                      <span className="text-[11px] text-on-surface-muted font-mono truncate max-w-[120px]">
                        /{col.slug}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(col)}
                          className="p-1.5 text-on-surface-muted hover:text-on-surface hover:bg-surface rounded-lg transition"
                          title="Editar carpeta"
                        >
                          <span className="material-symbol" style={{ fontSize: "16px" }}>edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({
                              isOpen: true,
                              type: "collection",
                              id: col.id,
                              name: col.name,
                            });
                          }}
                          className="p-1.5 text-error/70 hover:text-error hover:bg-error/10 rounded-lg transition"
                          title="Eliminar carpeta"
                        >
                          <span className="material-symbol" style={{ fontSize: "16px" }}>delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* INSIDE ACTIVE COLLECTION VIEW */
        currentCollection && (
          <div className="space-y-6">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-4 rounded-2xl border border-outline-variant">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSelectAdminCollection(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition"
                >
                  <span className="material-symbol" style={{ fontSize: "16px" }}>arrow_back</span>
                  Ver Todas las Carpetas
                </button>
                <div className="h-4 w-px bg-outline-variant hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentCollection.icon || "📁"}</span>
                  <div>
                    <h2 className="font-bold text-base text-on-surface">{currentCollection.name}</h2>
                    <p className="text-xs text-on-surface-muted">
                      {currentCollection.designs.length} diseño(s) registrados
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload CTA */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilesUpload}
                  multiple
                  accept="image/png, image/webp"
                  className="hidden"
                  id="bulk-designs-upload"
                  disabled={uploadingDesigns}
                />
                <label
                  htmlFor="bulk-designs-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md cursor-pointer transition ${
                    uploadingDesigns ? "opacity-50 pointer-events-none" : "hover:bg-primary/90"
                  }`}
                >
                  <span className="material-symbol" style={{ fontSize: "16px" }}>upload_file</span>
                  {uploadingDesigns ? "Subiendo..." : "Subir Estampados PNG"}
                </label>
              </div>
            </div>

            {/* Upload progress message */}
            {uploadProgress && (
              <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-medium flex items-center gap-2 animate-pulse">
                <span className="material-symbol animate-spin" style={{ fontSize: "16px" }}>progress_activity</span>
                {uploadProgress}
              </div>
            )}

            {/* Designs Gallery Grid */}
            {currentCollection.designs.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-outline-variant p-8">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4 text-3xl">
                  🖼️
                </div>
                <h3 className="font-bold text-on-surface text-lg">Esta carpeta aún no tiene estampados</h3>
                <p className="text-sm text-on-surface-muted max-w-md mx-auto mt-1 mb-6">
                  Sube tus archivos PNG con fondo transparente (puedes seleccionar varios a la vez) para que aparezcan en el mockup.
                </p>
                <label
                  htmlFor="bulk-designs-upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow cursor-pointer hover:bg-primary/90"
                >
                  <span className="material-symbol" style={{ fontSize: "18px" }}>upload</span>
                  Seleccionar Archivos PNG
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {paginatedAdminDesigns.map((design) => (
                    <div
                      key={design.id}
                      className={`group bg-surface rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                        design.isActive ? "border-outline-variant hover:border-primary/50" : "border-outline-variant/40 opacity-60"
                      }`}
                    >
                      {/* Checkerboard container for transparent PNG */}
                      <div
                        className="w-full aspect-square p-4 flex items-center justify-center relative"
                        style={{
                          backgroundColor: "#161920",
                          backgroundImage: `
                            linear-gradient(45deg, #1c2028 25%, transparent 25%),
                            linear-gradient(-45deg, #1c2028 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #1c2028 75%),
                            linear-gradient(-45deg, transparent 75%, #1c2028 75%)
                          `,
                          backgroundSize: "16px 16px",
                          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={design.imageUrl}
                          alt={design.title}
                          className="max-w-full max-h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />

                        {/* Active pill badge */}
                        <button
                          onClick={() => handleToggleDesignActive(design)}
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${
                            design.isActive ? "bg-emerald-500/90 text-white" : "bg-neutral-800 text-neutral-400"
                          }`}
                          title={design.isActive ? "Clic para desactivar" : "Clic para activar"}
                        >
                          {design.isActive ? "Activo" : "Oculto"}
                        </button>
                      </div>

                      {/* Metadata & Inline Edit */}
                      <div className="p-3 bg-surface border-t border-outline-variant flex-1 flex flex-col justify-between">
                        {editingDesignId === design.id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editingDesignTitle}
                              onChange={(e) => setEditingDesignTitle(e.target.value)}
                              className="w-full bg-surface-container border border-primary text-xs text-on-surface px-2 py-1 rounded focus:outline-none"
                              autoFocus
                            />
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => setEditingDesignId(null)}
                                className="text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-muted"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSaveDesignTitle(design.id)}
                                className="text-[10px] px-2 py-0.5 rounded bg-primary text-on-primary font-bold"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              className="text-xs font-semibold text-on-surface truncate flex-1 cursor-pointer hover:text-primary"
                              title={design.title}
                              onClick={() => {
                                setEditingDesignId(design.id);
                                setEditingDesignTitle(design.title);
                              }}
                            >
                              {design.title}
                            </h4>
                            <button
                              onClick={() => {
                                setEditingDesignId(design.id);
                                setEditingDesignTitle(design.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-muted hover:text-on-surface transition"
                            >
                              <span className="material-symbol" style={{ fontSize: "14px" }}>edit</span>
                            </button>
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px] text-on-surface-muted">
                          <span>#{design.order + 1}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDesignModal(design);
                            }}
                            className="text-error/70 hover:text-error p-1 rounded hover:bg-error/10 transition"
                            title="Eliminar diseño"
                          >
                            <span className="material-symbol" style={{ fontSize: "14px" }}>delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Admin Pagination Controls */}
                {adminTotalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant bg-surface p-4 rounded-2xl">
                    <div className="text-xs text-on-surface-muted order-2 sm:order-1">
                      Mostrando <span className="font-bold text-on-surface">{adminStartIndex + 1}</span> -{" "}
                      <span className="font-bold text-on-surface">{adminEndIndex}</span> de{" "}
                      <span className="font-bold text-primary">{currentCollection.designs.length}</span> diseños (Página {safeAdminPage} de {adminTotalPages})
                    </div>

                    <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                      <button
                        onClick={() => setAdminPage(safeAdminPage - 1)}
                        disabled={safeAdminPage === 1}
                        className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                        title="Página anterior"
                      >
                        <span className="material-symbol" style={{ fontSize: "16px" }}>chevron_left</span>
                        <span>Anterior</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: adminTotalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setAdminPage(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                              pageNum === safeAdminPage
                                ? "bg-primary text-on-primary shadow-sm"
                                : "border border-outline-variant text-on-surface hover:bg-surface-container"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setAdminPage(safeAdminPage + 1)}
                        disabled={safeAdminPage === adminTotalPages}
                        className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                        title="Página siguiente"
                      >
                        <span>Siguiente</span>
                        <span className="material-symbol" style={{ fontSize: "16px" }}>chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}

      {/* CREATE / EDIT COLLECTION MODAL */}
      {collectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="font-serif font-bold text-lg text-on-surface">
                {editingCollection ? "Editar Carpeta" : "Nueva Carpeta de Diseños"}
              </h3>
              <button
                onClick={() => setCollectionModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-muted hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbol">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Nombre de la Colección / Carpeta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Playeras Halloween 2026"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Ícono / Emoji representativo
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-center text-2xl">
                    {formIcon}
                  </div>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    maxLength={4}
                    className="w-20 bg-surface-container border border-outline-variant rounded-xl px-3 py-2 text-center text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <span className="text-xs text-on-surface-muted">o elige uno:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-surface-container/50 rounded-xl border border-outline-variant/60">
                  {POPULAR_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormIcon(icon)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-surface transition ${
                        formIcon === icon ? "bg-primary/20 border border-primary scale-110" : ""
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Estampados exclusivos de calaveras, noche de brujas y terror."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Colección Activa</span>
                  <span className="text-[11px] text-on-surface-muted">Visible para los clientes en el simulador</span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setCollectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-muted hover:bg-surface-container transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCollection}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow hover:bg-primary/90 transition flex items-center gap-1.5"
                >
                  {savingCollection && (
                    <span className="material-symbol animate-spin" style={{ fontSize: "14px" }}>
                      progress_activity
                    </span>
                  )}
                  {editingCollection ? "Guardar Cambios" : "Crear Carpeta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto text-2xl">
              <span className="material-symbol">delete_forever</span>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif font-bold text-lg text-on-surface">
                {deleteModal.type === "collection" ? "¿Eliminar Carpeta?" : "¿Eliminar Estampado?"}
              </h3>
              <p className="text-xs text-on-surface-muted leading-relaxed">
                {deleteModal.type === "collection"
                  ? `¿Estás seguro de que deseas eliminar la carpeta "${deleteModal.name}" y todos sus estampados? Esta acción no se puede deshacer.`
                  : `¿Deseas eliminar el diseño "${deleteModal.name}" de esta colección?`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, type: "collection", id: "", name: "" })}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-muted hover:bg-surface-container transition flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-error text-white text-xs font-bold shadow hover:bg-error/90 transition flex-1 flex items-center justify-center gap-1.5"
              >
                {deleting && (
                  <span className="material-symbol animate-spin" style={{ fontSize: "14px" }}>
                    progress_activity
                  </span>
                )}
                {deleting ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
