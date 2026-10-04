"use client";

export default function HalloweenFloating() {
  return (
    <div
      id="halloween-decorations-root"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-40"
      style={{ isolation: "isolate" }}
    >
      <style>{`
        /* ========================================================= */
        /* HALLOWEEN FLOATING MOTIFS - DIAMY LASER CUT               */
        /* 100% Pointer-Events None - Zero Layout Impact            */
        /* ========================================================= */

        @keyframes halloweenFloatUp {
          0% {
            transform: translate3d(0, 105vh, 0) rotate(0deg) scale(0.9);
            opacity: 0;
          }
          10% {
            opacity: var(--float-opacity, 0.7);
          }
          50% {
            transform: translate3d(var(--float-drift, 35px), 50vh, 0) rotate(var(--float-rot, 12deg)) scale(1.04);
          }
          90% {
            opacity: var(--float-opacity, 0.7);
          }
          100% {
            transform: translate3d(calc(var(--float-drift, 35px) * -1), -10vh, 0) rotate(calc(var(--float-rot, 12deg) * -1)) scale(0.95);
            opacity: 0;
          }
        }

        @keyframes halloweenBatCross {
          0% {
            transform: translate3d(-10vw, 35vh, 0) rotate(14deg) scale(0.75);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(110vw, 12vh, 0) rotate(-10deg) scale(1.05);
            opacity: 0;
          }
        }

        @keyframes batWingFlapLeft {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-18deg) scaleY(0.88); }
        }
        @keyframes batWingFlapRight {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(18deg) scaleY(0.88); }
        }

        @keyframes halloweenGhostDrift {
          0% {
            transform: translate3d(0, 105vh, 0) scale(0.85);
            opacity: 0;
          }
          15% {
            opacity: 0.75;
          }
          35% {
            transform: translate3d(40px, 72vh, 0) rotate(5deg) scale(1.02);
          }
          65% {
            transform: translate3d(-35px, 38vh, 0) rotate(-6deg) scale(0.96);
          }
          90% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(25px, -12vh, 0) scale(1.02);
            opacity: 0;
          }
        }

        .hw-floating-item {
          position: absolute;
          pointer-events: none;
          user-select: none;
          will-change: transform, opacity;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        .hw-bat-wing-l {
          transform-origin: 50% 50%;
          animation: batWingFlapLeft 0.55s ease-in-out infinite alternate;
        }
        .hw-bat-wing-r {
          transform-origin: 50% 50%;
          animation: batWingFlapRight 0.55s ease-in-out infinite alternate;
        }

        .hw-glow-pumpkin {
          filter: drop-shadow(0 0 10px rgba(255, 115, 0, 0.45)) drop-shadow(0 2px 4px rgba(0,0,0,0.15));
        }
        .hw-glow-ghost {
          filter: drop-shadow(0 0 12px rgba(139, 61, 255, 0.35)) drop-shadow(0 2px 5px rgba(0,0,0,0.1));
        }
        .hw-laser-cut {
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.18));
        }

        /* Ocultar elementos excedentes en dispositivos móviles para máxima ligereza */
        @media (max-width: 640px) {
          .hw-desktop-only {
            display: none !important;
          }
          .hw-corner-web {
            width: 85px !important;
            height: 85px !important;
            opacity: 0.35 !important;
          }
        }

        /* Respeta preferencias de accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          .hw-floating-item {
            animation: none !important;
            display: none !important;
          }
        }
      `}</style>

      {/* ============================================================ */}
      {/* 1. Telaraña grabada en esquina superior izquierda */}
      {/* ============================================================ */}
      <svg
        className="hw-corner-web absolute top-16 left-0 w-28 h-28 pointer-events-none opacity-45 transition-opacity"
        viewBox="0 0 100 100"
        fill="none"
        stroke="#787680"
      >
        <path d="M0,0 L100,0 M0,0 L85,45 M0,0 L65,75 M0,0 L0,100" strokeWidth="1.2" opacity="0.65" />
        <path d="M25,0 Q22,12 18,22 Q12,24 0,25" strokeWidth="0.8" opacity="0.5" />
        <path d="M50,0 Q45,24 35,42 Q22,46 0,50" strokeWidth="0.8" opacity="0.5" />
        <path d="M75,0 Q67,36 52,62 Q33,68 0,75" strokeWidth="0.8" opacity="0.5" />
        <path d="M100,0 Q88,48 70,82 Q44,90 0,100" strokeWidth="0.8" opacity="0.5" />
      </svg>

      {/* ============================================================ */}
      {/* 2. Telaraña grabada en esquina superior derecha */}
      {/* ============================================================ */}
      <svg
        className="hw-corner-web absolute top-16 right-0 w-28 h-28 pointer-events-none opacity-45 scale-x-[-1] transition-opacity"
        viewBox="0 0 100 100"
        fill="none"
        stroke="#787680"
      >
        <path d="M0,0 L100,0 M0,0 L85,45 M0,0 L65,75 M0,0 L0,100" strokeWidth="1.2" opacity="0.65" />
        <path d="M25,0 Q22,12 18,22 Q12,24 0,25" strokeWidth="0.8" opacity="0.5" />
        <path d="M50,0 Q45,24 35,42 Q22,46 0,50" strokeWidth="0.8" opacity="0.5" />
        <path d="M75,0 Q67,36 52,62 Q33,68 0,75" strokeWidth="0.8" opacity="0.5" />
        <path d="M100,0 Q88,48 70,82 Q44,90 0,100" strokeWidth="0.8" opacity="0.5" />
      </svg>

      {/* ============================================================ */}
      {/* 3. Murciélago silueta corte láser (Ascenso suave izquierdo) */}
      {/* ============================================================ */}
      <div
        className="hw-floating-item"
        style={{
          left: "8%",
          animationName: "halloweenFloatUp",
          animationDuration: "14s",
          animationDelay: "-3s",
          ["--float-drift" as string]: "40px",
          ["--float-rot" as string]: "16deg",
          ["--float-opacity" as string]: "0.75",
        }}
      >
        <svg className="hw-laser-cut" width="38" height="24" viewBox="0 0 100 60" fill="#3b3749">
          <g className="hw-bat-wing-l">
            <path d="M50 35 C40 10 20 0 0 15 C10 32 22 34 32 45 C42 42 46 38 50 35 Z" />
          </g>
          <g className="hw-bat-wing-r">
            <path d="M50 35 C60 10 80 0 100 15 C90 32 78 34 68 45 C58 42 54 38 50 35 Z" />
          </g>
          <circle cx="50" cy="36" r="8" />
          <polygon points="46,28 49,34 43,33" />
          <polygon points="54,28 51,34 57,33" />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* 4. Calabaza Jack-o'-lantern con glow neón ámbar (Centro-izq) */}
      {/* ============================================================ */}
      <div
        className="hw-floating-item"
        style={{
          left: "22%",
          animationName: "halloweenFloatUp",
          animationDuration: "17s",
          animationDelay: "-8s",
          ["--float-drift" as string]: "-35px",
          ["--float-rot" as string]: "-12deg",
          ["--float-opacity" as string]: "0.85",
        }}
      >
        <svg className="hw-glow-pumpkin" width="36" height="34" viewBox="0 0 44 40">
          <ellipse cx="22" cy="23" rx="19" ry="15" fill="#ff7300" stroke="#d45700" strokeWidth="1.2" />
          <ellipse cx="22" cy="23" rx="11" ry="14.5" fill="#ff8c26" opacity="0.6" />
          <path d="M22 8 C23 3 26 2 28 1 C27 4 24 6 23 8 Z" fill="#4d7c0f" />
          <polygon points="14,19 18,19 16,14" fill="#2d1300" />
          <polygon points="30,19 26,19 28,14" fill="#2d1300" />
          <path d="M14 25 C16 28 28 28 30 25 C29 27 27 27 25 25 C24 27 20 27 19 25 C18 27 16 27 14 25 Z" fill="#2d1300" />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* 5. Fantasmita translúcido con brillo Diamy violeta (Centro) */}
      {/* ============================================================ */}
      <div
        className="hw-floating-item hw-desktop-only"
        style={{
          left: "48%",
          animationName: "halloweenGhostDrift",
          animationDuration: "18s",
          animationDelay: "-11s",
          ["--float-opacity" as string]: "0.8",
        }}
      >
        <svg className="hw-glow-ghost" width="34" height="42" viewBox="0 0 40 50" fill="rgba(240, 235, 255, 0.92)">
          <path d="M20 2 C9 2 4 10 4 22 C4 35 6 42 10 40 C14 38 16 44 20 42 C24 40 26 44 30 40 C34 42 36 35 36 22 C36 10 31 2 20 2 Z" stroke="#5255a9" strokeWidth="0.8" />
          <ellipse cx="14" cy="18" rx="2.5" ry="3.5" fill="#1b1b23" />
          <ellipse cx="26" cy="18" rx="2.5" ry="3.5" fill="#1b1b23" />
          <ellipse cx="20" cy="27" rx="2" ry="3" fill="#1b1b23" />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* 6. Murciélago cruzando en vuelo diagonal (Pasa ocasionalmente) */}
      {/* ============================================================ */}
      <div
        className="hw-floating-item hw-desktop-only"
        style={{
          animationName: "halloweenBatCross",
          animationDuration: "13s",
          animationDelay: "-5s",
        }}
      >
        <svg className="hw-laser-cut" width="46" height="28" viewBox="0 0 100 60" fill="#252430">
          <g className="hw-bat-wing-l">
            <path d="M50 35 C40 10 20 0 0 15 C10 32 22 34 32 45 C42 42 46 38 50 35 Z" />
          </g>
          <g className="hw-bat-wing-r">
            <path d="M50 35 C60 10 80 0 100 15 C90 32 78 34 68 45 C58 42 54 38 50 35 Z" />
          </g>
          <circle cx="50" cy="36" r="8" />
          <polygon points="46,28 49,34 43,33" />
          <polygon points="54,28 51,34 57,33" />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* 7. Calabacita Jack-o'-lantern derecha */}
      {/* ============================================================ */}
      <div
        className="hw-floating-item"
        style={{
          left: "75%",
          animationName: "halloweenFloatUp",
          animationDuration: "15s",
          animationDelay: "-2s",
          ["--float-drift" as string]: "30px",
          ["--float-rot" as string]: "15deg",
          ["--float-opacity" as string]: "0.8",
        }}
      >
        <svg className="hw-glow-pumpkin" width="34" height="32" viewBox="0 0 44 40">
          <ellipse cx="22" cy="23" rx="19" ry="15" fill="#ff7300" stroke="#d45700" strokeWidth="1.2" />
          <ellipse cx="22" cy="23" rx="11" ry="14.5" fill="#ff8c26" opacity="0.6" />
          <path d="M22 8 C23 3 26 2 28 1 C27 4 24 6 23 8 Z" fill="#4d7c0f" />
          <polygon points="14,19 18,19 16,14" fill="#2d1300" />
          <polygon points="30,19 26,19 28,14" fill="#2d1300" />
          <path d="M14 25 C16 28 28 28 30 25 C29 27 27 27 25 25 C24 27 20 27 19 25 C18 27 16 27 14 25 Z" fill="#2d1300" />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* 8. Chispita dorada láser (Flotación mágica derecha) */}
      {/* ============================================================ */}
      <div
        className="hw-floating-item hw-desktop-only"
        style={{
          left: "90%",
          animationName: "halloweenFloatUp",
          animationDuration: "12s",
          animationDelay: "-7s",
          ["--float-drift" as string]: "-25px",
          ["--float-rot" as string]: "45deg",
          ["--float-opacity" as string]: "0.7",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffb703" style={{ filter: "drop-shadow(0 0 6px #ffb703)" }}>
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* 9. Chispita morada Diamy izquierda */}
      {/* ============================================================ */}
      <div
        className="hw-floating-item hw-desktop-only"
        style={{
          left: "14%",
          animationName: "halloweenFloatUp",
          animationDuration: "16s",
          animationDelay: "-13s",
          ["--float-drift" as string]: "20px",
          ["--float-rot" as string]: "-30deg",
          ["--float-opacity" as string]: "0.65",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#8b3dff" style={{ filter: "drop-shadow(0 0 6px #8b3dff)" }}>
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
        </svg>
      </div>
    </div>
  );
}
