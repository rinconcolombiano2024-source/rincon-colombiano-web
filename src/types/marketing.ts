/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Marketing, Acquisition & Funnel Domain
 * ============================================================
 *
 * Cerebro contractual del embudo digital de Rincón Colombiano.
 *
 * Preparado para:
 *
 * - SEO
 * - Google Search
 * - Google Business Profile
 * - Google Maps
 * - campañas
 * - landing pages
 * - UTM
 * - QR
 * - redes sociales
 * - tráfico directo
 * - referrals
 * - eventos
 * - first-touch attribution
 * - last-touch attribution
 * - conversiones
 * - leads
 * - pedidos
 * - catering
 * - cumpleaños
 * - empresas
 * - familias
 * - desayunos sorpresa
 * - panadería
 * - comunidad
 * - fidelización
 * - analytics
 *
 * PRINCIPIO:
 *
 * DISCOVERY
 *    ↓
 * RINCONCOLOMBIANO.PL
 *    ↓
 * CONTENT / COMMUNITY / SERVICE / MENU
 *    ↓
 * CONVERSION
 *    ↓
 * RC ORDERA / CRM
 *
 * IMPORTANTE:
 *
 * Este dominio NO debe almacenar:
 *
 * - passwords
 * - tarjetas
 * - secretos
 * - tokens privados
 *
 * La medición debe respetar consentimiento,
 * privacidad y legislación aplicable.
 */

import type {
  IsoDateTime,
  Money,
  RequestId,
} from "@/types/common";

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  CustomerId,
} from "@/types/customer";

import type {
  RestaurantId,
} from "@/types/restaurant";

import type {
  MenuItemId,
} from "@/types/menu";

import type {
  OrderId,
} from "@/types/order";

import type {
  ArticleId,
  EventId,
  PageId,
  PromotionId,
  ServiceId,
} from "@/types/content";

import type {
  CommunityPostId,
  CommunityProfileId,
} from "@/types/community";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type VisitorId =
  string;

export type MarketingSessionId =
  string;

export type MarketingTouchpointId =
  string;

export type CampaignId =
  string;

export type LandingPageId =
  string;

export type ConversionId =
  string;

export type FunnelId =
  string;

export type FunnelStepId =
  string;

export type QrCampaignId =
  string;

export type LeadId =
  string;

export type SeoTopicId =
  string;

export type MarketingEventId =
  string;


/* ============================================================
   CHANNELS
   ============================================================ */

export type MarketingChannel =
  | "organic_search"
  | "google_business"
  | "google_maps"
  | "direct"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "whatsapp"
  | "email"
  | "sms"
  | "qr"
  | "referral"
  | "affiliate"
  | "paid_search"
  | "paid_social"
  | "display"
  | "event"
  | "offline"
  | "community"
  | "other"
  | "unknown";


/* ============================================================
   PLATFORM
   ============================================================ */

export type MarketingPlatform =
  | "google"
  | "google_business"
  | "google_maps"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "whatsapp"
  | "linkedin"
  | "email"
  | "sms"
  | "website"
  | "community"
  | "offline"
  | "other";


/* ============================================================
   UTM
   ============================================================ */

export interface UtmParameters {
  readonly source?: string;

  readonly medium?: string;

  readonly campaign?: string;

  readonly term?: string;

  readonly content?: string;

  readonly id?: string;
}


/* ============================================================
   CLICK IDENTIFIERS
   ============================================================ */

/**
 * IDs publicitarios opcionales.
 *
 * Solo deben utilizarse conforme a consentimiento
 * y políticas de cada plataforma.
 */

export interface AdvertisingClickIdentifiers {
  readonly gclid?: string;

  readonly gbraid?: string;

  readonly wbraid?: string;

  readonly fbclid?: string;

  readonly ttclid?: string;
}


/* ============================================================
   ENTRY CONTEXT
   ============================================================ */

export interface MarketingEntryContext {
  /**
   * Primera ruta visitada.
   *
   * Ejemplo:
   *
   * /pl/menu/bandeja-paisa
   */
  readonly landingPath:
    string;

  readonly referrer?: string;

  readonly channel:
    MarketingChannel;

  readonly platform?:
    MarketingPlatform;

  readonly utm:
    UtmParameters;

  readonly clickIds?:
    AdvertisingClickIdentifiers;

  readonly capturedAt:
    IsoDateTime;
}


/* ============================================================
   VISITOR
   ============================================================ */

/**
 * Visitante anónimo.
 *
 * No equivale necesariamente a Customer.
 */

export interface MarketingVisitor {
  readonly id:
    VisitorId;

  readonly firstSeenAt:
    IsoDateTime;

  readonly lastSeenAt:
    IsoDateTime;

  readonly locale:
    SupportedLocale;

  readonly firstTouch?:
    MarketingEntryContext;

  readonly lastTouch?:
    MarketingEntryContext;
}


/* ============================================================
   SESSION
   ============================================================ */

export interface MarketingSession {
  readonly id:
    MarketingSessionId;

  readonly visitorId:
    VisitorId;

  readonly customerId?:
    CustomerId;

  readonly startedAt:
    IsoDateTime;

  readonly endedAt?:
    IsoDateTime;

  readonly entry:
    MarketingEntryContext;

  readonly pageViewCount:
    number;

  readonly engaged:
    boolean;
}


/* ============================================================
   TOUCHPOINT
   ============================================================ */

export type MarketingTouchpointType =
  | "impression"
  | "click"
  | "landing"
  | "page_view"
  | "content_view"
  | "video_view"
  | "menu_view"
  | "product_view"
  | "service_view"
  | "event_view"
  | "community_view"
  | "cta_click"
  | "form_start"
  | "conversion";


export interface MarketingTouchpoint {
  readonly id:
    MarketingTouchpointId;

  readonly visitorId:
    VisitorId;

  readonly sessionId:
    MarketingSessionId;

  readonly type:
    MarketingTouchpointType;

  readonly channel:
    MarketingChannel;

  readonly platform?:
    MarketingPlatform;

  readonly path?:
    string;

  readonly campaignId?:
    CampaignId;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   CAMPAIGN OBJECTIVES
   ============================================================ */

export type CampaignObjective =
  | "brand_awareness"
  | "website_traffic"
  | "community_growth"
  | "restaurant_visits"
  | "orders"
  | "delivery_orders"
  | "pickup_orders"
  | "reservations"
  | "catering_leads"
  | "event_leads"
  | "birthday_leads"
  | "corporate_leads"
  | "family_leads"
  | "breakfast_leads"
  | "bakery_sales"
  | "customer_registration"
  | "loyalty_registration";


/* ============================================================
   CAMPAIGN STATUS
   ============================================================ */

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "archived";


/* ============================================================
   CAMPAIGN
   ============================================================ */

export interface MarketingCampaign {
  readonly id:
    CampaignId;

  readonly name:
    string;

  readonly slug:
    string;

  readonly status:
    CampaignStatus;

  readonly objective:
    CampaignObjective;

  readonly channels:
    readonly MarketingChannel[];

  readonly platforms:
    readonly MarketingPlatform[];

  readonly defaultLandingPath:
    string;

  readonly startsAt?:
    IsoDateTime;

  readonly endsAt?:
    IsoDateTime;

  readonly restaurantIds:
    readonly RestaurantId[];

  readonly promotionId?:
    PromotionId;

  readonly budget?:
    Money;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   LANDING PAGE
   ============================================================ */

export type LandingPagePurpose =
  | "seo"
  | "campaign"
  | "product"
  | "service"
  | "event"
  | "restaurant"
  | "community"
  | "promotion"
  | "brand";


export interface MarketingLandingPage {
  readonly id:
    LandingPageId;

  readonly pageId:
    PageId;

  readonly path:
    string;

  readonly purpose:
    LandingPagePurpose;

  readonly locale:
    SupportedLocale;

  readonly campaignIds:
    readonly CampaignId[];

  readonly primaryConversion:
    ConversionType;

  readonly active:
    boolean;
}


/* ============================================================
   CONVERSION TYPES
   ============================================================ */

export type ConversionType =
  | "order_created"
  | "order_completed"
  | "delivery_order"
  | "pickup_order"
  | "reservation_request"
  | "reservation_completed"
  | "catering_inquiry"
  | "event_inquiry"
  | "corporate_inquiry"
  | "family_inquiry"
  | "birthday_inquiry"
  | "breakfast_inquiry"
  | "surprise_breakfast_inquiry"
  | "table_decoration_inquiry"
  | "bakery_inquiry"
  | "contact_inquiry"
  | "phone_click"
  | "whatsapp_click"
  | "email_click"
  | "customer_registration"
  | "community_registration"
  | "loyalty_registration"
  | "newsletter_subscription";


/* ============================================================
   CONVERSION
   ============================================================ */

export interface MarketingConversion {
  readonly id:
    ConversionId;

  readonly type:
    ConversionType;

  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly customerId?:
    CustomerId;

  readonly orderId?:
    OrderId;

  readonly leadId?:
    LeadId;

  readonly restaurantId?:
    RestaurantId;

  readonly campaignId?:
    CampaignId;

  readonly value?:
    Money;

  readonly occurredAt:
    IsoDateTime;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   ATTRIBUTION
   ============================================================ */

export type AttributionModel =
  | "first_touch"
  | "last_touch"
  | "linear"
  | "position_based"
  | "data_driven";


export interface AttributionTouch {
  readonly channel:
    MarketingChannel;

  readonly platform?:
    MarketingPlatform;

  readonly campaignId?:
    CampaignId;

  readonly sessionId?:
    MarketingSessionId;

  readonly touchpointId?:
    MarketingTouchpointId;

  readonly occurredAt:
    IsoDateTime;
}


export interface ConversionAttribution {
  readonly conversionId:
    ConversionId;

  readonly model:
    AttributionModel;

  readonly firstTouch?:
    AttributionTouch;

  readonly lastTouch?:
    AttributionTouch;

  readonly assistingTouches:
    readonly AttributionTouch[];

  readonly calculatedAt:
    IsoDateTime;
}


/* ============================================================
   FUNNEL
   ============================================================ */

export type FunnelStage =
  | "awareness"
  | "discovery"
  | "engagement"
  | "consideration"
  | "intent"
  | "conversion"
  | "retention"
  | "advocacy";


export interface MarketingFunnelStep {
  readonly id:
    FunnelStepId;

  readonly name:
    string;

  readonly stage:
    FunnelStage;

  readonly eventNames:
    readonly MarketingEventName[];

  readonly sortOrder:
    number;
}


export interface MarketingFunnel {
  readonly id:
    FunnelId;

  readonly name:
    string;

  readonly active:
    boolean;

  readonly steps:
    readonly MarketingFunnelStep[];

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   MARKETING EVENTS
   ============================================================ */

export type MarketingEventName =
  | "page_view"
  | "landing_view"
  | "search_result_click"
  | "content_view"
  | "article_view"
  | "story_view"
  | "gallery_view"
  | "video_start"
  | "video_progress"
  | "video_complete"
  | "menu_view"
  | "category_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_started"
  | "delivery_address_checked"
  | "order_created"
  | "order_completed"
  | "restaurant_view"
  | "service_view"
  | "event_view"
  | "promotion_view"
  | "community_post_view"
  | "community_profile_view"
  | "community_signup"
  | "customer_signup"
  | "reservation_started"
  | "reservation_submitted"
  | "inquiry_started"
  | "inquiry_submitted"
  | "phone_click"
  | "whatsapp_click"
  | "email_click"
  | "cta_click"
  | "share"
  | "qr_open";


/* ============================================================
   MARKETING EVENT PAYLOAD
   ============================================================ */

export interface MarketingEvent {
  readonly id:
    MarketingEventId;

  readonly name:
    MarketingEventName;

  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly customerId?:
    CustomerId;

  readonly campaignId?:
    CampaignId;

  readonly restaurantId?:
    RestaurantId;

  readonly path?:
    string;

  readonly menuItemId?:
    MenuItemId;

  readonly articleId?:
    ArticleId;

  readonly eventId?:
    EventId;

  readonly serviceId?:
    ServiceId;

  readonly promotionId?:
    PromotionId;

  readonly communityPostId?:
    CommunityPostId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly value?:
    Money;

  readonly metadata?:
    Readonly<
      Record<
        string,
        string | number | boolean | null
      >
    >;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   QR CAMPAIGNS
   ============================================================ */

export type QrPlacement =
  | "restaurant_table"
  | "restaurant_window"
  | "flyer"
  | "business_card"
  | "packaging"
  | "delivery_bag"
  | "event"
  | "poster"
  | "vehicle"
  | "other";


export interface QrCampaign {
  readonly id:
    QrCampaignId;

  readonly name:
    string;

  readonly destinationPath:
    string;

  readonly placement:
    QrPlacement;

  readonly restaurantId?:
    RestaurantId;

  readonly campaignId?:
    CampaignId;

  readonly active:
    boolean;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   SEO SEARCH INTENT
   ============================================================ */

export type SeoSearchIntent =
  | "informational"
  | "navigational"
  | "commercial"
  | "transactional"
  | "local";


/* ============================================================
   SEO TOPIC
   ============================================================ */

/**
 * Tema estratégico de contenido.
 *
 * No equivale a una antigua etiqueta meta keywords.
 *
 * Sirve para arquitectura editorial y SEO.
 */

export interface SeoTopic {
  readonly id:
    SeoTopicId;

  readonly name:
    string;

  readonly locale:
    SupportedLocale;

  readonly intent:
    SeoSearchIntent;

  readonly primaryQuery:
    string;

  readonly relatedQueries:
    readonly string[];

  readonly targetPath:
    string;

  readonly restaurantId?:
    RestaurantId;

  readonly serviceId?:
    ServiceId;

  readonly menuItemId?:
    MenuItemId;

  readonly active:
    boolean;
}


/* ============================================================
   SEO CONTENT CLUSTERS
   ============================================================ */

export interface SeoTopicCluster {
  readonly id:
    string;

  readonly name:
    string;

  /**
   * Página principal del tema.
   *
   * Ejemplo:
   *
   * /pl/catering
   */
  readonly pillarPath:
    string;

  readonly topicIds:
    readonly SeoTopicId[];

  readonly locale:
    SupportedLocale;

  readonly active:
    boolean;
}


/* ============================================================
   ORGANIC SEARCH SIGNAL
   ============================================================ */

/**
 * Datos provenientes de fuentes agregadas
 * como Search Console.
 *
 * No debemos asumir que conocemos la consulta
 * individual de cada visitante.
 */

export interface OrganicSearchMetric {
  readonly query?:
    string;

  readonly page:
    string;

  readonly locale?:
    SupportedLocale;

  readonly impressions:
    number;

  readonly clicks:
    number;

  readonly averagePosition?:
    number;

  readonly clickThroughRate?:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   GOOGLE BUSINESS / LOCAL DISCOVERY
   ============================================================ */

export type LocalDiscoveryAction =
  | "website_click"
  | "directions"
  | "phone_call"
  | "menu_click"
  | "reservation_click";


export interface LocalDiscoveryEvent {
  readonly restaurantId:
    RestaurantId;

  readonly action:
    LocalDiscoveryAction;

  readonly occurredAt:
    IsoDateTime;

  readonly campaignId?:
    CampaignId;
}


/* ============================================================
   LEAD SOURCE
   ============================================================ */

export type LeadIntent =
  | "catering"
  | "corporate_event"
  | "family_event"
  | "birthday"
  | "breakfast"
  | "surprise_breakfast"
  | "table_decoration"
  | "bakery"
  | "private_event"
  | "cultural_event"
  | "general_contact"
  | "other";


export interface MarketingLeadReference {
  readonly id:
    LeadId;

  readonly intent:
    LeadIntent;

  readonly visitorId?:
    VisitorId;

  readonly customerId?:
    CustomerId;

  readonly campaignId?:
    CampaignId;

  readonly restaurantId?:
    RestaurantId;

  readonly landingPath?:
    string;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   TRACKING CONSENT
   ============================================================ */

export type TrackingConsentStatus =
  | "unknown"
  | "granted"
  | "denied";


export interface MarketingTrackingConsent {
  readonly analytics:
    TrackingConsentStatus;

  readonly marketing:
    TrackingConsentStatus;

  readonly personalization:
    TrackingConsentStatus;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   MEASUREMENT POLICY
   ============================================================ */

/**
 * El frontend puede utilizar esta estructura para decidir
 * qué eventos está autorizado a enviar.
 */

export interface MarketingMeasurementPolicy {
  readonly essentialEnabled:
    true;

  readonly analyticsEnabled:
    boolean;

  readonly marketingEnabled:
    boolean;

  readonly personalizationEnabled:
    boolean;
}


/* ============================================================
   CAMPAIGN PERFORMANCE
   ============================================================ */

/**
 * Snapshot analítico.
 *
 * No debe sustituir sistemas contables.
 */

export interface CampaignPerformance {
  readonly campaignId:
    CampaignId;

  readonly impressions:
    number;

  readonly clicks:
    number;

  readonly sessions:
    number;

  readonly engagedSessions:
    number;

  readonly conversions:
    number;

  readonly orders:
    number;

  readonly leads:
    number;

  readonly revenue?:
    Money;

  readonly spend?:
    Money;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   CONTENT PERFORMANCE
   ============================================================ */

export interface ContentPerformance {
  readonly path:
    string;

  readonly views:
    number;

  readonly engagedSessions:
    number;

  readonly ctaClicks:
    number;

  readonly conversions:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   FUNNEL PERFORMANCE
   ============================================================ */

export interface FunnelStepPerformance {
  readonly stepId:
    FunnelStepId;

  readonly users:
    number;

  readonly sessions:
    number;

  readonly conversionRate?:
    number;
}


export interface FunnelPerformance {
  readonly funnelId:
    FunnelId;

  readonly steps:
    readonly FunnelStepPerformance[];

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   MARKETING QUERY
   ============================================================ */

export interface MarketingAnalyticsQuery {
  readonly campaignId?:
    CampaignId;

  readonly restaurantId?:
    RestaurantId;

  readonly channel?:
    MarketingChannel;

  readonly locale?:
    SupportedLocale;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type MarketingErrorCode =
  | "CAMPAIGN_NOT_FOUND"
  | "LANDING_PAGE_NOT_FOUND"
  | "INVALID_CAMPAIGN"
  | "INVALID_LANDING_PATH"
  | "INVALID_UTM"
  | "VISITOR_NOT_FOUND"
  | "SESSION_NOT_FOUND"
  | "CONVERSION_NOT_FOUND"
  | "TRACKING_NOT_ALLOWED"
  | "INVALID_EVENT"
  | "ANALYTICS_UNAVAILABLE"
  | "SERVICE_UNAVAILABLE"
  | "VALIDATION_ERROR"
  | "UNKNOWN";


export interface MarketingDomainError {
  readonly code:
    MarketingErrorCode;

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

export function isCampaignRunning(
  campaign: MarketingCampaign,
  now = new Date(),
): boolean {
  if (
    campaign.status !== "active"
  ) {
    return false;
  }

  const nowTime =
    now.getTime();

  if (
    campaign.startsAt &&
    new Date(
      campaign.startsAt,
    ).getTime() > nowTime
  ) {
    return false;
  }

  if (
    campaign.endsAt &&
    new Date(
      campaign.endsAt,
    ).getTime() < nowTime
  ) {
    return false;
  }

  return true;
}


/**
 * Protege el principio de que las landing pages
 * principales deben vivir dentro de nuestro sitio.
 */
export function isInternalLandingPath(
  path: string,
): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//")
  );
}


export function normalizeUtmValue(
  value:
    string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : undefined;
}


export function isPrimaryConversion(
  event:
    MarketingEventName,
): boolean {
  return (
    event ===
      "order_completed" ||
    event ===
      "reservation_submitted" ||
    event ===
      "inquiry_submitted" ||
    event ===
      "customer_signup" ||
    event ===
      "community_signup"
  );
}


export function buildMeasurementPolicy(
  consent:
    MarketingTrackingConsent,
): MarketingMeasurementPolicy {
  return {
    essentialEnabled:
      true,

    analyticsEnabled:
      consent.analytics ===
      "granted",

    marketingEnabled:
      consent.marketing ===
      "granted",

    personalizationEnabled:
      consent.personalization ===
      "granted",
  };
}
