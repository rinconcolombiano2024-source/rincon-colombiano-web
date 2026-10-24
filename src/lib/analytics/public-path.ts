/**
 * Visitor analytics must never include customer sign-in or private account
 * pages, even when a browser previously accepted optional cookies.
 * Protect current /account routes and localized aliases reserved in routes.ts.
 */
const PRIVATE_SECTIONS = new Set(["account", "konto", "mi-cuenta", "admin", "api"]);

export function isPublicAnalyticsPath(pathname: string | null): boolean {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return false;
  }
  const segments = pathname.split("/");
  if (!["pl", "es", "en"].includes(segments[1] ?? "")) {
    return false;
  }
  let section: string;
  try {
    section = decodeURIComponent(segments[2] ?? "").toLowerCase();
  } catch {
    return false;
  }
  return !section.includes("/") && !PRIVATE_SECTIONS.has(section);
}
