import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Estadísticas | Admin" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ rango?: string }>;
}

function getRangeStart(rango: string): Date {
  const now = new Date();
  if (rango === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (rango === "90d") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // default 30d
}

function formatPath(path: string): string {
  if (path === "/") return "Inicio";
  if (path.startsWith("/producto/")) return `Producto: ${path.replace("/producto/", "")}`;
  if (path.startsWith("/catalogo")) return "Catálogo";
  if (path.startsWith("/contacto")) return "Contacto";
  return path;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export default async function EstadisticasPage({ searchParams }: Props) {
  const { rango = "30d" } = await searchParams;
  const rangeStart = getRangeStart(rango);
  const now = new Date();

  // Inicio de hoy y semana
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalHoy, totalSemana, totalMes, totalHistorico] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.pageView.count(),
  ]);

  // Visitas por día en el rango seleccionado
  type DayRow = { day: Date; count: number };
  const visitasPorDia = await prisma.$queryRaw<DayRow[]>`
    SELECT
      DATE_TRUNC('day', "createdAt") AS day,
      COUNT(*)::int AS count
    FROM page_views
    WHERE "createdAt" >= ${rangeStart}
    GROUP BY day
    ORDER BY day ASC
  `;

  // Top páginas
  const topPaginas = await prisma.pageView.groupBy({
    by: ["path"],
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: 10,
    where: { createdAt: { gte: rangeStart } },
  });

  const maxVisitas = Math.max(...visitasPorDia.map((d) => d.count), 1);
  const totalRango = visitasPorDia.reduce((s, d) => s + d.count, 0);

  const rangos = [
    { label: "7 días", value: "7d" },
    { label: "30 días", value: "30d" },
    { label: "90 días", value: "90d" },
  ];

  const cards = [
    { label: "Hoy", value: totalHoy, icon: "today", color: "text-blue-500" },
    { label: "Esta semana", value: totalSemana, icon: "date_range", color: "text-violet-500" },
    { label: "Este mes", value: totalMes, icon: "calendar_month", color: "text-pink-500" },
    { label: "Total histórico", value: totalHistorico, icon: "bar_chart", color: "text-primary" },
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface">Estadísticas</h1>
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface rounded-2xl border border-outline-variant p-5">
            <span
              className={`material-symbol ${c.color}`}
              style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
            >
              {c.icon}
            </span>
            <p className="text-2xl font-bold text-on-surface mt-2">{c.value.toLocaleString("es-MX")}</p>
            <p className="text-sm text-on-surface-muted">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Gráfica + filtros */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-on-surface">Visitas por día</h2>
            <p className="text-sm text-on-surface-muted mt-0.5">
              {totalRango.toLocaleString("es-MX")} visitas en el período seleccionado
            </p>
          </div>
          <div className="flex gap-2">
            {rangos.map((r) => (
              <Link
                key={r.value}
                href={`/admin/estadisticas?rango=${r.value}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  rango === r.value
                    ? "bg-primary text-white"
                    : "bg-surface-container text-on-surface-muted hover:text-on-surface"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        {visitasPorDia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbol text-outline mb-2" style={{ fontSize: "40px" }}>bar_chart</span>
            <p className="text-on-surface-muted text-sm">Sin datos en este período</p>
          </div>
        ) : (
          <div className="flex items-end gap-1 h-40 overflow-x-auto pb-6">
            {visitasPorDia.map((d) => {
              const heightPct = Math.max((d.count / maxVisitas) * 100, 4);
              return (
                <div key={d.day.toString()} className="flex flex-col items-center gap-1 flex-1 min-w-[28px] group">
                  <span className="text-xs text-on-surface font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${formatDate(new Date(d.day))}: ${d.count} visitas`}
                  />
                  <span
                    className="text-[9px] text-on-surface-muted -rotate-45 origin-top-left whitespace-nowrap mt-1"
                    style={{ fontSize: "9px" }}
                  >
                    {formatDate(new Date(d.day))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top páginas */}
      <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
        <div className="p-5 border-b border-outline-variant">
          <h2 className="font-semibold text-on-surface">Páginas más visitadas</h2>
          <p className="text-sm text-on-surface-muted mt-0.5">En el período seleccionado</p>
        </div>
        {topPaginas.length === 0 ? (
          <p className="text-center text-on-surface-muted text-sm py-8">Sin datos</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container">
              <tr>
                <th className="text-left px-5 py-3 text-on-surface-muted font-medium">#</th>
                <th className="text-left px-5 py-3 text-on-surface-muted font-medium">Página</th>
                <th className="text-left px-5 py-3 text-on-surface-muted font-medium">Ruta</th>
                <th className="text-right px-5 py-3 text-on-surface-muted font-medium">Visitas</th>
                <th className="text-right px-5 py-3 text-on-surface-muted font-medium hidden sm:table-cell">%</th>
              </tr>
            </thead>
            <tbody>
              {topPaginas.map((p, i) => {
                const pct = totalRango > 0 ? ((p._count.path / totalRango) * 100).toFixed(1) : "0";
                return (
                  <tr key={p.path} className={i % 2 === 0 ? "" : "bg-surface-container/30"}>
                    <td className="px-5 py-3 text-on-surface-muted">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-on-surface">{formatPath(p.path)}</td>
                    <td className="px-5 py-3 text-on-surface-muted font-mono text-xs">{p.path}</td>
                    <td className="px-5 py-3 text-right font-semibold text-on-surface">
                      {p._count.path.toLocaleString("es-MX")}
                    </td>
                    <td className="px-5 py-3 text-right text-on-surface-muted hidden sm:table-cell">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
