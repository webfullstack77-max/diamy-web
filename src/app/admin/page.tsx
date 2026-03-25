import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Admin" };

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, activeCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  const recentProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: true },
  });

  const stats = [
    { label: "Productos totales", value: productCount, icon: "inventory_2", href: "/admin/productos" },
    { label: "Productos activos", value: activeCount, icon: "check_circle", href: "/admin/productos" },
    { label: "Categorías", value: categoryCount, icon: "category", href: "/admin/categorias" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-surface rounded-2xl border border-outline-variant p-5 flex items-center gap-4 hover:border-primary transition"
          >
            <span
              className="material-symbol text-primary"
              style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}
            >
              {s.icon}
            </span>
            <div>
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              <p className="text-sm text-on-surface-muted">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent products */}
      <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h2 className="font-semibold text-on-surface">Productos recientes</h2>
          <Link href="/admin/productos/nuevo" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            <span className="material-symbol" style={{ fontSize: "16px" }}>add</span>
            Nuevo producto
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-container">
            <tr>
              <th className="text-left px-5 py-3 text-on-surface-muted font-medium">Producto</th>
              <th className="text-left px-5 py-3 text-on-surface-muted font-medium hidden sm:table-cell">Categoría</th>
              <th className="text-left px-5 py-3 text-on-surface-muted font-medium">Precio</th>
              <th className="text-left px-5 py-3 text-on-surface-muted font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {recentProducts.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? "" : "bg-surface-container/30"}>
                <td className="px-5 py-3">
                  <Link href={`/admin/productos/${p.id}`} className="font-medium text-on-surface hover:text-primary transition line-clamp-1">
                    {p.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-on-surface-muted hidden sm:table-cell">
                  {p.category.name}
                </td>
                <td className="px-5 py-3 font-medium text-on-surface">
                  ${p.price.toLocaleString("es-MX")}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.isActive ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-muted"
                  }`}>
                    {p.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
