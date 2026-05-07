"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "523211144447";

type Step =
  | "main_menu"
  | "cotizacion_tipo"
  | "catalogo"
  | "tiempos"
  | "materiales"
  | "diseno"
  | "transfer"
  | "out_of_hours"
  | "done";

interface Msg {
  from: "bot" | "user";
  text: string;
}

interface Btn {
  label: string;
  userText: string;
  next: Step | "wa" | "catalogo_url";
  waContext?: string;
}

function getMexicoHour(): number {
  return parseInt(
    new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Mexico_City",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  );
}

function getGreeting(hour: number): string {
  if (hour >= 6 && hour < 12) return "¡Buenos días!";
  if (hour >= 12 && hour < 19) return "¡Buenas tardes!";
  return "¡Buenas noches!";
}

function buildWaUrl(context: string): string {
  const text = `Hola Diamy, vengo del chat de su sitio web. Me interesa: ${context}`;
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;
}

function renderText(text: string): string {
  return text
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

const FLOW: Record<Step, { text: string; buttons: Btn[] }> = {
  main_menu: {
    text: "¿En qué te puedo ayudar hoy?",
    buttons: [
      { label: "💰 Cotización", userText: "Quiero una cotización", next: "cotizacion_tipo" },
      { label: "📦 Ver catálogo", userText: "Quiero ver el catálogo", next: "catalogo" },
      { label: "⏱ Tiempo de entrega", userText: "¿Cuánto tiempo tardan?", next: "tiempos" },
      { label: "🛠 Materiales", userText: "¿Con qué materiales trabajan?", next: "materiales" },
      { label: "🎨 Diseño personalizado", userText: "Quiero un diseño personalizado", next: "diseno" },
    ],
  },
  cotizacion_tipo: {
    text: "¡Con gusto te cotizamos! ¿Qué tipo de producto te interesa?",
    buttons: [
      { label: "👕 Playeras", userText: "Playeras estampadas", next: "transfer", waContext: "cotización de Playeras estampadas" },
      { label: "🎨 Acrílico", userText: "Acrílico grabado/cortado", next: "transfer", waContext: "cotización de Acrílico grabado o cortado" },
      { label: "🪵 MDF", userText: "MDF", next: "transfer", waContext: "cotización de MDF" },
      { label: "☕ Tazas", userText: "Tazas personalizadas", next: "transfer", waContext: "cotización de Tazas personalizadas" },
      { label: "🏷 Stickers / Vinil", userText: "Stickers o Vinil", next: "transfer", waContext: "cotización de Stickers o Vinil" },
      { label: "📦 Otro producto", userText: "Otro producto", next: "transfer", waContext: "cotización de un producto" },
    ],
  },
  catalogo: {
    text: "Puedes ver todos nuestros productos en el catálogo del sitio. ¿Te gustaría que te transfiera con ventas para una asesoría personalizada?",
    buttons: [
      { label: "🌐 Abrir catálogo", userText: "Abrir el catálogo", next: "catalogo_url" },
      { label: "💬 Hablar con ventas", userText: "Quiero hablar con ventas", next: "transfer", waContext: "ver el catálogo y recibir asesoría personalizada" },
      { label: "🔙 Menú principal", userText: "Regresar al menú", next: "main_menu" },
    ],
  },
  tiempos: {
    text: "Nuestros tiempos de entrega estimados:\n• Acrílico grabado: 3–5 días hábiles\n• Playeras: 5–7 días\n• Tazas: 3–4 días\n• MDF: 3–5 días\n\n¿Necesitas algo más?",
    buttons: [
      { label: "💬 Hablar con ventas", userText: "Quiero hablar con ventas", next: "transfer", waContext: "tiempos de entrega y disponibilidad" },
      { label: "🔙 Menú principal", userText: "Regresar al menú", next: "main_menu" },
    ],
  },
  materiales: {
    text: "Trabajamos con:\n🔷 Acrílico (transparente, de colores, espejo)\n🪵 MDF (madera)\n👕 Playeras de algodón\n☕ Tazas de cerámica\n🏷 Stickers y vinil",
    buttons: [
      { label: "💬 Consultar con ventas", userText: "Quiero consultar con ventas", next: "transfer", waContext: "información sobre materiales y opciones disponibles" },
      { label: "🔙 Menú principal", userText: "Regresar al menú", next: "main_menu" },
    ],
  },
  diseno: {
    text: "¡Nos encanta crear diseños únicos! ¿Ya tienes un diseño listo o necesitas que te ayudemos a crearlo?",
    buttons: [
      { label: "✅ Tengo mi diseño", userText: "Ya tengo mi diseño listo", next: "transfer", waContext: "diseño personalizado (tiene su propio diseño listo)" },
      { label: "🎨 Necesito ayuda con el diseño", userText: "Necesito ayuda con el diseño", next: "transfer", waContext: "diseño personalizado (necesita ayuda para crear el diseño)" },
    ],
  },
  transfer: {
    text: "¡Perfecto! En un momento te comunicamos con nuestro equipo de ventas. 😊",
    buttons: [],
  },
  out_of_hours: {
    text: "",
    buttons: [
      { label: "📩 Dejar mensaje en WhatsApp", userText: "Dejar mi mensaje", next: "wa", waContext: "una consulta general" },
    ],
  },
  done: { text: "", buttons: [] },
};

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState<Step>("main_menu");
  const [waContext, setWaContext] = useState("una consulta");
  const [inBusinessHours, setInBusinessHours] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Init conversation on open
  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;

    const hour = getMexicoHour();
    const g = getGreeting(hour);
    const inHours = hour >= 9 && hour < 18;
    setInBusinessHours(inHours);

    if (inHours) {
      setMsgs([
        { from: "bot", text: `${g} 👋 Bienvenido a *Diamy Laser Cut*. ¿En qué te puedo ayudar hoy?` },
      ]);
      setStep("main_menu");
    } else {
      setMsgs([
        {
          from: "bot",
          text: `${g} 👋 Nuestro horario de atención es *lunes a sábado de 9 AM a 6 PM*. ¿Deseas dejarnos tu mensaje y te respondemos en cuanto abramos?`,
        },
      ]);
      setStep("out_of_hours");
    }
  }, [open]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  function handleButton(btn: Btn) {
    const userMsg: Msg = { from: "user", text: btn.userText };

    if (btn.next === "wa") {
      setMsgs((prev) => [...prev, userMsg]);
      window.open(buildWaUrl(btn.waContext ?? waContext), "_blank");
      return;
    }

    if (btn.next === "catalogo_url") {
      setMsgs((prev) => [...prev, userMsg]);
      window.open("/catalogo", "_blank");
      return;
    }

    if (btn.next === "transfer") {
      const ctx = btn.waContext ?? waContext;
      setWaContext(ctx);
      setMsgs((prev) => [
        ...prev,
        userMsg,
        { from: "bot", text: FLOW.transfer.text },
      ]);
      setStep("done");
      return;
    }

    // Normal step transition
    const nextStep = btn.next as Step;
    setMsgs((prev) => [
      ...prev,
      userMsg,
      { from: "bot", text: FLOW[nextStep].text },
    ]);
    setStep(nextStep);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setMsgs([]);
      setStep("main_menu");
      setWaContext("una consulta");
    }, 300);
  }

  const buttons = step !== "done" ? (FLOW[step]?.buttons ?? []) : [];

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end">
      {/* Chat window */}
      <div
        className={`mb-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxHeight: "520px" }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: "#25D366" }}>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            {WA_ICON}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">Diamy Laser Cut</p>
            <p className="text-white/80 text-xs">
              {inBusinessHours ? "En línea · Respondemos de inmediato" : "Fuera de horario · 9 AM–6 PM"}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar chat"
            className="w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-2.5"
          style={{ background: "#ece5dd" }}
        >
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.from === "user"
                    ? "bg-[#dcf8c6] text-gray-800 rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-tl-sm"
                }`}
                // Bot text uses *bold* and \n — controlled content, safe to render as HTML
                dangerouslySetInnerHTML={{ __html: renderText(m.text) }}
              />
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick-reply buttons */}
        {buttons.length > 0 && (
          <div className="p-3 border-t border-gray-100 bg-white shrink-0 flex flex-wrap gap-2">
            {buttons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleButton(btn)}
                className="px-3 py-1.5 rounded-full border border-[#25D366] text-[#25D366] text-xs font-semibold hover:bg-[#25D366] hover:text-white transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Transfer CTA — shown after conversation ends */}
        {step === "done" && (
          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            <a
              href={buildWaUrl(waContext)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-white text-sm font-bold transition hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              {WA_ICON}
              Continuar en WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Chatear por WhatsApp"}
        className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg hover:scale-110 transition-all duration-200"
        style={{ background: open ? "#1ebe57" : "#25D366" }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          WA_ICON
        )}
      </button>
    </div>
  );
}
