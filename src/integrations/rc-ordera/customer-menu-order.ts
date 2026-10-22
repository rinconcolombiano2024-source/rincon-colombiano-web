/**
 * Customer-only ordering of menu tabs imported from RC ORDERA.
 * We deliberately DO NOT sort products, rename source keys, or write
 * anything to Supabase. Newly created categories without a known label
 * keep their relative position after the familiar restaurant sections.
 */
const CUSTOMER_CATEGORY_PRIORITY = [
  "ENTRADAS",
  "PLATOS PRINCIPALES",
  "BEBIDAS",
  "COMBOS",
  "PORCIONES",
] as const;

const categoryRank = new Map<string, number>(
  CUSTOMER_CATEGORY_PRIORITY.map((name, index) => [name, index]),
);

function normalizedCategoryName(name: string): string {
  return name.trim().replace(/\s+/gu, " ").toLocaleUpperCase("es");
}

export function orderImportedMenuCategories<T extends { readonly name: string }>(
  original: readonly T[],
): readonly T[] {
  return original
    .map((category, index) => ({
      category,
      index,
      priority: categoryRank.get(normalizedCategoryName(category.name)) ??
        CUSTOMER_CATEGORY_PRIORITY.length,
    }))
    .sort((a, b) => a.priority - b.priority || a.index - b.index)
    .map(({ category }) => category);
}
