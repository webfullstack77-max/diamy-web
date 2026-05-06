-- CreateTable
CREATE TABLE "auto_publish_config" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "channels" TEXT NOT NULL DEFAULT '["whatsapp"]',
    "nextPublishDate" TEXT,
    "lastPublishedAt" TIMESTAMP(3),
    "lastProductId" TEXT,
    "lastProductTitle" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_publish_config_pkey" PRIMARY KEY ("id")
);
