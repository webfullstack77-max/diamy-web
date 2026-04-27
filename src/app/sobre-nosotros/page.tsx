export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";

const fases = [
  {
    emoji: "🌱",
    fase: "Fase 1",
    periodo: "Septiembre 2024",
    titulo: "Los Inicios",
    desc: "Empezamos con una sola máquina láser, enfocándonos en productos navideños que rápidamente ganaron popularidad. El éxito de esos primeros productos nos mostró que el mercado tenía hambre de personalización de calidad.",
    items: [
      "Esferas navideñas personalizadas",
      "Nacimientos artesanales",
      "Coronas navideñas decorativas",
    ],
  },
  {
    emoji: "📈",
    fase: "Fase 2",
    periodo: "Finales de 2024",
    titulo: "Expansión en Láser",
    desc: "La demanda nos llevó a invertir en máquinas más potentes. Nuestro material estrella: MDF. Ampliamos el catálogo exponencialmente.",
    items: [
      "Organizadores de escritorio",
      "Letreros florales",
      "Portaretratos personalizados",
      "Cajas de regalo decorativas",
      "Adornos de pared multicapas",
    ],
  },
  {
    emoji: "🚀",
    fase: "Fase 3",
    periodo: "Presente",
    titulo: "Diversificación Tecnológica",
    desc: "Comprendimos que cada cliente tiene necesidades diferentes, así que invertimos en múltiples tecnologías para poder transformar cualquier idea en realidad.",
    items: [
      "Corte de vinil con Cricut Joy y Explore 3",
      "Impresión 3D con Bambulab A1 Combo y Creality Ender3",
      "Láser CO₂ de alta gama: xTool P2 y Atomstack A70 Max",
      "Sublimación y estampado DTF",
    ],
  },
];

const tecnologias = [
  {
    emoji: "✂️",
    categoria: "Corte de Vinil",
    equipos: ["Cricut Joy", "Cricut Explore 3"],
    desc: "Stickers personalizados de alta calidad para decor, branding y regalos corporativos.",
  },
  {
    emoji: "🖨️",
    categoria: "Impresión 3D",
    equipos: ["Bambulab A1 Combo", "2× Creality Ender3 V3"],
    desc: "Prototipos, piezas técnicas y producción a escala con acabados profesionales.",
  },
  {
    emoji: "⚡",
    categoria: "Láser de Gama Alta",
    equipos: ["xTool P2", "Atomstack A70 Max", "Láser CO₂ 100W"],
    desc: "Corte y grabado en acrílico, MDF, termos y más. Precisión milimétrica.",
  },
  {
    emoji: "👕",
    categoria: "Sublimación & DTF",
    equipos: ["Impresora de sublimación", "Impresora DTF"],
    desc: "Tazas personalizadas y playeras con estampado profesional listo para vender.",
  },
];

const valores = [
  {
    emoji: "🎯",
    titulo: "Precisión",
    desc: "Equipos de última generación para tolerancias ajustadas y detalles impecables en cada pieza.",
  },
  {
    emoji: "💡",
    titulo: "Creatividad",
    desc: "Tu idea es nuestra inspiración. Trabajamos contigo para transformar conceptos en realidades tangibles.",
  },
  {
    emoji: "🤝",
    titulo: "Compromiso Familiar",
    desc: "Equipo pequeño pero poderoso. Cada proyecto recibe atención personalizada porque tu satisfacción es nuestra reputación.",
  },
  {
    emoji: "🌱",
    titulo: "Sostenibilidad",
    desc: "Optimizamos el uso de materiales. No desperdiciamos; creamos soluciones eficientes que respetan tu inversión.",
  },
];

const estados = [
  "🏙️ Monterrey",
  "🌆 Ciudad de México",
  "🏛️ Puebla",
  "🤠 Durango",
];

const razones = [
  {
    titulo: "Tecnología Diversa",
    desc: "No somos especialistas en una cosa; somos expertos en transformar ideas.",
  },
  {
    titulo: "Trato Personal",
    desc: "Nacemos de una familia que entiende el valor de la confianza y la relación directa con cada cliente.",
  },
  {
    titulo: "Calidad Comprobada",
    desc: "Más de 500 clientes felices hablan por nosotros.",
  },
  {
    titulo: "Cobertura Nacional",
    desc: "Dondequiera que estés en México, podemos llevar tu proyecto personalizado.",
  },
  {
    titulo: "Atención al Detalle",
    desc: "Cada pieza es una oportunidad de sorprenderte.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-16">

      {/* Hero */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Diamy Laser Cut"
            width={120}
            height={120}
            priority
            className="object-contain"
          />
        </div>
        <h1 className="font-serif text-4xl font-bold text-on-surface mb-3">
          Diamy Laser Cut
        </h1>
        <p className="text-base font-semibold text-primary mb-3">
          De un sueño familiar a una realidad en expansión
        </p>
        <p className="text-sm text-on-surface-muted leading-relaxed">
          Somos un equipo joven, dinámico y comprometido con transformar ideas
          en piezas únicas. Desde Morelos, México, para toda la república.
        </p>
      </div>

      {/* Historia */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-2">
          📖 Nuestra Historia
        </h2>
        <p className="text-sm text-on-surface-muted leading-relaxed mb-8">
          Diamy nace en{" "}
          <strong className="text-on-surface">septiembre de 2024</strong> como
          un proyecto familiar movido por la pasión por la creatividad y la
          personalización. Lo que comenzó como una pequeña apuesta con una
          única máquina láser, hoy es un negocio en crecimiento que atiende
          clientes en toda la república mexicana.
        </p>

        <div className="space-y-4">
          {fases.map((f) => (
            <div
              key={f.fase}
              className="bg-surface-container rounded-2xl p-5 border border-outline-variant"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {f.fase} · {f.periodo}
                  </p>
                  <p className="font-semibold text-on-surface">{f.titulo}</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-muted leading-relaxed mb-3">
                {f.desc}
              </p>
              <ul className="space-y-1.5">
                {f.items.map((item) => (
                  <li
                    key={item}
                    className="text-xs text-on-surface-muted flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Tecnología */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-2">
          🔧 Nuestra Tecnología
        </h2>
        <p className="text-sm text-on-surface-muted leading-relaxed mb-6">
          Cada nueva máquina representa nuestra búsqueda de nuevas
          posibilidades. No nos estancamos; evolucionamos con las tendencias.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tecnologias.map((t) => (
            <div
              key={t.categoria}
              className="bg-surface-container rounded-2xl p-5 border border-outline-variant"
            >
              <p className="font-semibold text-on-surface text-sm mb-1">
                {t.emoji} {t.categoria}
              </p>
              <p className="text-xs text-on-surface-muted leading-relaxed mb-3">
                {t.desc}
              </p>
              <ul className="space-y-1">
                {t.equipos.map((equipo) => (
                  <li
                    key={equipo}
                    className="text-xs text-on-surface-muted flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    {equipo}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Alcance */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-2">
          📍 Nuestro Alcance
        </h2>
        <p className="text-sm text-on-surface-muted leading-relaxed mb-4">
          Lo que comenzó como un proyecto local ha trascendido fronteras. Hoy
          tenemos clientes satisfechos en múltiples estados de la república:
        </p>
        <div className="flex flex-wrap gap-2">
          {estados.map((e) => (
            <span
              key={e}
              className="px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-sm text-on-surface"
            >
              {e}
            </span>
          ))}
          <span className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
            ✨ y seguimos creciendo
          </span>
        </div>
      </section>

      {/* Valores */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-6">
          💎 Nuestros Valores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {valores.map((v) => (
            <div
              key={v.titulo}
              className="flex gap-3 items-start p-4 bg-surface-container rounded-2xl border border-outline-variant"
            >
              <span className="text-2xl shrink-0">{v.emoji}</span>
              <div>
                <p className="font-semibold text-on-surface text-sm mb-1">
                  {v.titulo}
                </p>
                <p className="text-xs text-on-surface-muted leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-6">
          ⭐ ¿Por Qué Elegir Diamy?
        </h2>
        <div className="space-y-3">
          {razones.map((r) => (
            <div key={r.titulo} className="flex gap-3 items-start">
              <span className="text-lg shrink-0">✅</span>
              <p className="text-sm text-on-surface-muted leading-relaxed">
                <strong className="text-on-surface">{r.titulo}</strong>{" "}
                — {r.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Compromiso */}
      <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant text-center">
        <div className="text-3xl mb-3">🚀</div>
        <p className="font-serif text-lg font-bold text-on-surface mb-2">
          Nuestro Compromiso
        </p>
        <p className="text-sm text-on-surface-muted leading-relaxed">
          No solo vendemos productos. Creamos{" "}
          <strong className="text-on-surface">momentos especiales</strong> —
          regalos que sorprenden, decoraciones que transforman espacios, marcas
          que se destacan.
        </p>
        <p className="text-sm font-medium text-primary mt-3">
          Tu proyecto es nuestro proyecto. Tu satisfacción es nuestra métrica
          de éxito.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center space-y-3">
        <p className="font-serif text-xl font-bold text-on-surface">
          ¿Tienes una idea? ¡Platícanos! 💬
        </p>
        <p className="text-sm text-on-surface-muted">
          No hay proyecto demasiado pequeño ni demasiado grande.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          <Link
            href="/catalogo"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition"
          >
            <span className="material-symbol" style={{ fontSize: "16px" }}>
              grid_view
            </span>
            Ver catálogo
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "527777961193"}?text=${encodeURIComponent("Hola, me interesa un producto de Diamy")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container transition"
          >
            💬 Cotizar por WhatsApp
          </a>
        </div>
      </div>

    </div>
  );
}
