/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Content Management Domain
 * ============================================================
 *
 * Contrato central del CMS de Rincón Colombiano.
 *
 * Permitirá administrar SIN MODIFICAR CÓDIGO:
 *
 * - páginas
 * - fotografías
 * - videos
 * - historias
 * - noticias
 * - opiniones
 * - eventos
 * - catering
 * - empresas
 * - familias
 * - desayunos
 * - desayunos sorpresa
 * - decoración de mesas
 * - cumpleaños
 * - panadería
 * - promociones
 * - galerías
 * - banners
 * - botones CTA
 * - contenido SEO
 *
 * PRINCIPIO:
 *
 * ADMIN PRIVADO
 *      ↓
 * BORRADOR
 *      ↓
 * REVISIÓN
 *      ↓
 * PUBLICACIÓN
 *      ↓
 * WEB PÚBLICA
 *
 * El público NUNCA tendrá acceso a herramientas administrativas.
 */

import type {
  AuditTimestamps,
  EntityId,
  IsoDateTime,
  LocalizedText,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  RestaurantId,
} from "@/types/restaurant";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type ContentId = string;

export type PageId = string;

export type ContentBlockId = string;

export type MediaAssetId = string;

export type GalleryId = string;

export type StoryId = string;

export type EventId = string;

export type ReviewId = string;

export type PromotionId = string;

export type ServiceId = string;

export type ArticleId = string;

export type ContentRevisionId = string;


/* ============================================================
   PUBLICATION STATUS
   ============================================================ */

export type PublicationStatus =
  | "draft"
  | "in_review"
  | "scheduled"
  | "published"
  | "unpublished"
  | "archived";


/* ============================================================
   VISIBILITY
   ============================================================ */

export type ContentVisibility =
  | "public"
  | "private"
  | "unlisted";


/* ============================================================
   CONTENT OWNERSHIP
   ============================================================ */

export type ContentScope =
  | "global"
  | "country"
  | "city"
  | "restaurant";


export interface ContentTarget {
  readonly scope: ContentScope;

  readonly countryCode?: string;

  readonly city?: string;

  readonly restaurantIds?: readonly RestaurantId[];
}


/* ============================================================
   SEO
   ============================================================ */

export interface ContentSeo {
  readonly indexable: boolean;

  readonly title?: LocalizedText;

  readonly description?: LocalizedText;

  readonly canonicalPath?: string;

  readonly keywords?: readonly string[];

  readonly socialTitle?: LocalizedText;

  readonly socialDescription?: LocalizedText;

  readonly socialImageId?: MediaAssetId;

  readonly structuredDataType?: string;
}


/* ============================================================
   MEDIA
   ============================================================ */

export type MediaType =
  | "image"
  | "video"
  | "document";


export type MediaProvider =
  | "supabase"
  | "cloudinary"
  | "youtube"
  | "vimeo"
  | "external";


export interface MediaAsset
  extends AuditTimestamps {
  readonly id: MediaAssetId;

  readonly type: MediaType;

  readonly provider: MediaProvider;

  readonly url: string;

  readonly thumbnailUrl?: string;

  readonly alt: LocalizedText;

  readonly title?: LocalizedText;

  readonly caption?: LocalizedText;

  readonly width?: number;

  readonly height?: number;

  readonly durationSeconds?: number;

  readonly mimeType?: string;

  readonly fileSizeBytes?: number;

  readonly copyrightOwner?: string;

  readonly source?: string;

  readonly visibility: ContentVisibility;

  readonly uploadedBy?: UserId;
}


/* ============================================================
   GALLERY
   ============================================================ */

export interface GalleryItem {
  readonly mediaId: MediaAssetId;

  readonly sortOrder: number;
}


export interface Gallery
  extends AuditTimestamps {
  readonly id: GalleryId;

  readonly name: LocalizedText;

  readonly description?: LocalizedText;

  readonly items: readonly GalleryItem[];

  readonly status: PublicationStatus;

  readonly target: ContentTarget;
}


/* ============================================================
   CTA
   ============================================================ */

export type CallToActionType =
  | "internal_link"
  | "external_link"
  | "order"
  | "reservation"
  | "contact"
  | "catering"
  | "phone"
  | "whatsapp";


export interface CallToAction {
  readonly id: string;

  readonly type: CallToActionType;

  readonly label: LocalizedText;

  readonly href?: string;

  readonly style:
    | "primary"
    | "secondary"
    | "outline"
    | "text";
}


/* ============================================================
   BLOCK SYSTEM
   ============================================================ */

export type ContentBlockType =
  | "hero"
  | "text"
  | "rich_text"
  | "image"
  | "video"
  | "gallery"
  | "cta"
  | "quote"
  | "review"
  | "reviews"
  | "services"
  | "events"
  | "menu"
  | "locations"
  | "contact"
  | "catering"
  | "promotion"
  | "story"
  | "custom";


export interface ContentBlock {
  readonly id: ContentBlockId;

  readonly type: ContentBlockType;

  readonly enabled: boolean;

  readonly sortOrder: number;

  readonly title?: LocalizedText;

  readonly subtitle?: LocalizedText;

  readonly body?: LocalizedText;

  readonly mediaIds?: readonly MediaAssetId[];

  readonly galleryId?: GalleryId;

  readonly ctas?: readonly CallToAction[];

  /**
   * Configuración específica del bloque.
   *
   * Debe contener únicamente información serializable.
   */
  readonly settings?: Readonly<
    Record<
      string,
      string | number | boolean | null
    >
  >;
}


/* ============================================================
   PAGE
   ============================================================ */

export type PageType =
  | "home"
  | "landing"
  | "service"
  | "restaurant"
  | "article"
  | "event"
  | "campaign"
  | "legal"
  | "custom";


export interface ContentPage
  extends AuditTimestamps {
  readonly id: PageId;

  readonly slug: string;

  readonly type: PageType;

  readonly name: LocalizedText;

  readonly status: PublicationStatus;

  readonly visibility: ContentVisibility;

  readonly locale: SupportedLocale;

  readonly target: ContentTarget;

  readonly blocks: readonly ContentBlock[];

  readonly seo: ContentSeo;

  readonly publishedAt?: IsoDateTime;

  readonly scheduledPublishAt?: IsoDateTime;

  readonly scheduledUnpublishAt?: IsoDateTime;

  readonly createdBy?: UserId;

  readonly updatedBy?: UserId;

  readonly publishedBy?: UserId;

  readonly revision: number;
}


/* ============================================================
   STORY
   ============================================================ */

export interface BrandStory
  extends AuditTimestamps {
  readonly id: StoryId;

  readonly slug: string;

  readonly title: LocalizedText;

  readonly summary?: LocalizedText;

  readonly body: LocalizedText;

  readonly coverMediaId?: MediaAssetId;

  readonly galleryId?: GalleryId;

  readonly status: PublicationStatus;

  readonly target: ContentTarget;

  readonly seo: ContentSeo;

  readonly publishedAt?: IsoDateTime;
}


/* ============================================================
   EVENTS
   ============================================================ */

export type EventType =
  | "restaurant"
  | "cultural"
  | "festival"
  | "corporate"
  | "private"
  | "birthday"
  | "family"
  | "special";


export interface BrandEvent
  extends AuditTimestamps {
  readonly id: EventId;

  readonly slug: string;

  readonly type: EventType;

  readonly title: LocalizedText;

  readonly description: LocalizedText;

  readonly startsAt: IsoDateTime;

  readonly endsAt?: IsoDateTime;

  readonly venueName?: string;

  readonly address?: string;

  readonly mediaIds: readonly MediaAssetId[];

  readonly ctas: readonly CallToAction[];

  readonly status: PublicationStatus;

  readonly target: ContentTarget;

  readonly seo: ContentSeo;
}


/* ============================================================
   SERVICES
   ============================================================ */

export type ServiceCategory =
  | "catering"
  | "corporate"
  | "family"
  | "birthday"
  | "breakfast"
  | "surprise_breakfast"
  | "table_decoration"
  | "bakery"
  | "events"
  | "celebrations"
  | "custom";


export interface BrandService
  extends AuditTimestamps {
  readonly id: ServiceId;

  readonly slug: string;

  readonly category: ServiceCategory;

  readonly name: LocalizedText;

  readonly shortDescription?: LocalizedText;

  readonly description: LocalizedText;

  readonly coverMediaId?: MediaAssetId;

  readonly galleryId?: GalleryId;

  readonly ctas: readonly CallToAction[];

  readonly status: PublicationStatus;

  readonly target: ContentTarget;

  readonly seo: ContentSeo;

  readonly featured: boolean;

  readonly sortOrder: number;
}


/* ============================================================
   CUSTOMER REVIEWS
   ============================================================ */

export type ReviewSource =
  | "website"
  | "google"
  | "facebook"
  | "instagram"
  | "manual"
  | "other";


export interface CustomerReview
  extends AuditTimestamps {
  readonly id: ReviewId;

  readonly customerDisplayName: string;

  readonly rating?: number;

  readonly title?: LocalizedText;

  readonly content: LocalizedText;

  readonly source: ReviewSource;

  readonly sourceUrl?: string;

  readonly restaurantId?: RestaurantId;

  readonly mediaIds?: readonly MediaAssetId[];

  readonly verified: boolean;

  readonly featured: boolean;

  readonly status: PublicationStatus;

  readonly publishedAt?: IsoDateTime;
}


/* ============================================================
   PROMOTIONS
   ============================================================ */

export interface BrandPromotion
  extends AuditTimestamps {
  readonly id: PromotionId;

  readonly slug: string;

  readonly title: LocalizedText;

  readonly description: LocalizedText;

  readonly mediaId?: MediaAssetId;

  readonly startsAt?: IsoDateTime;

  readonly endsAt?: IsoDateTime;

  readonly ctas: readonly CallToAction[];

  readonly target: ContentTarget;

  readonly status: PublicationStatus;

  readonly seo: ContentSeo;
}


/* ============================================================
   ARTICLES / CONTENT MARKETING
   ============================================================ */

export type ArticleCategory =
  | "gastronomy"
  | "colombian_culture"
  | "restaurant"
  | "events"
  | "recipes"
  | "news"
  | "guides"
  | "stories";


export interface ContentArticle
  extends AuditTimestamps {
  readonly id: ArticleId;

  readonly slug: string;

  readonly category: ArticleCategory;

  readonly title: LocalizedText;

  readonly excerpt?: LocalizedText;

  readonly body: LocalizedText;

  readonly coverMediaId?: MediaAssetId;

  readonly authorName?: string;

  readonly status: PublicationStatus;

  readonly target: ContentTarget;

  readonly seo: ContentSeo;

  readonly publishedAt?: IsoDateTime;

  readonly updatedBy?: UserId;
}


/* ============================================================
   REVISION HISTORY
   ============================================================ */

/**
 * Nunca queremos perder una versión anterior de una página
 * simplemente porque alguien la editó desde el administrador.
 */

export interface ContentRevision {
  readonly id: ContentRevisionId;

  readonly contentId: ContentId;

  readonly revision: number;

  readonly snapshot: Readonly<
    Record<string, unknown>
  >;

  readonly createdAt: IsoDateTime;

  readonly createdBy: UserId;

  readonly changeNote?: string;
}


/* ============================================================
   PUBLISHING
   ============================================================ */

export interface PublishContentRequest {
  readonly contentId: ContentId;

  readonly requestId: RequestId;

  readonly publishAt?: IsoDateTime;
}


export interface UnpublishContentRequest {
  readonly contentId: ContentId;

  readonly requestId: RequestId;

  readonly unpublishAt?: IsoDateTime;
}


/* ============================================================
   CONTENT QUERY
   ============================================================ */

export interface ContentQuery {
  readonly status?: PublicationStatus;

  readonly locale?: SupportedLocale;

  readonly type?: PageType;

  readonly restaurantId?: RestaurantId;

  readonly search?: string;

  readonly cursor?: string;

  readonly limit?: number;
}


/* ============================================================
   CONTENT ERRORS
   ============================================================ */

export type ContentErrorCode =
  | "CONTENT_NOT_FOUND"
  | "CONTENT_NOT_PUBLISHED"
  | "MEDIA_NOT_FOUND"
  | "INVALID_SLUG"
  | "INVALID_PUBLICATION_STATE"
  | "REVISION_CONFLICT"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "UPLOAD_FAILED"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface ContentDomainError {
  readonly code: ContentErrorCode;

  readonly message: string;

  readonly retryable: boolean;

  readonly requestId?: RequestId;
}


/* ============================================================
   HELPERS
   ============================================================ */

export function isPublished(
  status: PublicationStatus,
): boolean {
  return status === "published";
}


export function isPublicContent(
  visibility: ContentVisibility,
): boolean {
  return visibility === "public";
}


export function canRenderPublicly(
  status: PublicationStatus,
  visibility: ContentVisibility,
): boolean {
  return (
    status === "published" &&
    visibility === "public"
  );
}
