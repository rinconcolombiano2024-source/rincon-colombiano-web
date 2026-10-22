import Link from "next/link";
import { requireAdminIdentity } from "@/lib/admin/auth";
import { buildRcOrderaOrderUrl, getRcOrderaPublicAppUrl, getRcOrderaRestaurantId, getRcOrderaServerConfig } from "@/integrations/rc-ordera/config";
import RcOrderaMenuManager from "@/components/admin/RcOrderaMenuManager";
import { loadRcOrderaPublicCatalog } from "@/integrations/rc-ordera/public-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const money = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });

const messages = {
  ready: "Catálogo público disponible.",
  "not-configured": "Falta configurar el acceso a RC ORDERA. No mostraremos productos ficticios.",
  "restaurant-not-found": "La sede no existe o no está activa en RC ORDERA.",
  unavailable: "No se ha podido consultar el catálogo público de RC ORDERA.",
} as const;

/**
 * Separate public catalog visibility from owner-only write operations.
 * The editorial product module requires its own RC ORDERA authentication,
 * without exposing a service key or modifying live menus on page load.
 */
export default async function AdminMenuPage() {
  const admin = await requireAdminIdentity();
  const result = await loadRcOrderaPublicCatalog("czapelska");
  const catalog = result.catalog;
  const publishedProducts = catalog?.categories.flatMap((group) => group.products) ?? [];
  const translationCoverage = ([
    { locale: "pl", label: "Polski" },
    { locale: "es", label: "Español" },
    { locale: "en", label: "English" },
  ] as const).map(({ locale, label }) => ({
    locale,
    label,
    completed: publishedProducts.filter((product) =>
      Boolean(product.translations?.[locale]?.name.trim())).length,
  }));
  const integration = getRcOrderaServerConfig();
  const restaurantId = getRcOrderaRestaurantId("czapelska");
  const canEditMenu = admin.role === "owner" || admin.role === "editor";
  const editorConfig = integration && restaurantId && canEditMenu
    ? { supabaseUrl: integration.supabaseUrl, anonKey: integration.anonKey, restaurantId }
    : null;

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#12100e]">
      <div className="grid h-2 grid-cols-[2fr_1fr_1fr]" aria-hidden="true">
        <div className="bg-[#f7c600]" />
        <div className="bg-[#123d73]" />
        <div className="bg-[#c92d39]" />
      </div>
      <div className="site-container py-8 sm:py-12">
        <nav aria-label="Navegación administrativa" className="flex flex-wrap gap-4 text-sm font-bold text-[#123d73]">
          <Link href="/admin" className="underline underline-offset-4">← Volver al panel</Link>
          <Link href="/admin/content" className="underline underline-offset-4">Contenido y páginas</Link>
          <Link href="/admin/brand" className="underline underline-offset-4">Identidad visual</Link>
        </nav>

        <header className="mt-8 rounded-[2rem] bg-[#123d73] p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-widest text-[#f7c600]">RC ORDERA · integración</p>
          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Menú y disponibilidad</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85">
            Consulta el catálogo público y conecta tu cuenta propietaria de RC ORDERA
            para actualizar productos, precios, fotos y disponibilidad desde este panel.
          </p>
          <p className="mt-4 text-xs text-white/70">Sesión: {admin.email}</p>
        </header>

        <section aria-labelledby="sync-status" className="mt-6 rounded-3xl border border-[#e4dccf] bg-white p-6 sm:p-8">
          <h2 id="sync-status" className="font-serif text-xl font-bold">Estado · Czapelska 33</h2>
          <p role="status" className="mt-2 text-sm leading-6 text-[#62594f]">{messages[result.status]}</p>
          {catalog ? (
            <p className="mt-3 text-sm font-bold text-[#123d73]">
              {catalog.categories.length} categorías · {catalog.productCount} productos ·
              Origen: {catalog.source === "rpc" ? "RPC oficial" : "catálogo de respaldo"}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-[#756b61]">
            La web consulta directamente el catálogo público de RC ORDERA y lo muestra en español,
            polaco e inglés. No copies ni mantengas dos menús independientes.
            Los productos agotados no se muestran y la caché pública puede tardar
            hasta cinco minutos en reflejar cambios guardados en RC ORDERA.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/pl/menu" target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-[#f7c600] px-5 text-sm font-black text-[#12100e]">
              Ver menú importado en nuestra web ↗
            </Link>
            <a href={buildRcOrderaOrderUrl("czapelska")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-[#123d73] px-5 text-sm font-black text-[#123d73]">
              Comparar con menú original RC ORDERA ↗
            </a>
            <a href={getRcOrderaPublicAppUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-[#123d73] px-5 text-sm font-black text-[#123d73]">
              Abrir RC ORDERA ↗
            </a>
          </div>
        </section>

        {catalog ? (
          <section aria-labelledby="ordera-translation-coverage" className="mt-6 rounded-3xl border border-[#e4dccf] bg-white p-6 sm:p-8">
            <h2 id="ordera-translation-coverage" className="font-serif text-2xl font-bold">
              Cobertura de idiomas del menú
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#62594f]">
              Estos valores reflejan nombres traducidos realmente presentes en el catálogo público
              de RC ORDERA, no traducciones automáticas. Completa los idiomas pendientes desde
              el editor de productos y guarda con la cuenta propietaria.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {translationCoverage.map(({ locale, label, completed }) => (
                <div key={locale} className="rounded-2xl border border-[#e4dccf] bg-[#faf9f6] p-5">
                  <p className="text-sm font-black text-[#123d73]">{label}</p>
                  <p className="mt-2 font-serif text-3xl font-bold">
                    {completed} <span className="text-base font-medium text-[#62594f]">/ {publishedProducts.length}</span>
                  </p>
                  <progress
                    aria-label={`Productos con nombre en ${label}`}
                    value={completed}
                    max={Math.max(1, publishedProducts.length)}
                    className="mt-4 h-3 w-full accent-[#123d73]"
                  />
                  <p className="mt-2 text-xs text-[#62594f]">
                    {Math.max(0, publishedProducts.length - completed)} traducciones pendientes
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {catalog ? (
          <section aria-labelledby="catalog-title" className="mt-6">
            <h2 id="catalog-title" className="font-serif text-2xl font-bold">Productos publicados</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {catalog.categories.map((category, categoryIndex) => (
                <article key={`${categoryIndex}-${category.name}`} className="rounded-3xl border border-[#e4dccf] bg-white p-5">
                  <h3 className="font-serif text-xl font-bold">{category.name}</h3>
                  <ul className="mt-4 divide-y divide-[#ece7df]">
                    {category.products.map((product, index) => (
                      <li key={product.id ?? `${product.name}-${index}`} className="flex justify-between gap-5 py-3">
                        <div>
                          <p className="text-sm font-bold">{product.name}</p>
                          <p className={`mt-1 text-xs ${product.available ? "text-emerald-700" : "text-red-700"}`}>
                            {product.available ? "Disponible" : "No disponible"}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold">{money.format(product.price)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {editorConfig ? (
          <RcOrderaMenuManager config={editorConfig} />
        ) : (
          <section className="mt-6 rounded-3xl border border-[#ead6a0] bg-[#fff8e4] p-6 text-sm leading-7">
            <h2 className="font-serif text-xl font-bold">Edición directa del menú</h2>
            <p className="mt-2">
              {!canEditMenu
                ? "Tu rol de publicación puede consultar este catálogo, pero no editar los productos."
                : "Para activar el editor conecta RC_ORDERA_SUPABASE_URL y RC_ORDERA_SUPABASE_ANON_KEY en el servidor de esta web. La edición exige iniciar sesión también con la cuenta propietaria de RC ORDERA."}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
