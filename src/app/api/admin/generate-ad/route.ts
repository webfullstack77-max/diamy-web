import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { imageUrl, productName, tone } = await request.json();

  if (!productName) {
    return NextResponse.json({ error: "Nombre de producto requerido" }, { status: 400 });
  }

  const content: Anthropic.MessageParam["content"] = [];

  // Agregar imagen si se proporcionó
  if (imageUrl) {
    try {
      if (imageUrl.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", imageUrl);
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
      } else if (imageUrl.startsWith("http")) {
        content.push({
          type: "image",
          source: { type: "url", url: imageUrl },
        });
      }
    } catch {
      // Continuar sin imagen si falla
    }
  }

  const toneMap: Record<string, string> = {
    promocional: "promocional (enfocado en precio/oferta y valor del producto)",
    festivo: "festivo y celebratorio (ideal para fechas especiales como cumpleaños, día de la madre, etc.)",
    informativo: "informativo y descriptivo (explica el producto con detalle)",
  };

  content.push({
    type: "text",
    text: `Eres experto en marketing para pequeñas empresas mexicanas.
Genera un anuncio para redes sociales sobre este producto: "${productName}".
${content.length > 1 ? "Analiza la imagen del producto para enriquecer el anuncio." : ""}
Tono: ${toneMap[tone] || "promocional"}.

Reglas:
- Máximo 150 palabras
- Informal y cercano, tutea al cliente
- Incluye una llamada a la acción clara (ej: "¡Escríbenos!", "Pide el tuyo")
- Al final agrega exactamente 5 hashtags relevantes en español, precedidos de una línea en blanco
- NO uses emojis

Solo responde el texto del anuncio listo para publicar, sin explicaciones ni títulos adicionales.`,
  });

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[generate-ad] Anthropic error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  // Separar caption y hashtags
  const lines = text.split("\n");
  const hashtagLineIdx = lines.findIndex((l) => l.trim().startsWith("#"));
  let caption = text;
  let hashtags = "";

  if (hashtagLineIdx > 0) {
    caption = lines.slice(0, hashtagLineIdx).join("\n").trim();
    hashtags = lines.slice(hashtagLineIdx).join(" ").trim();
  }

  return NextResponse.json({ caption, hashtags });
}
