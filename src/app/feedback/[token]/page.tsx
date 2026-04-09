import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedbackForm from "@/components/feedback/FeedbackForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function FeedbackPage({ params }: Props) {
  const { token } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { token } });

  if (!testimonial) return notFound();

  if (testimonial.isSubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="text-center py-16">
          <span className="material-symbol text-primary" style={{ fontSize: 64 }}>check_circle</span>
          <h2 className="font-serif text-2xl font-bold text-on-surface mt-4 mb-2">
            ¡Ya enviaste tu reseña!
          </h2>
          <p className="text-on-surface-muted text-sm">
            Gracias por compartir tu experiencia con nosotros.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container/40 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbol text-primary" style={{ fontSize: 32 }}>star</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-on-surface mb-1">
            ¿Cómo fue tu experiencia?
          </h1>
          <p className="text-on-surface-muted text-sm">
            Tu opinión nos ayuda a mejorar y a otros clientes a conocer Diamy Laser Cut.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-md p-6 md:p-8">
          <FeedbackForm token={token} />
        </div>

        <p className="text-center text-xs text-on-surface-muted mt-6">
          Diamy Laser Cut · diamylasercut.com.mx
        </p>
      </div>
    </main>
  );
}
