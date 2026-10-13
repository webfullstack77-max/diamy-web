import type { Metadata } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import PublicOnly from "@/components/layout/PublicOnly";
import AutoRefresh from "@/components/AutoRefresh";
import PageTracker from "@/components/analytics/PageTracker";
import HalloweenFloating from "@/components/layout/HalloweenFloating";
import ThemedPopup from "@/components/popups/ThemedPopup";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Diamy Cuernavaca",
    default: "Diamy — Corte Láser, Acrílico y DTF Textil en Cuernavaca",
  },
  description:
    "Taller de corte láser, acrílico, MDF y estampado DTF textil en Cuernavaca, Morelos. Letreros para eventos, bodas, negocios y regalos personalizados con entrega express local.",
  metadataBase: new URL("https://diamylasercut.com.mx"),
  keywords: [
    "corte laser cuernavaca",
    "dtf textil cuernavaca",
    "acrilico grabado cuernavaca",
    "letreros para bodas cuernavaca",
    "playeras personalizadas cuernavaca",
    "recuerdos para eventos morelos",
    "corte mdf cuernavaca",
    "jiutepec corte laser"
  ],
  openGraph: {
    title: "Diamy — Corte Láser y DTF Textil en Cuernavaca",
    description:
      "Taller de corte láser, acrílico y estampado DTF textil en Cuernavaca, Morelos. Entregas express y pedidos personalizados.",
    url: "https://diamylasercut.com.mx",
    siteName: "Diamy Laser Cut Cuernavaca",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Diamy Laser Cut Cuernavaca" }],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diamy — Corte Láser y DTF Textil en Cuernavaca",
    description: "Taller de corte láser, acrílico y DTF textil en Cuernavaca, Morelos.",
    images: ["/og-image.jpg"],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Diamy Laser Cut",
  "image": "https://diamylasercut.com.mx/logo.png",
  "url": "https://diamylasercut.com.mx",
  "telephone": "+527777961193",
  "description": "Taller especializado en corte y grabado láser, acrílico, madera MDF y estampado DTF textil en Cuernavaca, Morelos.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cuernavaca",
    "addressRegion": "Morelos",
    "addressCountry": "MX"
  },
  "areaServed": [
    "Cuernavaca",
    "Jiutepec",
    "Temixco",
    "Emiliano Zapata",
    "Morelos"
  ],
  "priceRange": "$$"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${notoSerif.variable} ${manrope.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LM2RYPD93F" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LM2RYPD93F');
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
        <AutoRefresh />
        <PageTracker />
        <PublicOnly>
          <Header />
          <HalloweenFloating />
          <ThemedPopup />
        </PublicOnly>
        <main className="flex-1">
          {/* Spacer que compensa el Header fijo solo en páginas públicas */}
          <PublicOnly>
            <div className="h-16" />
          </PublicOnly>
          {children}
        </main>
        <PublicOnly>
          <FloatingWhatsApp />
          <Footer />
          <MobileNav />
        </PublicOnly>
      </body>
    </html>
  );
}
