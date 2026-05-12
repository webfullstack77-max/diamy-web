"use client";

import { useState } from "react";

interface Props {
  token: string;
}

export default function FeedbackForm({ token }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ author: "", role: "", email: "", phone: "", text: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setErrorMsg("Por favor selecciona una calificación."); return; }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Ocurrió un error. Intenta de nuevo.");
        setStatus("error");
        return;
      }
      setStatus("ok");
    } catch {
      setErrorMsg("Ocurrió un error. Intenta de nuevo.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="text-center py-16 px-6">
        <span className="material-symbol text-primary" style={{ fontSize: 64 }}>favorite</span>
        <h2 className="font-serif text-2xl font-bold text-on-surface mt-4 mb-2">
          ¡Gracias por tu reseña!
        </h2>
        <p className="text-on-surface-muted text-sm max-w-sm mx-auto">
          Tu opinión es muy valiosa para nosotros. Pronto aparecerá en nuestra página.
        </p>
      </div>
    );
  }

  const activeRating = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Calificación */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-2">
          Calificación <span className="text-error">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onTouchStart={() => setHover(star)}
              onTouchEnd={() => setHover(0)}
              className="focus:outline-none p-1"
              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              <span
                className="material-symbol transition-colors"
                style={{
                  fontSize: 40,
                  color: star <= activeRating ? "#f59e0b" : "#d1d5db",
                  fontVariationSettings: star <= activeRating ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                star
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-on-surface-muted mt-1">
            {["", "Muy malo", "Malo", "Regular", "Bueno", "¡Excelente!"][rating]}
          </p>
        )}
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">
          Nombre completo <span className="text-error">*</span>
        </label>
        <input
          name="author"
          type="text"
          required
          value={form.author}
          onChange={handleChange}
          placeholder="Ej: María González"
          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Correo */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">
          Correo electrónico <span className="text-error">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="tucorreo@ejemplo.com"
          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Celular */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">
          Número de celular <span className="text-on-surface-muted text-xs">(opcional)</span>
        </label>
        <input
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="Ej: 55 1234 5678"
          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Rol / descripción */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">
          ¿Cómo nos conociste o qué compraste? <span className="text-on-surface-muted text-xs">(opcional)</span>
        </label>
        <input
          name="role"
          type="text"
          value={form.role}
          onChange={handleChange}
          placeholder="Ej: Cliente frecuente, regalo de boda, tazas personalizadas…"
          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Comentario */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">
          Comentario <span className="text-error">*</span>
        </label>
        <textarea
          name="text"
          required
          value={form.text}
          onChange={handleChange}
          rows={4}
          placeholder="Cuéntanos tu experiencia con Diamy Laser Cut..."
          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-error bg-error-container/30 rounded-xl px-4 py-2">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm transition hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Enviando..." : "Enviar reseña"}
      </button>
    </form>
  );
}
