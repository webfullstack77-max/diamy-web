import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://${request.headers.get("host")}`;
  const absoluteImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : `${siteUrl}${imageUrl}`;

  try {
    const replicate = new Replicate({ auth: token });

    const prediction = await replicate.predictions.create({
      model: "minimax/video-01",
      input: {
        first_frame_image: absoluteImageUrl,
        prompt:
          "Cinematic product showcase, slow gentle zoom revealing detail, professional lighting, luxury feel, clean background",
      },
    });

    console.log("[generate-video] Predicción iniciada:", prediction.id);
    return NextResponse.json({ predictionId: prediction.id });
  } catch (error) {
    console.error("[generate-video] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al iniciar generación de video" },
      { status: 500 }
    );
  }
}
