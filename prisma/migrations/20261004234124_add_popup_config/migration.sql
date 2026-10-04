-- CreateTable
CREATE TABLE "popup_config" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'halloween',
    "title" TEXT NOT NULL DEFAULT 'Temporada de Halloween',
    "subtitle" TEXT DEFAULT 'Playeras exclusivas Halloween',
    "buttonText" TEXT DEFAULT 'Ver Producto',
    "slides" TEXT NOT NULL DEFAULT '[]',
    "autoPlayInterval" INTEGER NOT NULL DEFAULT 4,
    "displayFrequency" TEXT NOT NULL DEFAULT 'always',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "popup_config_pkey" PRIMARY KEY ("id")
);
