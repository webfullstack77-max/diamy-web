import { NextResponse } from "next/server";
import { getPopupConfig } from "@/lib/popup-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getPopupConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error in GET /api/popup:", error);
    return NextResponse.json({ error: "Error al cargar popup" }, { status: 500 });
  }
}
