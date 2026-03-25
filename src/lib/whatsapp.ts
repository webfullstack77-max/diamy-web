export function getWhatsAppUrl(productTitle: string, productUrl?: string, modelNumber?: number): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const modelText = modelNumber ? `, Modelo #${modelNumber}` : "";
  const text = productUrl
    ? `Hola, me interesa el producto "${productTitle}"${modelText}. Lo vi en: ${productUrl}`
    : `Hola, me interesa el producto "${productTitle}"${modelText}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
