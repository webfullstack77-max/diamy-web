export const dynamic = "force-dynamic";

export default function PrivacidadPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-2">
        Aviso de Privacidad
      </h1>
      <p className="text-xs text-on-surface-muted mb-8">
        Última actualización: abril 2026
      </p>

      <div className="space-y-8 text-sm text-on-surface leading-relaxed">

        <section>
          <h2 className="font-semibold text-base text-on-surface mb-2">1. Identidad y domicilio del Responsable</h2>
          <p>
            <strong>Diamy Laser Cut</strong> (en adelante, "Diamy"), con domicilio en el Estado de Morelos, México, es responsable del tratamiento de sus datos personales en términos de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
          </p>
          <p className="mt-2">
            Contacto del responsable:{" "}
            <a href="mailto:ventas@diamylasercut.com.mx" className="text-primary hover:underline">
              ventas@diamylasercut.com.mx
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-on-surface mb-2">2. Datos personales recabados</h2>
          <p>Para llevar a cabo las finalidades descritas en este aviso, recabamos los siguientes datos personales:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-on-surface-muted">
            <li>Nombre completo</li>
            <li>Número de teléfono (WhatsApp o llamada)</li>
            <li>Correo electrónico</li>
            <li>Dirección de entrega (para envíos)</li>
            <li>Información sobre el pedido o diseño solicitado</li>
          </ul>
          <p className="mt-2">
            No recabamos datos personales sensibles (datos de salud, biométricos, etc.).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-on-surface mb-2">3. Finalidades del tratamiento</h2>
          <p className="font-medium text-on-surface mb-1">Finalidades primarias (necesarias para el servicio):</p>
          <ul className="list-disc pl-5 space-y-1 text-on-surface-muted">
            <li>Procesar y gestionar su pedido personalizado</li>
            <li>Enviar cotizaciones y confirmar condiciones de compra</li>
            <li>Coordinar la entrega o envío del producto</li>
            <li>Brindar atención al cliente y soporte posventa</li>
          </ul>
          <p className="font-medium text-on-surface mt-3 mb-1">Finalidades secundarias (puede oponerse):</p>
          <ul className="list-disc pl-5 space-y-1 text-on-surface-muted">
            <li>Envío de promociones, novedades y ofertas especiales</li>
            <li>Encuestas de satisfacción</li>
          </ul>
          <p className="mt-2">
            Si no desea que sus datos sean tratados para las finalidades secundarias, puede manifestarlo enviando un correo a{" "}
            <a href="mailto:ventas@diamylasercut.com.mx" className="text-primary hover:underline">
              ventas@diamylasercut.com.mx
            </a>{" "}
            con el asunto "Oposición a finalidades secundarias".
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-on-surface mb-2">4. Transferencias de datos</h2>
          <p>
            Diamy no vende, cede ni transfiere sus datos personales a terceros, salvo en los siguientes casos necesarios para el cumplimiento del servicio:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-on-surface-muted">
            <li>
              <strong>Empresas de paquetería:</strong> su nombre y dirección de entrega se comparten con el servicio de mensajería para realizar el envío.
            </li>
          </ul>
          <p className="mt-2">
            Estas transferencias no requieren su consentimiento conforme al artículo 37 de la LFPDPPP por ser necesarias para la relación jurídica entre las partes.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-on-surface mb-2">5. Derechos ARCO</h2>
          <p>
            Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong> al tratamiento de sus datos personales (derechos ARCO). Para ejercer estos derechos, envíe una solicitud a:
          </p>
          <p className="mt-2">
            <a href="mailto:ventas@diamylasercut.com.mx" className="text-primary hover:underline">
              ventas@diamylasercut.com.mx
            </a>
          </p>
          <p className="mt-2">Su solicitud debe incluir:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-on-surface-muted">
            <li>Nombre completo e identificación oficial</li>
            <li>Descripción clara del derecho que desea ejercer</li>
            <li>Los datos personales sobre los que solicita la acción</li>
          </ul>
          <p className="mt-2">
            Responderemos en un plazo máximo de 20 días hábiles conforme a lo establecido en la ley.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-on-surface mb-2">6. Medidas de seguridad</h2>
          <p>
            Implementamos medidas técnicas y administrativas para proteger sus datos personales contra pérdida, uso indebido, alteración o acceso no autorizado.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-on-surface mb-2">7. Cambios al aviso de privacidad</h2>
          <p>
            Cualquier modificación a este aviso de privacidad se notificará mediante actualización en esta página. Le recomendamos revisarla periódicamente. La fecha de la última actualización aparece al inicio de este documento.
          </p>
        </section>

        <section className="bg-surface-container rounded-xl p-4 border border-outline-variant">
          <p className="text-xs text-on-surface-muted">
            Este aviso fue elaborado en cumplimiento de la{" "}
            <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</strong>{" "}
            (LFPDPPP, DOF 05-07-2010) y su Reglamento (DOF 21-12-2011).
          </p>
        </section>

      </div>
    </div>
  );
}
