"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Category {
  slug: string;
  name: string;
  children?: { slug: string; name: string }[];
}

interface Props {
  categories: Category[];
}

export default function FilterChips({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setFilter(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  const activeCategory = params.get("categoria");

  const activeParent = categories.find(
    (c) =>
      c.slug === activeCategory ||
      c.children?.some((s) => s.slug === activeCategory)
  );
  const subcategories = activeParent?.children ?? [];

  return (
    <div className="md:hidden space-y-2 pb-2">
      {/* Fila 1: categorías padre */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("categoria", null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            !activeCategory
              ? "bg-primary text-on-primary"
              : "bg-surface-container text-on-surface"
          }`}
        >
          Todo
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setFilter("categoria", c.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeParent?.slug === c.slug
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Fila 2: subcategorías de la categoría activa */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subcategories.map((s) => (
            <button
              key={s.slug}
              onClick={() => setFilter("categoria", s.slug)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition border ${
                activeCategory === s.slug
                  ? "bg-secondary text-on-secondary border-secondary"
                  : "bg-primary/10 text-primary border-primary/30"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
