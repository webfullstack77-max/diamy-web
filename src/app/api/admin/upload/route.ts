import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "@/lib/auth";
import sharp from "sharp";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_IMAGE_SIZE = 30 * 1024 * 1024; // 30MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Tipo de archivo no permitido (usa JPG, PNG, WebP, MP4 o WebM)" }, { status: 400 });
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json({ error: `Archivo demasiado grande (máx ${isVideo ? "50" : "30"}MB)` }, { status: 400 });
  }

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  if (isVideo) {
    // Videos: guardar directamente sin procesar
    const ext = file.type === "video/webm" ? "webm" : "mp4";
    const filename = `${uuidv4()}.${ext}`;
    const raw = Buffer.from(await file.arrayBuffer());
    await writeFile(join(uploadDir, filename), raw);
    return NextResponse.json({ url: `/uploads/${filename}` });
  }

  // Imágenes: comprimir y redimensionar, conservar nombre original
  const raw = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(raw)
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Limpiar nombre original: quitar caracteres especiales, conservar extensión como .jpg
  const originalName = file.name
    .replace(/\.[^.]+$/, "")           // quitar extensión
    .replace(/[^a-zA-Z0-9._-]/g, "-") // reemplazar espacios/chars especiales con -
    .replace(/-+/g, "-")               // colapsar guiones dobles
    .slice(0, 80);                     // máximo 80 chars

  // Si ya existe un archivo con ese nombre, agregar sufijo corto para evitar colisión
  const { existsSync } = await import("fs");
  let filename = `${originalName}.jpg`;
  if (existsSync(join(uploadDir, filename))) {
    filename = `${originalName}-${uuidv4().slice(0, 6)}.jpg`;
  }

  await writeFile(join(uploadDir, filename), compressed);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
