import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import CategoryGrid from "@/components/home/CategoryGrid";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import ProductOfMonth from "@/components/home/ProductOfMonth";
import DailyPromoModal from "@/components/home/DailyPromoModal";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, testimonials, featuredProducts, productOfMonthItems] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" } }),
    prisma.testimonial.findMany({ where: { isPublished: true, isSubmitted: true }, orderBy: { submittedAt: "desc" } }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.productOfMonthItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { product: { include: { category: true } } },
    }),
  ]);

  return (
    <>
      <DailyPromoModal />
      {/* Logo flotante fijo en toda la página */}
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-contain opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "url('/logo.png')", zIndex: 0 }}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-container via-background to-surface py-20 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,#5255a9_0%,transparent_60%)]" />
        <div className="relative w-fit mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Logo */}
          <div className="shrink-0">
            <Image
              src="/logo.png"
              alt="Diamy Laser Cut"
              width={220}
              height={220}
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>
          {/* Texto */}
          <div className="text-center md:text-left">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-on-surface leading-tight">
              <span className="text-primary">Productos Personalizados</span>
            </h1>
            <p className="mt-4 text-on-surface-muted text-lg max-w-lg">
              Creamos piezas únicas en madera, acrílico y más. Perfectas para
              regalos, decoración y proyectos corporativos.
            </p>
            <div className="mt-8 flex flex-row gap-3 justify-center md:justify-start flex-wrap">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-semibold hover:bg-primary-dark transition shadow-lg"
              >
                <span className="material-symbol" style={{ fontSize: "16px" }}>grid_view</span>
                Ver catálogo
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-primary text-primary text-sm font-semibold hover:bg-primary-container transition"
              >
                <span className="material-symbol" style={{ fontSize: "16px" }}>chat</span>
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="relative mt-8 flex items-center justify-center gap-4">
          <span className="text-on-surface-muted text-sm font-medium">Síguenos:</span>
          <a
            href="https://www.facebook.com/profile.php?id=61553822224871"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook de Diamy"
            className="hover:scale-110 transition-transform"
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#1877F2"/>
              <path d="M22 16C22 12.686 19.314 10 16 10C12.686 10 10 12.686 10 16C10 18.994 12.122 21.49 14.938 22V17.75H13.25V16H14.938V14.55C14.938 12.883 15.931 11.968 17.448 11.968C18.175 11.968 18.937 12.097 18.937 12.097V13.734H18.096C17.267 13.734 17.062 14.239 17.062 14.757V16H18.859L18.549 17.75H17.062V22C19.878 21.49 22 18.994 22 16Z" fill="white"/>
            </svg>
          </a>
          <a
            href="https://www.instagram.com/diamy2026/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Diamy"
            className="hover:scale-110 transition-transform"
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ig-hero-grad" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFC107"/>
                  <stop offset="30%" stopColor="#F44336"/>
                  <stop offset="70%" stopColor="#9C27B0"/>
                  <stop offset="100%" stopColor="#3F51B5"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#ig-hero-grad)"/>
              <rect x="10" y="10" width="12" height="12" rx="3.5" stroke="white" strokeWidth="1.8" fill="none"/>
              <circle cx="16" cy="16" r="2.8" stroke="white" strokeWidth="1.8" fill="none"/>
              <circle cx="20" cy="12" r="0.8" fill="white"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-on-surface text-surface py-5 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: "Clientes felices" },
            { value: "10+", label: "Categorías" },
            { value: "100%", label: "Personalizable" },
            { value: "MX", label: "Envíos nacionales" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-primary-container">{s.value}</p>
              <p className="text-xs text-surface/70 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <CategoryGrid categories={categories} />

      {/* Producto del mes */}
      {productOfMonthItems.length > 0 && (
        <ProductOfMonth items={productOfMonthItems} />
      )}

      {/* How it works */}
      <section className="py-14 px-4 sm:px-6 lg:px-12 bg-surface-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface mb-2">
            ¿Cómo funciona?
          </h2>
          <p className="text-on-surface-muted text-sm mb-10">
            Tener tu producto personalizado es muy sencillo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {[
              { step: "1", icon: "search", title: "Elige tu producto", desc: "Explora nuestro catálogo y encuentra el producto que más te guste." },
              { step: "2", icon: "edit_note", title: "Mándanos tu diseño", desc: "Escríbenos por WhatsApp con tu idea, nombre o imagen y lo adaptamos." },
              { step: "3", icon: "card_giftcard", title: "Recíbelo en casa", desc: "Producimos tu pieza única y te la enviamos a cualquier parte de México.", note: "Envío gratis en compras mayores de $500 MXN" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <span className="material-symbol text-on-primary" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-on-surface text-surface text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-on-surface">{item.title}</h3>
                <p className="text-on-surface-muted text-sm leading-relaxed">{item.desc}</p>
                {"note" in item && (
                  <p className="text-xs font-semibold text-primary bg-primary-container px-3 py-1 rounded-full">{item.note}</p>
                )}
              </div>
            ))}
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-semibold hover:bg-primary-dark transition shadow-lg"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>chat</span>
            Empieza tu pedido ahora
          </a>
        </div>
      </section>

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">
                Productos Destacados
              </h2>
              <p className="text-on-surface-muted text-sm mt-1">
                Piezas favoritas de nuestros clientes
              </p>
              <Link
                href="/catalogo"
                className="mt-3 flex items-center gap-1 text-primary text-sm font-medium hover:underline"
              >
                Ver todos
                <span className="material-symbol" style={{ fontSize: "16px" }}>
                  arrow_forward
                </span>
              </Link>
            </div>

            <FeaturedCarousel products={featuredProducts} />
          </div>
        </section>
      )}

      {/* Services highlight */}
      <section className="py-12 px-4 sm:px-6 lg:px-12 bg-primary text-on-primary">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
            {[
              { icon: "precision_manufacturing", title: "Alta Precisión", desc: "Equipos de corte láser de última generación" },
              { icon: "palette", title: "Diseño Personalizado", desc: "Adaptamos cada pieza a tu visión y necesidades" },
              { icon: "local_shipping", title: "Envíos a Todo el País", desc: "Entrega segura en toda la república.\nSolo República Mexicana,\n en compras mayores a $500 MXN" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <span
                  className="material-symbol"
                  style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-on-primary/80 text-sm whitespace-pre-line">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />
    </>
  );
}
