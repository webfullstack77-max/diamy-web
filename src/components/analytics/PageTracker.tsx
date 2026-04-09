"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getVisitorId(): string {
  const key = "dms_vid";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const visitorId = getVisitorId();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitorId }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
