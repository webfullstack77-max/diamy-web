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
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

function formatPath(path: string): string {
  if (path === "/") return "Inicio";
  if (path.startsWith("/producto/")) return `Producto: ${path.replace("/producto/", "")}`;
  if (path.startsWith("/catalogo")) return "Catálogo";
  if (path.startsWith("/contacto")) return "Contacto";
  return path;
}

function formatDate(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export default async function EstadisticasPage({ searchParams }: Props) {
  const { rango = "30d" } = await searchParams;
  const rangeStart = getRangeStart(rango);
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Traer todas las vistas para el rango con visitorId y path
  const viewsInRange = await prisma.pageView.findMany({
    where: { createdAt: { gte: rangeStart } },
    select: { createdAt: true, visitorId: true, path: true },
    orderBy: { createdAt: "asc" },
  });

  // Vistas de periodos fijos para las cards (visitantes únicos)
  const [viewsHoy, viewsSemana, viewsMes, viewsTotal] = await Promise.all([
    prisma.pageView.findMany({ where: { createdAt: { gte: todayStart } }, select: { visitorId: true } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: weekStart } }, select: { visitorId: true } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: monthStart } }, select: { visitorId: true } }),
    prisma.pageView.findMany({ select: { visitorId: true } }),
  ]);

  function uniqueVisitors(rows: { visitorId: string | null }[]) {
    return new Set(rows.map((r) => r.visitorId).filter(Boolean)).size;
  }

  const visitantesHoy = uniqueVisitors(viewsHoy);
  const visitantesSemana = uniqueVisitors(viewsSemana);
  const visitantesMes = uniqueVisitors(viewsMes);
  const visitantesTotal = uniqueVisitors(viewsTotal);

  // Visitantes únicos por día en el rango seleccionado
  const byDay = new Map<string, Set<string>>();
  for (const v of viewsInRange) {
    const day = v.createdAt.toISOString().slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, new Set());
    if (v.visitorId) byDay.get(day)!.add(v.visitorId);
  }
  const visitasPorDia = Array.from(byDay.entries())
    .map(([day, visitors]) => ({ day, count: visitors.size }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // Total visitantes únicos en el rango (para el subtítulo)
  const visitantesRango = new Set(viewsInRange.map((v) => v.visitorId).filter(Boolean)).size;

  // Top páginas (por page views, no por visitantes únicos)
  const byPath = new Map<string, number>();
  for (const v of viewsInRange) {
    byPath.set(v.path, (byPath.get(v.path) || 0) + 1);
  }
  const topPaginas = Array.from(byPath.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  const totalPageViewsRango = viewsInRange.length;
  const maxVisitas = Math.max(...visitasPorDia.map((d) => d.count), 1);

  const rangos = [
    { label: "7 días", value: "7d" },
    { label: "30 días", value: "30d" },
    { label: "90 días", value: "90d" },
  ];

  const cards = [
    { label: "Visitantes únicos hoy", value: visitantesHoy, icon: "person", color: "text-blue-500" },
    { label: "Visitantes únicos semana", value: visitantesSemana, icon: "people", color: "text-violet-500" },
    { label: "Visitantes únicos mes", value: visitantesMes, icon: "calendar_month", color: "text-pink-500" },
    { label: "Visitantes únicos total", value: visitantesTotal, icon: "bar_chart", color: "text-primary" },
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface">Estadísticas</h1>
      </div>

      {/* Cards */}
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
            <p className="text-xs text-on-surface-muted mt-0.5 leading-tight">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Gráfica */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-6 mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-on-surface">Visitantes únicos por día</h2>
            <p className="text-sm text-on-surface-muted mt-0.5">
              <span className="font-medium text-on-surface">{visitantesRango.toLocaleString("es-MX")}</span> visitantes únicos
              {" · "}
              <span className="font-medium text-on-surface">{totalPageViewsRango.toLocaleString("es-MX")}</span> páginas vistas
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
            <p className="text-on-surface-muted text-xs mt-1">Las visitas empezarán a aparecer cuando usuarios entren al sitio</p>
          </div>
        ) : (
          <div className="flex items-end gap-1 h-40 overflow-x-auto pb-6">
            {visitasPorDia.map((d) => {
              const heightPx = Math.max(Math.round((d.count / maxVisitas) * 100), 4);
              return (
                <div key={d.day} className="flex flex-col items-center gap-1 flex-1 min-w-[28px] group">
                  <span className="text-xs text-on-surface font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-all"
                    style={{ height: `${heightPx}px` }}
                    title={`${formatDate(d.day)}: ${d.count} visitante${d.count !== 1 ? "s" : ""}`}
                  />
                  <span className="text-on-surface-muted whitespace-nowrap mt-1" style={{ fontSize: "9px", transform: "rotate(-45deg)", transformOrigin: "top left", display: "block" }}>
                    {formatDate(d.day)}
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
          <p className="text-sm text-on-surface-muted mt-0.5">Por número de visitas en el período</p>
        </div>
        {topPaginas.length === 0 ? (
          <p className="text-center text-on-surface-muted text-sm py-8">Sin datos</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container">
              <tr>
                <th className="text-left px-5 py-3 text-on-surface-muted font-medium">#</th>
                <th className="text-left px-5 py-3 text-on-surface-muted font-medium">Página</th>
                <th className="text-left px-5 py-3 text-on-surface-muted font-medium hidden sm:table-cell">Ruta</th>
                <th className="text-right px-5 py-3 text-on-surface-muted font-medium">Visitas</th>
                <th className="text-right px-5 py-3 text-on-surface-muted font-medium hidden sm:table-cell">%</th>
              </tr>
            </thead>
            <tbody>
              {topPaginas.map((p, i) => {
                const pct = totalPageViewsRango > 0 ? ((p.count / totalPageViewsRango) * 100).toFixed(1) : "0";
                return (
                  <tr key={p.path} className={i % 2 === 0 ? "" : "bg-surface-container/30"}>
                    <td className="px-5 py-3 text-on-surface-muted">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-on-surface">{formatPath(p.path)}</td>
                    <td className="px-5 py-3 text-on-surface-muted font-mono text-xs hidden sm:table-cell">{p.path}</td>
                    <td className="px-5 py-3 text-right font-semibold text-on-surface">
                      {p.count.toLocaleString("es-MX")}
                    </td>
                    <td className="px-5 py-3 text-right text-on-surface-muted hidden sm:table-cell">{pct}%</td>
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
