import type { AppLocale } from "@/i18n/config";
import type {
  RcOrderaPublicCategory,
  RcOrderaPublicProduct,
} from "@/integrations/rc-ordera/public-catalog";

/**
 * Translate only KNOWN category names for the public web. The RC ORDERA
 * category keys remain unchanged in Supabase and in all owner write paths.
 * Unknown categories added by the CEO are shown verbatim, never invented.
 */
const CATEGORY_TRANSLATIONS: Readonly<Record<string, Readonly<Record<AppLocale, string>>>> = {
  "BEBIDAS": { pl: "Napoje", es: "Bebidas", en: "Drinks" },
  "COMBOS": { pl: "Zestawy", es: "Combos", en: "Combos" },
  "ENTRADAS": { pl: "Przystawki", es: "Entradas", en: "Starters" },
  "PLATOS PRINCIPALES": { pl: "Dania główne", es: "Platos principales", en: "Main courses" },
  "PORCIONES": { pl: "Porcje", es: "Porciones", en: "Side portions" },
};

export function localizeRcOrderaCategoryName(name: string, locale: AppLocale): string {
  const sourceKey = name.trim().replace(/\s+/g, " ").toLocaleUpperCase("es");
  return CATEGORY_TRANSLATIONS[sourceKey]?.[locale] ?? name;
}

/**
 * Locale-specific public read view of the RC ORDERA catalog. This does not
 * mutate the source/menu or call Supabase; it only uses authorized text that
 * the public catalog actually contains. Colombian dish names remain intact,
 * but Spanish SOURCE descriptions must not be shown on Polish/English pages
 * when the owner has not provided a real translation. No fabricated text.
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
      ...(locale !== "es" && (!name || name.length > 160)
        ? { description: "" }
        : name && name.length <= 160
          ? { description: translated?.description ?? "" }
          : {}),
    };
  }

  if (!name || name.length > 160) {
    // Keep traditional dish names unchanged (Arepa, Tamal, etc.), but never
    // silently label an untranslated Spanish description as Polish/English.
    // The CEO translation audit guides owners to supply full localized copy.
    return locale === "es" ? product : { ...product, description: "" };
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
    name: localizeRcOrderaCategoryName(category.name, locale),
    products: category.products.map((product) =>
      localizeRcOrderaProduct(product, locale)),
  }));
}
