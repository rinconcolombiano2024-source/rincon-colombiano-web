/**
 * Read-only protection against duplicate RC ORDERA product IDs in public
 * catalog payloads. Keep the first occurrence in source order, including its
 * original category, price, availability, translation and station metadata.
 * Missing legacy IDs are not deduplicated by name: two products can share a
 * label without being the same product. Never mutate the upstream payload.
 */
export interface PublicCatalogItemWithId {
  readonly id: string | null;
}

export interface PublicCatalogCategory<T extends PublicCatalogItemWithId> {
  readonly name: string;
  readonly products: readonly T[];
}

export function deduplicatePublicCatalogProducts<T extends PublicCatalogItemWithId>(
  categories: readonly PublicCatalogCategory<T>[],
): PublicCatalogCategory<T>[] {
  const seenIds = new Set<string>();
  return categories.flatMap((category) => {
    const products = category.products.filter((product) => {
      if (!product.id) {
        return true;
      }
      if (seenIds.has(product.id)) {
        return false;
      }
      seenIds.add(product.id);
      return true;
    });
    return products.length > 0 ? [{ name: category.name, products }] : [];
  });
}
