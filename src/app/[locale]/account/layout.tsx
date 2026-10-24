import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isSupportedLocale, type AppLocale } from "@/i18n/config";

const accountTitles: Readonly<Record<AppLocale, string>> = {
  pl: "Konto klienta | Rincón Colombiano",
  es: "Cuenta de cliente | Rincón Colombiano",
  en: "Customer account | Rincón Colombiano",
};

/**
 * Sign-in and customer account screens are not public landing pages.
 * Keep their titles localized, but never allow search engines to index
 * account or authentication UI, even on the production domain.
 */
export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ readonly locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: isSupportedLocale(locale) ? accountTitles[locale] : "Rincón Colombiano",
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default function CustomerAccountLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return children;
}
