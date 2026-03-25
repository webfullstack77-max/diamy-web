"use client";

import { useState } from "react";

const TIPOS = [
  "Tazas Personalizadas",
  "Estampado de Playeras",
  "Productos MDF",
  "Acrílicos",
  "Stickers",
  "Grabado de Termos",
  "Otro",
];

export default function ContactoPage() {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    tipoProducto: "",
    cantidad: "",
    mensaje: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus("ok");
      setForm({ nombre: "", telefono: "", email: "", tipoProducto: "", cantidad: "", mensaje: "" });
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Error al enviar");
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary transition";

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface">Contáctanos</h1>
        <p className="text-on-surface-muted text-sm mt-2">
          Cuéntanos qué necesitas y te respondemos lo antes posible.
        </p>
      </div>

      {/* Info rápida */}
      <div className="flex gap-3 mb-8">
        <a
          href="https://wa.me/527777961193"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 flex-1 bg-[#25D366]/10 text-[#128c4a] rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#25D366]/20 transition"
        >
          <span className="material-symbol" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>chat</span>
          WhatsApp
        </a>
        <a
          href="mailto:ventas@diamylasercut.com.mx"
          className="flex items-center gap-2 flex-1 bg-primary/10 text-primary rounded-xl px-4 py-3 text-sm font-medium hover:bg-primary/20 transition"
        >
          <span className="material-symbol" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>mail</span>
          Correo
        </a>
      </div>

      {/* Formulario */}
      {status === "ok" ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <span className="material-symbol text-primary" style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h2 className="font-semibold text-on-surface text-xl">¡Mensaje enviado!</h2>
          <p className="text-on-surface-muted text-sm">Te responderemos a la brevedad en tu correo.</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Nombre <span className="text-error">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Tu nombre completo"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                WhatsApp / Teléfono
              </label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="10 dígitos"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Correo electrónico <span className="text-error">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="tucorreo@ejemplo.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Tipo de producto
              </label>
              <select
                name="tipoProducto"
                value={form.tipoProducto}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Selecciona...</option>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Cantidad aproximada
              </label>
              <input
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Ej. 10 piezas"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Mensaje <span className="text-error">*</span>
            </label>
            <textarea
              name="mensaje"
              value={form.mensaje}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe tu pedido, diseño o consulta..."
              className={inputClass}
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-error bg-error/10 rounded-xl px-4 py-3">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <span className="material-symbol animate-spin" style={{ fontSize: "18px" }}>progress_activity</span>
                Enviando...
              </>
            ) : (
              <>
                <span className="material-symbol" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>send</span>
                Enviar mensaje
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
