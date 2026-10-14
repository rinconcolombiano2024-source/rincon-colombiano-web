/**
 * Give each real RC ORDERA category one unique, stable-in-render anchor.
 *
 * Two distinct source categories can share a translated name, and Polish
 * diacritics / punctuation can collapse otherwise different labels into the
 * same URL fragment. Never merge categories or change product/station IDs.
 *
 * Keep the first existing anchor intact for SEO bookmarks; suffix only a
 * collision. This is intentionally local to the public menu UI.
 */
export function withMenuCategoryAnchors<T extends { readonly name: string }>(
  categories: readonly T[],
): readonly (T & { readonly anchorId: string })[] {
  const used = new Set<string>();

  return categories.map((category) => {
    const slug = category.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "");
    const base = slug ? `category-${slug}` : "category-menu";
    let anchorId = base;
    let suffix = 2;
    while (used.has(anchorId)) {
      anchorId = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(anchorId);

    return { ...category, anchorId };
  });
}
