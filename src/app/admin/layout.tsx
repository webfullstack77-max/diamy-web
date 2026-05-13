import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import PushSetup from "@/components/admin/PushSetup";
import AssistantChat from "@/components/admin/AssistantChat";
import MobileBottomNav from "@/components/admin/MobileBottomNav";

export const metadata = { title: "Admin | Diamy" };

const NAV_ITEMS = [
  { href: "/admin", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/productos", icon: "inventory_2", label: "Productos" },
  { href: "/admin/plantillas", icon: "checkroom", label: "Plantillas" },
  { href: "/admin/mockups", icon: "imagesearch_roller", label: "Mockups" },
  { href: "/admin/mockups-dm", icon: "style", label: "Mockups Pro" },
  { href: "/admin/categorias", icon: "category", label: "Categorías" },
  { href: "/admin/publicidad", icon: "campaign", label: "Publicidad" },
  { href: "/admin/producto-del-mes", icon: "star", label: "Producto del mes" },
  { href: "/admin/imagen-del-dia", icon: "today", label: "Imagen del día" },
  { href: "/admin/testimonios", icon: "rate_review", label: "Testimonios" },
  { href: "/admin/pedidos", icon: "receipt_long", label: "Pedidos" },
];

function DesktopNav() {
  return (
    <nav className="hidden lg:flex w-56 shrink-0 bg-surface border-r border-outline-variant min-h-screen flex-col">
      <div className="p-6 border-b border-outline-variant">
        <Link href="/" className="font-serif text-xl font-bold text-primary">Diamy</Link>
        <p className="text-xs text-on-surface-muted mt-0.5">Admin Panel</p>
      </div>
      <ul className="p-4 space-y-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-on-surface hover:bg-surface-container transition"
            >
              <span className="material-symbol" style={{ fontSize: "18px" }}>{item.icon}</span>
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
          <span className="material-symbol" style={{ fontSize: "18px" }}>open_in_new</span>
          Ver sitio
        </Link>
      </div>
    </nav>
  );
}

function MobileHeader() {
  return (
    <header
      className="lg:hidden bg-surface border-b border-outline-variant flex items-center px-4 shrink-0"
      style={{
        height: "calc(3.5rem + env(safe-area-inset-top, 0px))",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <Link href="/admin/pedidos" className="font-serif font-bold text-primary text-lg">
        Diamy
      </Link>
      <span className="text-xs text-on-surface-muted ml-2">· Pedidos</span>
    </header>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PushSetup />
      <div className="flex min-h-screen bg-surface-container">
        <DesktopNav />
        <div className="flex-1 flex flex-col min-h-screen">
          <MobileHeader />
          <main className="flex-1 p-4 lg:p-8 pb-28 lg:pb-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
      <AssistantChat />
    </>
  );
}
