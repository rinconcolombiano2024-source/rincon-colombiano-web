import Link from "next/link";
import { requireAdminIdentity } from "@/lib/admin/auth";
import { analyticsPeriod, getAnalyticsReport } from "@/lib/analytics/reports";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const number = new Intl.NumberFormat("es-ES");

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdminIdentity();
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
            <p className="mt-3 leading-7">{report.status === "not-configured" ? "Hace falta conectar la propiedad de Google Analytics con acceso de lectura. Hasta entonces no mostramos cifras de visitas." : "Vuelve a intentarlo en unos minutos. Si continúa, revisa los permisos de lectura y la conexión de Google Analytics."}</p>
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#123d73] px-5 font-bold text-white">Abrir Google Analytics</a>
          </section>
        ) : (
          <>
            <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[{ title: "Visitantes medidos", count: report.totals[0] }, { title: "Sesiones", count: report.totals[1] }, { title: "Páginas vistas", count: report.totals[2] }, { title: "Clics para pedir", count: report.orderClicks }].map(item => (
                <article key={item.title} className="rounded-2xl border-t-4 border-[#f7c600] bg-white p-6 shadow-sm"><h2 className="font-bold text-[#123d73]">{item.title}</h2><p className="mt-3 text-4xl font-extrabold">{number.format(item.count ?? 0)}</p></article>
              ))}
            </section>
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
