import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;

  if (token) {
    await prisma.adminSession.deleteMany({ where: { token } });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("admin_session");
  return response;
}
