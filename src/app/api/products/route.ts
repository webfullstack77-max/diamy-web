import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria");
  const material = searchParams.get("material");
  const search = searchParams.get("q");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoria && { category: { slug: categoria } }),
      ...(material && { materials: { has: material } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
