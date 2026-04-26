import Link from "next/link";

export const dynamic = "force-dynamic";

const beneficios = [
  {
    icon: "verified",
    title: "Calidad garantizada",
    desc: "Revisamos cada pieza antes de entregarla. Si hay un error de producción, lo reponemos.",
  },
  {
    icon: "palette",
    title: "100% personalizable",
    desc: "Desde el diseño hasta el material: todo se adapta a lo que necesitas.",
  },
  {
    icon: "local_shipping",
    title: "Envíos nacionales",
    desc: "Enviamos a toda la República Mexicana. Envío gratis en compras mayores a $500 MXN.",
  },
  {
    icon: "support_agent",
    title: "Atención directa",
    desc: "Hablas con quien hace tu pedido. Sin intermediarios, sin bots.",
  },
];

const valores = [
  {
    icon: "precision_manufacturing",
    title: "Precisión",
    desc: "Cada corte y grabado se realiza con tecnología láser de alta resolución.",
  },
  {
    icon: "favorite",
    title: "Dedicación",
    desc: "Tratamos cada pedido como si fuera el nuestro. Los detalles importan.",
  },
  {
    icon: "handshake",
    title: "Confianza",
    desc: "Más de 500 clientes nos han elegido. Su satisfacción es nuestra mejor carta de presentación.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-14">

      {/* Hero */}
      <div className="text-center">
        <span
          className="material-symbol text-primary mb-4 block"
          style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}
        >
          bolt
        </span>
        <h1 className="font-serif text-4xl font-bold text-on-surface mb-3">
          Diamy Laser Cut
        </h1>
        <p className="text-on-surface-muted leading-relaxed">
          {/* TODO: Reemplaza con tu tagline real */}
          Creamos piezas únicas con tecnología láser y mucho cuidado. Desde Morelos, México, para todo el país.
        </p>
      </div>

      {/* Historia */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-4">Nuestra historia</h2>
        <div className="space-y-3 text-sm text-on-surface leading-relaxed">
          {/* TODO: Reemplaza con tu historia real */}
          <p>
            Diamy Laser Cut nació en <strong>[año de fundación]</strong> con una idea simple: hacer que la personalización de alta calidad fuera accesible para todos. Lo que empezó como un pequeño taller en Morelos hoy atiende pedidos en toda la República Mexicana.
          </p>
          <p>
            El nombre "Diamy" viene de <strong>[historia del nombre]</strong>. Desde el primer día, nuestra meta ha sido la misma: que cada pieza que salga de nuestras manos refleje el cuidado y la precisión que nuestros clientes merecen.
          </p>
          <p>
            Hoy contamos con más de <strong>500 clientes satisfechos</strong> y seguimos creciendo, siempre con el mismo compromiso de calidad y atención personalizada.
          </p>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-6">¿Por qué elegirnos?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {beneficios.map((b) => (
            <div
              key={b.title}
              className="bg-surface-container rounded-2xl p-5 border border-outline-variant flex gap-4 items-start"
            >
              <span
                className="material-symbol text-primary shrink-0"
                style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                {b.icon}
              </span>
              <div>
                <p className="font-semibold text-on-surface text-sm mb-1">{b.title}</p>
                <p className="text-xs text-on-surface-muted leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tecnología */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-4">Nuestra tecnología</h2>
        <p className="text-sm text-on-surface-muted leading-relaxed mb-4">
          {/* TODO: Reemplaza con los equipos reales que usas */}
          Trabajamos con equipos de corte láser CO₂ y grabado de alta precisión, impresión sublimación y DTF, y herramientas de diseño CAD para garantizar que cada pieza quede exactamente como la imaginaste.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Corte láser CO₂", "Grabado láser", "Sublimación", "DTF", "Vinil", "Impresión 3D"].map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant text-xs text-on-surface"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-6">Nuestros valores</h2>
        <div className="space-y-4">
          {valores.map((v) => (
            <div key={v.title} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span
                  className="material-symbol text-primary"
                  style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
                >
                  {v.icon}
                </span>
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm mb-0.5">{v.title}</p>
                <p className="text-xs text-on-surface-muted leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-surface-container rounded-2xl p-6 text-center border border-outline-variant">
        <p className="font-serif text-lg font-bold text-on-surface mb-2">¿Listo para crear algo único?</p>
        <p className="text-sm text-on-surface-muted mb-5">Explora nuestro catálogo o contáctanos directamente.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/catalogo"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition"
          >
            <span className="material-symbol" style={{ fontSize: "16px" }}>grid_view</span>
            Ver catálogo
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "527777961193"}?text=${encodeURIComponent("Hola, me interesa un producto de Diamy")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface transition"
          >
            Cotizar por WhatsApp
          </a>
        </div>
      </div>

    </div>
  );
}
