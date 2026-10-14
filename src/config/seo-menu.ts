import type { AppLocale } from "@/i18n/config";
import { buildCanonicalUrl, type JsonLdObject } from "@/config/seo";
import type { RcOrderaPublicCatalog } from "@/integrations/rc-ordera/public-catalog";
import { localizeRcOrderaCategories } from "@/integrations/rc-ordera/localize-catalog";

/**
 * Real, read-only Menu schema built exclusively from the public RC ORDERA
 * product catalog. Never fabricate prices, stock, reviews or dishes.
 *
 * Static keyword inventories must NEVER become JSON-LD MenuItem entries.
 * Structured data reflects products genuinely shown in this page.
 */
export function buildVerifiedMenuJsonLd(
  catalog: RcOrderaPublicCatalog | null,
  locale: AppLocale,
): JsonLdObject | null {
  if (!catalog) {
    return null;
  }

  const sections = localizeRcOrderaCategories(catalog.categories, locale)
    .slice(0, 30)
    .map((category) => {
      const items = category.products
        .filter((product) =>
          product.available &&
          product.name.trim().length > 0 &&
          product.name.length <= 160 &&
          Number.isFinite(product.price) &&
          product.price >= 0 &&
          product.price <= 9999)
        .slice(0, 100)
        .map((product) => ({
          "@type": "MenuItem",
          name: product.name.trim(),
          ...(product.description.trim().length > 0
            ? { description: product.description.trim().slice(0, 350) }
            : {}),
          offers: {
            "@type": "Offer",
            price: product.price.toFixed(2),
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
          },
        }));
      return {
        "@type": "MenuSection",
        name: category.name.trim(),
        hasMenuItem: items,
      };
    })
    .filter((section) => section.name.length > 0 && section.hasMenuItem.length > 0);

  if (sections.length === 0) {
    return null;
  }

  const menuUrl = buildCanonicalUrl("menu", locale);
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${menuUrl}#menu`,
    name: locale === "pl" ? "Menu Rincón Colombiano" :
      locale === "es" ? "Menú de Rincón Colombiano" : "Rincón Colombiano menu",
    inLanguage: locale === "pl" ? "pl-PL" : locale,
    url: menuUrl,
    hasMenuSection: sections,
  };
}
