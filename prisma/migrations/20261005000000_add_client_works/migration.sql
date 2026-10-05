-- CreateTable
CREATE TABLE "client_works" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT,
    "clientName" TEXT,
    "badge" TEXT DEFAULT 'Trabajo Real',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "productId" TEXT,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_works_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "client_works" ADD CONSTRAINT "client_works_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert initial sample works if empty
INSERT INTO "client_works" ("id", "title", "description", "imageUrl", "category", "clientName", "badge", "order", "isActive", "link", "updatedAt")
VALUES
  ('cw_termos_uv', 'Termos Térmicos con Grabado Láser y DTF UV', 'Personalización de alta resistencia para empresas y eventos. Acabado brillante anti-rayaduras y grabado nítido de logotipos corporativos.', '/uploads/2122fc19-4d3d-4a0c-bccc-a12cc5821a1d.png', 'Grabado de Termos', 'Corporativo & Eventos Privados', '✨ Grabado Láser & UV', 0, true, '/catalogo', CURRENT_TIMESTAMP),
  ('cw_bebe_mdf', 'Portarretrato de Bebé con Relieve 3D en MDF', 'Diseño multicapa cortado en madera MDF de primera calidad con grabado caligráfico de fechas de nacimiento y ensamblado artesanal.', '/uploads/8da12e82-e98a-40fa-b13c-b5114652d78e.png', 'Productos MDF', 'Familia Mendoza Ramos', '🪵 Corte Láser de Precisión', 1, true, '/catalogo', CURRENT_TIMESTAMP),
  ('cw_playeras_dtf', 'Playeras Temáticas Edición Especial Halloween', 'Estampado textil DTF de máxima resolución sobre tela 100% algodón peinado. Colores ultra vivos que no se cuartean ni pierden intensidad con los lavados.', '/uploads/3b541247-1378-4fa9-b9c2-877ffb182bd8.jpg', 'Estampado de Playeras', 'Colección Temporada Spooky', '🔥 DTF Textil Ultra HD', 2, true, '/producto/playerasdhsemi', CURRENT_TIMESTAMP),
  ('cw_tazas_harley', 'Tazas Cerámicas Harley Davidson de Colección', 'Cerámica importada con acabado espejo y resistencia a microondas y lavavajillas. Diseños personalizados de alta definición con relieve visual.', '/uploads/db200348-516c-47d4-aab8-3d29156adf5f.jpg', 'Tazas Personalizadas', 'Club Biker Cuernavaca', '☕ Cerámica Premium', 3, true, '/producto/tharleydavidson', CURRENT_TIMESTAMP),
  ('cw_bebe_recuerdos', 'Portarretrato Huellita & Recuerdos de Bebé', 'Corte fino en madera natural con detalle grabado y acabado suave al tacto. Ideal para baby showers y habitaciones infantiles.', '/uploads/25f63d45-dd6c-4820-a223-4730be204a62.png', 'Productos MDF', 'Baby Shower Valeria', '⭐ Hecho a Mano', 4, true, '/catalogo', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
