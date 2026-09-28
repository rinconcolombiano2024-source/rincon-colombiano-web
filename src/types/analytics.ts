/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Analytics, BI & Growth Intelligence Domain
 * ============================================================
 *
 * Sistema central de inteligencia empresarial.
 *
 * Diseñado para medir:
 *
 * - tráfico
 * - SEO
 * - Google
 * - campañas
 * - redes sociales
 * - contenido
 * - videos
 * - productos
 * - menú
 * - carrito
 * - checkout
 * - pedidos
 * - ventas
 * - delivery
 * - restaurantes
 * - reservas
 * - catering
 * - leads
 * - comunidad
 * - fidelización
 * - recompensas
 * - referidos
 * - búsquedas internas
 * - retención
 * - cohortes
 *
 * PRINCIPIOS:
 *
 * 1. Analytics != contabilidad.
 * 2. Los eventos deben tener nombres estables.
 * 3. Evitar PII innecesaria.
 * 4. Los dashboards consumen datos agregados.
 * 5. Las métricas deben tener definición explícita.
 * 6. Siempre distinguir ingreso, conversión y actividad.
 * 7. Los datos deben indicar su período y frescura.
 * 8. Nunca calcular decisiones críticas desde
 *    un subconjunto arbitrario como "últimos 250".
 */

import type {
  CurrencyCode,
  IsoDateTime,
  Money,
  RequestId,
} from "@/types/common";

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  RestaurantId,
} from "@/types/restaurant";

import type {
  CustomerId,
} from "@/types/customer";

import type {
  OrderId,
} from "@/types/order";

import type {
  ReservationId,
} from "@/types/reservation";

import type {
  InquiryId,
} from "@/types/inquiry";

import type {
  CampaignId,
  MarketingChannel,
  MarketingSessionId,
  VisitorId,
} from "@/types/marketing";

import type {
  CommunityPostId,
  CommunityProfileId,
} from "@/types/community";

import type {
  MediaAssetId,
} from "@/types/media";

import type {
  MenuItemId,
} from "@/types/menu";

import type {
  LoyaltyProgramId,
  ReferralCampaignId,
  ReferralId,
  RewardGrantId,
} from "@/types/loyalty";

import type {
  SearchQueryId,
} from "@/types/search";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type AnalyticsEventId =
  string;

export type AnalyticsMetricId =
  string;

export type AnalyticsDashboardId =
  string;

export type AnalyticsWidgetId =
  string;

export type AnalyticsReportId =
  string;

export type AnalyticsExportId =
  string;

export type AnalyticsSnapshotId =
  string;

export type AnalyticsCohortId =
  string;


/* ============================================================
   TIME
   ============================================================ */

export type AnalyticsTimeGranularity =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";


export interface AnalyticsPeriod {
  readonly from:
    IsoDateTime;

  readonly until:
    IsoDateTime;

  readonly timezone:
    string;
}


/* ============================================================
   RATE
   ============================================================ */

/**
 * Basis points.
 *
 * Ejemplos:
 *
 * 10000 = 100%
 * 2500  = 25%
 * 125   = 1.25%
 */
export interface AnalyticsRate {
  readonly basisPoints:
    number;
}


/* ============================================================
   DATA FRESHNESS
   ============================================================ */

export type AnalyticsFreshness =
  | "realtime"
  | "near_realtime"
  | "hourly"
  | "daily"
  | "historical";


/* ============================================================
   SOURCE
   ============================================================ */

export type AnalyticsSource =
  | "website"
  | "rc_ordera"
  | "database"
  | "search_console"
  | "google_business"
  | "social"
  | "community"
  | "loyalty"
  | "delivery"
  | "reservation"
  | "inquiry"
  | "search"
  | "manual"
  | "other";


/* ============================================================
   METRIC CATEGORIES
   ============================================================ */

export type AnalyticsMetricCategory =
  | "traffic"
  | "acquisition"
  | "seo"
  | "engagement"
  | "content"
  | "community"
  | "commerce"
  | "restaurant"
  | "delivery"
  | "reservation"
  | "inquiry"
  | "loyalty"
  | "referral"
  | "search"
  | "financial"
  | "operational";


/* ============================================================
   METRIC KEYS
   ============================================================ */

export type AnalyticsMetricKey =
  /* Traffic */
  | "page_views"
  | "sessions"
  | "visitors"
  | "new_visitors"
  | "returning_visitors"
  | "engaged_sessions"

  /* SEO */
  | "organic_impressions"
  | "organic_clicks"
  | "organic_ctr"
  | "average_search_position"

  /* Content */
  | "content_views"
  | "video_starts"
  | "video_completions"
  | "cta_clicks"
  | "shares"

  /* Community */
  | "community_members"
  | "community_posts"
  | "community_comments"
  | "community_reactions"
  | "community_active_users"

  /* Commerce */
  | "product_views"
  | "add_to_cart"
  | "checkout_started"
  | "orders_created"
  | "orders_completed"
  | "orders_cancelled"
  | "gross_revenue"
  | "average_order_value"
  | "checkout_conversion_rate"

  /* Restaurant */
  | "restaurant_page_views"
  | "restaurant_orders"
  | "restaurant_revenue"

  /* Delivery */
  | "delivery_quotes"
  | "delivery_orders"
  | "delivery_rejections"
  | "average_delivery_time"
  | "average_delivery_fee"

  /* Reservations */
  | "reservation_searches"
  | "reservations_created"
  | "reservations_completed"
  | "reservation_no_shows"

  /* Inquiries */
  | "inquiries_created"
  | "quotes_sent"
  | "quotes_accepted"
  | "inquiry_conversion_rate"

  /* Loyalty */
  | "loyalty_members"
  | "points_issued"
  | "points_redeemed"
  | "rewards_granted"
  | "rewards_redeemed"

  /* Referral */
  | "referrals_created"
  | "referrals_qualified"
  | "referral_orders"
  | "referral_revenue"

  /* Search */
  | "internal_searches"
  | "zero_result_searches"
  | "search_result_clicks"
  | "search_conversion_rate";


/* ============================================================
   DIMENSIONS
   ============================================================ */

export type AnalyticsDimension =
  | "restaurant"
  | "country"
  | "city"
  | "locale"
  | "channel"
  | "campaign"
  | "landing_page"
  | "menu_item"
  | "service"
  | "event"
  | "content"
  | "community_post"
  | "customer_type"
  | "fulfillment_type"
  | "payment_method"
  | "device_category"
  | "search_query"
  | "referral_campaign";


/* ============================================================
   METRIC DEFINITION
   ============================================================ */

export type AnalyticsValueType =
  | "integer"
  | "decimal"
  | "money"
  | "rate"
  | "duration_seconds";


export interface AnalyticsMetricDefinition {
  readonly id:
    AnalyticsMetricId;

  readonly key:
    AnalyticsMetricKey;

  readonly name:
    string;

  readonly description:
    string;

  readonly category:
    AnalyticsMetricCategory;

  readonly valueType:
    AnalyticsValueType;

  readonly source:
    AnalyticsSource;

  readonly freshness:
    AnalyticsFreshness;

  /**
   * Indica si esta métrica puede sumarse
   * directamente entre períodos.
   */
  readonly additive:
    boolean;

  readonly active:
    boolean;
}


/* ============================================================
   METRIC VALUE
   ============================================================ */

export type AnalyticsMetricValue =
  | {
      readonly type:
        "integer";

      readonly value:
        number;
    }
  | {
      readonly type:
        "decimal";

      readonly value:
        number;
    }
  | {
      readonly type:
        "money";

      readonly value:
        Money;
    }
  | {
      readonly type:
        "rate";

      readonly value:
        AnalyticsRate;
    }
  | {
      readonly type:
        "duration_seconds";

      readonly value:
        number;
    };


/* ============================================================
   DATA POINT
   ============================================================ */

export interface AnalyticsDataPoint {
  readonly timestamp:
    IsoDateTime;

  readonly metric:
    AnalyticsMetricKey;

  readonly value:
    AnalyticsMetricValue;

  readonly dimensions?:
    Readonly<
      Record<
        string,
        string
      >
    >;
}


/* ============================================================
   SERIES
   ============================================================ */

export interface AnalyticsSeries {
  readonly metric:
    AnalyticsMetricKey;

  readonly granularity:
    AnalyticsTimeGranularity;

  readonly points:
    readonly AnalyticsDataPoint[];
}


/* ============================================================
   EVENT
   ============================================================ */

export type AnalyticsEventName =
  | "page_view"
  | "content_view"
  | "video_start"
  | "video_complete"
  | "cta_click"
  | "social_click"
  | "search"
  | "search_result_click"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "order_created"
  | "order_completed"
  | "order_cancelled"
  | "delivery_quote"
  | "reservation_created"
  | "reservation_completed"
  | "inquiry_created"
  | "quote_sent"
  | "quote_accepted"
  | "community_signup"
  | "community_post_created"
  | "loyalty_joined"
  | "reward_granted"
  | "reward_redeemed"
  | "referral_created"
  | "referral_qualified";


/* ============================================================
   EVENT CONTEXT
   ============================================================ */

export interface AnalyticsEventContext {
  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  /**
   * Utilizar únicamente cuando realmente
   * sea necesario para análisis interno.
   */
  readonly customerId?:
    CustomerId;

  readonly restaurantId?:
    RestaurantId;

  readonly campaignId?:
    CampaignId;

  readonly locale?:
    SupportedLocale;

  readonly path?:
    string;

  readonly referrerPath?:
    string;
}


/* ============================================================
   EVENT ENTITY REFERENCES
   ============================================================ */

export interface AnalyticsEntityReferences {
  readonly orderId?:
    OrderId;

  readonly reservationId?:
    ReservationId;

  readonly inquiryId?:
    InquiryId;

  readonly menuItemId?:
    MenuItemId;

  readonly communityPostId?:
    CommunityPostId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly mediaAssetId?:
    MediaAssetId;

  readonly referralId?:
    ReferralId;

  readonly rewardGrantId?:
    RewardGrantId;

  readonly searchQueryId?:
    SearchQueryId;
}


/* ============================================================
   RAW ANALYTICS EVENT
   ============================================================ */

/**
 * Debe mantenerse pequeño.
 *
 * No guardar contenido privado de formularios,
 * mensajes, direcciones completas o información
 * sensible dentro de analytics.
 */

export interface AnalyticsEvent {
  readonly id:
    AnalyticsEventId;

  readonly name:
    AnalyticsEventName;

  readonly occurredAt:
    IsoDateTime;

  readonly context:
    AnalyticsEventContext;

  readonly entities:
    AnalyticsEntityReferences;

  readonly value?:
    Money;

  readonly metadata?:
    Readonly<
      Record<
        string,
        string | number | boolean | null
      >
    >;

  readonly schemaVersion:
    number;
}


/* ============================================================
   FILTERS
   ============================================================ */

export interface AnalyticsFilter {
  readonly restaurantIds?:
    readonly RestaurantId[];

  readonly locales?:
    readonly SupportedLocale[];

  readonly channels?:
    readonly MarketingChannel[];

  readonly campaignIds?:
    readonly CampaignId[];

  readonly currency?:
    CurrencyCode;
}


/* ============================================================
   QUERY
   ============================================================ */

export interface AnalyticsQuery {
  readonly metrics:
    readonly AnalyticsMetricKey[];

  readonly dimensions:
    readonly AnalyticsDimension[];

  readonly period:
    AnalyticsPeriod;

  readonly granularity:
    AnalyticsTimeGranularity;

  readonly filters:
    AnalyticsFilter;

  readonly requestId:
    RequestId;
}


/* ============================================================
   QUERY RESPONSE
   ============================================================ */

export interface AnalyticsQueryResponse {
  readonly series:
    readonly AnalyticsSeries[];

  readonly generatedAt:
    IsoDateTime;

  readonly freshness:
    AnalyticsFreshness;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   BUSINESS OVERVIEW
   ============================================================ */

export interface BusinessOverviewSnapshot {
  readonly id:
    AnalyticsSnapshotId;

  readonly period:
    AnalyticsPeriod;

  readonly currency:
    CurrencyCode;

  readonly visitors:
    number;

  readonly sessions:
    number;

  readonly completedOrders:
    number;

  readonly revenue:
    Money;

  readonly averageOrderValue:
    Money;

  readonly reservations:
    number;

  readonly inquiries:
    number;

  readonly referralsQualified:
    number;

  readonly rewardsRedeemed:
    number;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   RESTAURANT PERFORMANCE
   ============================================================ */

export interface RestaurantAnalyticsSnapshot {
  readonly restaurantId:
    RestaurantId;

  readonly period:
    AnalyticsPeriod;

  readonly orders:
    number;

  readonly completedOrders:
    number;

  readonly cancelledOrders:
    number;

  readonly revenue:
    Money;

  readonly averageOrderValue:
    Money;

  readonly deliveryOrders:
    number;

  readonly pickupOrders:
    number;

  readonly reservations:
    number;

  readonly inquiries:
    number;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   PRODUCT PERFORMANCE
   ============================================================ */

export interface ProductAnalyticsSnapshot {
  readonly menuItemId:
    MenuItemId;

  readonly restaurantId?:
    RestaurantId;

  readonly period:
    AnalyticsPeriod;

  readonly views:
    number;

  readonly addToCart:
    number;

  readonly unitsSold:
    number;

  readonly orders:
    number;

  readonly revenue:
    Money;

  readonly viewToCartRate:
    AnalyticsRate;

  readonly cartToPurchaseRate:
    AnalyticsRate;
}


/* ============================================================
   SEO PERFORMANCE
   ============================================================ */

export interface SeoAnalyticsSnapshot {
  readonly period:
    AnalyticsPeriod;

  readonly impressions:
    number;

  readonly clicks:
    number;

  readonly clickThroughRate:
    AnalyticsRate;

  readonly organicSessions:
    number;

  readonly organicConversions:
    number;

  readonly organicRevenue?:
    Money;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   CONTENT PERFORMANCE
   ============================================================ */

export interface ContentAnalyticsSnapshot {
  readonly entityId:
    string;

  readonly entityType:
    | "page"
    | "article"
    | "story"
    | "video"
    | "event"
    | "service"
    | "community_post";

  readonly period:
    AnalyticsPeriod;

  readonly views:
    number;

  readonly engagedSessions:
    number;

  readonly shares:
    number;

  readonly ctaClicks:
    number;

  readonly conversions:
    number;

  readonly revenueAttributed?:
    Money;
}


/* ============================================================
   VIDEO PERFORMANCE
   ============================================================ */

export interface VideoAnalyticsSnapshot {
  readonly mediaAssetId:
    MediaAssetId;

  readonly period:
    AnalyticsPeriod;

  readonly impressions:
    number;

  readonly starts:
    number;

  readonly completions:
    number;

  readonly completionRate:
    AnalyticsRate;

  readonly ctaClicks:
    number;

  readonly conversions:
    number;
}


/* ============================================================
   DELIVERY PERFORMANCE
   ============================================================ */

export interface DeliveryAnalyticsSnapshot {
  readonly restaurantId?:
    RestaurantId;

  readonly period:
    AnalyticsPeriod;

  readonly quotes:
    number;

  readonly availableQuotes:
    number;

  readonly unavailableQuotes:
    number;

  readonly orders:
    number;

  readonly completedDeliveries:
    number;

  readonly failedDeliveries:
    number;

  readonly averageDeliveryMinutes:
    number;

  readonly averageDeliveryFee:
    Money;
}


/* ============================================================
   RESERVATION PERFORMANCE
   ============================================================ */

export interface ReservationAnalyticsSnapshot {
  readonly restaurantId?:
    RestaurantId;

  readonly period:
    AnalyticsPeriod;

  readonly searches:
    number;

  readonly reservationsCreated:
    number;

  readonly reservationsCompleted:
    number;

  readonly cancellations:
    number;

  readonly noShows:
    number;

  readonly guestsServed:
    number;

  readonly conversionRate:
    AnalyticsRate;
}


/* ============================================================
   INQUIRY PERFORMANCE
   ============================================================ */

export interface InquiryAnalyticsSnapshot {
  readonly period:
    AnalyticsPeriod;

  readonly inquiries:
    number;

  readonly contacted:
    number;

  readonly quotesSent:
    number;

  readonly quotesAccepted:
    number;

  readonly converted:
    number;

  readonly conversionRate:
    AnalyticsRate;

  readonly averageFirstResponseMinutes?:
    number;

  readonly revenueConverted?:
    Money;
}


/* ============================================================
   LOYALTY PERFORMANCE
   ============================================================ */

export interface LoyaltyAnalyticsSnapshot {
  readonly programId:
    LoyaltyProgramId;

  readonly period:
    AnalyticsPeriod;

  readonly activeMembers:
    number;

  readonly newMembers:
    number;

  readonly pointsIssued:
    number;

  readonly pointsRedeemed:
    number;

  readonly rewardsGranted:
    number;

  readonly rewardsRedeemed:
    number;

  readonly redemptionRate:
    AnalyticsRate;
}


/* ============================================================
   REFERRAL PERFORMANCE
   ============================================================ */

export interface ReferralAnalyticsSnapshot {
  readonly campaignId:
    ReferralCampaignId;

  readonly period:
    AnalyticsPeriod;

  readonly referralsCreated:
    number;

  readonly referralsClaimed:
    number;

  readonly referralsQualified:
    number;

  readonly rewardedReferrers:
    number;

  readonly referredCustomers:
    number;

  readonly qualifyingOrders:
    number;

  readonly revenue:
    Money;

  readonly qualificationRate:
    AnalyticsRate;
}


/* ============================================================
   COMMUNITY PERFORMANCE
   ============================================================ */

export interface CommunityAnalyticsSnapshot {
  readonly period:
    AnalyticsPeriod;

  readonly totalMembers:
    number;

  readonly newMembers:
    number;

  readonly activeMembers:
    number;

  readonly posts:
    number;

  readonly comments:
    number;

  readonly reactions:
    number;

  readonly shares:
    number;

  readonly communityDrivenConversions:
    number;
}


/* ============================================================
   SEARCH PERFORMANCE
   ============================================================ */

export interface SearchAnalyticsSnapshot {
  readonly period:
    AnalyticsPeriod;

  readonly searches:
    number;

  readonly zeroResultSearches:
    number;

  readonly resultClicks:
    number;

  readonly conversionsAfterSearch:
    number;

  readonly zeroResultRate:
    AnalyticsRate;

  readonly searchConversionRate:
    AnalyticsRate;
}


/* ============================================================
   FUNNEL
   ============================================================ */

export type AnalyticsFunnelStage =
  | "discovery"
  | "visit"
  | "engagement"
  | "intent"
  | "checkout"
  | "conversion"
  | "retention"
  | "referral";


export interface AnalyticsFunnelStageResult {
  readonly stage:
    AnalyticsFunnelStage;

  readonly users:
    number;

  readonly sessions:
    number;

  readonly conversionFromPrevious?:
    AnalyticsRate;
}


export interface AnalyticsFunnelSnapshot {
  readonly period:
    AnalyticsPeriod;

  readonly stages:
    readonly AnalyticsFunnelStageResult[];

  readonly overallConversionRate:
    AnalyticsRate;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   COHORT
   ============================================================ */

export type AnalyticsCohortBasis =
  | "first_order"
  | "registration"
  | "loyalty_join"
  | "first_visit";


export interface AnalyticsCohort {
  readonly id:
    AnalyticsCohortId;

  readonly name:
    string;

  readonly basis:
    AnalyticsCohortBasis;

  readonly from:
    IsoDateTime;

  readonly until:
    IsoDateTime;

  readonly restaurantId?:
    RestaurantId;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   RETENTION
   ============================================================ */

export interface AnalyticsRetentionPoint {
  readonly periodOffset:
    number;

  readonly customers:
    number;

  readonly retentionRate:
    AnalyticsRate;
}


export interface AnalyticsRetentionSnapshot {
  readonly cohortId:
    AnalyticsCohortId;

  readonly points:
    readonly AnalyticsRetentionPoint[];

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   DASHBOARD
   ============================================================ */

export type AnalyticsWidgetType =
  | "metric"
  | "timeseries"
  | "bar_chart"
  | "table"
  | "funnel"
  | "map"
  | "leaderboard";


export interface AnalyticsDashboardWidget {
  readonly id:
    AnalyticsWidgetId;

  readonly title:
    string;

  readonly type:
    AnalyticsWidgetType;

  readonly metrics:
    readonly AnalyticsMetricKey[];

  readonly dimensions:
    readonly AnalyticsDimension[];

  readonly sortOrder:
    number;

  readonly enabled:
    boolean;
}


export interface AnalyticsDashboard {
  readonly id:
    AnalyticsDashboardId;

  readonly name:
    string;

  readonly widgets:
    readonly AnalyticsDashboardWidget[];

  readonly defaultPeriod:
    AnalyticsTimeGranularity;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   DATA QUALITY
   ============================================================ */

export type AnalyticsDataQualityStatus =
  | "healthy"
  | "warning"
  | "degraded"
  | "invalid";


export interface AnalyticsDataQualityCheck {
  readonly id:
    string;

  readonly source:
    AnalyticsSource;

  readonly status:
    AnalyticsDataQualityStatus;

  readonly expectedRecords?:
    number;

  readonly actualRecords?:
    number;

  readonly duplicateRecords?:
    number;

  readonly missingRecords?:
    number;

  readonly checkedAt:
    IsoDateTime;

  readonly message?:
    string;
}


/* ============================================================
   DATASET COMPLETENESS
   ============================================================ */

/**
 * Muy importante:
 *
 * el dashboard debe saber si está utilizando
 * el dataset completo.
 *
 * Evita errores de reporting como:
 *
 * "últimos 250 pedidos"
 *
 * interpretados como:
 *
 * "todos los pedidos".
 */

export interface AnalyticsDatasetCompleteness {
  readonly complete:
    boolean;

  readonly recordsProcessed:
    number;

  readonly expectedRecords?:
    number;

  readonly cursorExhausted:
    boolean;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   REPORT
   ============================================================ */

export type AnalyticsReportStatus =
  | "draft"
  | "generating"
  | "ready"
  | "failed"
  | "expired";


export interface AnalyticsReport {
  readonly id:
    AnalyticsReportId;

  readonly name:
    string;

  readonly status:
    AnalyticsReportStatus;

  readonly period:
    AnalyticsPeriod;

  readonly generatedAt?:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   EXPORT
   ============================================================ */

export type AnalyticsExportFormat =
  | "csv"
  | "xlsx"
  | "json";


export type AnalyticsExportStatus =
  | "queued"
  | "processing"
  | "ready"
  | "failed"
  | "expired";


export interface AnalyticsExport {
  readonly id:
    AnalyticsExportId;

  readonly format:
    AnalyticsExportFormat;

  readonly status:
    AnalyticsExportStatus;

  readonly createdAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   COMPARISON
   ============================================================ */

export interface AnalyticsComparison {
  readonly current:
    AnalyticsMetricValue;

  readonly previous:
    AnalyticsMetricValue;

  readonly absoluteChange?:
    number;

  readonly percentageChangeBasisPoints?:
    number;
}


/* ============================================================
   PRIVACY
   ============================================================ */

export interface AnalyticsPrivacyPolicy {
  /**
   * IDs personales no deben incluirse
   * en dashboards públicos/agregados.
   */
  readonly aggregatePersonalData:
    true;

  readonly minimumReportingGroupSize:
    number;

  readonly retainRawEventsDays:
    number;

  readonly retainAggregatesDays?:
    number;
}


/* ============================================================
   ERROR MODEL
   ============================================================ */

export type AnalyticsErrorCode =
  | "INVALID_PERIOD"
  | "INVALID_METRIC"
  | "INVALID_DIMENSION"
  | "CURRENCY_MISMATCH"
  | "DATA_INCOMPLETE"
  | "DATA_SOURCE_UNAVAILABLE"
  | "QUERY_TOO_EXPENSIVE"
  | "REPORT_NOT_FOUND"
  | "EXPORT_FAILED"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface AnalyticsDomainError {
  readonly code:
    AnalyticsErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   HELPERS
   ============================================================ */

export function calculateRateBasisPoints(
  numerator: number,
  denominator: number,
): AnalyticsRate {
  if (
    denominator <= 0 ||
    !Number.isFinite(
      numerator,
    ) ||
    !Number.isFinite(
      denominator,
    )
  ) {
    return {
      basisPoints: 0,
    };
  }

  return {
    basisPoints:
      Math.round(
        (
          numerator /
          denominator
        ) *
        10000,
      ),
  };
}


export function rateToPercentage(
  rate: AnalyticsRate,
): number {
  return (
    rate.basisPoints /
    100
  );
}


export function isAnalyticsPeriodValid(
  period: AnalyticsPeriod,
): boolean {
  const from =
    new Date(
      period.from,
    ).getTime();

  const until =
    new Date(
      period.until,
    ).getTime();

  return (
    Number.isFinite(
      from,
    ) &&
    Number.isFinite(
      until,
    ) &&
    from < until
  );
}


export function isDatasetComplete(
  dataset:
    AnalyticsDatasetCompleteness,
): boolean {
  return (
    dataset.complete &&
    dataset.cursorExhausted
  );
}
