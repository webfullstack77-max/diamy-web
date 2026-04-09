-- AlterTable: Add new columns to Testimonial
ALTER TABLE "Testimonial" ADD COLUMN "token" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "email" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "phone" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "orderNote" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Testimonial" ADD COLUMN "isSubmitted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Testimonial" ADD COLUMN "submittedAt" TIMESTAMP(3);

-- Make existing columns nullable
ALTER TABLE "Testimonial" ALTER COLUMN "author" DROP NOT NULL;
ALTER TABLE "Testimonial" ALTER COLUMN "text" DROP NOT NULL;

-- Populate token for existing rows using gen_random_uuid()
UPDATE "Testimonial" SET "token" = gen_random_uuid()::text WHERE "token" IS NULL;

-- Now make token NOT NULL and add unique constraint
ALTER TABLE "Testimonial" ALTER COLUMN "token" SET NOT NULL;
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_token_key" UNIQUE ("token");
