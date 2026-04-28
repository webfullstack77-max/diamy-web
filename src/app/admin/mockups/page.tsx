import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MockupGenerator from "@/components/admin/MockupGenerator";

export const dynamic = "force-dynamic";

export default async function MockupsPage() {
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
      <h1 className="text-2xl font-bold text-on-surface">Generador de Mockups</h1>
      <MockupGenerator templates={templates as any} />
    </div>
  );
}
