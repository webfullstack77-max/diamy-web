import type { Metadata } from "next";
import Link from "next/link";
import DTFMockupStudio from "@/components/personalizador/DTFMockupStudio";

export const metadata: Metadata = {
  title: "Simulador de Playeras DTF | Diamy Laser Cut",
  description:
    "Crea y visualiza tu playera personalizada en tiempo real con perspectiva 3D: elige modelo Caballero, Dama o Niños, más de 20 colores oficiales Playerytees y estampados de nuestro catálogo o sube tu propio diseño.",
};

export default function PersonalizadorPage() {
  return (
    <div className="min-h-screen bg-[#07090c] text-white selection:bg-[#d4af37] selection:text-[#0c0e12]">
      {/* Background ambient gold glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/50">
          <Link href="/" className="hover:text-[#d4af37] transition">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-white/80 font-medium">Personalizador de Playeras DTF</span>
        </nav>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold tracking-wide">
            <span className="material-symbol" style={{ fontSize: "16px" }}>auto_awesome</span>
            SIMULADOR TEXTIL 3D EN TIEMPO REAL
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-tight">
            Diseña Tu Playera <span className="text-[#d4af37]">DTF Premium</span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 font-sans leading-relaxed">
            Visualiza tu estampado sobre playeras reales Playerytees en cortes Caballero, Dama y Niños.
            Explora las colecciones, selecciona tu color favorito y cotiza directamente por WhatsApp.
          </p>
        </div>

        {/* Main Mockup Studio Application */}
        <DTFMockupStudio />

        {/* Value Props & How it works */}
        <div className="pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xl font-bold font-serif mb-3">
              1
            </span>
            <h3 className="font-serif font-bold text-base text-white">Elige Modelo y Color</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Disponemos de playeras 100% algodón pre-encogido de Playerytees en 23 colores para Caballero (410C), 19 para Dama (410D) y 17 para Niños (410N).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xl font-bold font-serif mb-3">
              2
            </span>
            <h3 className="font-serif font-bold text-base text-white">Selecciona tu Estampado</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Navega en las carpetas temáticas como Halloween, Fiestas Patrias, Anime o sube tu propio logotipo sin fondo. El diseño se adapta y centra automáticamente.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xl font-bold font-serif mb-3">
              3
            </span>
            <h3 className="font-serif font-bold text-base text-white">Comparte y Cotiza en WhatsApp</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Toma captura instantánea con el botón &quot;Compartir en WhatsApp&quot;. Recibiremos el modelo, color exacto y mockup para darte tu presupuesto de inmediato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
