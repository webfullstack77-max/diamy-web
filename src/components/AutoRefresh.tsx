"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const INTERVAL_MS = 60_000; // revisa cada 60 segundos

export default function AutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // No hacer polling en el panel admin
    if (pathname.startsWith("/admin")) return;

    let currentVersion: number | null = null;

    const check = async () => {
      // No hacer polling si la pestaña no está visible
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/content-version", { cache: "no-store" });
        if (!res.ok) return;
        const { version } = await res.json();
        if (currentVersion === null) {
          currentVersion = version; // primera carga: solo guardar
        } else if (version !== currentVersion) {
          currentVersion = version;
          router.refresh(); // recarga datos del servidor sin recargar la página
        }
      } catch {
        // silenciar errores de red
      }
    };

    const interval = setInterval(check, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router, pathname]);

  return null;
}
