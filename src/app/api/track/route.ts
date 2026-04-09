import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false });
    }

    // Ignorar rutas internas
    if (
      path.startsWith("/admin") ||
      path.startsWith("/api") ||
      path.startsWith("/_next")
    ) {
      return NextResponse.json({ ok: false });
    }

    // IP real detrás de nginx
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;

    // Excluir IPs bloqueadas (ANALYTICS_BLOCKED_IPS=ip1,ip2)
    const blocked = (process.env.ANALYTICS_BLOCKED_IPS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ip && blocked.includes(ip)) {
      return NextResponse.json({ ok: false });
    }

    // Excluir bots comunes
    const ua = req.headers.get("user-agent") || "";
    if (/bot|crawl|spider|slurp|facebookexternalhit|headless/i.test(ua)) {
      return NextResponse.json({ ok: false });
    }

    await prisma.pageView.create({
      data: {
        path,
        ip,
        userAgent: ua || null,
        referer: req.headers.get("referer") || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
