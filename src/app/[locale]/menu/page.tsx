import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  buildMenuMetadata,
} from "@/config/seo";

import {
  buildRoutePath,
} from "@/config/routes";

import {
  isSupportedLocale,
  type AppLocale,
} from "@/i18n/config";

import {
  buildRcOrderaOrderUrl,
} from "@/integrations/rc-ordera/config";

import {
  getRcOrderaPublicCatalog,
  type RcOrderaPublicCatalog,
} from "@/integrations/rc-ordera/public-catalog";


/* ============================================================
   CACHE
   ============================================================ */

/**
 * La oferta pública puede cambiar durante el día.
 *
 * Permitimos actualizar esta página periódicamente
 * sin convertir cada request público en una consulta nueva.
 */
export const revalidate =
  300;


/* ============================================================
   TYPES
   ============================================================ */

interface MenuPageProps {
  readonly params:
    Promise<{
      readonly locale:
        string;
    }>;
}


interface FeaturedDish {
  readonly name:
    string;

  readonly description:
    string;
}


interface MenuPageCopy {
  readonly back:
    string;

  readonly eyebrow:
    string;

  readonly title:
    string;

  readonly description:
    string;

  readonly order:
    string;

  readonly liveLabel:
    string;

  readonly unavailableLabel:
    string;

  readonly unavailableDescription:
    string;

  readonly featuredEyebrow:
    string;
