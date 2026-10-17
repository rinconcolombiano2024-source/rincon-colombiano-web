import Link from "next/link";
import { requireAdminIdentity } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { moderateReview } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Opiniones de clientes" };
const labels = { pending: "Pendientes", published: "Publicadas", rejected: "Retiradas" } as const;
type ReviewStatus = keyof typeof labels;
const messages: Record<string, string> = {
  saved: "Estado guardado. Las opiniones publicadas aparecen en la web.",
  conflict: "Esta opinión cambió mientras la revisabas. Comprueba su estado actual.",
  invalid: "La solicitud no es válida. Vuelve a intentarlo desde esta página.",
  forbidden: "Solo propietarios y responsables de publicación pueden moderar opiniones.",
  unavailable: "No se pudo guardar. Comprueba la conexión y los permisos de opiniones.",
};

export default async function ReviewsPage({ searchParams }: {
  searchParams: Promise<{ filter?: string; page?: string; result?: string }>;
}) {
  const admin = await requireAdminIdentity();
  const canModerate = admin.role === "owner" || admin.role === "publisher";
  const params = await searchParams;
  const filter: ReviewStatus = params.filter === "published" || params.filter === "rejected" ? params.filter : "pending";
  const requestedPage = Number(params.page ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1;
  const supabase = canModerate ? await createSupabaseServerClient() : null;
  const result = supabase ? await supabase.from("customer_reviews")
    .select("id,display_name,body,rating,status,created_at")
    .eq("status", filter).order("created_at", { ascending: false }).order("id")
    .range((page - 1) * 20, page * 20) : null;
  const rows = result?.data?.slice(0, 20) ?? [];
  const message = params.result ? messages[params.result] : undefined;
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-5 py-10">
    <Link href="/admin" className="font-semibold underline">← Panel de dirección</Link>
    <h1 className="text-3xl font-bold">Opiniones de clientes</h1>
    <p>Revisa las experiencias compartidas antes de publicarlas. Conservamos el texto y la valoración originales. Publica opiniones positivas y críticas que respeten las normas; retira spam, insultos o datos personales.</p>
    {message && <p role="status" className="rounded-xl border p-4">{message}</p>}
    {!canModerate ? <p>Solo propietarios y responsables de publicación pueden consultar y moderar opiniones.</p> : <>
      <nav aria-label="Estado de las opiniones" className="flex flex-wrap gap-3">{Object.entries(labels).map(([key, label]) =>
        <Link key={key} href={`/admin/reviews?filter=${key}`} aria-current={filter === key ? "page" : undefined}
          className={`rounded-xl border px-4 py-3 font-semibold ${filter === key ? "bg-blue-950 text-white" : "bg-white text-blue-950"}`}>{label}</Link>)}</nav>
      {!result || result.error ? <p role="alert">No se pueden cargar las opiniones. Comprueba la conexión y la configuración de permisos.</p> : <>
        {!rows.length && <p>No hay opiniones en esta página.</p>}
        <ul className="space-y-4">{rows.map(review => <li key={review.id} className="space-y-3 rounded-2xl border p-5">
          <p className="font-bold">{review.display_name} · {review.rating}/5</p>
          <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("es-ES", { timeZone: "Europe/Warsaw" })}</time>
          <p className="whitespace-pre-wrap break-words">{review.body}</p>
          <form action={moderateReview} className="flex flex-wrap gap-3">
            <input type="hidden" name="id" value={review.id} />
            <input type="hidden" name="expected" value={review.status} />
            {filter !== "published" && <button name="status" value="published" className="rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white">Publicar</button>}
            {filter !== "rejected" && <button name="status" value="rejected" className="rounded-lg border px-4 py-3">Retirar</button>}
            {filter !== "pending" && <button name="status" value="pending" className="rounded-lg border px-4 py-3">Volver a revisión</button>}
          </form>
        </li>)}</ul>
        <nav aria-label="Páginas de opiniones" className="flex gap-5">
          {page > 1 && <Link href={`/admin/reviews?filter=${filter}&page=${page - 1}`} className="underline">Anterior</Link>}
          {(result.data?.length ?? 0) > 20 && <Link href={`/admin/reviews?filter=${filter}&page=${page + 1}`} className="underline">Siguiente</Link>}
        </nav>
      </>}
    </>}
  </main>;
}
