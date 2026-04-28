import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import GarmentTemplateForm from "@/components/admin/GarmentTemplateForm";

export const dynamic = "force-dynamic";

export default async function NuevaPlantillaPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface">Nueva plantilla de prenda</h1>
      <GarmentTemplateForm />
    </div>
  );
}
