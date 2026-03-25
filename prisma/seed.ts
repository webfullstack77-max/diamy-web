import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL! },
  { schema: process.env.DB_SCHEMA ?? "diamy_v4" }
);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // Categories
  const categorias = await Promise.all([
    prisma.category.upsert({
      where: { slug: "regalos" },
      update: {},
      create: {
        slug: "regalos",
        name: "Regalos",
        description: "Piezas personalizadas perfectas para regalar en cualquier ocasión",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuChtFV7dxBx4pCFz5ctJlnl8RbOGC3lHD1P09YW82tpFG2OJR_5aYF3YdAEU94kwvEXxNnBPsYuBrqZGOjbdWd1rnSWe6rFSTq3cw=s1280",
      },
    }),
    prisma.category.upsert({
      where: { slug: "decoracion" },
      update: {},
      create: {
        slug: "decoracion",
        name: "Decoración",
        description: "Piezas decorativas únicas para tu hogar u oficina",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuChVtqEVS1Kj53I9H4L7bWJkBVEfN2WFzgFRjP2cStUWXJFD0QdkxaVuqTx-FpqZVGfvB5SDOH7bZilyBj63G-YaaqUjZcRkY3J-A=s1280",
      },
    }),
    prisma.category.upsert({
      where: { slug: "corporativo" },
      update: {},
      create: {
        slug: "corporativo",
        name: "Corporativo",
        description: "Soluciones de grabado y corte láser para empresas",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBnj3DUW36ELsWkHrjnKLBSKm2c4P_uHI4x2SFSSyJT0hCBuVXWfPjHKbkjJiIL6uN1y5j-lT_Sxu8yoifDDmRJ4VCKU9ORxPyg=s1280",
      },
    }),
    prisma.category.upsert({
      where: { slug: "bodas" },
      update: {},
      create: {
        slug: "bodas",
        name: "Bodas",
        description: "Recuerdos y detalles personalizados para tu boda",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5ARrJSQ_yJWf5qiJNn1l02IKEbf4OFmE_CtZ21IaFfaMqMJG8dTMC-IVbFOIWGlFi0bJCVpKyIiPjL4KzJwlJb1WaHFB7oOXxg=s1280",
      },
    }),
  ]);

  const [regalos, decoracion, corporativo, bodas] = categorias;

  // Products
  const productos = [
    {
      slug: "caja-de-madera-grabada-personalizda",
      title: "Caja de Madera Grabada Personalizada",
      description: "Hermosa caja de madera de abedul báltico de 6mm con grabado láser personalizado. Perfecta para guardar recuerdos, joyas o como regalo especial.\n\nPuedes personalizar el texto, iniciales o diseño de tu elección. Acabado natural o barnizado disponible.",
      price: 349,
      originalPrice: 420,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0ugwlFoePVqVCCrpc4VWcSPCruStmEpXRuxKduiBJHrzlToB_9nMK1wWIq4zG6vEZrpNLp_KrvpTAX8aCVSPH4BT0lPWlt_R8H6-bQPFOt1yzETYInQSCJUxyqb_iodVSJsqXUuYGWLo9v7GMxvmgSvJEurRbpf0CLcNj_Jf-PA54ssBjJSsyc5nXax38MaBr3BNayO4fpVOMFZXmKv8BLh5sXdflhXaj-WMeUuJUO7H6VlJphvDUh5rvWnV",
      ],
      materials: ["Abedul Báltico 6mm", "Acabado Satinado"],
      categoryId: regalos.id,
    },
    {
      slug: "cuadro-decorativo-acrilico-espejo",
      title: "Cuadro Decorativo de Acrílico Espejo",
      description: "Elegante cuadro decorativo fabricado en acrílico con acabado espejo. El diseño geométrico de precisión láser crea un efecto visual espectacular con cualquier iluminación.\n\nDimensiones: 30x40cm. Disponible en dorado, plateado y negro.",
      price: 580,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0ujpUFL7Q9TqSzMpRduM6mhTlcjb00BH7rQ7IqbHQzBJMSzSr_CXlK_kxWjAvWcfBugsQr32P_dDtnRhZ04gZi0MkOsxK6PYESVfZwbP7Vr6pNOSrjw8QGgd9GlBMM5olpBONx_mwOZ0SUB8aKVleYLuH1K8mmXz59MBNTtz9YzsiTe995G8fBuHv8rghIJOh8oGP8HlcTllXZfHS59UQ96XSaDfXX2GIIXAzAa6kmjXErWLzFBOoNDBf9Q",
      ],
      materials: ["Acrílico Espejo", "Acabado Mate Negro"],
      categoryId: decoracion.id,
    },
    {
      slug: "tarjetas-corporativas-grabadas",
      title: "Tarjetas Corporativas Grabadas en Metal",
      description: "Tarjetas de presentación corporativas en acero inoxidable con grabado láser de alta precisión. Dan una primera impresión inigualable y son prácticamente indestructibles.\n\nLote mínimo: 50 piezas. Personalización completa: logo, nombre, datos de contacto.",
      price: 1200,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0uhHoe1d7BYokAnHgRpKML2IMxmPOdujHWiNU72REIC_FSPTWhCCz-1VX6bFM7dPSlj1MuTOM3IhEFkqeoX3D_4CSX-qOMtdnsPEPsAOBDqEfrsaoT_Nrg45XCVNQ9u4zRUUlx1oXzdA9uLUKVH5S8ga2fhe5VfJQAScDl-6RlG1z8Q1hze49z43061pPqzoa1ZEY9-bECpW6gKNch6ZZHF5-V_MoDyUj7YFBoovwSXt6UqYfmFytA4oB2Bz",
      ],
      materials: ["Acero Inoxidable", "Grabado Láser"],
      categoryId: corporativo.id,
    },
    {
      slug: "centro-mesa-boda-madera",
      title: "Centro de Mesa para Boda en Madera",
      description: "Elegante centro de mesa personalizado con los nombres de los novios y fecha de la boda. Fabricado en madera de abedul con acabado lacado.\n\nAltura: 25cm. Incluye base con LED opcional. Entrega mínima 3 semanas antes.",
      price: 290,
      originalPrice: 350,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0uiUHAqx1_Dx2A7EBz2eANgoHS5pzge9-DJ8zyt3YK-K_FCQL2pwphyKnncfgP20tgMbo52E91rSOSR-n2MCuZmQOYWZMo6uN9K32i_Eg48qPqqUcuLLFDeO12jWxBdJE8IWC6_9kfWSNu8jH99u_snp-3fueyRBLa1FWCwQdX9OxO4UbUzapfCLVMt1hyX_4zexneko2UiA6Sf2o6d76wPGqJ545-Xq7d0GobZjj35K6J4cBsuYOATA5AWs",
      ],
      materials: ["Abedul Báltico", "Acabado Lacado"],
      categoryId: bodas.id,
    },
    {
      slug: "llavero-acrilico-personalizado",
      title: "Llavero Acrílico Personalizado",
      description: "Llavero de acrílico frosted con nombre o iniciales grabadas. Ligero, duradero y con un acabado translúcido muy elegante.\n\nMedidas: 6x3cm. Colores disponibles: blanco, rosa, azul cielo, negro.",
      price: 85,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0uiRdjpXygg4GEiL8n6vW04LZDox1Aoc9hSzmHHKOVuOSFIofKHQmP5972b7w39B3nBkjIQSPHDHzS2jhv9WjVI9kOXdY0b0wnYNSGcmUs6m6gGLvsdpoVrnoB4ixuBQQ6YFS3yblm3oTSYgJtyRbheFRvnpDMoiAM04KLHJ8CKaXBvKOHhkFX4G362VJN835nZ_RI_DADoF6PTeHxCQhPf4LPHnC3Rc1jj3h1qsBvMZFO5jzmQE89yr82ut",
      ],
      materials: ["Acrílico Frosted", "Grabado Láser"],
      categoryId: regalos.id,
    },
    {
      slug: "letrero-madera-nombre-habitacion",
      title: "Letrero de Madera con Nombre para Habitación",
      description: "Letrero decorativo de madera con nombre personalizado, ideal para habitaciones infantiles o como regalo de bienvenida.\n\nMateriales de primera calidad. Pinturas atóxicas disponibles en múltiples colores. Tamaño: 40x15cm.",
      price: 195,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0uj6GFjwEwRT8Kwij58LoJJrBgRyPQ6ffokSpAjBL1AKRUdPnNq10jP2PgiNGcW2INdp4LfbyWpUULLslMntUMd3X7B_-VrA-vnvJbJpoIBk3yuQN7pZ2tWPn8wMGOHsDDpXK90EaJQrXWNMazpn0F2ISPyQxZrZZ_t8rUA_GJHIKjZ1GawyO7HOxhnsX6INh4o5WLQXCxpdce3_zmQRFqDDe4OoN5Q2GMAGCK7OnCavmjqJJs7E8d2p7OaD",
      ],
      materials: ["MDF 3mm", "Pintura Acrílica"],
      categoryId: decoracion.id,
    },
    {
      slug: "placa-conmemorativa-acero",
      title: "Placa Conmemorativa en Acero",
      description: "Placa conmemorativa de acero inoxidable con grabado de texto personalizado. Ideal para premiaciones, reconocimientos y momentos especiales.\n\nFormatos disponibles: placa de pared, base de trofeo o placa de escritorio.",
      price: 450,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0ugwlFoePVqVCCrpc4VWcSPCruStmEpXRuxKduiBJHrzlToB_9nMK1wWIq4zG6vEZrpNLp_KrvpTAX8aCVSPH4BT0lPWlt_R8H6-bQPFOt1yzETYInQSCJUxyqb_iodVSJsqXUuYGWLo9v7GMxvmgSvJEurRbpf0CLcNj_Jf-PA54ssBjJSsyc5nXax38MaBr3BNayO4fpVOMFZXmKv8BLh5sXdflhXaj-WMeUuJUO7H6VlJphvDUh5rvWnV",
      ],
      materials: ["Acero Inoxidable", "Acabado Cepillado"],
      categoryId: corporativo.id,
    },
    {
      slug: "invitacion-boda-acrilico",
      title: "Invitación de Boda en Acrílico",
      description: "Exclusivas invitaciones de boda en acrílico transparente con texto grabado en color dorado o plateado. Una pieza que los invitados conservarán como recuerdo.\n\nMedidas: 14x19cm. Precio por pieza en lotes mínimos de 20 piezas.",
      price: 180,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0ujpUFL7Q9TqSzMpRduM6mhTlcjb00BH7rQ7IqbHQzBJMSzSr_CXlK_kxWjAvWcfBugsQr32P_dDtnRhZ04gZi0MkOsxK6PYESVfZwbP7Vr6pNOSrjw8QGgd9GlBMM5olpBONx_mwOZ0SUB8aKVleYLuH1K8mmXz59MBNTtz9YzsiTe995G8fBuHv8rghIJOh8oGP8HlcTllXZfHS59UQ96XSaDfXX2GIIXAzAa6kmjXErWLzFBOoNDBf9Q",
      ],
      materials: ["Acrílico Transparente", "Impresión UV Dorado"],
      categoryId: bodas.id,
    },
    {
      slug: "portarretrato-bamboo-grabado",
      title: "Portarretrato de Bambú Grabado",
      description: "Elegante portarretrato de bambú sostenible con grabado personalizado. Un regalo eco-friendly con un toque de calidez natural.\n\nFormatos: 10x15cm o 13x18cm. Opción de grabado en la parte inferior.",
      price: 145,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0uiUHAqx1_Dx2A7EBz2eANgoHS5pzge9-DJ8zyt3YK-K_FCQL2pwphyKnncfgP20tgMbo52E91rSOSR-n2MCuZmQOYWZMo6uN9K32i_Eg48qPqqUcuLLFDeO12jWxBdJE8IWC6_9kfWSNu8jH99u_snp-3fueyRBLa1FWCwQdX9OxO4UbUzapfCLVMt1hyX_4zexneko2UiA6Sf2o6d76wPGqJ545-Xq7d0GobZjj35K6J4cBsuYOATA5AWs",
      ],
      materials: ["Bambú", "Grabado Láser"],
      categoryId: regalos.id,
    },
    {
      slug: "reloj-pared-madera-personalizado",
      title: "Reloj de Pared de Madera Personalizado",
      description: "Hermoso reloj de pared en madera de abedul con diseño personalizado cortado a láser. El mecanismo de cuarzo silencioso incluido.\n\nDiámetro: 35cm. Funciona con 1 pila AA. Diseño adaptable al logo o ilustración del cliente.",
      price: 520,
      images: [
        "https://lh3.googleusercontent.com/aida/ADBb0uhHoe1d7BYokAnHgRpKML2IMxmPOdujHWiNU72REIC_FSPTWhCCz-1VX6bFM7dPSlj1MuTOM3IhEFkqeoX3D_4CSX-qOMtdnsPEPsAOBDqEfrsaoT_Nrg45XCVNQ9u4zRUUlx1oXzdA9uLUKVH5S8ga2fhe5VfJQAScDl-6RlG1z8Q1hze49z43061pPqzoa1ZEY9-bECpW6gKNch6ZZHF5-V_MoDyUj7YFBoovwSXt6UqYfmFytA4oB2Bz",
      ],
      materials: ["Abedul Báltico 6mm", "Mecanismo Cuarzo"],
      categoryId: decoracion.id,
    },
  ];

  for (const p of productos) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // Testimonials
  const testimonios = [
    {
      author: "María González",
      role: "Cliente frecuente",
      text: "Pedí un regalo personalizado para el cumpleaños de mi madre y quedó perfecto. La calidad del grabado es impresionante y llegó antes de lo esperado. ¡Lo recomiendo totalmente!",
      rating: 5,
    },
    {
      author: "Carlos Reyes",
      role: "Diseñador gráfico",
      text: "Trabajé con Diamy para unos souvenirs corporativos y superaron todas mis expectativas. El equipo es muy profesional y la precisión del corte láser es excepcional. Definitivamente volveré.",
      rating: 5,
    },
    {
      author: "Laura Martínez",
      role: "Organizadora de eventos",
      text: "Los centros de mesa que mandé hacer para una boda fueron el tema de conversación de toda la noche. Las parejas que se casaron están encantadas con el resultado. Precio muy justo por la calidad.",
      rating: 5,
    },
  ];

  for (const t of testimonios) {
    const exists = await prisma.testimonial.findFirst({
      where: { author: t.author },
    });
    if (!exists) {
      await prisma.testimonial.create({ data: t });
    }
  }

  console.log("✅ Seed completado exitosamente");
  console.log(`   - ${categorias.length} categorías`);
  console.log(`   - ${productos.length} productos`);
  console.log(`   - ${testimonios.length} testimonios`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
