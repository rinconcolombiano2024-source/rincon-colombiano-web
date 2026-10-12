/**
 * Catálogo único de fotografías administrables.
 *
 * Añadir un slot exige una migración SQL que actualice la restricción
 * y el allowlist de public.web_brand_register_asset. El Quality Gate
 * valida esta invariancia para evitar otra regresión "hero_primary".
 */
export const BRAND_SLOTS = [
  "logo_primary",
  "logo_compact",
  "logo_light",
  "logo_dark",
  "favicon",
  "open_graph",
  "social_square",
  "hero_primary",
  "campaign_primary",
  "food_featured_1",
  "food_featured_2",
  "food_featured_3",
] as const;

export type BrandSlot = (typeof BRAND_SLOTS)[number];
