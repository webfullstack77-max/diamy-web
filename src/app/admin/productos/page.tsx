import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Productos | Admin" };

export default async function AdminProductosPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, subcategory: true },
      orderBy: [{ category: { name: "asc" } }, { title: "asc" }],
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
    }),
  ]);

  // Agrupar productos por categoryId
  const grouped = products.reduce<Record<string, typeof products>>((acc, p) => {
    if (!acc[p.categoryId]) acc[p.categoryId] = [];
    acc[p.categoryId].push(p);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-on-surface">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary-dark transition"
        >
          <span className="material-symbol" style={{ fontSize: "18px" }}>add</span>
          Nuevo producto
        </Link>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const items = grouped[cat.id] ?? [];
          return (
            <div key={cat.id} className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
              {/* Cabecera de categoría */}
              <div className="flex items-center gap-2 px-5 py-3 bg-primary-container border-b border-outline-variant">
                <span className="material-symbol text-primary" style={{ fontSize: "18px" }}>category</span>
                <span className="font-semibold text-primary text-sm">{cat.name}</span>
                <span className="ml-auto text-xs text-on-surface-muted">
                  {items.length} producto{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-4 text-sm text-on-surface-muted italic">
                  Sin productos —{" "}
                  <Link href="/admin/productos/nuevo" className="text-primary hover:underline">agregar uno</Link>
                </div>
              ) : (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
