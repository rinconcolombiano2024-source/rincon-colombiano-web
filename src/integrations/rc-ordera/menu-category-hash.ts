/**
 * Resolve a public menu fragment only to an actually-rendered RC ORDERA
 * category tab. Malformed hashes or deleted categories never open a wrong
 * menu panel. Pure helper for client navigation and automated tests.
 */
export function resolveImportedMenuCategoryHash(
  hash: string,
  categories: readonly { readonly id: string }[],
): string | null {
  if (!hash.startsWith("#") || hash.length > 220) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(hash.slice(1));
    return categories.some((category) => category.id === decoded) ? decoded : null;
  } catch {
    return null;
  }
}
