import type { AppLocale } from "@/i18n/config";

export type CommercialInquiryIntent = "hours" | "prices";

/**
 * Only two frequently asked commercial intents. Match customer language,
 * not a guessed live price/opening state. Rincón AI always links the visitor
 * to the real menu or published location section for current details.
 *
 * Keep these patterns locale-aware: "cena" means dinner in Spanish but
 * "price" in Polish and must not send Spanish dinner questions to prices.
 */
export function getCommercialInquiryIntent(
  message: string,
  locale: AppLocale,
): CommercialInquiryIntent | null {
  const normalized = message
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "");

  const hours: Readonly<Record<AppLocale, RegExp>> = {
    pl: /\b(?:godzin|otwar|otwart|zamyk|do ktorej)/u,
    es: /\b(?:horario|a que hora|cuando abren|cuando cierran|esta abierto|estan abiertos|a que horas)/u,
    en: /\b(?:hours|opening time|closing time|when (?:do you|are you) open|what time (?:do you|are you) (?:open|close)|are you open)/u,
  };
  const prices: Readonly<Record<AppLocale, RegExp>> = {
    pl: /\b(?:cena|ceny|cene|cenie|cennik|ile koszt|kosztuj|koszt\b)/u,
    es: /\b(?:precios?\b|cuanto cuest|cuanto vale|cuanto cobran|valor\b)/u,
    en: /\b(?:prices?\b|pricing\b|how much|costs?\b)/u,
  };

  if (hours[locale].test(normalized)) {
    return "hours";
  }
  if (prices[locale].test(normalized)) {
    return "prices";
  }
  return null;
}
