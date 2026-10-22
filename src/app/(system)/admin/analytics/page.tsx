import Link from "next/link";
import { AnalyticsExport } from "@/components/admin/AnalyticsExport";
import { AnalyticsTrend } from "@/components/admin/AnalyticsTrend";
import { requireAdminIdentity } from "@/lib/admin/auth";
import { analyticsPeriod, getAnalyticsReadiness, getAnalyticsReport } from "@/lib/analytics/reports";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const number = new Intl.NumberFormat("es-ES");

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdminIdentity();
  const readiness = getAnalyticsReadiness();
  const days = analyticsPeriod((await searchParams).days);
  const report = await getAnalyticsReport(String(days));
  return (
    <main className="min-h-screen bg-[#f4f1eb] px-4 py-8 text-[#171717] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="font-bold text-[#123d73] underline underline-offset-4">← Administración</Link>
        <header className="mt-6 rounded-3xl bg-[#123d73] p-6 text-white sm:p-9">
          <p className="text-sm font-bold tracking-widest text-[#f7c600]">RINCÓN COLOMBIANO CEO</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Visitas y oportunidades de pedido</h1>
          <p className="mt-3 max-w-3xl leading-7">Conoce cuántas personas visitan la web, qué páginas consultan y cuántas veces abren un canal de pedidos.</p>
        </header>
        <nav aria-label="Periodo de estadísticas" className="my-6 flex flex-wrap gap-3">
          {[7, 30, 90].map(period => <Link key={period} href={`/admin/analytics?days=${period}`} aria-current={days === period ? "page" : undefined} className={`rounded-xl border-2 border-[#123d73] px-5 py-3 font-bold ${days === period ? "bg-[#123d73] text-white" : "bg-white text-[#123d73]"}`}>Últimos {period} días</Link>)}
        </nav>
        {report.status !== "ready" ? (
          <section className="rounded-2xl border border-[#123d73]/20 bg-white p-6">
            <h2 className="text-xl font-bold">{report.status === "not-configured" ? "Conecta las estadísticas de tu web" : "No se han podido consultar las estadísticas"}</h2>
            <p className="mt-3 leading-7">{report.status === "not-configured" ? "El contador de visitantes todavía no está conectado. No inventamos cifras: las visitas anteriores a la activación no se pueden reconstruir." : "Vuelve a intentarlo en unos minutos. Si continúa, revisa los permisos de lectura y la conexión de Google Analytics."}</p>
            {report.status === "not-configured" ? (
              <div className="mt-5 space-y-3 text-sm leading-6">
                <p className="font-bold text-[#123d73]">Estado de la conexión (sin mostrar credenciales)</p>
                <p>Medición de visitas GA4: <strong>{readiness.trackingConfigured ? "Configurada" : "Pendiente"}</strong></p>
                <p>Lectura de informes en CEO: <strong>{readiness.reportingConfigured ? "Configurada · falta verificar acceso" : "Pendiente"}</strong></p>
                <p>Para empezar, crea una propiedad y flujo web GA4 para rinconcolombiano.pl. Añade su ID G-... en la variable de Vercel <code className="font-bold">NEXT_PUBLIC_GA_MEASUREMENT_ID</code> y publica una nueva versión: la web sólo cargará el medidor después del consentimiento de cookies.</p>
                <p>Para ver los datos aquí, concede acceso de lectura de la propiedad a una cuenta de servicio de Google y configura en Vercel <code className="font-bold">GA_PROPERTY_ID</code>, <code className="font-bold">GA_CLIENT_EMAIL</code> y <code className="font-bold">GA_PRIVATE_KEY</code>. Nunca pegues las claves en la web pública ni en GitHub.</p>
                <p>Esta página muestra visitantes medidos, sesiones, páginas vistas y clics hacia pedidos. El seguimiento depende del consentimiento y de los bloqueadores.</p>
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-[#123d73] px-5 font-bold text-white">Abrir Google Analytics ↗</a>
              <a href="https://vercel.com/jhon-mendez-s-projects/rincon-colombiano-web/analytics" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl border border-[#123d73] px-5 font-bold text-[#123d73]">Ver Analytics de Vercel ↗</a>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#62594f]">Vercel Web Analytics es un servicio independiente: debes activarlo en Vercel. Activarlo no conecta automáticamente las cifras de Google Analytics en este panel.</p>
          </section>
        ) : (
          <>
            <div className="mb-5 flex justify-end"><AnalyticsExport report={report} days={days} /></div>
            <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[{ title: "Visitantes medidos", count: report.totals[0] }, { title: "Sesiones", count: report.totals[1] }, { title: "Páginas vistas", count: report.totals[2] }, { title: "Clics para pedir", count: report.orderClicks }].map(item => (
                <article key={item.title} className="rounded-2xl border-t-4 border-[#f7c600] bg-white p-6 shadow-sm"><h2 className="font-bold text-[#123d73]">{item.title}</h2><p className="mt-3 text-4xl font-extrabold">{number.format(item.count ?? 0)}</p></article>
              ))}
            </section>
            <AnalyticsTrend days={report.days} />
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {[{ title: "Páginas más visitadas", label: "Página", metric: "Vistas", rows: report.pages }, { title: "De dónde llegan las visitas", label: "Canal", metric: "Sesiones", rows: report.sources }, { title: "Evolución diaria", label: "Fecha", metric: "Vistas", rows: report.days }].map(section => (
                <section key={section.title} className="min-w-0 rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-[#123d73]">{section.title}</h2>
                  {section.rows.length === 0 ? <p className="mt-4">Sin actividad registrada en este periodo.</p> : <div className="mt-4 max-h-96 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th scope="col" className="pb-3">{section.label}</th><th scope="col" className="pb-3 text-right">{section.metric}</th></tr></thead><tbody>{section.rows.map((row, i) => <tr key={`${row.label}-${i}`} className="border-t border-black/10"><th scope="row" className="break-all py-3 pr-3 font-normal">{section.label === "Fecha" && /^\d{8}$/.test(row.label) ? `${row.label.slice(6)}/${row.label.slice(4, 6)}/${row.label.slice(0, 4)}` : row.label}</th><td className="py-3 text-right font-bold">{number.format(row.values[0] ?? 0)}</td></tr>)}</tbody></table></div>}
                </section>
              ))}
            </div>
            <p className="mt-5 text-sm text-[#62594f]">Consulta: {new Date(report.updatedAt).toLocaleString("es-ES", { timeZone: "Europe/Warsaw" })} (Varsovia). Periodo según la zona horaria de la propiedad: {report.timeZone}. Actualización de consulta cada minuto; Google puede procesar los datos con retraso.</p>
          </>
        )}
        <p className="mt-6 max-w-4xl text-sm leading-6 text-[#62594f]">La medición depende del consentimiento y puede excluir visitas que rechazan cookies o usan bloqueadores. Una sesión puede incluir varias páginas. Los clics hacia RC ORDERA, SumUp o aplicaciones de reparto indican interés: no confirman un pedido ni un pago. No se recuperan visitas anteriores a la activación de la medición.</p>
      </div>
    </main>
  );
}

