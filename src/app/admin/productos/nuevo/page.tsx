import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nuevo Producto | Admin" };

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({ include: { children: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-6">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
