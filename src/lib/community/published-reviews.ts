/**
 * Public reviews come from an external database response. Never trust its
 * runtime shape, even for records already marked as moderated/published.
 * Invalid rows must not crash the customer page's star renderer.
 */
export type PublicCustomerReview = {
  id: string;
  display_name: string;
  body: string;
  rating: number;
  created_at: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PUBLIC_REVIEWS = 12;

export function normalizePublishedReviews(input: unknown): PublicCustomerReview[] {
  if (!Array.isArray(input)) { return []; }

  const reviews: PublicCustomerReview[] = [];
  const seen = new Set<string>();
  for (const item of input) {
    if (reviews.length >= MAX_PUBLIC_REVIEWS) { break; }
    if (item === null || typeof item !== "object" || Array.isArray(item)) { continue; }

    const row = item as Record<string, unknown>;
    const { id, display_name: rawName, body: rawBody, rating, created_at } = row;
    if (typeof id !== "string" || !UUID.test(id) || seen.has(id)) { continue; }
    if (typeof rawName !== "string" || typeof rawBody !== "string") { continue; }
    if (typeof created_at !== "string" || created_at.length > 64) { continue; }
    if (!Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5) { continue; }

    const display_name = rawName.trim();
    const body = rawBody.trim();
    if (!display_name || display_name.length > 60 || !body || body.length > 1000) { continue; }

    reviews.push({ id, display_name, body, rating: Number(rating), created_at });
    seen.add(id);
  }
  return reviews;
}
