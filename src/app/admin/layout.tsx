import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata = { title: "Admin | Diamy" };

function AdminNav() {
  return (
    <nav className="w-56 shrink-0 bg-surface border-r border-outline-variant min-h-screen flex flex-col">
      <div className="p-6 border-b border-outline-variant">
        <Link href="/" className="font-serif text-xl font-bold text-primary">
          Diamy
        </Link>
        <p className="text-xs text-on-surface-muted mt-0.5">Admin Panel</p>
      </div>
      <ul className="p-4 space-y-1 flex-1">
        {[
          { href: "/admin", icon: "dashboard", label: "Dashboard" },
          { href: "/admin/productos", icon: "inventory_2", label: "Productos" },
          { href: "/admin/categorias", icon: "category", label: "Categorías" },
          { href: "/admin/publicidad", icon: "campaign", label: "Publicidad" },
          { href: "/admin/producto-del-mes", icon: "star", label: "Producto del mes" },
          { href: "/admin/testimonios", icon: "rate_review", label: "Testimonios" },
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-on-surface hover:bg-surface-container transition"
            >
              <span className="material-symbol" style={{ fontSize: "18px" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-outline-variant space-y-1">
        <LogoutButton />
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-on-surface-muted hover:bg-surface-container transition"
        >
          <span className="material-symbol" style={{ fontSize: "18px" }}>
            open_in_new
          </span>
          Ver sitio
        </Link>
      </div>
    </nav>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-container">
      <AdminNav />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
