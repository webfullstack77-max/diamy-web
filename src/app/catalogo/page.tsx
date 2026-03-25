import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/catalog/ProductCard";
import FilterSidebar from "@/components/catalog/FilterSidebar";
import FilterChips from "@/components/catalog/FilterChips";

export const metadata: Metadata = { title: "Catálogo" };

interface SearchParams {
  categoria?: string;
  material?: string;
  q?: string;
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { categoria, material, q } = await searchParams;

  const categoryFilter = categoria
    ? { OR: [{ category: { slug: categoria } }, { subcategory: { slug: categoria } }] }
    : undefined;
  const searchFilter = q
    ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] }
    : undefined;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(material && { materials: { has: material } }),
        ...(categoryFilter && searchFilter
          ? { AND: [categoryFilter, searchFilter] }
          : categoryFilter
          ? categoryFilter
          : searchFilter
          ? searchFilter
          : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ where: { parentId: null }, include: { children: { orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }) as Promise<any[]>,
  ]);

  // Collect all unique materials from all products for filters
  const allMaterials = await prisma.product.findMany({
    where: { isActive: true },
    select: { materials: true },
  });
  const materials = [...new Set(allMaterials.flatMap((p) => p.materials))].sort();

  const activeCategory = categories.find((c) => c.slug === categoria) as (typeof categories[0] & { promoMode?: boolean; promoImage?: string | null; promoDescription?: string | null }) | undefined;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const isPromo = !!(activeCategory as any)?.promoMode;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          {activeCategory ? activeCategory.name : "Catálogo"}
        </h1>
        <p className="text-on-surface-muted text-sm mt-1">
          {activeCategory?.description ??
            "Todos nuestros productos de corte láser y grabado personalizado"}
        </p>
      </div>

      {/* Mobile filter chips */}
      <FilterChips
        materials={materials}
        categories={categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          children: c.children.map((s: any) => ({ slug: s.slug, name: s.name })),
        }))}
      />

      <div className="flex gap-8 mt-6">
        {/* Desktop sidebar */}
        <FilterSidebar
          materials={materials}
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.name,
            children: c.children.map((s: any) => ({ slug: s.slug, name: s.name })),
          }))}
        />

        {/* Main content */}
        <div className="flex-1">
          {isPromo ? (
            /* ── Modo promocional ── */
            <div className="space-y-6">
              {(activeCategory as any).promoImage && (
                <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src={(activeCategory as any).promoImage}
                    alt={activeCategory!.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {(activeCategory as any).promoDescription && (
                <p className="text-on-surface text-base leading-relaxed">
                  {(activeCategory as any).promoDescription}
                </p>
              )}

              {/* Badges de cotización */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-3 flex-1 bg-surface-container rounded-xl p-4">
                  <span className="material-symbol text-primary shrink-0" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>design_services</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Tu diseño, nuestro trabajo</p>
                    <p className="text-xs text-outline">Mándanos tu diseño y te cotizamos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 bg-surface-container rounded-xl p-4">
                  <span className="material-symbol text-primary shrink-0" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Calidad garantizada</p>
                    <p className="text-xs text-outline">Materiales premium en cada pedido</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 bg-surface-container rounded-xl p-4">
                  <span className="material-symbol text-primary shrink-0" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Envío incluido</p>
                    <p className="text-xs text-outline">En pedidos mayores a $500 MXN</p>
                  </div>
                </div>
              </div>

              {/* Botón WhatsApp */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Me interesa cotizar un pedido de ${activeCategory!.name}. ¿Pueden ayudarme?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] text-white font-semibold text-lg shadow-lg hover:bg-[#20bd5a] transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.534 5.876L0 24l6.29-1.516A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.596-.477-5.112-1.312l-.368-.217-3.73.899.939-3.618-.24-.381A9.972 9.972 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                Pedir cotización por WhatsApp
              </a>
            </div>
          ) : (
            /* ── Grid normal ── */
            <>
              {q && (
                <p className="text-sm text-on-surface-muted mb-4">
                  Resultados para:{" "}
                  <span className="font-medium text-on-surface">&ldquo;{q}&rdquo;</span>{" "}
                  ({products.length} producto{products.length !== 1 ? "s" : ""})
                </p>
              )}

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="material-symbol text-outline mb-4" style={{ fontSize: "48px" }}>search_off</span>
                  <h3 className="font-semibold text-on-surface mb-1">Sin resultados</h3>
                  <p className="text-sm text-on-surface-muted">
                    Prueba con otros filtros o{" "}
                    <a href={`https://wa.me/${whatsappNumber}`} className="text-primary underline">
                      contáctanos para personalizar
                    </a>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
