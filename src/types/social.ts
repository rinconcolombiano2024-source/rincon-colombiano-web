/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise External Social & Communication Channels Domain
 * ============================================================
 *
 * Registro empresarial de canales externos.
 *
 * Permite administrar desde el panel privado:
 *
 * - WhatsApp
 * - Instagram
 * - Facebook
 * - Messenger
 * - TikTok
 * - YouTube
 * - LinkedIn
 * - Threads
 * - X
 * - Pinterest
 * - Telegram
 * - Google Business Profile
 * - Google Maps
 * - teléfono
 * - email
 * - otros canales futuros
 *
 * PRINCIPIO:
 *
 * RINCONCOLOMBIANO.PL es el centro digital.
 *
 * Los canales externos son:
 *
 * - fuentes de adquisición
 * - canales de contacto
 * - canales de distribución
 * - destinos secundarios
 *
 * No deben convertirse en la fuente principal de verdad.
 *
 * SEGURIDAD:
 *
 * Este dominio NUNCA debe almacenar:
 *
 * - API secrets
 * - access tokens privados
 * - passwords
 * - refresh tokens
 * - claves de integración
 *
 * Los secretos pertenecen al backend / secret manager.
 */

import type {
  CountryCode,
  IsoDateTime,
  LocalizedText,
  RequestId,
} from "@/types/common";

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  RestaurantId,
} from "@/types/restaurant";

import type {
  MediaAssetId,
} from "@/types/content";

import type {
  CampaignId,
  MarketingSessionId,
  VisitorId,
} from "@/types/marketing";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type SocialChannelId =
  string;

export type SocialProfileId =
  string;

export type SocialLinkId =
  string;

export type SocialShareId =
  string;

export type SocialOutboundEventId =
  string;

export type SocialMessageTemplateId =
  string;


/* ============================================================
   PLATFORM CATEGORY
   ============================================================ */

export type ExternalChannelCategory =
  | "social"
  | "messaging"
  | "video"
  | "maps"
  | "search"
  | "contact"
  | "professional"
  | "other";


/* ============================================================
   SUPPORTED PLATFORMS
   ============================================================ */

export type ExternalPlatform =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "messenger"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "threads"
  | "x"
  | "pinterest"
  | "telegram"
  | "google_business"
  | "google_maps"
  | "phone"
  | "email"
  | "custom";


/* ============================================================
   PLATFORM CAPABILITIES
   ============================================================ */

export interface SocialChannelCapabilities {
  /**
   * Perfil público.
   *
   * Ejemplo:
   *
   * instagram.com/rincon...
   */
  readonly profile:
    boolean;

  /**
   * Contacto directo.
   */
  readonly directContact:
    boolean;

  /**
   * Compartir contenido.
   */
  readonly sharing:
    boolean;

  /**
   * Publicación de video.
   */
  readonly video:
    boolean;

  /**
   * Mensajería.
   */
  readonly messaging:
    boolean;

  /**
   * Navegación física / mapa.
   */
  readonly directions:
    boolean;

  /**
   * Llamadas.
   */
  readonly calling:
    boolean;
}


/* ============================================================
   CHANNEL STATUS
   ============================================================ */

export type SocialChannelStatus =
  | "draft"
  | "active"
  | "paused"
  | "disabled"
  | "archived";


/* ============================================================
   CHANNEL SCOPE
   ============================================================ */

/**
 * Una cuenta puede ser:
 *
 * GLOBAL
 *
 * o específica:
 *
 * Polonia
 * Varsovia
 * Czapelska
 */

export type SocialChannelScopeType =
  | "global"
  | "country"
  | "city"
  | "restaurant";


export interface SocialChannelScope {
  readonly type:
    SocialChannelScopeType;

  readonly countryCode?:
    CountryCode;

  readonly city?:
    string;

  readonly restaurantIds?:
    readonly RestaurantId[];
}


/* ============================================================
   EXTERNAL PROFILE
   ============================================================ */

export interface ExternalSocialProfile {
  readonly id:
    SocialProfileId;

  readonly platform:
    ExternalPlatform;

  /**
   * Nombre visible.
   */
  readonly displayName:
    string;

  /**
   * Username/handle sin asumir formato.
   *
   * Ejemplo:
   *
   * rinconcolombiano
   */
  readonly handle?:
    string;

  /**
   * URL pública oficial.
   */
  readonly profileUrl:
    string;

  readonly avatarMediaId?:
    MediaAssetId;

  readonly verified:
    boolean;

  readonly scope:
    SocialChannelScope;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   CHANNEL
   ============================================================ */

export interface SocialChannel {
  readonly id:
    SocialChannelId;

  readonly platform:
    ExternalPlatform;

  readonly category:
    ExternalChannelCategory;

  readonly name:
    LocalizedText;

  readonly status:
    SocialChannelStatus;

  readonly profileId?:
    SocialProfileId;

  readonly scope:
    SocialChannelScope;

  readonly capabilities:
    SocialChannelCapabilities;

  /**
   * Enlace principal.
   */
  readonly href:
    string;

  /**
   * Icono lógico.
   *
   * El frontend decide cómo representarlo.
   */
  readonly iconKey:
    string;

  /**
   * Orden global.
   */
  readonly sortOrder:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   PUBLIC PLACEMENTS
   ============================================================ */

export type SocialPlacement =
  | "header"
  | "mobile_menu"
  | "footer"
  | "contact_page"
  | "social_hub"
  | "floating_action"
  | "restaurant_page"
  | "service_page"
  | "article"
  | "community"
  | "event_page";


/* ============================================================
   LINK PURPOSE
   ============================================================ */

export type SocialLinkPurpose =
  | "follow"
  | "contact"
  | "message"
  | "call"
  | "email"
  | "directions"
  | "watch"
  | "share"
  | "visit_profile";


/* ============================================================
   PUBLIC SOCIAL LINK
   ============================================================ */

export interface SocialLink {
  readonly id:
    SocialLinkId;

  readonly channelId:
    SocialChannelId;

  readonly purpose:
    SocialLinkPurpose;

  readonly label:
    LocalizedText;

  readonly href:
    string;

  readonly placements:
    readonly SocialPlacement[];

  /**
   * Permite activar/desactivar un botón
   * sin eliminar la configuración.
   */
  readonly enabled:
    boolean;

  /**
   * Orden dentro del grupo.
   */
  readonly sortOrder:
    number;

  /**
   * Abrir en otra pestaña.
   */
  readonly openInNewTab:
    boolean;

  /**
   * Recomendado para enlaces externos no editoriales.
   */
  readonly noFollow:
    boolean;

  readonly scope:
    SocialChannelScope;
}


/* ============================================================
   CONTACT ACTIONS
   ============================================================ */

export type SocialContactAction =
  | "open_whatsapp"
  | "open_messenger"
  | "open_instagram"
  | "call_phone"
  | "send_email"
  | "open_maps"
  | "open_profile";


/* ============================================================
   WHATSAPP
   ============================================================ */

export interface WhatsAppChannelConfiguration {
  /**
   * Número en formato internacional.
   *
   * Ejemplo conceptual:
   *
   * +48...
   */
  readonly phoneNumber:
    string;

  /**
   * Mensaje opcional que podemos completar
   * automáticamente.
   */
  readonly defaultMessage?:
    LocalizedText;

  readonly enabled:
    boolean;
}


/* ============================================================
   EMAIL
   ============================================================ */

export interface EmailChannelConfiguration {
  readonly email:
    string;

  readonly defaultSubject?:
    LocalizedText;

  readonly enabled:
    boolean;
}


/* ============================================================
   PHONE
   ============================================================ */

export interface PhoneChannelConfiguration {
  readonly phoneNumber:
    string;

  readonly label?:
    LocalizedText;

  readonly enabled:
    boolean;
}


/* ============================================================
   GOOGLE MAPS
   ============================================================ */

export interface GoogleMapsChannelConfiguration {
  readonly restaurantId:
    RestaurantId;

  readonly mapsUrl:
    string;

  readonly placeId?:
    string;

  readonly directionsEnabled:
    boolean;
}


/* ============================================================
   GOOGLE BUSINESS
   ============================================================ */

export interface GoogleBusinessChannelConfiguration {
  readonly restaurantId:
    RestaurantId;

  readonly profileUrl:
    string;

  readonly locationId?:
    string;

  readonly enabled:
    boolean;
}


/* ============================================================
   MESSAGE TEMPLATES
   ============================================================ */

/**
 * Desde el administrador podremos configurar:
 *
 * "Hola, quiero información sobre catering..."
 *
 * sin editar código.
 */

export type SocialMessageTemplatePurpose =
  | "general"
  | "catering"
  | "birthday"
  | "corporate"
  | "family"
  | "breakfast"
  | "surprise_breakfast"
  | "table_decoration"
  | "bakery"
  | "event"
  | "reservation";


export interface SocialMessageTemplate {
  readonly id:
    SocialMessageTemplateId;

  readonly purpose:
    SocialMessageTemplatePurpose;

  readonly message:
    LocalizedText;

  readonly channelIds:
    readonly SocialChannelId[];

  readonly enabled:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   SHARE TARGETS
   ============================================================ */

export type SocialSharePlatform =
  | "whatsapp"
  | "facebook"
  | "messenger"
  | "linkedin"
  | "x"
  | "telegram"
  | "copy_link";


export interface SocialShareTarget {
  readonly platform:
    SocialSharePlatform;

  /**
   * URL propia de Rincón Colombiano que queremos compartir.
   */
  readonly canonicalUrl:
    string;

  readonly title?:
    string;

  readonly text?:
    string;
}


/* ============================================================
   SHARE RECORD
   ============================================================ */

export interface SocialShare {
  readonly id:
    SocialShareId;

  readonly platform:
    SocialSharePlatform;

  readonly path:
    string;

  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly campaignId?:
    CampaignId;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   OUTBOUND TRACKING
   ============================================================ */

/**
 * Cuando el usuario abandona nuestra web para:
 *
 * WhatsApp
 * Instagram
 * Google Maps
 * teléfono
 *
 * podemos registrar el clic conforme a la
 * política de medición aplicable.
 */

export type SocialOutboundAction =
  | "profile_click"
  | "message_click"
  | "phone_click"
  | "email_click"
  | "directions_click"
  | "video_channel_click"
  | "share_click";


export interface SocialOutboundEvent {
  readonly id:
    SocialOutboundEventId;

  readonly channelId:
    SocialChannelId;

  readonly action:
    SocialOutboundAction;

  readonly sourcePath:
    string;

  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly campaignId?:
    CampaignId;

  readonly restaurantId?:
    RestaurantId;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   PUBLIC SOCIAL DIRECTORY
   ============================================================ */

/**
 * Snapshot que la web pública puede consumir.
 *
 * Solo debe contener información pública.
 */

export interface PublicSocialDirectory {
  readonly version:
    string;

  readonly generatedAt:
    IsoDateTime;

  readonly channels:
    readonly SocialChannel[];

  readonly links:
    readonly SocialLink[];
}


/* ============================================================
   PERFORMANCE SNAPSHOT
   ============================================================ */

/**
 * Datos agregados.
 *
 * No sustituye analytics oficial de cada plataforma.
 */

export interface SocialChannelPerformance {
  readonly channelId:
    SocialChannelId;

  readonly profileClicks:
    number;

  readonly messageClicks:
    number;

  readonly phoneClicks:
    number;

  readonly directionsClicks:
    number;

  readonly shares:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   EXTERNAL PROFILE METRICS
   ============================================================ */

/**
 * Snapshot opcional procedente de APIs oficiales.
 *
 * No convertir estos números en nuestra fuente
 * principal de identidad del usuario.
 */

export interface ExternalProfileMetrics {
  readonly profileId:
    SocialProfileId;

  readonly followers?:
    number;

  readonly following?:
    number;

  readonly posts?:
    number;

  readonly views?:
    number;

  readonly measuredAt:
    IsoDateTime;
}


/* ============================================================
   ADMIN CREATE CHANNEL
   ============================================================ */

export interface CreateSocialChannelRequest {
  readonly platform:
    ExternalPlatform;

  readonly category:
    ExternalChannelCategory;

  readonly name:
    LocalizedText;

  readonly href:
    string;

  readonly iconKey:
    string;

  readonly scope:
    SocialChannelScope;

  readonly capabilities:
    SocialChannelCapabilities;

  readonly sortOrder:
    number;

  readonly requestId:
    RequestId;
}


/* ============================================================
   ADMIN UPDATE CHANNEL
   ============================================================ */

export interface UpdateSocialChannelRequest {
  readonly channelId:
    SocialChannelId;

  readonly name?:
    LocalizedText;

  readonly href?:
    string;

  readonly status?:
    SocialChannelStatus;

  readonly sortOrder?:
    number;

  readonly capabilities?:
    SocialChannelCapabilities;

  readonly requestId:
    RequestId;
}


/* ============================================================
   DIRECTORY QUERY
   ============================================================ */

export interface SocialDirectoryQuery {
  readonly placement?:
    SocialPlacement;

  readonly countryCode?:
    CountryCode;

  readonly city?:
    string;

  readonly restaurantId?:
    RestaurantId;

  readonly platform?:
    ExternalPlatform;

  readonly locale?:
    SupportedLocale;
}


/* ============================================================
   ERROR MODEL
   ============================================================ */

export type SocialErrorCode =
  | "CHANNEL_NOT_FOUND"
  | "PROFILE_NOT_FOUND"
  | "INVALID_URL"
  | "UNSAFE_URL"
  | "CHANNEL_DISABLED"
  | "INVALID_PLATFORM"
  | "INVALID_SCOPE"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface SocialDomainError {
  readonly code:
    SocialErrorCode;

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

/**
 * Verifica si el canal debe mostrarse.
 */
export function isSocialChannelActive(
  channel: SocialChannel,
): boolean {
  return channel.status === "active";
}


/**
 * Impide protocolos peligrosos como:
 *
 * javascript:
 * data:
 *
 * Permitimos:
 *
 * https:
 * mailto:
 * tel:
 */
export function isSafeSocialHref(
  href: string,
): boolean {
  const normalized =
    href.trim().toLowerCase();

  return (
    normalized.startsWith(
      "https://",
    ) ||
    normalized.startsWith(
      "mailto:",
    ) ||
    normalized.startsWith(
      "tel:",
    )
  );
}


/**
 * Comprueba si un link corresponde
 * a una ubicación de interfaz.
 */
export function supportsSocialPlacement(
  link: SocialLink,
  placement: SocialPlacement,
): boolean {
  return (
    link.enabled &&
    link.placements.includes(
      placement,
    )
  );
}


/**
 * Un enlace externo debe abrir una URL segura.
 */
export function canRenderSocialLink(
  link: SocialLink,
): boolean {
  return (
    link.enabled &&
    isSafeSocialHref(
      link.href,
    )
  );
}


/**
 * Construye URL estándar para WhatsApp.
 *
 * NO incluye tracking secreto.
 */
export function buildWhatsAppUrl(
  phoneNumber: string,
  message?: string,
): string {
  const normalizedPhone =
    phoneNumber.replace(
      /[^\d]/g,
      "",
    );

  const baseUrl =
    `https://wa.me/${normalizedPhone}`;

  if (
    !message ||
    message.trim().length === 0
  ) {
    return baseUrl;
  }

  return (
    `${baseUrl}?text=` +
    encodeURIComponent(
      message,
    )
  );
}


/**
 * Construye enlace telefónico.
 */
export function buildPhoneUrl(
  phoneNumber: string,
): string {
  const normalized =
    phoneNumber.replace(
      /[^\d+]/g,
      "",
    );

  return `tel:${normalized}`;
}


/**
 * Construye enlace de email.
 */
export function buildEmailUrl(
  email: string,
  subject?: string,
): string {
  const normalizedEmail =
    email.trim();

  if (
    !subject ||
    subject.trim().length === 0
  ) {
    return `mailto:${normalizedEmail}`;
  }

  return (
    `mailto:${normalizedEmail}` +
    `?subject=${encodeURIComponent(subject)}`
  );
}
