export type AnswerPart = { text: string; href?: string };

const SITE = "https://rinconcolombiano.pl";
const EXTERNAL = new Set([
  "https://rincon-colombiano-pedidosapp.vercel.app/",
  "https://rincon-colombiano.sumupstore.com/produkty",
]);

/** Model output is untrusted. Only published restaurant destinations become links. */
export function approvedAnswerHref(value: string, locale: string): string | undefined {
  if (!["pl", "es", "en"].includes(locale)) { return undefined; }
  try {
    const url = new URL(value, `${SITE}/${locale}`);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.search) { return undefined; }
    if (EXTERNAL.has(url.href)) { return url.href; }
    if (url.origin !== SITE) { return undefined; }
    const pages = new Set([`/${locale}`, `/${locale}/menu`, `/${locale}/canales-pedido`]);
    if (!pages.has(url.pathname)) { return undefined; }
    if (url.hash && (url.pathname !== `/${locale}` || !["#menu", "#locations", "#contact", "#reviews", "#services"].includes(url.hash))) { return undefined; }
    return url.pathname + url.hash;
  } catch { return undefined; }
}

export function answerParts(text: string, locale: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  const candidates = /\[([^\]\n]{1,100})\]\(([^\s)]+)\)|(https?:\/\/[^\s<>]+|\/(?:pl|es|en)(?:\/[^\s<>]*)?(?:#[a-z]+)?|#(?:menu|locations|contact|reviews|services)\b)/g;
  let cursor = 0;
  for (const match of text.matchAll(candidates)) {
    const raw = match[2] ?? match[3] ?? "";
    const candidate = match[2] ? raw : raw.replace(/[.,;:!?)}\]]+$/, "");
    const href = approvedAnswerHref(candidate, locale);
    if (!href) { continue; }
    const index = match.index;
    if (index > cursor) { parts.push({ text: text.slice(cursor, index) }); }
    parts.push({ text: match[1] ?? candidate, href });
    const suffix = match[2] ? "" : raw.slice(candidate.length);
    if (suffix) { parts.push({ text: suffix }); }
    cursor = index + match[0].length;
  }
  if (cursor < text.length) { parts.push({ text: text.slice(cursor) }); }
  return parts;
}
