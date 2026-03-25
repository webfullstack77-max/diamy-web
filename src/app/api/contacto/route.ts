import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  const { nombre, telefono, email, tipoProducto, cantidad, mensaje } =
    await request.json();

  if (!nombre || !email || !mensaje) {
    return NextResponse.json(
      { error: "Nombre, correo y mensaje son requeridos" },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <h2>Nuevo mensaje de contacto — Diamy Laser Cut</h2>
    <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="background:#f3f0ff;font-weight:600;width:180px">Nombre</td><td>${nombre}</td></tr>
      <tr><td style="background:#f3f0ff;font-weight:600">WhatsApp / Teléfono</td><td>${telefono || "—"}</td></tr>
      <tr><td style="background:#f3f0ff;font-weight:600">Correo</td><td>${email}</td></tr>
      <tr><td style="background:#f3f0ff;font-weight:600">Tipo de producto</td><td>${tipoProducto || "—"}</td></tr>
      <tr><td style="background:#f3f0ff;font-weight:600">Cantidad aprox.</td><td>${cantidad || "—"}</td></tr>
      <tr><td style="background:#f3f0ff;font-weight:600;vertical-align:top">Mensaje</td><td style="white-space:pre-wrap">${mensaje}</td></tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: `"Diamy Web" <${process.env.SMTP_USER}>`,
      to: "ventas@diamylasercut.com.mx",
      replyTo: email,
      subject: `Contacto web: ${nombre} — ${tipoProducto || "Consulta general"}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error enviando correo:", err);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje. Intenta más tarde." },
      { status: 500 }
    );
  }
}
