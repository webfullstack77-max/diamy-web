import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PuntoTextilOrder } from "./punto-textil-orders-store";
import { PUNTO_TEXTIL_SUPPLIER_INFO } from "@/data/punto-textil-catalog";

export function generatePuntoTextilPdf(order: PuntoTextilOrder): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Background bar
  doc.setFillColor(33, 43, 54); // Dark elegant slate
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent line
  doc.setFillColor(217, 119, 6); // Warm amber accent (Diamy's primary/gold tone)
  doc.rect(0, 27, pageWidth, 1.5, "F");

  // Diamy Title & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("DIAMY LASER CUT", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("Taller de Personalizado, DTF & Corte Láser | diamylasercut.com.mx", margin, 18);
  doc.text("ORDEN DE COMPRA / PEDIDO DE PRENDAS", margin, 23);

  // Folio and Date on the right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`FOLIO: ${order.folio}`, pageWidth - margin, 12, { align: "right" });

  const dateObj = new Date(order.createdAt);
  const formattedDate = dateObj.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Fecha: ${formattedDate}`, pageWidth - margin, 18, { align: "right" });
  doc.text(
    `Tarifa: ${order.pricingTier.toUpperCase()} (${order.totalPieces} prendas)`,
    pageWidth - margin,
    23,
    { align: "right" }
  );

  // Supplier & Client Info Cards
  let yPos = 35;

  // Supplier Box (Left)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, (pageWidth - margin * 2) / 2 - 3, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("PROVEEDOR TEXTIL:", margin + 4, yPos + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(PUNTO_TEXTIL_SUPPLIER_INFO.companyName, margin + 4, yPos + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Marca: ${PUNTO_TEXTIL_SUPPLIER_INFO.brand} (Catálogo 2026)`, margin + 4, yPos + 17);
  doc.text(`Sitio: ${PUNTO_TEXTIL_SUPPLIER_INFO.website}`, margin + 4, yPos + 22);

  // Client Box (Right)
  const rightBoxX = margin + (pageWidth - margin * 2) / 2 + 3;
  const boxWidth = (pageWidth - margin * 2) / 2 - 3;
  doc.roundedRect(rightBoxX, yPos, boxWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("SOLICITANTE:", rightBoxX + 4, yPos + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Diamy Laser Cut", rightBoxX + 4, yPos + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Área de Producción & Estampado Textil", rightBoxX + 4, yPos + 17);
  doc.text(`Precios: Lista IVA Incluido (Febrero 2026)`, rightBoxX + 4, yPos + 22);

  yPos += 31;

  // Build Table Data
  const tableRows = order.items.map((item, idx) => {
    // Format sizes breakdown: "S: 5, M: 10, L: 8"
    const sizeDetails = Object.entries(item.sizes)
      .filter(([_, qty]) => qty > 0)
      .map(([sz, qty]) => `${sz}: ${qty}`)
      .join("  |  ");

    // Average or sample unit price
    const unitPricesArray = Object.values(item.unitPrices).filter((p) => p > 0);
    const avgPrice =
      unitPricesArray.length > 0
        ? unitPricesArray.reduce((a, b) => a + b, 0) / unitPricesArray.length
        : 0;

    return [
      String(idx + 1),
      item.styleCode,
      `${item.modelName}\n(${item.gender.toUpperCase()} - ${item.cutType})`,
      item.color.name,
      sizeDetails,
      `${item.totalPieces} pzas`,
      `$${avgPrice.toFixed(2)}`,
      `$${item.lineTotal.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [
      [
        "#",
        "Estilo",
        "Modelo / Corte",
        "Color",
        "Desglose de Tallas",
        "Pzas",
        "P. Unit.*",
        "Importe",
      ],
    ],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [33, 43, 54],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 50 },
      3: { cellWidth: 26, fontStyle: "bold" },
      4: { cellWidth: 46 },
      5: { cellWidth: 15, halign: "center", fontStyle: "bold" },
      6: { cellWidth: 16, halign: "right" },
      7: { cellWidth: 18, halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${data.pageNumber} de ${doc.getNumberOfPages()}  ·  Diamy Laser Cut  ·  diamylasercut.com.mx`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    },
  });

  // Calculate position after table
  // @ts-ignore
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 60;

  let summaryY = finalY + 6;
  if (summaryY > pageHeight - 55) {
    doc.addPage();
    summaryY = margin;
  }

  // Size distribution summary (Total pieces per size)
  const sizeTotals: Record<string, number> = {};
  order.items.forEach((item) => {
    Object.entries(item.sizes).forEach(([sz, qty]) => {
      if (qty > 0) {
        sizeTotals[sz] = (sizeTotals[sz] || 0) + qty;
      }
    });
  });

  // Size summary box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  const sizeBoxWidth = (pageWidth - margin * 2) * 0.58;
  doc.roundedRect(margin, summaryY, sizeBoxWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("CONCENTRADO DE PIEZAS POR TALLA:", margin + 4, summaryY + 6);

  const sizeEntries = Object.entries(sizeTotals).map(([sz, qty]) => `${sz}: ${qty}`);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  // Print in 2 rows if many
  const half = Math.ceil(sizeEntries.length / 2);
  const row1 = sizeEntries.slice(0, half).join("   |   ");
  const row2 = sizeEntries.slice(half).join("   |   ");

  doc.text(row1 || "Sin desglose", margin + 4, summaryY + 13);
  if (row2) {
    doc.text(row2, margin + 4, summaryY + 19);
  }

  // Financial Totals Box (Right)
  const totalsBoxX = margin + sizeBoxWidth + 4;
  const totalsBoxWidth = pageWidth - margin - totalsBoxX;
  doc.setFillColor(254, 243, 199); // Soft amber background
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(totalsBoxX, summaryY, totalsBoxWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text("TOTALES (IVA INCLUIDO):", totalsBoxX + 4, summaryY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text(`Prendas: ${order.totalPieces} pzas (${order.pricingTier.toUpperCase()})`, totalsBoxX + 4, summaryY + 11);
  doc.text(`Subtotal estimado: $${order.subtotal.toFixed(2)}`, totalsBoxX + 4, summaryY + 16);
  doc.text(`IVA (16% inc.): $${order.iva.toFixed(2)}`, totalsBoxX + 4, summaryY + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9);
  doc.text(`TOTAL: $${order.total.toFixed(2)} MXN`, totalsBoxX + 4, summaryY + 25);

  // Bank Info & Instructions Box
  let bankY = summaryY + 31;
  if (bankY > pageHeight - 35) {
    doc.addPage();
    bankY = margin;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, bankY, pageWidth - margin * 2, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("DATOS PARA PAGO / TRANSFERENCIA DE DISTRIBUIDORA PUNTO TEXTIL:", margin + 4, bankY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "• BBVA Bancomer: Cuenta 0199099832  ·  CLABE 012650001990998326 (Distribuidora Punto Textil S.A. de C.V.)",
    margin + 4,
    bankY + 10
  );
  doc.text(
    "• BBVA CIE Ventanilla: Convenio 1165224  ·  Referencia 00067  ·  Cuenta 0168771030 (Global Playerytees S.A. de C.V.)",
    margin + 4,
    bankY + 14
  );
  doc.text(
    "• Santander: Cuenta 65503140806  ·  CLABE 014650655031408064 (Global Playerytees S.A. de C.V.)",
    margin + 4,
    bankY + 18
  );

  return doc;
}

export function downloadPuntoTextilPdf(order: PuntoTextilOrder) {
  const doc = generatePuntoTextilPdf(order);
  const cleanFolio = order.folio.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`Pedido_PuntoTextil_${cleanFolio}.pdf`);
}

/**
 * Formatea el pedido para enviar por WhatsApp al asesor de Punto Textil
 */
export function formatOrderForWhatsApp(order: PuntoTextilOrder): string {
  const dateStr = new Date(order.createdAt).toLocaleDateString("es-MX");
  let text = `👕 *PEDIDO DE PRENDAS - PUNTO TEXTIL*\n`;
  text += `📄 *Folio:* ${order.folio}\n`;
  text += `📅 *Fecha:* ${dateStr}\n`;
  text += `🏷️ *Tarifa:* ${order.pricingTier.toUpperCase()} (${order.totalPieces} prendas)\n`;
  text += `🏢 *Cliente:* Diamy Laser Cut (diamylasercut.com.mx)\n\n`;
  text += `*DETALLE DEL PEDIDO:*\n`;

  order.items.forEach((item, idx) => {
    const sizesStr = Object.entries(item.sizes)
      .filter(([_, q]) => q > 0)
      .map(([s, q]) => `${s}: ${q}`)
      .join(", ");

    text += `\n${idx + 1}. *[${item.styleCode}]* ${item.modelName}\n`;
    text += `   • Color: *${item.color.name}*\n`;
    text += `   • Tallas: ${sizesStr}\n`;
    text += `   • Subtotal fila: ${item.totalPieces} pzas = $${item.lineTotal.toFixed(2)} MXN\n`;
  });

  text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📦 *TOTAL PRENDAS:* ${order.totalPieces} piezas\n`;
  text += `💰 *TOTAL A PAGAR:* $${order.total.toFixed(2)} MXN (IVA Incluido)\n`;
  if (order.notes) {
    text += `📝 *Notas:* ${order.notes}\n`;
  }
  text += `\nFavor de confirmar existencias y generar ficha de pago. ¡Muchas gracias!`;

  return text;
}
