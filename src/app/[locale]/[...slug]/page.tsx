import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  buildBreadcrumbJsonLd,
  buildRestaurantJsonLd,
  buildRestaurantMetadata,
  serializeJsonLd,
} from "@/config/seo";

import {
  buildRoutePath,
} from "@/config/routes";

import {
  getPublicRestaurants,
  type DayOfWeek,
  type RestaurantConfig,
  type RestaurantStatus,
} from "@/config/restaurants";

import {
  isSupportedLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/i18n/config";

import {
  buildRcOrderaOrderUrl,
  type RcOrderaLocationKey,
} from "@/integrations/rc-ordera/config";


/* ============================================================
   TYPES
   ============================================================ */

interface RestaurantPageProps {
  readonly params:
    Promise<{
      readonly locale:
        string;

      readonly slug:
        string[];
    }>;
}


interface RestaurantPageCopy {
  readonly back:
    string;

  readonly eyebrow:
    string;

  readonly addressLabel:
    string;

  readonly hoursLabel:
    string;

  readonly hoursUnavailable:
    string;

  readonly servicesLabel:
    string;

  readonly servicesUnavailable:
    string;

  readonly order:
    string;

  readonly menu:
    string;

  readonly maps:
    string;

  readonly phone:
    string;

  readonly email:
    string;

  readonly statusOpen:
    string;
