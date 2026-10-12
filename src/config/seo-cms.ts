/**
 * Editable SEO overrides for verified indexable commercial routes only.
 *
 * The canonical, hreflang, indexability, OG image and structural data stay
 * controlled by Next.js route policies to prevent unsafe admin URLs and
 * search-index poisoning. Editors can change honest title/description.
 */
export const SEO_EDITABLE_ROUTES = [
  { key: "home_seo", label: "Inicio — restaurante colombiano", href: "/pl", route: "home" },
  { key: "menu_seo", label: "Menú real — RC ORDERA", href: "/pl/menu", route: "menu" },
  { key: "location_czapelska_seo", label: "Sede abierta — Czapelska 33", href: "/pl/restauracje/czapelska", route: "location" },
] as const;

export type SeoCmsKey = (typeof SEO_EDITABLE_ROUTES)[number]["key"];

export function validPublishedSeo(
  key: string,
  content: {
    readonly kind: string;
    readonly title: string;
    readonly body: string;
  },
): boolean {
  return SEO_EDITABLE_ROUTES.some((r) => r.key === key) &&
    content.kind === "page" &&
    content.title.trim().length > 0 &&
    content.title.length <= 70 &&
    content.body.trim().length > 0 &&
    content.body.length <= 165;
}
