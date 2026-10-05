import Link from "next/link";
import Image from "next/image";

export default function DTFSimulatorPromo() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0e1218] via-[#141923] to-[#0a0d12] border border-amber-500/30 p-8 sm:p-12 shadow-2xl overflow-hidden">
          {/* Subtle gold radial background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Nueva Herramienta Interactiva
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-tight">
                Simulador de Playeras <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">DTF en Tiempo Real</span>
              </h2>

              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Diseña y visualiza tu playera antes de ordenar. Elige entre más de <strong>20 colores oficiales Playerytees</strong> (Caballero, Dama y Niño), prueba nuestras colecciones temáticas o <strong>sube tu propio diseño PNG</strong> con perspectiva 3D realista.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                  <span className="text-amber-400 text-lg block mb-1">🪵 🏭</span>
                  <span className="text-xs font-bold text-white block">2 Escenas HD</span>
                  <span className="text-[11px] text-white/50 block">Mesa y Taller DTF</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                  <span className="text-amber-400 text-lg block mb-1">🎨 👕</span>
                  <span className="text-xs font-bold text-white block">23 Colores</span>
                  <span className="text-[11px] text-white/50 block">Caballero, Dama, Niño</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left col-span-2 sm:col-span-1">
                  <span className="text-amber-400 text-lg block mb-1">📸 💬</span>
                  <span className="text-xs font-bold text-white block">Envío por WhatsApp</span>
                  <span className="text-[11px] text-white/50 block">Captura y cotiza al instante</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/personalizador"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-[#0c0e12] font-black text-base shadow-xl hover:brightness-110 hover:scale-[1.02] transition-all"
                >
                  <span className="material-symbol" style={{ fontSize: "20px" }}>checkroom</span>
                  Abrir Simulador de Playeras
                </Link>
                <Link
                  href="/catalogo?categoria=estampado-de-playeras"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 text-sm font-semibold transition"
                >
                  Ver Catálogo de Playeras
                </Link>
              </div>
            </div>

            {/* Right Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-black/60">
                <Image
                  src="/mockups/scene_wood/Black.jpg"
                  alt="Vista previa Simulador DTF Diamy"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />

                {/* Overlaid sample design */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
                  <div className="relative w-3/4 h-3/4 drop-shadow-2xl">
                    <Image
                      src="/uploads/designs/AguilaCuadros.png"
                      alt="Estampado DTF"
                      fill
                      className="object-contain"
                      sizes="300px"
                    />
                  </div>
                </div>

                {/* Interactive floating pill overlay */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-amber-400/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-black border-2 border-white shadow-sm" />
                    <div>
                      <span className="text-xs font-bold text-white block">NEGRO • PLAYERYTEES 410C</span>
                      <span className="text-[10px] text-amber-400 block font-mono">Perspectiva 3D Activa</span>
                    </div>
                  </div>
                  <Link
                    href="/personalizador"
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold shadow hover:bg-amber-400 transition"
                  >
                    Probar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
