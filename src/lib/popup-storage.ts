import { prisma } from "@/lib/prisma";
import type { PopupConfig, PopupSlide, PopupTheme } from "@/types/popup";

export const DEFAULT_POPUP_CONFIG: PopupConfig = {
  isActive: true,
  theme: "halloween",
  title: "Temporada de Halloween",
  subtitle: "Playeras exclusivas Halloween",
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
    const row = await prisma.popupConfig.findUnique({
      where: { id: "main" },
    });

    if (!row) {
      return await savePopupConfig(DEFAULT_POPUP_CONFIG);
    }

    let slides: PopupSlide[] = [];
    try {
      slides = JSON.parse(row.slides);
    } catch {
      slides = DEFAULT_POPUP_CONFIG.slides;
    }

    return {
      isActive: row.isActive,
      theme: (row.theme as PopupTheme) || "halloween",
      title: row.title,
      subtitle: row.subtitle || undefined,
      buttonText: row.buttonText || undefined,
      slides,
      autoPlayInterval: row.autoPlayInterval,
      displayFrequency: (row.displayFrequency as PopupConfig["displayFrequency"]) || "always",
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error reading popup config from database:", error);
    return DEFAULT_POPUP_CONFIG;
  }
}

export async function savePopupConfig(config: PopupConfig): Promise<PopupConfig> {
  try {
    const slidesJson = JSON.stringify(config.slides || []);
    const row = await prisma.popupConfig.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        isActive: config.isActive ?? true,
        theme: config.theme || "halloween",
        title: config.title || DEFAULT_POPUP_CONFIG.title,
        subtitle: config.subtitle || null,
        buttonText: config.buttonText || "Ver Producto",
        slides: slidesJson,
        autoPlayInterval: config.autoPlayInterval ?? 4,
        displayFrequency: config.displayFrequency || "always",
      },
      update: {
        isActive: config.isActive ?? true,
        theme: config.theme || "halloween",
        title: config.title || DEFAULT_POPUP_CONFIG.title,
        subtitle: config.subtitle || null,
        buttonText: config.buttonText || "Ver Producto",
        slides: slidesJson,
        autoPlayInterval: config.autoPlayInterval ?? 4,
        displayFrequency: config.displayFrequency || "always",
      },
    });

    let slides: PopupSlide[] = [];
    try {
      slides = JSON.parse(row.slides);
    } catch {
      slides = config.slides || [];
    }

    return {
      isActive: row.isActive,
      theme: (row.theme as PopupTheme) || "halloween",
      title: row.title,
      subtitle: row.subtitle || undefined,
      buttonText: row.buttonText || undefined,
      slides,
      autoPlayInterval: row.autoPlayInterval,
      displayFrequency: (row.displayFrequency as PopupConfig["displayFrequency"]) || "always",
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error saving popup config to database:", error);
    throw error;
  }
}
