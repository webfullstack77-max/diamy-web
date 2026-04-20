interface Props {
  hasDimensions?: boolean;
  widthCm: number | null;
  heightCm: number | null;
}

function formatCm(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1).replace(/\.0$/, "");
}

export default function DimensionsBlock({ hasDimensions, widthCm, heightCm }: Props) {
  if (!hasDimensions) return null;
  if (widthCm == null && heightCm == null) return null;

  const widthLabel = widthCm != null ? `${formatCm(widthCm)} cm` : null;
  const heightLabel = heightCm != null ? `${formatCm(heightCm)} cm` : null;

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-muted">Medidas</p>

      <svg
        viewBox="0 0 200 140"
        className="w-40 h-28 text-on-surface"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Rectángulo */}
        <rect x="30" y="25" width="120" height="75" rx="4" className="text-outline-variant" />

        {/* Flecha horizontal (ancho) — debajo */}
        {widthLabel && (
          <>
            <line x1="30" y1="118" x2="150" y2="118" />
            <polyline points="36,114 30,118 36,122" />
            <polyline points="144,114 150,118 144,122" />
            <text
              x="90"
              y="135"
              textAnchor="middle"
              fontSize="12"
              stroke="none"
              fill="currentColor"
              className="font-sans"
            >
              Ancho: {widthLabel}
            </text>
          </>
        )}

        {/* Flecha vertical (alto) — a la izquierda */}
        {heightLabel && (
          <>
            <line x1="15" y1="25" x2="15" y2="100" />
            <polyline points="11,31 15,25 19,31" />
            <polyline points="11,94 15,100 19,94" />
            <text
              x="8"
              y="66"
              textAnchor="middle"
              fontSize="12"
              stroke="none"
              fill="currentColor"
              transform="rotate(-90 8 66)"
              className="font-sans"
            >
              Alto: {heightLabel}
            </text>
          </>
        )}
      </svg>

      <p className="text-sm text-on-surface-muted text-center">
        {widthLabel && heightLabel ? `${widthLabel} × ${heightLabel}` : widthLabel ?? heightLabel}
      </p>
    </div>
  );
}
