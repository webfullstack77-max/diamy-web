import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import Replicate from "replicate";
import { requireAdmin } from "@/lib/auth";

// Modelo por defecto: SegFormer B2 Clothes
// Ver lista de modelos: https://replicate.com/explore?type=image-to-image&query=clothes
const DEFAULT_MODEL =
  "mattmdjaga/segformer_b2_clothes:1d0ff7eb91f12bce75ab6f8f5a0e3f1c0e5b4e7a4f1c0e5b4e7a4f1c0e5b4e7a";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN no está configurado en el servidor" },
      { status: 500 }
    );
  }

  const { imageUrl } = await request.json();
  if (!imageUrl) {
    return NextResponse.json({ error: "Falta imageUrl" }, { status: 400 });
  }

  // Construir URL absoluta para que Replicate pueda descargarla
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://${request.headers.get("host")}`;
  const absoluteImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : `${siteUrl}${imageUrl}`;

  const modelId = (process.env.REPLICATE_MODEL ?? DEFAULT_MODEL) as `${string}/${string}:${string}`;

  try {
    const replicate = new Replicate({ auth: token });

    console.log("[segment-garment] Calling Replicate:", modelId, "with image:", absoluteImageUrl);

    const output = await replicate.run(modelId, {
      input: {
        image: absoluteImageUrl,
      },
    });

    console.log("[segment-garment] Replicate output:", JSON.stringify(output).slice(0, 200));

    // El output puede ser una URL string, array de URLs, u objeto con categorías
    let maskUrlReplicate: string | undefined;

    if (typeof output === "string") {
      maskUrlReplicate = output;
    } else if (Array.isArray(output) && output.length > 0) {
      // Buscar el primer elemento que sea string URL
      maskUrlReplicate = output.find((x) => typeof x === "string") as string;
    } else if (output && typeof output === "object") {
      // Buscar categoría de prenda superior
      const obj = output as Record<string, unknown>;
      const candidates = [
        "upper-clothes",
        "upper_clothes",
        "shirt",
        "t-shirt",
        "dress",
        "mask",
        "output",
      ];
      for (const key of candidates) {
        if (typeof obj[key] === "string") {
          maskUrlReplicate = obj[key] as string;
          break;
        }
      }
      // Si no se encontró, tomar el primer valor string
      if (!maskUrlReplicate) {
        const firstString = Object.values(obj).find(
          (v) => typeof v === "string"
        );
        if (firstString) maskUrlReplicate = firstString as string;
      }
    }

    if (!maskUrlReplicate) {
      throw new Error(
        `Formato de respuesta de Replicate inesperado: ${JSON.stringify(output).slice(0, 300)}`
      );
    }

    // Descargar la máscara y guardarla localmente
    const maskRes = await fetch(maskUrlReplicate);
    if (!maskRes.ok) {
      throw new Error(`Error descargando máscara: ${maskRes.status}`);
    }
    const maskBuffer = Buffer.from(await maskRes.arrayBuffer());

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filename = `mask-${uuidv4()}.png`;
    await writeFile(join(uploadDir, filename), maskBuffer);

    return NextResponse.json({ maskUrl: `/uploads/${filename}` });
  } catch (error) {
    console.error("[segment-garment] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error procesando la imagen con IA",
      },
      { status: 500 }
    );
  }
}
