/**
 * Canonical public-home editorial keys, shared with Rincón Admin.
 * Each CMS document stores title + body and is published per locale.
 */
export const HOME_EDITABLE_SECTIONS = [
  { key: "home_hero", label: "Portada principal", kind: "page", maxTitle: 120, maxBody: 500 },
  { key: "home_services", label: "Introducción de servicios", kind: "service", maxTitle: 110, maxBody: 400 },
  { key: "home_service_catering", label: "Tarjeta: catering", kind: "service", maxTitle: 70, maxBody: 250 },
  { key: "home_service_birthdays", label: "Tarjeta: cumpleaños", kind: "service", maxTitle: 70, maxBody: 250 },
  { key: "home_service_corporate", label: "Tarjeta: empresas", kind: "service", maxTitle: 70, maxBody: 250 },
  { key: "home_service_families", label: "Tarjeta: familias", kind: "service", maxTitle: 70, maxBody: 250 },
  { key: "home_service_breakfasts", label: "Tarjeta: desayunos", kind: "service", maxTitle: 70, maxBody: 250 },
  { key: "home_service_surprises", label: "Tarjeta: sorpresas", kind: "service", maxTitle: 70, maxBody: 250 },
  { key: "home_service_decoration", label: "Tarjeta: decoración", kind: "service", maxTitle: 70, maxBody: 250 },
  { key: "home_service_bakery", label: "Tarjeta: panadería", kind: "service", maxTitle: 70, maxBody: 250 },
  { key: "home_seo", label: "Google SEO — Inicio", kind: "page", maxTitle: 70, maxBody: 165 },
] as const;

export type HomeContentKey = (typeof HOME_EDITABLE_SECTIONS)[number]["key"];
export type HomeCmsKind = (typeof HOME_EDITABLE_SECTIONS)[number]["kind"];
export const HOME_EDITABLE_KEYS: readonly HomeContentKey[] =
  HOME_EDITABLE_SECTIONS.map(({ key }) => key);

export function getHomeSection(key: string) {
  return HOME_EDITABLE_SECTIONS.find((section) => section.key === key);
}

/** Reject oversized or empty content from old/invalid CMS rows. */
export function validHomeCmsCopy(
  key: string,
  content: { readonly title: string; readonly body: string; readonly kind: string },
): boolean {
  const section = getHomeSection(key);
  return Boolean(section &&
    content.kind === section.kind &&
    content.title.trim().length > 0 &&
    content.title.length <= section.maxTitle &&
    content.body.trim().length > 0 &&
    content.body.length <= section.maxBody);
}
