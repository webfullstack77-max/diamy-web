"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const path = usePathname();

  const activeTab =
    path.startsWith("/admin/pedidos/nuevo") ? "/admin/pedidos/nuevo"
    : path.startsWith("/admin/pedidos") ? "/admin/pedidos"
    : "";

  const tabs = [
    { href: "/admin/pedidos", icon: "receipt_long", label: "Pedidos" },
    { href: "/admin/pedidos/nuevo", icon: "add_circle", label: "Nuevo pedido" },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-outline-variant flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center pt-2 pb-1.5 transition-colors ${
              isActive ? "text-primary" : "text-on-surface-muted"
            }`}
          >
            <span className="material-symbol" style={{ fontSize: 24 }}>{tab.icon}</span>
            <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
