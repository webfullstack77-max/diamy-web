"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/catalogo", icon: "grid_view", label: "Catálogo" },
  { href: "/contacto", icon: "chat", label: "Contacto" },
  { href: "/#nosotros", icon: "person", label: "Nosotros" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-outline-variant rounded-t-2xl">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href.split("?")[0]);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
            >
              <span
                className="material-symbol"
                style={{
                  fontSize: "24px",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
