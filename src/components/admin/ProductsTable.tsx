"use client";

import Link from "next/link";
import { useState } from "react";

type Subcategory = { name: string } | null;
type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  isActive: boolean;
  categoryId: string;
  subcategory: Subcategory;
};
type Category = { id: string; name: string };

export default function ProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [search, setSearch] = useState("");

  const q = search.toLowerCase().trim();
  const filtered = q
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      )
    : products;

  // Agrupar por categoría
  const grouped = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.categoryId]) acc[p.categoryId] = [];
    acc[p.categoryId].push(p);
    return acc;
  }, {});

  // Solo mostrar categorías que tengan resultados
  const visibleCategories = categories.filter((c) => (grouped[c.id]?.length ?? 0) > 0);

  return (
    <>
      {/* Buscador */}
      <div className="relative mb-6">
        <span
          className="material-symbol absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted"
          style={{ fontSize: "18px" }}
        >
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o slug..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>close</span>
          </button>
        )}
      </div>

      {q && (
        <p className="text-sm text-on-surface-muted mb-4">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para &ldquo;{search}&rdquo;
        </p>
      )}

      {visibleCategories.length === 0 && (
        <p className="text-sm text-on-surface-muted py-8 text-center">No se encontraron productos.</p>
      )}

      <div className="space-y-6">
        {visibleCategories.map((cat) => {
          const items = grouped[cat.id] ?? [];
          return (
            <div key={cat.id} className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-primary-container border-b border-outline-variant">
                <span className="material-symbol text-primary" style={{ fontSize: "18px" }}>category</span>
                <span className="font-semibold text-primary text-sm">{cat.name}</span>
                <span className="ml-auto text-xs text-on-surface-muted">
                  {items.length} producto{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-surface-container border-b border-outline-variant/50">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-on-surface-muted font-medium">Producto</th>
                    <th className="text-left px-5 py-2.5 text-on-surface-muted font-medium hidden sm:table-cell">Subcategoría</th>
                    <th className="text-left px-5 py-2.5 text-on-surface-muted font-medium">Precio</th>
                    <th className="text-left px-5 py-2.5 text-on-surface-muted font-medium hidden sm:table-cell">Estado</th>
                    <th className="text-right px-5 py-2.5 text-on-surface-muted font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p, i) => (
                    <tr key={p.id} className={`border-b border-outline-variant/50 last:border-0 ${i % 2 === 0 ? "" : "bg-surface-container/20"}`}>
                      <td className="px-5 py-3">
                        <span className="font-medium text-on-surface line-clamp-1">{p.title}</span>
                        <span className="text-xs text-on-surface-muted block">{p.slug}</span>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        {p.subcategory ? (
                          <span className="text-xs bg-primary-container text-primary px-2 py-0.5 rounded-full">{p.subcategory.name}</span>
                        ) : (
                          <span className="text-xs text-on-surface-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium">${p.price.toLocaleString("es-MX")}</td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.isActive ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-muted"
                        }`}>
                          {p.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/productos/${p.id}`}
                          className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline"
                        >
                          <span className="material-symbol" style={{ fontSize: "14px" }}>edit</span>
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </>
  );
}
