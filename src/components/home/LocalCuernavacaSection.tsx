import Link from "next/link";

export default function LocalCuernavacaSection() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "527777961193";

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-surface via-surface-container/50 to-surface">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbol text-primary" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>
              location_on
            </span>
            Atención Local en Cuernavaca & Zona Metropolitana
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface leading-tight">
            Tu Taller Especializado en <span className="text-primary">Corte Láser & DTF Textil</span>
          </h2>
          <p className="mt-3 text-on-surface-muted text-base leading-relaxed">
            Olvídate de esperar paqueterías foráneas que tardan días. Producimos en nuestro taller local en Cuernavaca con recogida directa o entrega express el mismo día.
          </p>
        </div>

        {/* 3 Pilares Locales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Tarjeta 1: Bodas y Eventos */}
          <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-outline-variant hover:border-primary/40 transition shadow-sm hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5">
                <span className="material-symbol" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>
                  celebration
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-on-surface mb-2">
                Bodas & Jardines de Eventos
              </h3>
              <p className="text-sm text-on-surface-muted leading-relaxed mb-4">
                Morelos es la capital de los eventos en jardín. Hacemos que cada detalle luzca impecable y elegante:
              </p>
              <ul className="space-y-2 text-xs text-on-surface-muted mb-6">
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-primary text-sm font-bold">check</span>
                  Letreros de bienvenida (Acrílico espejo dorado/plata y madera)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-primary text-sm font-bold">check</span>
                  Cake toppers personalizados y números de mesa
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-primary text-sm font-bold">check</span>
                  Playeras y gorras DTF para despedidas de soltera y tornaboda
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-primary text-sm font-bold">check</span>
                  Recuerdos grabados para invitados y marcasitios
                </li>
              </ul>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola Diamy, me interesa cotizar detalles y letreros para una boda/evento en Cuernavaca.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-primary-container text-primary text-xs font-bold transition"
            >
              <span>Cotizar Evento</span>
              <span className="material-symbol text-sm">arrow_forward</span>
            </a>
          </div>

          {/* Tarjeta 2: Negocios y Restaurantes */}
          <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-outline-variant hover:border-primary/40 transition shadow-sm hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-5">
                <span className="material-symbol" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>
                  storefront
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-on-surface mb-2">
                Restaurantes & Negocios B2B
              </h3>
              <p className="text-sm text-on-surface-muted leading-relaxed mb-4">
                Renueva la imagen de tu restaurante, cafetería o empresa con piezas duraderas y profesionales:
              </p>
              <ul className="space-y-2 text-xs text-on-surface-muted mb-6">
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-primary text-sm font-bold">check</span>
                  Menús y bases de código QR en acrílico grabado
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-primary text-sm font-bold">check</span>
                  Mandiles y playeras de staff estampadas con DTF ultra resistente
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-primary text-sm font-bold">check</span>
                  Señalética elegante para mesas, baños y recepción
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-primary text-sm font-bold">check</span>
                  Reconocimientos, trofeos y placas conmemorativas
                </li>
              </ul>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola Diamy, me interesa cotizar material para mi negocio/restaurante en Cuernavaca.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-primary-container text-primary text-xs font-bold transition"
            >
              <span>Cotizar para Negocio</span>
              <span className="material-symbol text-sm">arrow_forward</span>
            </a>
          </div>

          {/* Tarjeta 3: Urgencias y Pedidos Express */}
          <div className="bg-gradient-to-br from-primary/10 via-surface to-primary/5 rounded-2xl p-6 sm:p-7 border-2 border-primary/30 flex flex-col justify-between shadow-sm hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-5 shadow-md">
                <span className="material-symbol" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-extrabold uppercase">
                  Servicio Express
                </span>
                <span className="text-xs text-on-surface-muted font-medium">24 a 48 hrs</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-on-surface mb-2">
                ¿Tienes una Urgencia Local?
              </h3>
              <p className="text-sm text-on-surface-muted leading-relaxed mb-4">
                Si tu evento o compromiso es en pocos días y necesitas resolver de inmediato, ¡nosotros te respaldamos!:
              </p>
              <ul className="space-y-2 text-xs text-on-surface-muted mb-6">
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-emerald-600 text-sm font-bold">verified</span>
                  Recogida directa en nuestro taller en Cuernavaca sin costo
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-emerald-600 text-sm font-bold">verified</span>
                  Envío express el mismo día vía Didi Entrega / Uber Flash
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-emerald-600 text-sm font-bold">verified</span>
                  Atención prioritaria y directa vía WhatsApp sin intermediarios
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbol text-emerald-600 text-sm font-bold">verified</span>
                  Cobertura en Cuernavaca, Jiutepec, Temixco y Zapata
                </li>
              </ul>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola Diamy, tengo un pedido urgente en Cuernavaca. ¿Tienen disponibilidad para estos días?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-dark transition shadow"
            >
              <span className="material-symbol text-sm">chat</span>
              <span>Consultar Urgencia Directa</span>
            </a>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 rounded-2xl bg-surface-container border border-outline-variant p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 hidden sm:flex">
              <span className="material-symbol" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface text-base sm:text-lg">
                ¿Prefieres recoger en persona o entrega express en tu puerta?
              </h4>
              <p className="text-xs sm:text-sm text-on-surface-muted mt-0.5">
                Te damos ambas facilidades: pasa a nuestro taller cuando esté listo o te lo mandamos en minutos vía Uber/Didi.
              </p>
            </div>
          </div>
          <Link
            href="/catalogo"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary text-primary hover:bg-primary/10 text-sm font-bold transition"
          >
            Explorar Catálogo Local
            <span className="material-symbol text-base">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
