/*
  Warnings:

  - You are about to drop the column `productOfMonthImage` on the `site_config` table. All the data in the column will be lost.
  - You are about to drop the column `productOfMonthLink` on the `site_config` table. All the data in the column will be lost.
  - You are about to drop the column `productOfMonthText` on the `site_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site_config" DROP COLUMN "productOfMonthImage",
DROP COLUMN "productOfMonthLink",
DROP COLUMN "productOfMonthText";

-- CreateTable
CREATE TABLE "product_of_month_items" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "text" TEXT,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_of_month_items_pkey" PRIMARY KEY ("id")
);
