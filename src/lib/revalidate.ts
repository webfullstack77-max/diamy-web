import { revalidatePath } from "next/cache";

export function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/producto/[slug]", "page");
}
