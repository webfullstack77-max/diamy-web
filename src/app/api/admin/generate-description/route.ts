import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getMediaType(url: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { title, images } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Título requerido" }, { status: 400 });
  }

  const content: Anthropic.MessageParam["content"] = [];

  // Agregar hasta 4 imágenes como base64
  const imageUrls: string[] = (images ?? []).slice(0, 4);
  for (const url of imageUrls) {
    try {
      if (url.startsWith("/uploads/")) {
        // Imagen local → redimensionar y encodear como base64
        const filePath = path.join(process.cwd(), "public", url);
        if (fs.existsSync(filePath)) {
          const resized = await sharp(filePath)
            .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
          const data = resized.toString("base64");
          content.push({
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data },
          });
        }
      } else if (url.startsWith("http")) {
        // URL externa → usar directamente
        content.push({
          type: "image",
          source: { type: "url", url },
        });
      }
    } catch {
      // Si falla una imagen, continuar con las demás
    }
  }

  content.push({
    type: "text",
    text: `Eres un experto en copywriting para tiendas de productos personalizados en México.
Genera una descripción de producto atractiva en español para:

Producto: "${title}"
${content.length > 1 ? "Analiza las imágenes para describir el producto con precisión." : ""}

Requisitos:
- Máximo 3 oraciones cortas
- Menciona que es personalizable
- Tono cálido y cercano, dirigido a compradores mexicanos
- NO uses emojis
- NO menciones precios
- Termina con una frase que invite a pedir su diseño personalizado

Solo devuelve la descripción, sin títulos ni explicaciones adicionales.`,
  });

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[generate-description] Anthropic error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const description = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  return NextResponse.json({ description });
}
