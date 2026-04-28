import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GarmentTemplateForm from "@/components/admin/GarmentTemplateForm";

export const dynamic = "force-dynamic";

export default async function EditPlantillaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const { id } = await params;
  const template = await prisma.garmentTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    redirect("/admin/plantillas");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface">Editar plantilla</h1>
      <GarmentTemplateForm template={template as any} />
    </div>
  );
}
