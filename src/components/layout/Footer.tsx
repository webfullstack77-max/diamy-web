import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <span className="font-serif text-2xl font-bold text-primary">Diamy</span>
          <p className="mt-2 text-sm text-on-surface-muted leading-relaxed">
            Corte láser y grabado personalizado. Creamos piezas únicas con
            materiales de calidad para cada ocasión.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold text-on-surface mb-3">Catálogo</h3>
          <ul className="space-y-2 text-sm text-on-surface-muted">
            <li>
              <Link href="/catalogo" prefetch={false} className="hover:text-primary transition">
                Todos los productos
              </Link>
            </li>
            <li>
              <Link href="/catalogo?categoria=Sublimacion+de+tazas" prefetch={false} className="hover:text-primary transition">
                Tazas Personalizadas
              </Link>
            </li>
            <li>
              <Link href="/catalogo?categoria=DTF" prefetch={false} className="hover:text-primary transition">
                Estampado de Playeras
              </Link>
            </li>
            <li>
              <Link href="/catalogo?categoria=MDF" prefetch={false} className="hover:text-primary transition">
                Productos MDF
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div id="contacto">
          <h3 className="font-semibold text-on-surface mb-3">Contacto</h3>
          <ul className="space-y-2 text-sm text-on-surface-muted">
            <li className="flex items-center gap-2">
              <span className="material-symbol" style={{ fontSize: "16px" }}>
                chat
              </span>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition"
              >
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbol" style={{ fontSize: "16px" }}>
                mail
              </span>
              <a
                href="mailto:ventas@diamylasercut.com.mx"
                className="hover:text-primary transition"
              >
                ventas@diamylasercut.com.mx
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-outline-variant py-4 text-center text-xs text-on-surface-muted">
        © {new Date().getFullYear()} Diamy. Todos los derechos reservados.
      </div>
    </footer>
  );
}
