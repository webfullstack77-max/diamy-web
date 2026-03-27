import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductsTable from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";
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

      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
