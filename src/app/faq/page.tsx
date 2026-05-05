"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "¿Cómo hago mi pedido?",
    a: "Puedes contactarnos por WhatsApp o usar el formulario de contacto en nuestro sitio. Cuéntanos qué producto te interesa, las medidas aproximadas, colores y cualquier detalle de personalización. Te enviamos una cotización en menos de 24 horas.",
  },
  {
    q: "¿Cuánto tarda la entrega?",
    a: "El tiempo de producción es de 3 a 5 días hábiles dependiendo del producto y la cantidad. Una vez listo, el envío tarda entre 2 y 5 días hábiles adicionales según tu ubicación. Te avisamos cuando tu pedido esté en camino.",
  },
  {
    q: "¿Hacen envíos a todo México?",
    a: "Sí, tenemos cobertura nacional. Además, los envíos son gratis en compras mayores a $500 MXN. Para pedidos menores, el costo de envío se calcula según tu código postal.",
  },
  {
    q: "¿Puedo traer mi propio diseño?",
    a: "¡Por supuesto! Aceptamos archivos en formato PNG, PDF, AI (Illustrator) y SVG. Si tu diseño tiene fondo transparente y buena resolución, mejor. Si no tienes un archivo listo, nuestro equipo puede ayudarte a adaptarlo o crearlo desde cero.",
  },
  {
    q: "¿Cuál es el pedido mínimo?",
    a: "El pedido mínimo varía según el producto. Muchos artículos se pueden pedir desde 1 pieza (acrilicos, MDF, tazas, termos). Para playeras y stickers en cantidad el precio por pieza baja considerablemente. Consúltanos por WhatsApp para un presupuesto exacto.",
  },
  {
    q: "¿Qué materiales trabajan?",
    a: "Trabajamos con acrílico, MDF, coroplast, vinil adhesivo, playeras de algodón, tazas y termos sublimables, stickers y más. Si tienes una idea con un material distinto, con gusto lo evaluamos.",
  },
  {
    q: "¿Cuáles son los métodos de pago?",
    a: "Aceptamos transferencia bancaria, depósito en OXXO y efectivo para entregas locales en Morelos. Solicitamos un anticipo del 50% para confirmar el pedido y el resto contra entrega.",
  },
  {
    q: "¿Tienen garantía o hacen cambios?",
    a: "Sí. Si hay un error de nuestra parte en la producción (colores incorrectos, corte equivocado, texto mal escrito respecto al diseño aprobado), lo reponemos sin costo. Si el error es del diseño que el cliente aprobó, analizamos cada caso. Tu satisfacción es lo más importante.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <span
          className="material-symbol text-primary mb-3"
          style={{ fontSize: "48px", fontVariationSettings: "'FILL' 1" }}
        >
          help
        </span>
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          Preguntas Frecuentes
        </h1>
        <p className="text-on-surface-muted text-sm mt-2 max-w-md">
          Aquí respondemos las dudas más comunes. Si no encuentras lo que buscas,
          escríbenos por WhatsApp.
        </p>
      </div>

      {/* Acordeón */}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-outline-variant rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-on-surface hover:bg-surface-container transition"
            >
              <span>{faq.q}</span>
              <span
                className="material-symbol text-on-surface-muted shrink-0 ml-4 transition-transform duration-200"
                style={{
                  fontSize: "20px",
                  transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                expand_more
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-on-surface-muted leading-relaxed border-t border-outline-variant pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 bg-surface-container rounded-2xl p-6 text-center border border-outline-variant">
        <p className="text-sm text-on-surface-muted mb-4">
          ¿Tienes una pregunta que no está aquí?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "523211144447"}?text=${encodeURIComponent("Hola, tengo una pregunta sobre sus productos")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ebe57] transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.534 5.876L0 24l6.29-1.516A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.596-.477-5.112-1.312l-.368-.217-3.73.899.939-3.618-.24-.381A9.972 9.972 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
            </svg>
            Escribir por WhatsApp
          </a>
          <Link
            href="/contacto"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container transition"
          >
            <span className="material-symbol" style={{ fontSize: "16px" }}>mail</span>
            Formulario de contacto
          </Link>
        </div>
      </div>
    </div>
  );
}
