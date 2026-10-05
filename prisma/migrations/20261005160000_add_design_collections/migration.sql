-- CreateTable
CREATE TABLE IF NOT EXISTS "design_collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT '📁',
    "coverImage" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "design_assets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "collectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "design_collections_slug_key" ON "design_collections"("slug");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'design_assets_collectionId_fkey'
    ) THEN
        ALTER TABLE "design_assets" ADD CONSTRAINT "design_assets_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "design_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Seed Collections
INSERT INTO "design_collections" ("id", "name", "slug", "description", "icon", "coverImage", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4r500002ktfm3se1885', 'Fiestas Patrias & México', 'fiestas-patrias-mexico', 'Estampados patrios premium, águilas de proporción áurea, independencia y cultura mexicana.', '🦅', NULL, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "design_collections" ("id", "name", "slug", "description", "icon", "coverImage", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4zc000k2ktf7iv5q4j8', 'Playeras Halloween', 'playeras-halloween', 'Calaveras, terror, calabazas y diseños escalofriantes para la temporada de noche de brujas.', '🎃', NULL, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "design_collections" ("id", "name", "slug", "description", "icon", "coverImage", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4zg000l2ktfr8fvel4o', 'Anime & Gaming', 'anime-gaming', 'Estilo streetwear, cultura gamer y personajes de anime para playeras de alto impacto.', '⚡', NULL, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Seed Designs
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4t000012ktfcfdcwuj1', 'AguilaCuadros', '/uploads/designs/AguilaCuadros.png', NULL, 'cmuvno4r500002ktfm3se1885', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4td00022ktf89qm2mru', 'AguilaMexicana', '/uploads/designs/AguilaMexicana.png', NULL, 'cmuvno4r500002ktfm3se1885', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4u000042ktfa5opnh28', 'Camapana SinFondo', '/uploads/designs/Camapana_SinFondo.png', NULL, 'cmuvno4r500002ktfm3se1885', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4v200072ktfywjnjar7', 'GritoIndependencia', '/uploads/designs/GritoIndependencia.png', NULL, 'cmuvno4r500002ktfm3se1885', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4vj00082ktfqp4nx27l', 'HerenciaYResistencia', '/uploads/designs/HerenciaYResistencia.png', NULL, 'cmuvno4r500002ktfm3se1885', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4vu00092ktf9c84be5t', 'Independencia', '/uploads/designs/Independencia.png', NULL, 'cmuvno4r500002ktfm3se1885', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4w7000a2ktfkdy4yg9b', 'JosefaAnime', '/uploads/designs/JosefaAnime.png', NULL, 'cmuvno4r500002ktfm3se1885', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4wj000b2ktfr24nyj5p', 'MexicoElevation', '/uploads/designs/MexicoElevation.png', NULL, 'cmuvno4r500002ktfm3se1885', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4ww000c2ktflwkj40bt', 'MexicoLibre Serpiente', '/uploads/designs/MexicoLibre_Serpiente.png', NULL, 'cmuvno4r500002ktfm3se1885', 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4xa000d2ktf6lh3lgcl', 'MexicoMAtrix', '/uploads/designs/MexicoMAtrix.png', NULL, 'cmuvno4r500002ktfm3se1885', 12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4xm000e2ktfgydsivwv', 'MexicoVertical', '/uploads/designs/MexicoVertical.png', NULL, 'cmuvno4r500002ktfm3se1885', 13, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4xw000f2ktf67m3myhz', 'MexicoVerticalVariante', '/uploads/designs/MexicoVerticalVariante.png', NULL, 'cmuvno4r500002ktfm3se1885', 14, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4yj000h2ktf3d2wect0', 'Morelos El Rayo del sur', '/uploads/designs/Morelos_El_Rayo_del_sur.png', NULL, 'cmuvno4r500002ktfm3se1885', 16, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4yw000i2ktf2hhyptf0', 'Pipila', '/uploads/designs/Pipila.png', NULL, 'cmuvno4r500002ktfm3se1885', 17, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvno4z8000j2ktfsf8ts7of', 'PozoleSocialClub', '/uploads/designs/PozoleSocialClub.png', NULL, 'cmuvno4r500002ktfm3se1885', 18, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmkr0002n4tffhsby4b9', 'ARTE PNG 1  telegram@plantillasPRemiumFree', '/uploads/ARTE-PNG-1-telegram-plantillasPRemiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmkz0003n4tf855jr41a', 'ARTE PNG 2  telegram@plantillasPRemiumFree', '/uploads/ARTE-PNG-2-telegram-plantillasPRemiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjml30004n4tfzj7h7k8j', 'ARTE PNG 3  telegram@plantillasPRemiumFree', '/uploads/ARTE-PNG-3-telegram-plantillasPRemiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjml70005n4tf1lp2cdll', 'ARTE PNG 4  telegram@plantillasPRemiumFree', '/uploads/ARTE-PNG-4-telegram-plantillasPRemiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmlb0006n4tfzzlflpk2', 'ARTE PNG 5  telegram@plantillasPRemiumFree', '/uploads/ARTE-PNG-5-telegram-plantillasPRemiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmlg0007n4tfpz03390x', 'ARTE PNG 6  telegram@plantillasPrEmiumFree', '/uploads/ARTE-PNG-6-telegram-plantillasPrEmiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmlp0009n4tfy5tujmzo', 'ARTE PNG 8  telegram@plantillasPrEmiumFree', '/uploads/ARTE-PNG-8-telegram-plantillasPrEmiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmlt000an4tf800av9su', 'ARTE PNG 9  telegram@plantillasPrEmiumFree', '/uploads/ARTE-PNG-9-telegram-plantillasPrEmiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmlx000bn4tfx11vp981', 'ARTE PNG 10  telegram@plantillasPrEmiumFree', '/uploads/ARTE-PNG-10-telegram-plantillasPrEmiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmm2000cn4tfss60s3zx', 'ARTE PNG 11  telegram@plantillasPrEmiumFree', '/uploads/ARTE-PNG-11-telegram-plantillasPrEmiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "design_assets" ("id", "title", "imageUrl", "thumbnailUrl", "collectionId", "order", "isActive", "createdAt", "updatedAt")
VALUES ('cmuvpjmm6000dn4tfj6sz6wfd', 'ARTE PNG 12  telegram@plantillasPreMiumFree', '/uploads/ARTE-PNG-12-telegram-plantillasPreMiumFree.png', NULL, 'cmuvno4zc000k2ktf7iv5q4j8', 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
