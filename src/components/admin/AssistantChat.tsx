"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
interface SpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event { error: string; }
interface SpeechRecognitionResultList { [index: number]: SpeechRecognitionResult; length: number; }
interface SpeechRecognitionResult { [index: number]: SpeechRecognitionAlternative; isFinal: boolean; }
interface SpeechRecognitionAlternative { transcript: string; confidence: number; }

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "¡Hola! Soy tu asistente de pedidos. Dime qué necesitas — puedo registrar pedidos, anotar pagos y actualizar estados. 😊" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [interimText, setInterimText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const handsFreeRef = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    setHasSpeech(typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window));
  }, []);

  useEffect(() => { handsFreeRef.current = handsFree; }, [handsFree]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  // Quita asteriscos, guiones de lista y otros símbolos markdown para que TTS no los lea
  function stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/^[-*•]\s+/gm, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // Selecciona la mejor voz femenina en español disponible en el dispositivo
  function pickFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const priority = [
      // Google voices (más naturales en Android Chrome)
      (v: SpeechSynthesisVoice) => v.lang === "es-MX" && v.name.toLowerCase().includes("google"),
      (v: SpeechSynthesisVoice) => v.lang === "es-US" && v.name.toLowerCase().includes("google"),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("es") && v.name.toLowerCase().includes("google"),
      // Voces femeninas por nombre (iOS: Siri, Paulina, Monica; Windows: Sabina)
      (v: SpeechSynthesisVoice) => v.lang.startsWith("es") && /sabina|paulina|monica|lucia|laura|female/i.test(v.name),
      // Cualquier voz es-MX
      (v: SpeechSynthesisVoice) => v.lang === "es-MX",
      // Cualquier voz en español
      (v: SpeechSynthesisVoice) => v.lang.startsWith("es"),
    ];
    for (const match of priority) {
      const found = voices.find(match);
      if (found) return found;
    }
    return null;
  }

  function speakText(text: string) {
    if (!handsFreeRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // Pausar el micrófono mientras habla el asistente — evita que se grabe a sí mismo
    try { recognitionRef.current?.stop(); } catch { /* ignorar */ }

    window.speechSynthesis.cancel();
    const clean = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "es-MX";
    utterance.rate = 1.0;
    utterance.pitch = 1.15; // voz más femenina y natural

    const voice = pickFemaleVoice();
    if (voice) utterance.voice = voice;

    // Reiniciar el micrófono DESPUÉS de que termina de hablar
    utterance.onend = () => {
      if (handsFreeRef.current) {
        setTimeout(() => {
          if (handsFreeRef.current) startHandsFreeRecognition();
        }, 400); // pequeña pausa para que el audio se estabilice
      }
    };

    utterance.onerror = () => {
      if (handsFreeRef.current) startHandsFreeRecognition();
    };

    window.speechSynthesis.speak(utterance);
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setInput("");
    setInterimText("");

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => {
      const next = [...prev, userMsg];

      const apiMessages = next
        .filter((_, i) => !(i === 0 && next[0].role === "assistant"))
        .map((m) => ({ role: m.role, content: m.content }));

      fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })
        .then((r) => r.json())
        .then((data) => {
          const response = data.response ?? "No pude procesar tu solicitud.";
          setMessages((p) => [...p, { role: "assistant", content: response }]);
          speakText(response);
        })
        .catch(() => {
          setMessages((p) => [...p, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]);
        })
        .finally(() => {
          loadingRef.current = false;
          setLoading(false);
        });

      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startHandsFreeRecognition() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "es-MX";
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setInterimText(interim);
      if (final && !loadingRef.current) {
        sendMessage(final);
      }
    };

    r.onerror = (e) => {
      if (e.error !== "no-speech") {
        setRecording(false);
        setHandsFree(false);
        handsFreeRef.current = false;
        setInterimText("");
      }
    };

    r.onend = () => {
      if (handsFreeRef.current && !loadingRef.current) {
        // Solo reiniciar si no estamos esperando respuesta de Claude ni hablando el TTS
        try { r.start(); } catch { /* ya corriendo */ }
      } else if (!handsFreeRef.current) {
        setRecording(false);
        setInterimText("");
      }
      // Si loadingRef.current=true, el mic se reiniciará desde utterance.onend
    };

    r.start();
    recognitionRef.current = r;
    setRecording(true);
  }

  function toggleHandsFree() {
    if (handsFree) {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      setHandsFree(false);
      handsFreeRef.current = false;
      setRecording(false);
      setInterimText("");
    } else {
      setHandsFree(true);
      handsFreeRef.current = true;
      startHandsFreeRecognition();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  // Modo normal: press-and-hold
  function startRecording() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "es-MX";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => { setInput(e.results[0][0].transcript); };
    r.onerror = () => setRecording(false);
    r.onend = () => setRecording(false);
    r.start();
    recognitionRef.current = r;
    setRecording(true);
  }
  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  function clearHistory() {
    setMessages([{ role: "assistant", content: "¡Hola de nuevo! ¿En qué te ayudo?" }]);
  }

  const displayText = interimText || input;

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          open ? "bg-surface-container text-on-surface border border-outline-variant" : "bg-primary text-on-primary"
        }`}
        title="Asistente IA"
      >
        <span className="material-symbol" style={{ fontSize: 24 }}>
          {open ? "close" : "smart_toy"}
        </span>
      </button>

      {/* Panel de chat */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-40 w-full max-w-sm bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col"
          style={{ height: "min(540px, calc(100vh - 140px))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-outline-variant shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbol text-primary" style={{ fontSize: 18 }}>smart_toy</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface">Asistente Diamy</p>
              <p className="text-xs text-on-surface-muted">Claude · Responde en español</p>
            </div>
            {/* Toggle manos libres */}
            {hasSpeech && (
              <button
                onClick={toggleHandsFree}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  handsFree
                    ? "bg-red-500 text-white"
                    : "bg-surface-container text-on-surface-muted hover:bg-primary/10"
                }`}
                title={handsFree ? "Desactivar manos libres" : "Activar manos libres"}
              >
                <span className={`material-symbol ${handsFree ? "animate-pulse" : ""}`} style={{ fontSize: 14 }}>
                  {handsFree ? "mic" : "mic_none"}
                </span>
                {handsFree ? "Activo" : "Manos libres"}
              </button>
            )}
            <button onClick={clearHistory} className="text-on-surface-muted hover:text-on-surface shrink-0" title="Limpiar conversación">
              <span className="material-symbol" style={{ fontSize: 18 }}>restart_alt</span>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-on-primary rounded-br-sm"
                    : "bg-surface-container text-on-surface rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-container rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-on-surface-muted rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-outline-variant px-3 py-2.5 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={displayText}
                onChange={(e) => {
                  if (!handsFree) {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                  }
                }}
                onKeyDown={handleKeyDown}
                readOnly={handsFree}
                placeholder={
                  handsFree
                    ? recording ? "Escuchando... habla con naturalidad" : "Iniciando micrófono..."
                    : "Escribe o mantén el micrófono..."
                }
                className={`flex-1 resize-none bg-surface-container rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[36px] max-h-20 leading-relaxed ${
                  interimText ? "text-on-surface-muted italic" : "text-on-surface"
                } ${handsFree ? "cursor-default" : ""}`}
                style={{ height: 36 }}
                disabled={loading && !handsFree}
              />
              {/* Mic press-and-hold — solo en modo normal */}
              {hasSpeech && !handsFree && (
                <button
                  onMouseDown={startRecording} onMouseUp={stopRecording}
                  onTouchStart={startRecording} onTouchEnd={stopRecording}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    recording ? "bg-red-500 text-white scale-110" : "bg-surface-container text-on-surface-muted hover:bg-primary/10"
                  }`}
                  title="Mantén pulsado para hablar"
                >
                  <span className="material-symbol" style={{ fontSize: 18 }}>
                    {recording ? "mic" : "mic_none"}
                  </span>
                </button>
              )}
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || (!input.trim() && !interimText)}
                className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 hover:opacity-90 disabled:opacity-40"
              >
                <span className="material-symbol" style={{ fontSize: 18 }}>send</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-muted mt-1.5 text-center">
              {handsFree
                ? "🎙 Habla con naturalidad — envía al pausar · responde en voz alta"
                : "Enter para enviar · Mantén 🎙 para hablar"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
