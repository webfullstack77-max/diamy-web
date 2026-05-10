-- CreateTable
CREATE TABLE "daily_promo" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "activeDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_promo_pkey" PRIMARY KEY ("id")
);
