"use client";

import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation";
import { useState } from "react";

interface SubCategory {
  slug: string;
  name: string;
}

interface CategoryWithChildren {
  slug: string;
  name: string;
  children: SubCategory[];
}

interface Props {
  categories: CategoryWithChildren[];
}

export default function FilterSidebar({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCategory = params.get("categoria");

  // Categorías expandidas (por slug)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Auto-expandir si la categoría activa tiene hijos
    categories.forEach((c) => {
      if (c.slug === activeCategory || c.children.some((s) => s.slug === activeCategory)) {
        initial.add(c.slug);
      }
    });
    return initial;
  });

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function toggleExpand(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  }

  function handleCategoryClick(cat: CategoryWithChildren) {
    if (cat.children.length > 0) {
      const alreadyActiveAndExpanded = activeCategory === cat.slug && expanded.has(cat.slug);
      if (alreadyActiveAndExpanded) {
        // Segundo clic: contraer
        setExpanded(new Set());
      } else {
        updateParam("categoria", cat.slug);
        setExpanded(new Set([cat.slug]));
      }
    } else {
      updateParam("categoria", cat.slug);
      setExpanded(new Set());
    }
  }

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <div className="sticky top-24 space-y-6">

        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-muted mb-3">
            Categorías
          </h3>
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => { updateParam("categoria", null); setExpanded(new Set()); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                  !activeCategory ? "bg-primary text-on-primary font-medium" : "text-on-surface hover:bg-surface-container"
                }`}
              >
                Todos
              </button>
            </li>

            {categories.map((cat) => {
              const isActive = activeCategory === cat.slug;
              const hasChildren = cat.children.length > 0;
              const isExpanded = expanded.has(cat.slug);
              const childIsActive = cat.children.some((s) => s.slug === activeCategory);

              return (
                <li key={cat.slug}>
                  {/* Fila de categoría padre */}
                  <div className="flex items-center group">
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className={`flex-1 text-left px-3 py-1.5 rounded-lg text-sm transition ${
                        isActive
                          ? "bg-primary text-on-primary font-medium"
                          : childIsActive
                          ? "text-primary font-medium hover:bg-surface-container"
                          : "text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {cat.name}
                    </button>
                    {hasChildren && (
                      <button
                        onClick={() => toggleExpand(cat.slug)}
                        className={`p-1 rounded-md transition shrink-0 ${
                          isActive ? "text-on-primary/70" : "text-on-surface-muted hover:text-on-surface hover:bg-surface-container"
                        }`}
                        title={isExpanded ? "Colapsar" : "Expandir"}
                      >
                        <span
                          className="material-symbol block transition-transform duration-200"
                          style={{ fontSize: "16px", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                        >
                          chevron_right
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Subcategorías */}
                  {hasChildren && isExpanded && (
                    <ul className="mt-0.5 ml-3 pl-3 border-l-2 border-primary/20 space-y-0.5">
                      {cat.children.map((sub) => (
                        <li key={sub.slug}>
                          <button
                            onClick={() => updateParam("categoria", sub.slug)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                              activeCategory === sub.slug
                                ? "bg-primary-container text-primary font-medium"
                                : "text-on-surface-muted hover:bg-surface-container hover:text-on-surface"
                            }`}
                          >
                            {sub.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-primary-container rounded-2xl p-4">
          <p className="text-sm font-medium text-primary mb-2">¿Diseño especial?</p>
          <p className="text-xs text-on-surface-muted mb-3">Contáctanos para piezas personalizadas</p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
          >
            <span className="material-symbol" style={{ fontSize: "16px" }}>chat</span>
            WhatsApp
          </a>
        </div>
      </div>
    </aside>
  );
}
