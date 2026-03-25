import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface mb-2 text-center">
          Nuestras Categorías
        </h2>
        <p className="text-on-surface-muted text-sm mb-8 text-center">
          Elige la categoría que mejor se adapta a tu proyecto
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-surface-container border-2 border-primary-container group-hover:border-primary transition-all duration-300 group-hover:scale-105 shadow-sm">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-container">
                    <span
                      className="material-symbol text-primary"
                      style={{ fontSize: "32px" }}
                    >
                      category
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-on-surface text-center group-hover:text-primary transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
