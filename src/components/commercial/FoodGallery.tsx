import Link from "next/link";

import type { AppLocale } from "@/i18n/config";
import { getPublishedBrandAsset } from "@/lib/brand/public-brand";

interface GalleryProps {
  readonly locale: AppLocale;
}

const copy = {
  pl: {
    eyebrow: "KOLUMBIJSKIE SMAKI",
    title: "Zobacz, co dla Ciebie gotujemy",
    description: "Oryginalne kolumbijskie dania, przygotowywane z sercem w Warszawie.",
    action: "Odkryj nasze menu",
  },
  es: {
    eyebrow: "SABOR Y TRADICIÓN",
    title: "Así se vive el sabor de Colombia",
    description: "Descubre nuestros platos colombianos preparados con cariño en Varsovia.",
    action: "Explorar nuestro menú",
  },
  en: {
    eyebrow: "COLOMBIAN FLAVOURS",
    title: "A taste of Colombia in Warsaw",
    description: "Discover Colombian dishes prepared with love in the heart of Warsaw.",
    action: "Explore our menu",
  },
} as const;

/**
 * Esta galería es dinámica y se alimenta SOLO de imágenes publicadas
 * desde el panel privado de marca. Sin datos ⇒ no hay huecos ni
 * fotos ficticias, y la página pública continúa operativa.
 */
export default async function FoodGallery({ locale }: GalleryProps) {
  const published = await Promise.all([
    getPublishedBrandAsset("food_featured_1"),
    getPublishedBrandAsset("food_featured_2"),
    getPublishedBrandAsset("food_featured_3"),
  ]);

  const photos = published.filter((photo) => photo !== null);
  if (photos.length === 0) {
    return null;
  }

  const translation = copy[locale];

  return (
    <section
      aria-labelledby="food-gallery-heading"
      className="overflow-hidden bg-[#faf9f6] py-16 sm:py-20"
    >
      <div className="site-container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c92d39]">
              {translation.eyebrow}
            </p>
            <h2 id="food-gallery-heading" className="mt-4 font-serif text-3xl font-bold leading-tight text-[#12100e] sm:text-4xl">
              {translation.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-[#62594f]">
              {translation.description}
            </p>
          </div>
          <Link
            href={`/${locale}/menu`}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#123d73] px-6 text-sm font-black text-white transition hover:bg-[#0e315d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#123d73]"
          >
            {translation.action} →
          </Link>
        </div>

        <div className={`mt-9 grid gap-4 ${photos.length > 1 ? "sm:grid-cols-2" : ""} ${photos.length > 2 ? "lg:grid-cols-3" : ""}`}>
          {photos.map((photo) => (
            <div
              key={photo.slot}
              role="img"
              aria-label={photo.altText || translation.title}
              className="relative min-h-64 overflow-hidden rounded-[2rem] bg-[#e7e1d7] bg-cover bg-center bg-no-repeat shadow-lg sm:min-h-80"
              style={{ backgroundImage: `url("${photo.publicUrl}")` }}
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#f7c600_0_50%,#123d73_50%_75%,#c92d39_75%_100%)]" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
