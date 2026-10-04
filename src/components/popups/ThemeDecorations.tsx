import type { PopupTheme } from "@/types/popup";

interface Props {
  theme: PopupTheme;
}

export default function ThemeDecorations({ theme }: Props) {
  switch (theme) {
    case "halloween":
      return (
        <>
          {/* Telaraña esquina izquierda */}
          <svg className="absolute -top-1 -left-1 w-20 h-20 pointer-events-none opacity-70 z-10" viewBox="0 0 100 100" fill="none">
            <path d="M0,0 L100,0 M0,0 L85,45 M0,0 L65,75 M0,0 L0,100" stroke="#ff7300" strokeWidth="1.5" />
            <path d="M25,0 Q22,12 18,22 Q12,24 0,25" stroke="#ff7300" strokeWidth="1" opacity="0.6" />
            <path d="M50,0 Q45,24 35,42 Q22,46 0,50" stroke="#ff7300" strokeWidth="1" opacity="0.6" />
            <path d="M75,0 Q67,36 52,62 Q33,68 0,75" stroke="#ff7300" strokeWidth="1" opacity="0.6" />
          </svg>

          {/* Telaraña esquina derecha */}
          <svg className="absolute -top-1 -right-1 w-20 h-20 pointer-events-none opacity-70 z-10 scale-x-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M0,0 L100,0 M0,0 L85,45 M0,0 L65,75 M0,0 L0,100" stroke="#ff7300" strokeWidth="1.5" />
            <path d="M25,0 Q22,12 18,22 Q12,24 0,25" stroke="#ff7300" strokeWidth="1" opacity="0.6" />
            <path d="M50,0 Q45,24 35,42 Q22,46 0,50" stroke="#ff7300" strokeWidth="1" opacity="0.6" />
          </svg>

          {/* Murciélagos volando en el header */}
          <div className="absolute -top-5 left-10 pointer-events-none z-20 animate-bounce" style={{ animationDuration: "3s" }}>
            <svg width="34" height="20" viewBox="0 0 100 60" fill="#2d1300">
              <path d="M50 35 C40 10 20 0 0 15 C10 32 22 34 32 45 C42 42 46 38 50 35 C54 38 58 42 68 45 C78 34 90 32 100 15 C80 0 60 10 50 35 Z" fill="#ff7300" />
            </svg>
          </div>

          <div className="absolute -top-4 right-16 pointer-events-none z-20">
            <svg width="26" height="16" viewBox="0 0 100 60" fill="#ff9e00" opacity="0.85">
              <path d="M50 35 C40 10 20 0 0 15 C10 32 22 34 32 45 C42 42 46 38 50 35 C54 38 58 42 68 45 C78 34 90 32 100 15 C80 0 60 10 50 35 Z" />
            </svg>
          </div>
        </>
      );

    case "dia_muertos":
      return (
        <>
          {/* Guirnalda de Papel Picado calado estilo mexicano */}
          <div className="absolute -top-3.5 left-4 right-14 flex justify-between items-start pointer-events-none z-20">
            {/* Banderín 1: Naranja Cempasúchil */}
            <div className="w-8 h-7 bg-amber-500 rounded-b-md shadow-md flex items-center justify-center text-[11px] text-zinc-950 font-black border-t-2 border-amber-300 transform -rotate-3">
              💀
            </div>
            {/* Banderín 2: Rosa Mexicano / Magenta */}
            <div className="w-8 h-7 bg-pink-600 rounded-b-md shadow-md flex items-center justify-center text-[11px] text-white font-black border-t-2 border-pink-400 transform rotate-2">
              🌸
            </div>
            {/* Banderín 3: Morado Altar */}
            <div className="w-8 h-7 bg-purple-700 rounded-b-md shadow-md flex items-center justify-center text-[11px] text-amber-300 font-black border-t-2 border-purple-400 transform -rotate-2">
              🕯️
            </div>
            {/* Banderín 4: Amarillo Dorado */}
            <div className="w-8 h-7 bg-yellow-400 rounded-b-md shadow-md flex items-center justify-center text-[11px] text-zinc-900 font-black border-t-2 border-yellow-200 transform rotate-3">
              ✨
            </div>
          </div>

          {/* Calaverita de Azúcar decorada SVG en el header izquierdo */}
          <div className="absolute top-2 left-2 pointer-events-none z-10 opacity-85">
            <svg width="28" height="32" viewBox="0 0 32 36" fill="none">
              <path d="M16 2 C8 2 3 7 3 16 C3 22 5 26 8 28 L8 34 C8 35 9 36 10 36 L22 36 C23 36 24 35 24 34 L24 28 C27 26 29 22 29 16 C29 7 24 2 16 2 Z" fill="#fff7ed" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="11" cy="15" r="4" fill="#ec4899" />
              <circle cx="11" cy="15" r="2" fill="#1b1b23" />
              <circle cx="21" cy="15" r="4" fill="#ec4899" />
              <circle cx="21" cy="15" r="2" fill="#1b1b23" />
              <path d="M16 19 L14.5 22 L17.5 22 Z" fill="#f59e0b" />
              <line x1="12" y1="31" x2="12" y2="34" stroke="#1b1b23" strokeWidth="1.2" />
              <line x1="16" y1="31" x2="16" y2="34" stroke="#1b1b23" strokeWidth="1.2" />
              <line x1="20" y1="31" x2="20" y2="34" stroke="#1b1b23" strokeWidth="1.2" />
              <circle cx="16" cy="8" r="2" fill="#f59e0b" />
            </svg>
          </div>

          {/* Flores de Cempasúchil flotantes y cirio encendido */}
          <div className="absolute top-2 right-14 text-amber-400 text-lg pointer-events-none drop-shadow-md">
            🌼
          </div>
          <div className="absolute bottom-3 left-3 text-amber-500 text-base pointer-events-none drop-shadow">
            🌼
          </div>
          <div className="absolute bottom-2 right-3 text-lg pointer-events-none animate-pulse" style={{ animationDuration: "2.5s" }}>
            🕯️
          </div>
        </>
      );

    case "navidad":
      return (
        <>
          {/* Ramas de pino y esferas en el borde superior */}
          <div className="absolute -top-3 left-4 flex gap-1 z-20 pointer-events-none text-2xl">
            <span>🎄</span>
            <span className="text-sm">✨</span>
          </div>
          <div className="absolute -top-3 right-16 flex gap-1 z-20 pointer-events-none text-2xl">
            <span className="text-sm">✨</span>
            <span>🔔</span>
          </div>

          {/* Nieve decorativa en esquinas */}
          <div className="absolute top-2 left-2 text-emerald-300/40 text-lg pointer-events-none">❄️</div>
          <div className="absolute top-3 right-8 text-emerald-300/40 text-sm pointer-events-none">❄️</div>
          <div className="absolute bottom-2 right-3 text-emerald-300/30 text-lg pointer-events-none">❄️</div>
        </>
      );

    case "ano_nuevo":
      return (
        <>
          <div className="absolute -top-4 left-6 pointer-events-none text-2xl z-20">🍾</div>
          <div className="absolute -top-3 right-14 pointer-events-none text-2xl z-20">🎉</div>
          <div className="absolute top-3 left-2 text-amber-300/60 text-lg pointer-events-none">⭐</div>
          <div className="absolute bottom-3 right-4 text-amber-300/50 text-xl pointer-events-none">✨</div>
        </>
      );

    case "dia_reyes":
      return (
        <>
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 pointer-events-none">
            <span className="text-2xl drop-shadow-lg">👑</span>
            <span className="text-lg">⭐</span>
            <span className="text-2xl drop-shadow-lg">👑</span>
          </div>
          <div className="absolute top-3 left-3 text-amber-300/60 text-sm pointer-events-none">✨</div>
          <div className="absolute top-3 right-12 text-amber-300/60 text-sm pointer-events-none">🎁</div>
        </>
      );

    case "dia_madre":
      return (
        <>
          <div className="absolute -top-3 left-6 flex items-center gap-1.5 z-20 pointer-events-none text-xl">
            <span>🌸</span>
            <span>🦋</span>
          </div>
          <div className="absolute -top-3 right-14 flex items-center gap-1.5 z-20 pointer-events-none text-xl">
            <span>🌺</span>
            <span>💐</span>
          </div>
          <div className="absolute bottom-3 right-3 text-rose-300/40 text-lg pointer-events-none">💖</div>
        </>
      );

    case "dia_nino":
      return (
        <>
          <div className="absolute -top-4 left-8 pointer-events-none text-2xl z-20">🎈</div>
          <div className="absolute -top-4 right-14 pointer-events-none text-2xl z-20">🚀</div>
          <div className="absolute top-2 left-2 text-cyan-300/60 text-sm pointer-events-none">⭐</div>
          <div className="absolute bottom-3 right-3 text-pink-400/60 text-lg pointer-events-none">🍭</div>
        </>
      );

    case "dia_maestro":
      return (
        <>
          <div className="absolute -top-3 left-6 pointer-events-none text-2xl z-20">🍎</div>
          <div className="absolute -top-3 right-14 pointer-events-none text-2xl z-20">📚</div>
          <div className="absolute top-3 left-2 text-amber-300/50 text-sm pointer-events-none">✏️</div>
          <div className="absolute bottom-3 right-3 text-amber-300/50 text-base pointer-events-none">🎓</div>
        </>
      );

    default:
      return (
        <>
          <div className="absolute -top-3 left-6 pointer-events-none text-xl z-20">💎</div>
          <div className="absolute -top-3 right-14 pointer-events-none text-xl z-20">✨</div>
        </>
      );
  }
}
