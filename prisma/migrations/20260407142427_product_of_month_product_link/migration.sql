-- AlterTable
ALTER TABLE "product_of_month_items" ADD COLUMN     "productId" TEXT;

-- AddForeignKey
ALTER TABLE "product_of_month_items" ADD CONSTRAINT "product_of_month_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
