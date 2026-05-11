import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Charlotte — multilingual v2, suena natural en español mexicano
const VOICE_ID = "XB0fDUnXU5powFXDhCwa";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { text } = await req.json().catch(() => ({ text: "" }));
  if (!text?.trim()) return NextResponse.json({ error: "No text" }, { status: 400 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // Sin API key → 404 para que el frontend use fallback Web Speech
    return NextResponse.json({ error: "ElevenLabs no configurado" }, { status: 404 });
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: text.slice(0, 500),
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.80, style: 0.15, use_speaker_boost: true },
      }),
    }
  );

  if (!res.ok) {
    console.error("ElevenLabs error:", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "ElevenLabs error" }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
