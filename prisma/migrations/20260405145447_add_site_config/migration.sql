-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "productOfMonthImage" TEXT,
    "productOfMonthText" TEXT,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);
