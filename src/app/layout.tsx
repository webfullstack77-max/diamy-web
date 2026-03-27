import type { Metadata } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import AutoRefresh from "@/components/AutoRefresh";
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
    template: "%s | Diamy",
    default: "Diamy — Corte Láser y Grabado Personalizado",
  },
  description:
    "Productos artesanales de corte láser y grabado personalizado. Regalos únicos, decoración y piezas a medida.",
  metadataBase: new URL("https://diamylasercut.com.mx"),
  openGraph: {
    title: "Diamy — Corte Láser y Grabado Personalizado",
    description:
      "Productos artesanales de corte láser y grabado personalizado. Regalos únicos, decoración y piezas a medida.",
    url: "https://diamylasercut.com.mx",
    siteName: "Diamy Laser Cut",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Diamy Laser Cut",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diamy — Corte Láser y Grabado Personalizado",
    description: "Productos artesanales de corte láser y grabado personalizado.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${notoSerif.variable} ${manrope.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
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
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
