import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, title, color } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "No se recibió la imagen del mockup" }, { status: 400 });
    }

    // Extract base64 data
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "Formato de imagen inválido" }, { status: 400 });
    }

    const buffer = Buffer.from(matches[2], "base64");

    const uploadDir = join(process.cwd(), "public", "uploads", "mockups-clientes");
    await mkdir(uploadDir, { recursive: true });

    // Clean name for SEO/reference
    const safeTitle = (title || "mockup")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);
    const safeColor = (color || "color")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 15);

    const filename = `diamy-${safeTitle}-${safeColor}-${uuidv4().slice(0, 8)}.jpg`;
    const filePath = join(uploadDir, filename);

    // Convert to high quality JPEG with optimal compression
    const optimized = await sharp(buffer)
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    await writeFile(filePath, optimized);

    // Determine host for full absolute URL
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "diamylasercut.com.mx";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const fullUrl = `${proto}://${host}/uploads/mockups-clientes/${filename}`;

    return NextResponse.json({
      success: true,
      url: `/uploads/mockups-clientes/${filename}`,
      fullUrl,
    });
  } catch (error) {
    console.error("Error al guardar captura del mockup:", error);
    return NextResponse.json({ error: "Error interno al procesar mockup" }, { status: 500 });
  }
}
