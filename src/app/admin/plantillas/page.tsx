import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlantillasPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const templates = await prisma.garmentTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Plantillas de Prenda</h1>
        <Link
          href="/admin/plantillas/nueva"
          className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-dark transition flex items-center gap-2"
        >
          <span className="material-symbol" style={{ fontSize: "20px" }}>add</span>
          Nueva plantilla
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-outline-variant p-12 text-center">
          <p className="text-on-surface-muted mb-4">No hay plantillas yet</p>
          <Link
            href="/admin/plantillas/nueva"
            className="text-primary font-semibold hover:underline"
          >
            Crear la primera →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/admin/plantillas/${template.id}`}
              className="group bg-surface rounded-2xl border border-outline-variant overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative h-64 bg-surface-container">
                <Image
                  src={template.imageUrl}
                  alt={template.name}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-on-surface">{template.name}</h3>
                <p className="text-xs text-on-surface-muted capitalize">
                  {template.category}
                </p>
                <p className="text-xs text-on-surface-muted">
                  {new Date(template.createdAt).toLocaleDateString("es-MX")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
