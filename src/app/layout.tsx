import type { Metadata } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
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
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
