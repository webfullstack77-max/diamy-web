"use client";

import type { Testimonial } from "@/types";

interface Props {
  testimonials: Testimonial[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="material-symbol text-secondary-dark"
          style={{
            fontSize: "16px",
            fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function TestimonialsSection({ testimonials }: Props) {
  if (testimonials.length === 0) return null;

  // Duplicar para loop infinito
  const items = [...testimonials, ...testimonials];

  return (
    <section className="py-14 px-0 bg-surface-container/50 overflow-hidden">
      <div className="text-center mb-10 px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface mb-2">
          Lo que dicen nuestros clientes
        </h2>
        <p className="text-on-surface-muted text-sm">Cada pieza, una historia</p>
      </div>

      <div
        className="flex gap-5 w-max"
        style={{
          animation: "marquee 30s linear infinite",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
      >
        {items.map((t, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-6 w-72 shrink-0 flex flex-col gap-3"
          >
            <StarRating rating={t.rating} />
            <p className="text-sm text-on-surface leading-relaxed italic line-clamp-4">
              &ldquo;{t.text ?? ""}&rdquo;
            </p>
            <div className="mt-auto flex items-center gap-3 pt-2 border-t border-outline-variant/40">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbol text-primary" style={{ fontSize: "20px" }}>person</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{t.author ?? "Cliente"}</p>
                {t.role && <p className="text-xs text-on-surface-muted">{t.role}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
