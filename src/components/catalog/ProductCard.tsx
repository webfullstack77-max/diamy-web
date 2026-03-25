import Link from "next/link";
import Image from "next/image";
import type { Product, Category } from "@/types";

type ProductWithCategory = Product & { category?: Category };

interface Props {
  product: ProductWithCategory;
}

export default function ProductCard({ product }: Props) {
  const img = product.images[0] ?? null;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="material-symbol text-outline"
              style={{ fontSize: "48px" }}
            >
              image
            </span>
          </div>
        )}
        {product.originalPrice && (
          <span className="absolute top-2 left-2 bg-secondary text-on-secondary text-xs font-bold px-2 py-0.5 rounded-full">
            Oferta
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs text-primary font-medium uppercase tracking-wide mb-1">
            {product.category.name}
          </span>
        )}
        <h3 className="font-semibold text-on-surface text-sm leading-snug line-clamp-2 mb-2">
          {product.title}
        </h3>

        {/* Materials */}
        {product.materials.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.materials.slice(0, 2).map((m) => (
              <span
                key={m}
                className="text-xs bg-surface-container text-on-surface-muted px-2 py-0.5 rounded-full"
              >
                {m}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-on-surface">
              ${product.price.toLocaleString("es-MX")}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-on-surface-muted line-through">
                ${product.originalPrice.toLocaleString("es-MX")}
              </span>
            )}
          </div>
          <span
            className="material-symbol text-primary"
            style={{ fontSize: "20px" }}
          >
            arrow_forward
          </span>
        </div>
      </div>
    </Link>
  );
}
