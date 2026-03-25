"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center gap-4">
        {/* Logo + Home */}
        <div className="shrink-0 flex items-center gap-2">
          <Link
            href="/"
            aria-label="Inicio"
            className="p-1.5 rounded-full hover:bg-primary-container transition"
          >
            <span className="material-symbol text-primary" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>
              home
            </span>
          </Link>
          <Link
            href="/"
            className="font-serif text-xl font-bold text-primary tracking-tight"
          >
            Diamy Laser Cut
          </Link>
        </div>

        {/* Search — hidden on mobile, visible md+ */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xl mx-auto"
        >
          <div className="relative w-full">
            <span
              className="material-symbol absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted select-none"
              style={{ fontSize: "20px" }}
            >
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          {/* Mobile search icon */}
          <Link
            href="/catalogo"
            className="md:hidden p-2 rounded-full hover:bg-surface-container transition"
            aria-label="Buscar"
          >
            <span className="material-symbol text-on-surface" style={{ fontSize: "22px" }}>
              search
            </span>
          </Link>

          <Link
            href="/catalogo"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:bg-primary-dark transition"
          >
            <span className="material-symbol" style={{ fontSize: "18px" }}>
              grid_view
            </span>
            Catálogo
          </Link>
        </div>
      </div>
    </header>
  );
}
