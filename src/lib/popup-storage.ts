import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import type { PopupConfig } from "@/types/popup";

const CONFIG_FILE = join(process.cwd(), "src", "data", "popup-config.json");

export const DEFAULT_POPUP_CONFIG: PopupConfig = {
  isActive: true,
  theme: "halloween",
  title: "¡Especial Spooky Halloween! 🎃",
  subtitle: "Playeras exclusivas y decoración en corte láser con envío a todo México",
  buttonText: "Ver Producto",
  displayFrequency: "always",
  autoPlayInterval: 4,
  slides: [
    {
      id: "slide-1",
      title: "Playera Demon Hunters — Calaveras y Cazadores",
      subtitle: "Estampado DTF alta definición sobre 100% algodón",
      badge: "🎃 Más Pedida",
      imageUrl: "/uploads/3b541247-1378-4fa9-b9c2-877ffb182bd8.jpg",
      linkUrl: "/producto/playerasdhsemi",
    },
    {
      id: "slide-2",
      title: "Playera Jurassic Spooky World — Edición Nocturna",
      subtitle: "Colores vibrantes resistentes a lavadas",
      badge: "🦖 Edición Limitada",
      imageUrl: "/uploads/5622e428-60b6-46cf-b2ec-a0a4699db75f.jpg",
      linkUrl: "/producto/playerasjp",
    },
    {
      id: "slide-3",
      title: "Playera Anime Jujutsu Kaisen — Modo Oscuro",
      subtitle: "Elige tu diseño favorito o personalízala con nosotros",
      badge: "⚡ Novedad Spooky",
      imageUrl: "/uploads/e00455a2-01d0-4895-80d6-7c2bc6fc2efc.jpg",
      linkUrl: "/producto/jujutsu-kaisen-tshirts",
    },
  ],
  updatedAt: new Date().toISOString(),
};

export async function getPopupConfig(): Promise<PopupConfig> {
  try {
    if (!existsSync(CONFIG_FILE)) {
      await savePopupConfig(DEFAULT_POPUP_CONFIG);
      return DEFAULT_POPUP_CONFIG;
    }
    const data = await readFile(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return { ...DEFAULT_POPUP_CONFIG, ...parsed };
  } catch (error) {
    console.error("Error reading popup config:", error);
    return DEFAULT_POPUP_CONFIG;
  }
}

export async function savePopupConfig(config: PopupConfig): Promise<PopupConfig> {
  const dir = join(process.cwd(), "src", "data");
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  const toSave: PopupConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(CONFIG_FILE, JSON.stringify(toSave, null, 2), "utf-8");
  return toSave;
}
