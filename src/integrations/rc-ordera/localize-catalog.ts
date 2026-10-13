import type { AppLocale } from "@/i18n/config";
import type {
  RcOrderaPublicCategory,
  RcOrderaPublicProduct,
} from "@/integrations/rc-ordera/public-catalog";

/**
 * Locale-specific public read view of the RC ORDERA catalog. This does not
 * mutate the source/menu or call Supabase; it only uses authorized text that
 * the public catalog actually contains. Spanish source text is the fallback.
 */
export function localizeRcOrderaProduct(
  product: RcOrderaPublicProduct,
  locale: AppLocale,
): RcOrderaPublicProduct {
  const translated = product.translations?.[locale];
  const name = translated?.name.trim();

  // The commercial menu item is LECHONA TOLIMENSE, not "lechón".
  // RC ORDERA can return a short legacy source title or translation; this
  // corrects ONLY that exact product label in the public read view.
  // Preserve its ID, price, availability, photo, category and kitchen station.
  // Do not rename other pork dishes or write back to the RC ORDERA database.
  const legacyLechonaName = /^(?:lech[oó]n|lechona)(?:\s+tolimense)?$/iu;
  if (legacyLechonaName.test(product.name.trim()) ||
      (name && legacyLechonaName.test(name))) {
    return {
      ...product,
      name: "Lechona Tolimense",
      ...(name && name.length <= 160
        ? { description: translated?.description ?? "" }
        : {}),
    };
  }

  if (!name || name.length > 160) {
    return product;
  }
  return {
    ...product,
    name,
    description: translated?.description ?? "",
  };
}

export function localizeRcOrderaCategories(
  categories: readonly RcOrderaPublicCategory[],
  locale: AppLocale,
): readonly RcOrderaPublicCategory[] {
  return categories.map((category) => ({
    ...category,
    products: category.products.map((product) =>
      localizeRcOrderaProduct(product, locale)),
  }));
}
