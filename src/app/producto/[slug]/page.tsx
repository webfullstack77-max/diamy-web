import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ImageGallery from "@/components/product/ImageGallery";
import WhatsAppButton from "@/components/product/WhatsAppButton";
import ShareButton from "@/components/product/ShareButton";
import CollectionView from "@/components/product/CollectionView";
import MassiveGallery from "@/components/product/MassiveGallery";
import ProductCard from "@/components/catalog/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Producto no encontrado" };
  return { title: product.title, description: product.description };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.categoryId, NOT: { id: product.id } },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const productUrl = `${siteUrl}/producto/${slug}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-muted mb-6">
        <Link href="/" className="hover:text-primary transition">Inicio</Link>
        <span className="material-symbol" style={{ fontSize: "14px" }}>chevron_right</span>
        <Link href="/catalogo" className="hover:text-primary transition">Catálogo</Link>
        {product.category && (
          <>
            <span className="material-symbol" style={{ fontSize: "14px" }}>chevron_right</span>
            <Link href={`/catalogo?categoria=${product.category.slug}`} className="hover:text-primary transition">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="material-symbol" style={{ fontSize: "14px" }}>chevron_right</span>
        <span className="text-on-surface truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main content: galería masiva, colección o producto normal */}
      {(product as any).isMassiveGallery ? (
        <MassiveGallery
          images={product.images}
          title={product.title}
          price={product.price}
          originalPrice={product.originalPrice}
          variablePrice={(product as any).variablePrice}
          description={product.description}
          materials={product.materials}
          slug={product.slug}
          category={product.category}
          productUrl={productUrl}
          whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
        />
      ) : product.isCollection ? (
        <CollectionView
          product={{
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            variablePrice: (product as any).variablePrice,
            images: product.images,
            materials: product.materials,
            description: product.description,
            category: product.category,
          }}
          productUrl={productUrl}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <ImageGallery images={product.images} title={product.title} />

          <div className="md:sticky md:top-24 md:self-start">
            {product.category && (
              <Link href={`/catalogo?categoria=${product.category.slug}`} className="text-xs text-primary font-semibold uppercase tracking-widest hover:underline">
                {product.category.name}
              </Link>
            )}
            <h1 className="font-serif text-3xl font-bold text-on-surface mt-2 leading-tight">{product.title}</h1>

            <div className="flex items-baseline gap-3 mt-4">
              {(product as any).variablePrice ? (
                <div className="flex items-center gap-2 bg-primary-container rounded-xl px-4 py-2">
                  <span className="material-symbol text-primary" style={{ fontSize: "18px" }}>sell</span>
                  <span className="text-sm font-medium text-on-primary-container">El precio cambia de acuerdo al modelo, pide tu cotización</span>
                </div>
              ) : (
                <>
                  <span className="text-3xl font-bold text-on-surface">${product.price.toLocaleString("es-MX")}</span><span className="text-sm font-normal text-outline ml-1">MXN</span>
                  {product.originalPrice && (
                    <span className="text-lg text-on-surface-muted line-through">${product.originalPrice.toLocaleString("es-MX")}</span>
                  )}
                </>
              )}
            </div>

            {product.materials.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-muted mb-2">Materiales</p>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((m) => (
                    <span key={m} className="px-3 py-1 bg-surface-container rounded-full text-sm text-on-surface border border-outline-variant">{m}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-muted mb-2">Descripción</p>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <div className="flex flex-col items-center gap-1 flex-1 bg-surface-container rounded-xl p-3">
                <span className="material-symbol text-primary" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                <span className="text-xs text-on-surface-muted text-center leading-tight font-medium">Envío incluido</span>
                <span className="text-xs text-outline text-center leading-tight">En pedidos mayores a $500 MXN, solo México</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1 bg-surface-container rounded-xl p-3">
                <span className="material-symbol text-primary" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-xs text-on-surface-muted text-center leading-tight">Calidad garantizada</span>
              </div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/3ModelosFinal.PNG"
              alt="Guía de modelos disponibles"
              className="mt-6 w-full rounded-2xl"
            />

            <div className="mt-6 flex flex-col gap-3">
              <WhatsAppButton productTitle={product.title} productUrl={productUrl} />
              <ShareButton
                title={product.title}
                description={product.description}
                imageUrl={product.images[0] ?? ""}
                url={productUrl}
              />
            </div>
          </div>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-on-surface mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}
    </div>
  );
}
