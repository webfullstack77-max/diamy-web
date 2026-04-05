"use client";

interface Props {
  imageUrl: string;
  text?: string;
}

export default function ProductOfMonth({ imageUrl, text }: Props) {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-12 bg-background">
      <div className="max-w-md mx-auto flex flex-col items-center gap-6">
        {/* Título */}
        <div className="text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">
            Producto del Mes
          </h2>
          <p className="text-on-surface-muted text-sm mt-1">Nuestra selección especial</p>
        </div>

        {/* Marco LED animado */}
        <div className="led-frame">
          <div className="led-frame-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Producto del mes"
              className="block w-full h-full object-cover rounded-[14px]"
            />
          </div>
        </div>

        {/* Texto debajo */}
        {text && (
          <p className="text-center text-on-surface-muted text-sm leading-relaxed max-w-sm">
            {text}
          </p>
        )}
      </div>

      <style>{`
        .led-frame {
          position: relative;
          width: 100%;
          max-width: 400px;
          border-radius: 16px;
          padding: 3px;
          background: conic-gradient(
            from var(--led-angle, 0deg),
            transparent 0deg,
            rgba(82, 85, 169, 0.6) 60deg,
            rgba(147, 112, 219, 0.5) 120deg,
            rgba(255, 255, 255, 0.3) 180deg,
            rgba(147, 112, 219, 0.5) 240deg,
            rgba(82, 85, 169, 0.6) 300deg,
            transparent 360deg
          );
          animation: led-rotate 4s linear infinite;
          box-shadow: 0 0 18px rgba(82, 85, 169, 0.25), 0 4px 24px rgba(0,0,0,0.1);
        }

        .led-frame-inner {
          border-radius: 14px;
          overflow: hidden;
          background: var(--color-surface, #fff);
          width: 100%;
          aspect-ratio: 1 / 1;
        }

        @property --led-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        @keyframes led-rotate {
          from { --led-angle: 0deg; }
          to   { --led-angle: 360deg; }
        }
      `}</style>
    </section>
  );
}
