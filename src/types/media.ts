/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Media Platform Domain
 * ============================================================
 *
 * Infraestructura central de medios.
 *
 * Preparada para:
 *
 * - fotografías
 * - videos
 * - historias
 * - galerías
 * - productos
 * - eventos
 * - restaurantes
 * - comunidad
 * - contenido SEO
 * - redes sociales
 * - documentos
 *
 * Capacidades previstas:
 *
 * - uploads desde panel administrativo
 * - uploads desde comunidad
 * - object storage
 * - CDN
 * - thumbnails
 * - WebP
 * - AVIF
 * - responsive images
 * - video transcoding
 * - streaming
 * - posters
 * - alt text
 * - SEO
 * - copyright
 * - consentimiento
 * - moderación
 * - virus scan
 * - revisión
 * - versionado
 * - reutilización
 *
 * PRINCIPIO:
 *
 * ORIGINAL
 *    ↓
 * VALIDACIÓN
 *    ↓
 * SEGURIDAD
 *    ↓
 * PROCESAMIENTO
 *    ↓
 * DERIVADOS
 *    ↓
 * CDN
 *    ↓
 * WEB / COMMUNITY / SEO / SOCIAL
 *
 * IMPORTANTE:
 *
 * Este archivo NO contiene secretos de almacenamiento,
 * tokens, access keys ni URLs firmadas permanentes.
 */

import type {
  IsoDateTime,
  LocalizedText,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  RestaurantId,
} from "@/types/restaurant";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type MediaAssetId =
  string;

export type MediaVariantId =
  string;

export type MediaUploadId =
  string;

export type MediaFolderId =
  string;

export type MediaProcessingJobId =
  string;

export type MediaModerationId =
  string;

export type MediaUsageId =
  string;

export type MediaVersionId =
  string;


/* ============================================================
   MEDIA TYPE
   ============================================================ */

export type MediaAssetType =
  | "image"
  | "video"
  | "audio"
  | "document";


/* ============================================================
   MEDIA SOURCE
   ============================================================ */

export type MediaSource =
  | "admin_upload"
  | "community_upload"
  | "restaurant_upload"
  | "import"
  | "external"
  | "generated";


/* ============================================================
   STORAGE PROVIDER
   ============================================================ */

export type MediaStorageProvider =
  | "supabase"
  | "s3"
  | "cloudflare_r2"
  | "cloudinary"
  | "custom";


/* ============================================================
   VIDEO PROVIDER
   ============================================================ */

export type MediaVideoProvider =
  | "internal"
  | "mux"
  | "cloudinary"
  | "youtube"
  | "vimeo"
  | "external";


/* ============================================================
   STATUS
   ============================================================ */

export type MediaAssetStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "quarantined"
  | "archived"
  | "deleted";


/* ============================================================
   VISIBILITY
   ============================================================ */

export type MediaVisibility =
  | "public"
  | "private"
  | "unlisted";


/* ============================================================
   MODERATION STATUS
   ============================================================ */

export type MediaModerationStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected"
  | "restricted";


/* ============================================================
   PROCESSING STATUS
   ============================================================ */

export type MediaProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";


/* ============================================================
   MIME
   ============================================================ */

export type MediaMimeType =
  string;


/* ============================================================
   FILE METADATA
   ============================================================ */

export interface MediaFileMetadata {
  readonly originalFileName:
    string;

  readonly mimeType:
    MediaMimeType;

  readonly fileSizeBytes:
    number;

  /**
   * Hash del archivo.
   *
   * Útil para:
   *
   * - deduplicación
   * - integridad
   * - auditoría
   */
  readonly checksumSha256?:
    string;

  readonly extension?:
    string;
}


/* ============================================================
   IMAGE METADATA
   ============================================================ */

export interface MediaImageMetadata {
  readonly width:
    number;

  readonly height:
    number;

  readonly aspectRatio:
    number;

  readonly animated:
    boolean;

  readonly hasAlpha:
    boolean;
}


/* ============================================================
   VIDEO METADATA
   ============================================================ */

export interface MediaVideoMetadata {
  readonly width:
    number;

  readonly height:
    number;

  readonly durationSeconds:
    number;

  readonly frameRate?:
    number;

  readonly bitrateKbps?:
    number;

  readonly codec?:
    string;

  readonly hasAudio:
    boolean;

  readonly aspectRatio:
    number;
}


/* ============================================================
   AUDIO METADATA
   ============================================================ */

export interface MediaAudioMetadata {
  readonly durationSeconds:
    number;

  readonly bitrateKbps?:
    number;

  readonly codec?:
    string;
}


/* ============================================================
   STORAGE
   ============================================================ */

/**
 * storageKey es una referencia interna.
 *
 * No debe utilizarse como URL pública.
 */

export interface MediaStorageReference {
  readonly provider:
    MediaStorageProvider;

  readonly bucket:
    string;

  readonly storageKey:
    string;

  readonly region?:
    string;
}


/* ============================================================
   PUBLIC DELIVERY
   ============================================================ */

export interface MediaDeliveryReference {
  /**
   * URL pública/CDN.
   */
  readonly url:
    string;

  readonly provider?:
    string;

  readonly cacheControl?:
    string;

  readonly immutable:
    boolean;
}


/* ============================================================
   IMAGE FORMAT
   ============================================================ */

export type ImageOutputFormat =
  | "avif"
  | "webp"
  | "jpeg"
  | "png";


/* ============================================================
   IMAGE FIT
   ============================================================ */

export type ImageResizeFit =
  | "cover"
  | "contain"
  | "inside"
  | "outside";


/* ============================================================
   IMAGE VARIANT
   ============================================================ */

export interface MediaImageVariant {
  readonly id:
    MediaVariantId;

  readonly assetId:
    MediaAssetId;

  readonly format:
    ImageOutputFormat;

  readonly width:
    number;

  readonly height:
    number;

  readonly fit:
    ImageResizeFit;

  readonly quality?:
    number;

  readonly fileSizeBytes?:
    number;

  readonly delivery:
    MediaDeliveryReference;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   STANDARD IMAGE PRESETS
   ============================================================ */

export type ImagePreset =
  | "thumbnail"
  | "avatar"
  | "card"
  | "menu_item"
  | "gallery"
  | "hero"
  | "social"
  | "seo"
  | "fullscreen";


/* ============================================================
   VIDEO RENDITIONS
   ============================================================ */

export type VideoResolution =
  | "360p"
  | "480p"
  | "720p"
  | "1080p"
  | "1440p"
  | "2160p";


export interface MediaVideoRendition {
  readonly id:
    MediaVariantId;

  readonly assetId:
    MediaAssetId;

  readonly resolution:
    VideoResolution;

  readonly width:
    number;

  readonly height:
    number;

  readonly bitrateKbps?:
    number;

  readonly codec?:
    string;

  readonly delivery:
    MediaDeliveryReference;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   VIDEO STREAMING
   ============================================================ */

export type VideoStreamingProtocol =
  | "hls"
  | "dash"
  | "progressive";


export interface MediaVideoStream {
  readonly provider:
    MediaVideoProvider;

  readonly protocol:
    VideoStreamingProtocol;

  readonly playbackUrl:
    string;

  readonly playbackId?:
    string;

  readonly public:
    boolean;
}


/* ============================================================
   VIDEO POSTER
   ============================================================ */

export interface MediaVideoPoster {
  readonly mediaVariantId:
    MediaVariantId;

  readonly timestampSeconds:
    number;

  readonly url:
    string;
}


/* ============================================================
   ACCESSIBILITY
   ============================================================ */

/**
 * alt text es obligatorio conceptualmente para imágenes
 * informativas publicadas.
 */

export interface MediaAccessibility {
  readonly alt:
    LocalizedText;

  readonly decorative:
    boolean;

  /**
   * Transcripción para video/audio.
   */
  readonly transcript?:
    LocalizedText;

  /**
   * Subtítulos externos.
   */
  readonly captionsAvailable:
    boolean;
}


/* ============================================================
   SEO
   ============================================================ */

export interface MediaSeoMetadata {
  /**
   * Permite utilizar el archivo en páginas indexables.
   */
  readonly indexable:
    boolean;

  readonly title?:
    LocalizedText;

  readonly caption?:
    LocalizedText;

  readonly description?:
    LocalizedText;

  readonly credit?:
    string;

  /**
   * Indica que esta imagen puede funcionar
   * como imagen social/SEO principal.
   */
  readonly eligibleForSocialPreview:
    boolean;
}


/* ============================================================
   RIGHTS
   ============================================================ */

export type MediaRightsType =
  | "owned"
  | "licensed"
  | "customer_permission"
  | "staff_permission"
  | "public_domain"
  | "external_permission"
  | "unknown";


export interface MediaRights {
  readonly type:
    MediaRightsType;

  readonly copyrightOwner?:
    string;

  readonly licenseName?:
    string;

  readonly licenseUrl?:
    string;

  readonly permissionReference?:
    string;

  readonly validFrom?:
    IsoDateTime;

  readonly validUntil?:
    IsoDateTime;

  /**
   * Puede utilizarse comercialmente.
   */
  readonly commercialUseAllowed:
    boolean;
}


/* ============================================================
   PERSON CONSENT
   ============================================================ */

/**
 * Para fotografías/videos de personas.
 *
 * No sustituye la documentación legal,
 * solamente representa su existencia.
 */

export interface MediaPersonConsent {
  readonly required:
    boolean;

  readonly confirmed:
    boolean;

  readonly consentReference?:
    string;

  readonly confirmedAt?:
    IsoDateTime;
}


/* ============================================================
   PRIVACY
   ============================================================ */

export interface MediaPrivacy {
  readonly containsPeople:
    boolean;

  readonly containsChildren:
    boolean;

  readonly containsSensitiveInformation:
    boolean;

  readonly personConsent:
    MediaPersonConsent;
}


/* ============================================================
   SECURITY
   ============================================================ */

export type MediaMalwareScanStatus =
  | "pending"
  | "clean"
  | "infected"
  | "failed";


export interface MediaSecurityState {
  readonly malwareScan:
    MediaMalwareScanStatus;

  /**
   * EXIF potencialmente sensible eliminado.
   */
  readonly metadataSanitized:
    boolean;

  readonly quarantined:
    boolean;

  readonly scannedAt?:
    IsoDateTime;
}


/* ============================================================
   MODERATION
   ============================================================ */

export type MediaModerationReason =
  | "unsafe"
  | "copyright"
  | "privacy"
  | "spam"
  | "inappropriate"
  | "duplicate"
  | "low_quality"
  | "other";


export interface MediaModeration {
  readonly id:
    MediaModerationId;

  readonly assetId:
    MediaAssetId;

  readonly status:
    MediaModerationStatus;

  readonly reason?:
    MediaModerationReason;

  readonly reviewedByUserId?:
    UserId;

  readonly reviewedAt?:
    IsoDateTime;

  readonly notes?:
    string;
}


/* ============================================================
   FOLDER
   ============================================================ */

export interface MediaFolder {
  readonly id:
    MediaFolderId;

  readonly parentFolderId?:
    MediaFolderId;

  readonly name:
    string;

  readonly slug:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   MEDIA ASSET
   ============================================================ */

export interface MediaAsset {
  readonly id:
    MediaAssetId;

  readonly type:
    MediaAssetType;

  readonly source:
    MediaSource;

  readonly status:
    MediaAssetStatus;

  readonly visibility:
    MediaVisibility;

  readonly moderationStatus:
    MediaModerationStatus;

  readonly file:
    MediaFileMetadata;

  readonly storage:
    MediaStorageReference;

  readonly originalDelivery?:
    MediaDeliveryReference;

  readonly image?:
    MediaImageMetadata;

  readonly video?:
    MediaVideoMetadata;

  readonly audio?:
    MediaAudioMetadata;

  readonly imageVariants:
    readonly MediaImageVariant[];

  readonly videoRenditions:
    readonly MediaVideoRendition[];

  readonly videoStream?:
    MediaVideoStream;

  readonly poster?:
    MediaVideoPoster;

  readonly accessibility:
    MediaAccessibility;

  readonly seo:
    MediaSeoMetadata;

  readonly rights:
    MediaRights;

  readonly privacy:
    MediaPrivacy;

  readonly security:
    MediaSecurityState;

  readonly folderId?:
    MediaFolderId;

  readonly restaurantId?:
    RestaurantId;

  readonly uploadedByUserId?:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly processedAt?:
    IsoDateTime;

  readonly archivedAt?:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   MEDIA USAGE
   ============================================================ */

/**
 * Permite saber dónde está siendo utilizado un archivo
 * antes de eliminarlo.
 *
 * Ejemplo:
 *
 * media_123
 *
 * usado por:
 *
 * homepage
 * producto
 * publicación
 * artículo
 * evento
 */

export type MediaUsageContext =
  | "page"
  | "content_block"
  | "menu_item"
  | "restaurant"
  | "community_post"
  | "community_story"
  | "profile"
  | "event"
  | "service"
  | "promotion"
  | "article"
  | "seo"
  | "social"
  | "other";


export interface MediaUsage {
  readonly id:
    MediaUsageId;

  readonly mediaAssetId:
    MediaAssetId;

  readonly context:
    MediaUsageContext;

  readonly entityId:
    string;

  readonly field?:
    string;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   MEDIA VERSION
   ============================================================ */

/**
 * Permite reemplazar un archivo sin perder
 * trazabilidad del anterior.
 */

export interface MediaVersion {
  readonly id:
    MediaVersionId;

  readonly mediaAssetId:
    MediaAssetId;

  readonly version:
    number;

  readonly storage:
    MediaStorageReference;

  readonly file:
    MediaFileMetadata;

  readonly createdByUserId?:
    UserId;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   UPLOAD PURPOSE
   ============================================================ */

export type MediaUploadPurpose =
  | "content"
  | "menu"
  | "restaurant"
  | "community"
  | "profile"
  | "event"
  | "service"
  | "promotion"
  | "article"
  | "seo"
  | "other";


/* ============================================================
   UPLOAD STATUS
   ============================================================ */

export type MediaUploadStatus =
  | "created"
  | "uploading"
  | "uploaded"
  | "validating"
  | "processing"
  | "completed"
  | "failed"
  | "expired";


/* ============================================================
   UPLOAD SESSION
   ============================================================ */

/**
 * La URL real de upload puede ser firmada temporalmente
 * por backend.
 *
 * Nunca se almacena aquí un secreto permanente.
 */

export interface MediaUploadSession {
  readonly id:
    MediaUploadId;

  readonly purpose:
    MediaUploadPurpose;

  readonly status:
    MediaUploadStatus;

  readonly expectedMimeType:
    string;

  readonly maximumFileSizeBytes:
    number;

  readonly uploadedByUserId?:
    UserId;

  readonly restaurantId?:
    RestaurantId;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly completedAssetId?:
    MediaAssetId;
}


/* ============================================================
   CREATE UPLOAD REQUEST
   ============================================================ */

export interface CreateMediaUploadRequest {
  readonly purpose:
    MediaUploadPurpose;

  readonly fileName:
    string;

  readonly mimeType:
    string;

  readonly fileSizeBytes:
    number;

  readonly restaurantId?:
    RestaurantId;

  readonly requestId:
    RequestId;
}


/* ============================================================
   PROCESSING JOB
   ============================================================ */

export type MediaProcessingOperation =
  | "validate"
  | "virus_scan"
  | "sanitize_metadata"
  | "resize"
  | "optimize"
  | "convert"
  | "thumbnail"
  | "transcode"
  | "generate_poster"
  | "generate_waveform"
  | "extract_metadata";


export interface MediaProcessingJob {
  readonly id:
    MediaProcessingJobId;

  readonly assetId:
    MediaAssetId;

  readonly operation:
    MediaProcessingOperation;

  readonly status:
    MediaProcessingStatus;

  readonly attempt:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly startedAt?:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly errorCode?:
    string;

  readonly errorMessage?:
    string;
}


/* ============================================================
   IMAGE TRANSFORMATION REQUEST
   ============================================================ */

export interface ImageTransformationRequest {
  readonly assetId:
    MediaAssetId;

  readonly preset:
    ImagePreset;

  readonly width?:
    number;

  readonly height?:
    number;

  readonly format?:
    ImageOutputFormat;

  readonly fit?:
    ImageResizeFit;

  readonly quality?:
    number;
}


/* ============================================================
   VIDEO PROCESSING REQUEST
   ============================================================ */

export interface VideoProcessingRequest {
  readonly assetId:
    MediaAssetId;

  readonly renditions:
    readonly VideoResolution[];

  readonly generatePoster:
    boolean;

  readonly generateStreaming:
    boolean;
}


/* ============================================================
   MEDIA SEARCH
   ============================================================ */

export interface MediaSearchQuery {
  readonly search?:
    string;

  readonly type?:
    MediaAssetType;

  readonly status?:
    MediaAssetStatus;

  readonly visibility?:
    MediaVisibility;

  readonly moderationStatus?:
    MediaModerationStatus;

  readonly restaurantId?:
    RestaurantId;

  readonly folderId?:
    MediaFolderId;

  readonly createdFrom?:
    IsoDateTime;

  readonly createdUntil?:
    IsoDateTime;

  readonly cursor?:
    string;

  readonly limit?:
    number;
}


/* ============================================================
   MEDIA PERFORMANCE
   ============================================================ */

/**
 * Snapshot agregado.
 */

export interface MediaPerformance {
  readonly assetId:
    MediaAssetId;

  readonly impressions:
    number;

  readonly views:
    number;

  readonly videoStarts?:
    number;

  readonly videoCompletions?:
    number;

  readonly clicks?:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type MediaErrorCode =
  | "MEDIA_NOT_FOUND"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE"
  | "UPLOAD_EXPIRED"
  | "UPLOAD_FAILED"
  | "MALWARE_DETECTED"
  | "PROCESSING_FAILED"
  | "TRANSCODING_FAILED"
  | "MODERATION_REQUIRED"
  | "MEDIA_REJECTED"
  | "RIGHTS_NOT_CONFIRMED"
  | "CONSENT_REQUIRED"
  | "MEDIA_IN_USE"
  | "STORAGE_UNAVAILABLE"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "UNKNOWN";


export interface MediaDomainError {
  readonly code:
    MediaErrorCode;

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

export function isMediaReady(
  asset: MediaAsset,
): boolean {
  return (
    asset.status === "ready" &&
    !asset.security.quarantined
  );
}


export function isMediaPublic(
  asset: MediaAsset,
): boolean {
  return (
    isMediaReady(asset) &&
    asset.visibility === "public" &&
    (
      asset.moderationStatus ===
        "approved" ||
      asset.moderationStatus ===
        "not_required"
    )
  );
}


export function canUseMediaCommercially(
  asset: MediaAsset,
): boolean {
  return (
    asset.rights
      .commercialUseAllowed &&
    (
      !asset.privacy
        .personConsent.required ||
      asset.privacy
        .personConsent.confirmed
    )
  );
}


export function canUseMediaForSeo(
  asset: MediaAsset,
): boolean {
  return (
    isMediaPublic(asset) &&
    asset.seo.indexable &&
    canUseMediaCommercially(
      asset,
    )
  );
}


export function isImageAsset(
  asset: MediaAsset,
): boolean {
  return (
    asset.type === "image"
  );
}


export function isVideoAsset(
  asset: MediaAsset,
): boolean {
  return (
    asset.type === "video"
  );
}
