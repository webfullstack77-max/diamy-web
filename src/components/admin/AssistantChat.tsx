"use client";

import { useState, useRef, useEffect } from "react";

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
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
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

  useEffect(() => {
    setHasSpeech(typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window));
  }, []);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    // Convertir a formato Anthropic (solo los mensajes sin el inicial del asistente si es el primer mensaje)
    const apiMessages = next
      .filter((_, i) => !(i === 0 && next[0].role === "assistant")) // quitar saludo inicial si es el primero
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response ?? "No pude procesar tu solicitud." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function startRecording() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "es-MX";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
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
        <div className="fixed bottom-24 right-4 z-40 w-full max-w-sm bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col"
          style={{ height: "min(520px, calc(100vh - 140px))" }}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-outline-variant shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbol text-primary" style={{ fontSize: 18 }}>smart_toy</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">Asistente Diamy</p>
              <p className="text-xs text-on-surface-muted">Claude · Responde en español</p>
            </div>
            <button onClick={clearHistory} className="text-on-surface-muted hover:text-on-surface" title="Limpiar conversación">
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
                value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px"; }}
                onKeyDown={handleKeyDown}
                placeholder="Escribe o mantén el micrófono..."
                className="flex-1 resize-none bg-surface-container rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[36px] max-h-20 leading-relaxed"
                style={{ height: 36 }}
                disabled={loading}
              />
              {/* Mic button */}
              {hasSpeech ? (
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
              ) : null}
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 hover:opacity-90 disabled:opacity-40"
              >
                <span className="material-symbol" style={{ fontSize: 18 }}>send</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-muted mt-1.5 text-center">
              Enter para enviar · Mantén 🎙 para hablar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
