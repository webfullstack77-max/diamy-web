import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { requireAdmin } from "@/lib/auth";
import { exec } from "child_process";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// Declare a global registry for local slideshow tasks
if (!(global as any).localVideoPredictions) {
  (global as any).localVideoPredictions = new Map<string, { status: string; videoUrl?: string; error?: string }>();
}
const localPredictions = (global as any).localVideoPredictions;

function isFfmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("ffmpeg -version", (err) => {
      resolve(!err);
    });
  });
}

async function processSlideshowBackground(mockId: string, imageUrls: string[]) {
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  
  const tempPaths: string[] = [];
  try {
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      let absoluteUrl = url.startsWith("http") 
        ? url 
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://diamylasercut.com.mx'}${url.startsWith('/') ? url : '/' + url}`;
        
      const res = await fetch(absoluteUrl);
      if (!res.ok) throw new Error(`Error descargando imagen ${i + 1}: ${res.statusText}`);
      const buf = Buffer.from(await res.arrayBuffer());
      
      const resizedBuf = await sharp(buf)
        .resize(1080, 1080, { fit: "cover", position: "center" })
        .jpeg({ quality: 85 })
        .toBuffer();
        
      const tempPath = join(uploadDir, `_slide_${mockId}_${i}.jpg`);
      await writeFile(tempPath, resizedBuf);
      tempPaths.push(tempPath);
    }
    
    const showTime = 3.0; // 3 seconds per slide
    const transTime = 0.5; // 0.5 seconds crossfade
    const N = tempPaths.length;
    const finalFilename = `vid-slideshow-${uuidv4()}.mp4`;
    const finalPath = join(uploadDir, finalFilename);
    
    let inputArgs = '';
    tempPaths.forEach((p) => {
      inputArgs += `-loop 1 -t ${showTime} -i "${p}" `;
    });
    
    let cmd = '';
    if (N === 1) {
      cmd = `ffmpeg -y -loop 1 -t 3 -i "${tempPaths[0]}" -r 25 -pix_fmt yuv420p "${finalPath}"`;
    } else {
      let filterComplex = '';
      let lastOut = '[0:v]';
      
      for (let i = 1; i < N; i++) {
        const offset = i * (showTime - transTime);
        const outLabel = `[v${i}]`;
        const nextIn = `[${i}:v]`;
        
        filterComplex += `${lastOut}${nextIn}xfade=transition=fade:duration=${transTime}:offset=${offset}`;
        if (i < N - 1) {
          filterComplex += `[v${i}_temp]; `;
          lastOut = `[v${i}_temp]`;
        } else {
          filterComplex += `[v]`;
        }
      }
      
      cmd = `ffmpeg -y ${inputArgs} -filter_complex "${filterComplex}" -map "[v]" -r 25 -pix_fmt yuv420p "${finalPath}"`;
    }
    
    await new Promise<void>((resolve, reject) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error("FFmpeg error:", stderr);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    localPredictions.set(mockId, { status: "done", videoUrl: `/uploads/${finalFilename}` });
    console.log(`[generate-video] Slideshow video generated: ${finalFilename}`);
  } catch (err: any) {
    localPredictions.set(mockId, { status: "error", error: err.message });
  } finally {
    for (const p of tempPaths) {
      try {
        await unlink(p);
      } catch {}
    }
  }
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Verificar si FFmpeg está disponible de inmediato
  const ffmpegOk = await isFfmpegAvailable();
  if (!ffmpegOk) {
    return NextResponse.json(
      { 
        error: "FFmpeg no está instalado en tu VPS. Por favor ejecuta 'sudo apt update && sudo apt install -y ffmpeg' en la terminal de tu VPS para activar la generación de videos." 
      },
      { status: 500 }
    );
  }

  const { imageUrl, imageUrls } = await request.json();
  const allImages = imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0
    ? imageUrls
    : imageUrl ? [imageUrl] : [];

  if (allImages.length === 0) {
    return NextResponse.json({ error: "Faltan imágenes para generar el video" }, { status: 400 });
  }

  const mockId = `slideshow_${uuidv4()}`;
  localPredictions.set(mockId, { status: "processing" });

  // Procesar el video local en segundo plano usando FFmpeg
  processSlideshowBackground(mockId, allImages).catch((err) => {
    console.error("[generate-video] Error en procesamiento de video local:", err);
    localPredictions.set(mockId, { status: "error", error: err.message });
  });

  console.log("[generate-video] Generación de video con FFmpeg iniciada:", mockId);
  return NextResponse.json({ predictionId: mockId });
}
