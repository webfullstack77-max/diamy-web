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
  const [hasMic, setHasMic] = useState(false);
  const [pendingTts, setPendingTts] = useState<ArrayBuffer | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const handsFreeRef = useRef(false);
  const loadingRef = useRef(false);
  const speakingRef = useRef(false); // true mientras el TTS está reproduciendo — bloquea restart del mic

  useEffect(() => {
    const hasSR = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setHasSpeech(hasSR);
    setHasMic(hasSR);
  }, []);

  useEffect(() => { handsFreeRef.current = handsFree; }, [handsFree]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      try { sourceNodeRef.current?.stop(); } catch { /* ignorar */ }
      audioRef.current?.pause();
      audioCtxRef.current?.close();
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

  async function speakText(text: string) {
    if (!handsFreeRef.current || typeof window === "undefined") return;

    speakingRef.current = true;
    // Solo detener mic si está disponible
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignorar */ }
    }
    window.speechSynthesis?.cancel();

    const clean = stripMarkdown(text);

    const restartMic = () => {
      speakingRef.current = false;
      if (handsFreeRef.current) {
        setTimeout(() => { if (handsFreeRef.current) startHandsFreeRecognition(); }, 400);
      }
    };

    // iOS bloquea todo audio.play() desde contexto async sin importar el workaround —
    // detectar explícitamente y usar siempre el tap button en lugar de intentar auto-play
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    try {
      const res = await fetch("/api/admin/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean }),
      });
      if (!res.ok) throw new Error("no-elevenlabs");

      const arrayBuffer = await res.arrayBuffer();

      if (isIOS) {
        // En iOS no intentamos auto-play — guardamos para que el usuario toque el botón
        setPendingTts(arrayBuffer);
        return; // speakingRef sigue true; mic reinicia después del tap
      }

      // Desktop / Android: AudioContext → HTMLAudioElement → speechSynthesis
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state !== "closed") {
        try {
          await ctx.resume();
          if (ctx.state === "running") {
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            sourceNodeRef.current = source;
            source.addEventListener("ended", () => { sourceNodeRef.current = null; restartMic(); });
            source.start();
            return;
          }
        } catch { /* probar HTMLAudioElement */ }
      }

      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; restartMic(); };
      audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; restartMic(); };
      await audio.play();
      return;
    } catch { /* ElevenLabs no disponible o auto-play falló */ }

    // Fallback: Web Speech API
    if (!("speechSynthesis" in window)) { restartMic(); return; }
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "es-MX";
    utterance.rate = 1.1;
    utterance.pitch = 1.1;
    const voice = pickFemaleVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = restartMic;
    utterance.onerror = restartMic;
    window.speechSynthesis.speak(utterance);
  }

  // Reproducir audio pendiente desde gesto del usuario (único método que iOS permite)
  function playPendingTts() {
    const buffer = pendingTts;
    if (!buffer) return;
    setPendingTts(null);
    const blob = new Blob([buffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url); // nuevo elemento creado dentro del gesto → iOS lo permite
    audioRef.current = audio;
    const done = () => {
      URL.revokeObjectURL(url);
      audioRef.current = null;
      speakingRef.current = false;
      if (handsFreeRef.current) {
        setTimeout(() => { if (handsFreeRef.current) startHandsFreeRecognition(); }, 400);
      }
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
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
      // "no-speech": silencio normal. "aborted": ocurre cuando .stop() se llama explícitamente (p.ej. antes de TTS).
      // Ninguno de los dos debe matar el modo manos libres.
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setRecording(false);
        setHandsFree(false);
        handsFreeRef.current = false;
        setInterimText("");
      }
    };

    r.onend = () => {
      if (handsFreeRef.current && !loadingRef.current && !speakingRef.current) {
        startHandsFreeRecognition();
      } else if (!handsFreeRef.current) {
        setRecording(false);
        setInterimText("");
      }
      // Si speakingRef.current=true, el mic se reiniciará desde audio.onended
    };

    r.start();
    recognitionRef.current = r;
    setRecording(true);
  }

  function toggleHandsFree() {
    if (handsFree) {
      recognitionRef.current?.stop();
      try { sourceNodeRef.current?.stop(); } catch { /* ignorar */ }
      sourceNodeRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
      speakingRef.current = false;
      setPendingTts(null);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      setHandsFree(false);
      handsFreeRef.current = false;
      setRecording(false);
      setInterimText("");
    } else {
      if (typeof window !== "undefined") {
        // Unlock 1: AudioContext — desbloquear durante gesto para poder usar decodeAudioData después
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AC) {
          if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
            audioCtxRef.current = new AC();
          }
          audioCtxRef.current.resume();
        }

        // Unlock 2: HTMLAudioElement — patrón más confiable en iOS PWA
        // Llamar play() con src vacío durante el gesto; falla silenciosamente pero desbloquea el elemento
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.play().catch(() => {});
      }
      setHandsFree(true);
      handsFreeRef.current = true;
      // Iniciar mic solo si está disponible (no en iOS PWA sin SpeechRecognition)
      if (hasMic) startHandsFreeRecognition();
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
      {/* Botón flotante — posicionado sobre el bottom nav móvil */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed right-4 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          open ? "bg-surface-container text-on-surface border border-outline-variant" : "bg-primary text-on-primary"
        }`}
        style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
        title="Asistente IA"
      >
        <span className="material-symbol" style={{ fontSize: 24 }}>
          {open ? "close" : "smart_toy"}
        </span>
      </button>

      {/* Panel de chat */}
      {open && (
        <div
          className="fixed right-4 z-40 w-full max-w-sm bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col"
          style={{
            bottom: "calc(9rem + env(safe-area-inset-bottom, 0px))",
            height: "min(520px, calc(100vh - 200px))",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-outline-variant shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbol text-primary" style={{ fontSize: 18 }}>smart_toy</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface">Asistente Diamy</p>
              <p className="text-xs text-on-surface-muted">Claude + ElevenLabs · Responde en español</p>
            </div>
            {/* Toggle voz — siempre visible; mic solo si disponible */}
            <button
              onClick={toggleHandsFree}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                handsFree
                  ? "bg-red-500 text-white"
                  : "bg-surface-container text-on-surface-muted hover:bg-primary/10"
              }`}
              title={handsFree ? "Desactivar voz" : "Activar voz"}
            >
              <span className={`material-symbol ${handsFree ? "animate-pulse" : ""}`} style={{ fontSize: 14 }}>
                {handsFree ? (hasMic ? "mic" : "volume_up") : (hasMic ? "mic_none" : "volume_off")}
              </span>
              {handsFree ? "Activo" : "Voz"}
            </button>
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

          {/* Tap-to-play — aparece en iOS cuando el autoplay es bloqueado */}
          {pendingTts && (
            <div className="border-t border-orange-200 bg-orange-50 px-3 py-2 shrink-0">
              <button
                onClick={playPendingTts}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold active:scale-95 transition-all"
              >
                <span className="material-symbol" style={{ fontSize: 20 }}>volume_up</span>
                Toca para escuchar la respuesta
              </button>
            </div>
          )}

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
                    ? hasMic
                      ? recording ? "Escuchando... habla con naturalidad" : "Iniciando micrófono..."
                      : "Voz activa — escribe y escucha las respuestas"
                    : "Escribe o mantén el micrófono..."
                }
                className={`flex-1 resize-none bg-surface-container rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[36px] max-h-20 leading-relaxed ${
                  interimText ? "text-on-surface-muted italic" : "text-on-surface"
                } ${handsFree ? "cursor-default" : ""}`}
                style={{ height: 36 }}
                disabled={loading && !handsFree}
              />
              {/* Mic press-and-hold — solo en modo normal y si hay mic */}
              {hasMic && !handsFree && (
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
                ? hasMic
                  ? "Habla con naturalidad — envía al pausar · responde en voz alta"
                  : "Escribe tu mensaje — las respuestas se escuchan en voz alta"
                : "Enter para enviar · Mantén el mic para hablar"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
