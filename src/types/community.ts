/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Community / Social Network Domain
 * ============================================================
 *
 * Dominio de la futura comunidad social propia de la marca.
 *
 * Preparado para:
 *
 * - perfiles
 * - publicaciones
 * - fotografías
 * - videos
 * - historias
 * - comentarios
 * - respuestas
 * - reacciones
 * - seguidores
 * - guardados
 * - compartidos
 * - menciones
 * - hashtags
 * - reseñas
 * - eventos
 * - contenido oficial
 * - contenido de clientes
 * - moderación
 * - denuncias
 * - privacidad
 * - SEO de contenido público
 * - integración comercial con menú, productos,
 *   restaurantes, promociones y servicios
 *
 * PRINCIPIO:
 *
 * DISCOVERY
 *     ↓
 * COMMUNITY
 *     ↓
 * ENGAGEMENT
 *     ↓
 * PRODUCT / SERVICE / EVENT
 *     ↓
 * CONVERSION
 *     ↓
 * RC ORDERA
 */

import type {
  AuditTimestamps,
  IsoDateTime,
  LocalizedText,
  RequestId,
  UserId,
} from "@/types/common";

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
  EventId,
  MediaAssetId,
  PromotionId,
  ServiceId,
} from "@/types/content";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type CommunityProfileId =
  string;

export type CommunityPostId =
  string;

export type CommunityCommentId =
  string;

export type CommunityReactionId =
  string;

export type CommunityFollowId =
  string;

export type CommunitySaveId =
  string;

export type CommunityShareId =
  string;

export type CommunityStoryId =
  string;

export type CommunityReportId =
  string;

export type CommunityModerationCaseId =
  string;

export type CommunityNotificationId =
  string;

export type HashtagId =
  string;


/* ============================================================
   PROFILE
   ============================================================ */

export type CommunityProfileType =
  | "customer"
  | "creator"
  | "restaurant"
  | "brand"
  | "staff";


export type CommunityProfileStatus =
  | "active"
  | "suspended"
  | "restricted"
  | "deleted";


export type CommunityVerificationType =
  | "none"
  | "customer"
  | "creator"
  | "official"
  | "staff";


export interface CommunityProfile {
  readonly id:
    CommunityProfileId;

  readonly customerId?:
    CustomerId;

  readonly userId?:
    UserId;

  readonly type:
    CommunityProfileType;

  readonly status:
    CommunityProfileStatus;

  readonly username:
    string;

  readonly displayName:
    string;

  readonly bio?:
    string;

  readonly avatarMediaId?:
    MediaAssetId;

  readonly coverMediaId?:
    MediaAssetId;

  readonly verification:
    CommunityVerificationType;

  readonly followerCount:
    number;

  readonly followingCount:
    number;

  readonly postCount:
    number;

  readonly public:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   CONTENT VISIBILITY
   ============================================================ */

export type CommunityVisibility =
  | "public"
  | "followers"
  | "private";


/* ============================================================
   CONTENT STATUS
   ============================================================ */

export type CommunityContentStatus =
  | "draft"
  | "published"
  | "hidden"
  | "removed"
  | "archived";


/* ============================================================
   MODERATION STATUS
   ============================================================ */

export type CommunityModerationStatus =
  | "clean"
  | "pending_review"
  | "restricted"
  | "removed";


/* ============================================================
   POST TYPE
   ============================================================ */

export type CommunityPostType =
  | "text"
  | "image"
  | "video"
  | "gallery"
  | "review"
  | "recommendation"
  | "event"
  | "story"
  | "promotion"
  | "product"
  | "service";


/* ============================================================
   COMMERCIAL CONNECTIONS
   ============================================================ */

/**
 * Un contenido social puede conducir directamente
 * a una conversión comercial.
 */

export interface CommunityCommercialLinks {
  readonly restaurantId?:
    RestaurantId;

  readonly menuItemId?:
    MenuItemId;

  readonly eventId?:
    EventId;

  readonly serviceId?:
    ServiceId;

  readonly promotionId?:
    PromotionId;

  readonly orderPath?:
    string;

  readonly reservationPath?:
    string;

  readonly contactPath?:
    string;
}


/* ============================================================
   SEO
   ============================================================ */

/**
 * Solo determinados contenidos públicos y moderados
 * deben poder indexarse.
 *
 * No queremos convertir Google en un índice de:
 *
 * - spam
 * - perfiles vacíos
 * - comentarios irrelevantes
 * - contenido duplicado
 */

export interface CommunitySeoSettings {
  readonly indexable:
    boolean;

  readonly title?:
    string;

  readonly description?:
    string;

  readonly canonicalPath?:
    string;
}


/* ============================================================
   POST
   ============================================================ */

export interface CommunityPost
  extends AuditTimestamps {
  readonly id:
    CommunityPostId;

  readonly authorProfileId:
    CommunityProfileId;

  readonly type:
    CommunityPostType;

  readonly status:
    CommunityContentStatus;

  readonly moderationStatus:
    CommunityModerationStatus;

  readonly visibility:
    CommunityVisibility;

  readonly text?:
    string;

  readonly mediaIds:
    readonly MediaAssetId[];

  readonly commercial:
    CommunityCommercialLinks;

  readonly seo:
    CommunitySeoSettings;

  readonly hashtags:
    readonly string[];

  readonly mentionedProfileIds:
    readonly CommunityProfileId[];

  readonly reactionCount:
    number;

  readonly commentCount:
    number;

  readonly shareCount:
    number;

  readonly saveCount:
    number;

  readonly publishedAt?:
    IsoDateTime;

  readonly editedAt?:
    IsoDateTime;
}


/* ============================================================
   STORIES
   ============================================================ */

export type CommunityStoryType =
  | "image"
  | "video"
  | "promotion"
  | "event"
  | "product"
  | "announcement";


export interface CommunityStory {
  readonly id:
    CommunityStoryId;

  readonly authorProfileId:
    CommunityProfileId;

  readonly type:
    CommunityStoryType;

  readonly mediaId:
    MediaAssetId;

  readonly text?:
    string;

  readonly commercial:
    CommunityCommercialLinks;

  readonly visibility:
    CommunityVisibility;

  readonly publishedAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly status:
    CommunityContentStatus;
}


/* ============================================================
   COMMENT
   ============================================================ */

export type CommunityCommentStatus =
  | "published"
  | "hidden"
  | "removed";


export interface CommunityComment {
  readonly id:
    CommunityCommentId;

  readonly postId:
    CommunityPostId;

  readonly authorProfileId:
    CommunityProfileId;

  /**
   * Permite respuestas anidadas.
   */
  readonly parentCommentId?:
    CommunityCommentId;

  readonly content:
    string;

  readonly status:
    CommunityCommentStatus;

  readonly moderationStatus:
    CommunityModerationStatus;

  readonly reactionCount:
    number;

  readonly replyCount:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly editedAt?:
    IsoDateTime;
}


/* ============================================================
   REACTIONS
   ============================================================ */

export type CommunityReactionType =
  | "like"
  | "love"
  | "celebrate"
  | "delicious";


export type CommunityReactionTarget =
  | "post"
  | "comment";


export interface CommunityReaction {
  readonly id:
    CommunityReactionId;

  readonly profileId:
    CommunityProfileId;

  readonly targetType:
    CommunityReactionTarget;

  readonly targetId:
    string;

  readonly reaction:
    CommunityReactionType;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   FOLLOW
   ============================================================ */

export interface CommunityFollow {
  readonly id:
    CommunityFollowId;

  readonly followerProfileId:
    CommunityProfileId;

  readonly followedProfileId:
    CommunityProfileId;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   SAVED CONTENT
   ============================================================ */

export interface CommunitySave {
  readonly id:
    CommunitySaveId;

  readonly profileId:
    CommunityProfileId;

  readonly postId:
    CommunityPostId;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   SHARING
   ============================================================ */

export type CommunityShareChannel =
  | "internal"
  | "copy_link"
  | "whatsapp"
  | "facebook"
  | "messenger"
  | "other";


export interface CommunityShare {
  readonly id:
    CommunityShareId;

  readonly postId:
    CommunityPostId;

  readonly profileId?:
    CommunityProfileId;

  readonly channel:
    CommunityShareChannel;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   HASHTAGS
   ============================================================ */

export interface CommunityHashtag {
  readonly id:
    HashtagId;

  readonly slug:
    string;

  readonly displayName:
    string;

  readonly usageCount:
    number;

  readonly public:
    boolean;
}


/* ============================================================
   FEED
   ============================================================ */

export type CommunityFeedType =
  | "discover"
  | "following"
  | "restaurant"
  | "events"
  | "food"
  | "culture";


export interface CommunityFeedQuery {
  readonly type:
    CommunityFeedType;

  readonly profileId?:
    CommunityProfileId;

  readonly restaurantId?:
    RestaurantId;

  readonly hashtag?:
    string;

  readonly cursor?:
    string;

  readonly limit:
    number;
}


/* ============================================================
   FEED ITEM
   ============================================================ */

export interface CommunityFeedItem {
  readonly post:
    CommunityPost;

  readonly author:
    CommunityProfile;

  readonly viewerHasReacted:
    boolean;

  readonly viewerReaction?:
    CommunityReactionType;

  readonly viewerHasSaved:
    boolean;

  readonly viewerFollowsAuthor:
    boolean;
}


/* ============================================================
   REVIEWS
   ============================================================ */

/**
 * Review social vinculada a una entidad real.
 */

export type CommunityReviewTarget =
  | "restaurant"
  | "menu_item"
  | "event"
  | "service";


export interface CommunityReview {
  readonly id:
    string;

  readonly authorProfileId:
    CommunityProfileId;

  readonly targetType:
    CommunityReviewTarget;

  readonly targetId:
    string;

  readonly rating:
    number;

  readonly title?:
    string;

  readonly body:
    string;

  readonly mediaIds:
    readonly MediaAssetId[];

  readonly verifiedPurchase:
    boolean;

  readonly moderationStatus:
    CommunityModerationStatus;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   REPORTING
   ============================================================ */

export type CommunityReportReason =
  | "spam"
  | "harassment"
  | "hate"
  | "violence"
  | "sexual_content"
  | "fraud"
  | "impersonation"
  | "copyright"
  | "privacy"
  | "misinformation"
  | "other";


export type CommunityReportTarget =
  | "profile"
  | "post"
  | "comment"
  | "review";


export type CommunityReportStatus =
  | "open"
  | "under_review"
  | "resolved"
  | "dismissed";


export interface CommunityReport {
  readonly id:
    CommunityReportId;

  readonly reporterProfileId:
    CommunityProfileId;

  readonly targetType:
    CommunityReportTarget;

  readonly targetId:
    string;

  readonly reason:
    CommunityReportReason;

  readonly description?:
    string;

  readonly status:
    CommunityReportStatus;

  readonly createdAt:
    IsoDateTime;

  readonly resolvedAt?:
    IsoDateTime;
}


/* ============================================================
   MODERATION
   ============================================================ */

export type ModerationAction =
  | "approve"
  | "hide"
  | "remove"
  | "restrict"
  | "restore"
  | "suspend_profile"
  | "warn_profile";


export interface CommunityModerationCase {
  readonly id:
    CommunityModerationCaseId;

  readonly reportIds:
    readonly CommunityReportId[];

  readonly targetType:
    CommunityReportTarget;

  readonly targetId:
    string;

  readonly status:
    | "open"
    | "reviewing"
    | "resolved";

  readonly assignedAdminUserId?:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly resolvedAt?:
    IsoDateTime;
}


/* ============================================================
   MODERATION DECISION
   ============================================================ */

export interface CommunityModerationDecision {
  readonly caseId:
    CommunityModerationCaseId;

  readonly action:
    ModerationAction;

  readonly moderatorUserId:
    UserId;

  readonly reason:
    string;

  readonly requestId:
    RequestId;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   NOTIFICATIONS
   ============================================================ */

export type CommunityNotificationType =
  | "reaction"
  | "comment"
  | "reply"
  | "follow"
  | "mention"
  | "event"
  | "promotion"
  | "moderation";


export interface CommunityNotification {
  readonly id:
    CommunityNotificationId;

  readonly profileId:
    CommunityProfileId;

  readonly type:
    CommunityNotificationType;

  readonly title:
    LocalizedText;

  readonly body?:
    LocalizedText;

  readonly targetPath?:
    string;

  readonly read:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly readAt?:
    IsoDateTime;
}


/* ============================================================
   PROFILE PRIVACY
   ============================================================ */

export interface CommunityPrivacySettings {
  readonly profileVisibility:
    "public" | "private";

  readonly allowFollowers:
    boolean;

  readonly allowComments:
    boolean;

  readonly allowMentions:
    boolean;

  readonly showActivity:
    boolean;
}


/* ============================================================
   CREATE POST
   ============================================================ */

export interface CreateCommunityPostRequest {
  readonly authorProfileId:
    CommunityProfileId;

  readonly type:
    CommunityPostType;

  readonly text?:
    string;

  readonly mediaIds?:
    readonly MediaAssetId[];

  readonly visibility:
    CommunityVisibility;

  readonly commercial?:
    CommunityCommercialLinks;

  readonly hashtags?:
    readonly string[];

  readonly requestId:
    RequestId;
}


/* ============================================================
   CREATE COMMENT
   ============================================================ */

export interface CreateCommunityCommentRequest {
  readonly postId:
    CommunityPostId;

  readonly authorProfileId:
    CommunityProfileId;

  readonly parentCommentId?:
    CommunityCommentId;

  readonly content:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   COMMUNITY ERRORS
   ============================================================ */

export type CommunityErrorCode =
  | "PROFILE_NOT_FOUND"
  | "PROFILE_SUSPENDED"
  | "POST_NOT_FOUND"
  | "COMMENT_NOT_FOUND"
  | "CONTENT_REMOVED"
  | "CONTENT_NOT_VISIBLE"
  | "PERMISSION_DENIED"
  | "RATE_LIMITED"
  | "DUPLICATE_REACTION"
  | "ALREADY_FOLLOWING"
  | "NOT_FOLLOWING"
  | "INVALID_MEDIA"
  | "MODERATION_REQUIRED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface CommunityDomainError {
  readonly code:
    CommunityErrorCode;

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

export function isCommunityPostPublic(
  post: CommunityPost,
): boolean {
  return (
    post.status === "published" &&
    post.visibility === "public" &&
    post.moderationStatus === "clean"
  );
}


export function canIndexCommunityPost(
  post: CommunityPost,
): boolean {
  return (
    isCommunityPostPublic(post) &&
    post.seo.indexable
  );
}


export function isCommunityProfileActive(
  profile: CommunityProfile,
): boolean {
  return (
    profile.status === "active"
  );
}
