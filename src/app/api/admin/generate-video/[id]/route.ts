import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import Replicate from "replicate";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "REPLICATE_API_TOKEN no configurado" }, { status: 500 });
  }

  const { id } = await params;

  if (id.startsWith("slideshow_")) {
    const localPredictions = (global as any).localVideoPredictions;
    if (!localPredictions) {
      return NextResponse.json({ status: "error", error: "No local predictions registry found" });
    }
    const task = localPredictions.get(id);
    if (!task) {
      return NextResponse.json({ status: "error", error: "Slideshow task not found" });
    }
    return NextResponse.json(task);
  }

  try {
    const replicate = new Replicate({ auth: token });
    const prediction = await replicate.predictions.get(id);

    if (prediction.status === "succeeded") {
      // Extraer URL del video del output
      let videoUrlReplicate: string | undefined;
      const output = prediction.output;
      if (typeof output === "string") {
        videoUrlReplicate = output;
      } else if (Array.isArray(output)) {
        videoUrlReplicate = output.find((x) => typeof x === "string") as string;
      } else if (output && typeof output === "object") {
        const obj = output as Record<string, unknown>;
        videoUrlReplicate =
          (obj.video as string) ?? (Object.values(obj).find((v) => typeof v === "string") as string);
      }

      if (!videoUrlReplicate) {
        return NextResponse.json({ status: "error", error: "No se encontró URL de video en la respuesta" });
      }

      // Descargar y guardar localmente
      const videoRes = await fetch(videoUrlReplicate);
      if (!videoRes.ok) {
        return NextResponse.json({ status: "error", error: `Error descargando video: ${videoRes.status}` });
      }
      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());

      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filename = `vid-${uuidv4()}.mp4`;
      await writeFile(join(uploadDir, filename), videoBuffer);

      console.log("[generate-video] Video guardado:", filename);
      return NextResponse.json({ status: "done", videoUrl: `/uploads/${filename}` });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      const errMsg = typeof prediction.error === "string" ? prediction.error : "La generación falló";
      return NextResponse.json({ status: "error", error: errMsg });
    }

    return NextResponse.json({ status: "processing" });
  } catch (error) {
    console.error("[generate-video/status] Error:", error);
    return NextResponse.json(
      { status: "error", error: error instanceof Error ? error.message : "Error consultando estado" }
    );
  }
}
