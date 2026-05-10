"use client";

import { useState, useEffect } from "react";

export default function DailyPromoModal() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("daily_promo_seen") === todayKey) return;

    fetch("/api/daily-promo/today")
      .then((r) => r.json())
      .then((data) => {
        if (data?.imageUrl) {
          setImageUrl(data.imageUrl);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [visible]);

  function close() {
    localStorage.setItem("daily_promo_seen", new Date().toISOString().slice(0, 10));
    setVisible(false);
  }

  if (!visible || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm daily-promo-backdrop"
      onClick={close}
    >
      <div
        className="relative daily-promo-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-surface-container transition"
        >
          <span className="material-symbol text-on-surface" style={{ fontSize: "20px" }}>close</span>
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Promoción del día"
          className="block rounded-2xl shadow-2xl"
          style={{ maxWidth: "min(88vw, 580px)", maxHeight: "80vh", width: "auto", height: "auto" }}
        />
      </div>
    </div>
  );
}
