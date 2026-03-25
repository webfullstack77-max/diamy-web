-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "promoDescription" TEXT,
ADD COLUMN     "promoImage" TEXT,
ADD COLUMN     "promoMode" BOOLEAN NOT NULL DEFAULT false;
