import { publicReleaseFingerprint } from "@/lib/release/fingerprint";

/**
 * Allows an owner to prove that a live Vercel alias is serving the exact
 * GitHub revision whose Quality Gate passed, before any DNS cutover.
 * No cookie, authentication state, merchant data or secret is returned.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(): Response {
  return Response.json(publicReleaseFingerprint(), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
