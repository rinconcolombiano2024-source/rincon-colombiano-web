/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Audit, Traceability & Compliance Domain
 * ============================================================
 *
 * Registro transversal e inmutable de operaciones importantes.
 *
 * Diseñado para auditar:
 *
 * - administradores
 * - empleados
 * - clientes
 * - comunidad
 * - IA
 * - integraciones
 * - procesos automáticos
 *
 * Acciones:
 *
 * - contenido
 * - SEO
 * - multimedia
 * - menú
 * - precios
 * - restaurantes
 * - pedidos
 * - pagos/reembolsos
 * - reservas
 * - inquiries/cotizaciones
 * - campañas
 * - loyalty
 * - recompensas
 * - referidos
 * - permisos
 * - autenticación
 * - configuración
 * - IA
 * - exportaciones
 * - privacidad
 *
 * PRINCIPIOS:
 *
 * 1. Audit log es append-only.
 * 2. No se editan eventos históricos.
 * 3. No se eliminan para "corregir" errores.
 * 4. Las correcciones generan nuevos eventos.
 * 5. Nunca almacenar passwords, tokens, OTP o secretos.
 * 6. Reducir PII al mínimo necesario.
 * 7. Las acciones críticas deben tener RequestId/correlation.
 * 8. IA y automatizaciones también son actores auditables.
 * 9. Los eventos pueden incorporar evidencia de integridad.
 */

import type {
  IsoDateTime,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  CustomerId,
} from "@/types/customer";

import type {
  CommunityProfileId,
} from "@/types/community";

import type {
  AdminUserId,
} from "@/types/admin";

import type {
  AuthSessionId,
  AuthUserId,
} from "@/types/auth";

import type {
  RestaurantId,
} from "@/types/restaurant";

import type {
  AIRunId,
  AIToolCallId,
} from "@/types/ai";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type AuditEventId =
  string;

export type AuditCorrelationId =
  string;

export type AuditTraceId =
  string;

export type AuditExportId =
  string;

export type AuditLegalHoldId =
  string;


/* ============================================================
   ACTOR TYPES
   ============================================================ */

export type AuditActorType =
  | "customer"
  | "community_member"
  | "staff"
  | "admin"
  | "system"
  | "ai"
  | "integration";


/* ============================================================
   ACTOR
   ============================================================ */

/**
 * Identifica quién originó la acción.
 *
 * displayLabel es informativo.
 *
 * Las autorizaciones nunca deben depender
 * de displayLabel.
 */

export interface AuditActor {
  readonly type:
    AuditActorType;

  readonly authUserId?:
    AuthUserId;

  readonly userId?:
    UserId;

  readonly adminUserId?:
    AdminUserId;

  readonly customerId?:
    CustomerId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly aiRunId?:
    AIRunId;

  readonly aiToolCallId?:
    AIToolCallId;

  readonly integrationKey?:
    string;

  readonly displayLabel?:
    string;
}


/* ============================================================
   SOURCE
   ============================================================ */

export type AuditSource =
  | "public_web"
  | "admin_console"
  | "rc_ordera"
  | "api"
  | "background_job"
  | "ai_assistant"
  | "webhook"
  | "migration"
  | "database"
  | "integration"
  | "manual";


/* ============================================================
   CATEGORY
   ============================================================ */

export type AuditCategory =
  | "authentication"
  | "authorization"
  | "admin"
  | "content"
  | "seo"
  | "media"
  | "menu"
  | "restaurant"
  | "order"
  | "payment"
  | "delivery"
  | "reservation"
  | "inquiry"
  | "customer"
  | "community"
  | "marketing"
  | "loyalty"
  | "referral"
  | "notification"
  | "ai"
  | "settings"
  | "integration"
  | "privacy"
  | "security"
  | "data"
  | "system";


/* ============================================================
   SEVERITY
   ============================================================ */

export type AuditSeverity =
  | "info"
  | "notice"
  | "warning"
  | "critical";


/* ============================================================
   OUTCOME
   ============================================================ */

export type AuditOutcome =
  | "success"
  | "failure"
  | "denied"
  | "cancelled"
  | "partial";


/* ============================================================
   ACTIONS
   ============================================================ */

export type AuditAction =
  /* Generic */
  | "entity.created"
  | "entity.updated"
  | "entity.archived"
  | "entity.restored"
  | "entity.deleted"

  /* Authentication */
  | "auth.login"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.session_revoked"
  | "auth.mfa_enabled"
  | "auth.mfa_disabled"
  | "auth.passkey_added"
  | "auth.passkey_removed"
  | "auth.password_changed"

  /* Authorization */
  | "authorization.granted"
  | "authorization.denied"

  /* Admin */
  | "admin.created"
  | "admin.updated"
  | "admin.suspended"
  | "admin.reactivated"
  | "admin.role_assigned"
  | "admin.role_removed"
  | "admin.permission_changed"

  /* Content */
  | "content.created"
  | "content.updated"
  | "content.review_requested"
  | "content.approved"
  | "content.published"
  | "content.unpublished"
  | "content.archived"
  | "content.restored"

  /* SEO */
  | "seo.metadata_changed"
  | "seo.canonical_changed"
  | "seo.indexability_changed"
  | "seo.redirect_changed"
  | "seo.structured_data_changed"

  /* Media */
  | "media.uploaded"
  | "media.updated"
  | "media.approved"
  | "media.rejected"
  | "media.archived"
  | "media.deleted"
  | "media.rights_changed"

  /* Menu */
  | "menu.item_created"
  | "menu.item_updated"
  | "menu.item_published"
  | "menu.item_unpublished"
  | "menu.price_changed"
  | "menu.availability_changed"

  /* Restaurant */
  | "restaurant.created"
  | "restaurant.updated"
  | "restaurant.hours_changed"
  | "restaurant.status_changed"

  /* Orders */
  | "order.created"
  | "order.updated"
  | "order.status_changed"
  | "order.cancelled"
  | "order.refunded"

  /* Payment */
  | "payment.created"
  | "payment.authorized"
  | "payment.captured"
  | "payment.failed"
  | "payment.refunded"

  /* Delivery */
  | "delivery.created"
  | "delivery.assigned"
  | "delivery.status_changed"
  | "delivery.cancelled"

  /* Reservations */
  | "reservation.created"
  | "reservation.updated"
  | "reservation.confirmed"
  | "reservation.cancelled"
  | "reservation.no_show"

  /* Inquiry */
  | "inquiry.created"
  | "inquiry.updated"
  | "inquiry.assigned"
  | "inquiry.quote_created"
  | "inquiry.quote_sent"
  | "inquiry.quote_accepted"
  | "inquiry.converted"

  /* Community */
  | "community.post_created"
  | "community.post_updated"
  | "community.post_removed"
  | "community.comment_removed"
  | "community.profile_suspended"
  | "community.report_resolved"

  /* Marketing */
  | "marketing.campaign_created"
  | "marketing.campaign_updated"
  | "marketing.campaign_started"
  | "marketing.campaign_paused"
  | "marketing.landing_changed"

  /* Loyalty */
  | "loyalty.points_earned"
  | "loyalty.points_redeemed"
  | "loyalty.points_adjusted"
  | "loyalty.reward_granted"
  | "loyalty.reward_redeemed"
  | "loyalty.reward_revoked"

  /* Referral */
  | "referral.created"
  | "referral.claimed"
  | "referral.qualified"
  | "referral.rejected"

  /* AI */
  | "ai.conversation_created"
  | "ai.tool_requested"
  | "ai.tool_confirmed"
  | "ai.tool_denied"
  | "ai.tool_executed"
  | "ai.tool_failed"
  | "ai.handoff_created"

  /* Notifications */
  | "notification.template_changed"
  | "notification.sent"
  | "notification.failed"

  /* Settings */
  | "settings.changed"
  | "feature.enabled"
  | "feature.disabled"

  /* Data */
  | "data.export_requested"
  | "data.export_completed"
  | "data.imported"
  | "data.deleted"

  /* Privacy */
  | "privacy.consent_changed"
  | "privacy.request_created"
  | "privacy.request_completed"

  /* Integrations */
  | "integration.connected"
  | "integration.disconnected"
  | "integration.configuration_changed"
  | "integration.webhook_received"

  /* Security */
  | "security.risk_detected"
  | "security.access_blocked"
  | "security.secret_rotated"

  /* System */
  | "system.migration_applied"
  | "system.job_failed"
  | "system.configuration_changed";


/* ============================================================
   RESOURCE TYPES
   ============================================================ */

export type AuditResourceType =
  | "auth_account"
  | "auth_session"
  | "admin_user"
  | "role"
  | "permission"
  | "customer"
  | "community_profile"
  | "community_post"
  | "community_comment"
  | "page"
  | "content"
  | "article"
  | "media"
  | "menu"
  | "menu_item"
  | "restaurant"
  | "order"
  | "payment"
  | "delivery"
  | "reservation"
  | "inquiry"
  | "quote"
  | "campaign"
  | "landing_page"
  | "notification"
  | "loyalty_account"
  | "loyalty_ledger"
  | "reward"
  | "referral"
  | "ai_conversation"
  | "ai_tool_call"
  | "setting"
  | "feature"
  | "integration"
  | "export"
  | "system";


/* ============================================================
   RESOURCE REFERENCE
   ============================================================ */

export interface AuditResourceReference {
  readonly type:
    AuditResourceType;

  readonly id:
    string;

  readonly parentType?:
    AuditResourceType;

  readonly parentId?:
    string;

  readonly restaurantId?:
    RestaurantId;

  /**
   * Nombre puramente informativo.
   *
   * Nunca se utiliza como ID.
   */
  readonly label?:
    string;
}


/* ============================================================
   CHANGE VALUES
   ============================================================ */

/**
 * Mantenemos valores deliberadamente sencillos
 * para evitar copiar objetos completos y secretos.
 */

export type AuditPrimitive =
  | string
  | number
  | boolean
  | null;


export type AuditValue =
  | AuditPrimitive
  | readonly AuditPrimitive[];


/* ============================================================
   CHANGE
   ============================================================ */

export interface AuditChange {
  /**
   * Ejemplo:
   *
   * "price.amountMinor"
   * "status"
   * "seo.title.pl"
   */
  readonly field:
    string;

  readonly before?:
    AuditValue;

  readonly after?:
    AuditValue;

  /**
   * True cuando el valor real fue deliberadamente
   * ocultado del audit log.
   */
  readonly redacted:
    boolean;
}


/* ============================================================
   CHANGESET
   ============================================================ */

export interface AuditChangeSet {
  readonly changes:
    readonly AuditChange[];

  /**
   * Referencia opcional a una versión completa
   * almacenada en el dominio correspondiente.
   */
  readonly beforeVersion?:
    number;

  readonly afterVersion?:
    number;
}


/* ============================================================
   NETWORK / SESSION CONTEXT
   ============================================================ */

export interface AuditSessionContext {
  readonly authSessionId?:
    AuthSessionId;

  /**
   * Si necesitamos correlación de red,
   * usar hash cuando sea apropiado.
   */
  readonly ipHash?:
    string;

  readonly userAgent?:
    string;

  readonly deviceId?:
    string;
}


/* ============================================================
   TRACE CONTEXT
   ============================================================ */

export interface AuditTraceContext {
  readonly requestId?:
    RequestId;

  readonly correlationId?:
    AuditCorrelationId;

  readonly traceId?:
    AuditTraceId;
}


/* ============================================================
   SAFE METADATA
   ============================================================ */

export type AuditMetadataValue =
  | string
  | number
  | boolean
  | null;


export type AuditMetadata =
  Readonly<
    Record<
      string,
      AuditMetadataValue
    >
  >;


/* ============================================================
   INTEGRITY
   ============================================================ */

/**
 * Puede utilizarse para construir una cadena de hashes.
 *
 * eventHash debe calcularse server-side sobre una
 * representación canónica del evento.
 */

export type AuditHashAlgorithm =
  | "sha256";


export interface AuditIntegrity {
  readonly algorithm:
    AuditHashAlgorithm;

  readonly sequenceNumber:
    number;

  readonly previousEventHash?:
    string;

  readonly eventHash:
    string;
}


/* ============================================================
   AUDIT EVENT
   ============================================================ */

export interface AuditEvent {
  readonly id:
    AuditEventId;

  readonly category:
    AuditCategory;

  readonly action:
    AuditAction;

  readonly severity:
    AuditSeverity;

  readonly outcome:
    AuditOutcome;

  readonly source:
    AuditSource;

  readonly actor:
    AuditActor;

  readonly resource:
    AuditResourceReference;

  readonly changes?:
    AuditChangeSet;

  readonly session:
    AuditSessionContext;

  readonly trace:
    AuditTraceContext;

  /**
   * Explicación empresarial opcional.
   *
   * Ejemplo:
   *
   * "Corrección solicitada por gerente"
   */
  readonly reason?:
    string;

  readonly metadata?:
    AuditMetadata;

  readonly integrity?:
    AuditIntegrity;

  /**
   * Momento en que ocurrió la acción.
   */
  readonly occurredAt:
    IsoDateTime;

  /**
   * Momento en que el sistema de auditoría
   * recibió el evento.
   */
  readonly recordedAt:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   CREATE AUDIT EVENT REQUEST
   ============================================================ */

/**
 * Este request está pensado para servicios backend.
 *
 * Nunca debemos confiar ciegamente en un navegador
 * que diga:
 *
 * "yo soy admin y cambié esto".
 */

export interface CreateAuditEventRequest {
  readonly category:
    AuditCategory;

  readonly action:
    AuditAction;

  readonly severity:
    AuditSeverity;

  readonly outcome:
    AuditOutcome;

  readonly source:
    AuditSource;

  readonly actor:
    AuditActor;

  readonly resource:
    AuditResourceReference;

  readonly changes?:
    AuditChangeSet;

  readonly session?:
    AuditSessionContext;

  readonly trace?:
    AuditTraceContext;

  readonly reason?:
    string;

  readonly metadata?:
    AuditMetadata;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   SENSITIVE ACTIONS
   ============================================================ */

export type SensitiveAuditAction =
  | "admin.permission_changed"
  | "order.refunded"
  | "payment.refunded"
  | "loyalty.points_adjusted"
  | "loyalty.reward_revoked"
  | "settings.changed"
  | "integration.configuration_changed"
  | "data.deleted"
  | "security.secret_rotated";


/* ============================================================
   AUDIT REQUIREMENTS
   ============================================================ */

export interface AuditActionPolicy {
  readonly action:
    AuditAction;

  readonly auditRequired:
    boolean;

  readonly reasonRequired:
    boolean;

  readonly requestIdRequired:
    boolean;

  readonly correlationRequired:
    boolean;

  readonly highIntegrityRequired:
    boolean;
}


/* ============================================================
   QUERY
   ============================================================ */

export interface AuditQuery {
  readonly actorType?:
    AuditActorType;

  readonly authUserId?:
    AuthUserId;

  readonly adminUserId?:
    AdminUserId;

  readonly customerId?:
    CustomerId;

  readonly restaurantId?:
    RestaurantId;

  readonly categories?:
    readonly AuditCategory[];

  readonly actions?:
    readonly AuditAction[];

  readonly outcomes?:
    readonly AuditOutcome[];

  readonly severities?:
    readonly AuditSeverity[];

  readonly resourceType?:
    AuditResourceType;

  readonly resourceId?:
    string;

  readonly correlationId?:
    AuditCorrelationId;

  readonly traceId?:
    AuditTraceId;

  readonly occurredFrom?:
    IsoDateTime;

  readonly occurredUntil?:
    IsoDateTime;

  readonly search?:
    string;

  readonly cursor?:
    string;

  readonly limit?:
    number;
}


/* ============================================================
   QUERY RESULT
   ============================================================ */

export interface AuditQueryResult {
  readonly events:
    readonly AuditEvent[];

  readonly nextCursor?:
    string;

  readonly hasMore:
    boolean;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   RESOURCE HISTORY
   ============================================================ */

export interface AuditResourceHistory {
  readonly resource:
    AuditResourceReference;

  readonly events:
    readonly AuditEvent[];

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   ACTOR ACTIVITY
   ============================================================ */

export interface AuditActorActivitySummary {
  readonly actor:
    AuditActor;

  readonly events:
    number;

  readonly successfulActions:
    number;

  readonly failedActions:
    number;

  readonly deniedActions:
    number;

  readonly criticalActions:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   INTEGRITY CHECK
   ============================================================ */

export type AuditIntegrityStatus =
  | "valid"
  | "invalid"
  | "unverified";


export interface AuditIntegrityCheck {
  readonly status:
    AuditIntegrityStatus;

  readonly checkedEvents:
    number;

  readonly firstInvalidEventId?:
    AuditEventId;

  readonly checkedAt:
    IsoDateTime;
}


/* ============================================================
   RETENTION
   ============================================================ */

export interface AuditRetentionRule {
  readonly category:
    AuditCategory;

  readonly retainDays:
    number;
}


export interface AuditRetentionPolicy {
  readonly defaultRetainDays:
    number;

  readonly rules:
    readonly AuditRetentionRule[];

  /**
   * Eventos bajo legal hold no se purgan.
   */
  readonly respectLegalHolds:
    true;
}


/* ============================================================
   LEGAL HOLD
   ============================================================ */

export type AuditLegalHoldStatus =
  | "active"
  | "released";


export interface AuditLegalHold {
  readonly id:
    AuditLegalHoldId;

  readonly status:
    AuditLegalHoldStatus;

  readonly reason:
    string;

  readonly resourceType?:
    AuditResourceType;

  readonly resourceId?:
    string;

  readonly category?:
    AuditCategory;

  readonly createdAt:
    IsoDateTime;

  readonly createdByUserId:
    UserId;

  readonly releasedAt?:
    IsoDateTime;

  readonly releasedByUserId?:
    UserId;
}


/* ============================================================
   EXPORT
   ============================================================ */

export type AuditExportFormat =
  | "csv"
  | "json";


export type AuditExportStatus =
  | "queued"
  | "processing"
  | "ready"
  | "failed"
  | "expired";


export interface AuditExport {
  readonly id:
    AuditExportId;

  readonly query:
    AuditQuery;

  readonly format:
    AuditExportFormat;

  readonly status:
    AuditExportStatus;

  readonly requestedByUserId:
    UserId;

  readonly requestedAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   FORBIDDEN METADATA KEYS
   ============================================================ */

/**
 * Defensa adicional.
 *
 * La validación real también debe hacerse
 * en backend.
 */

export const forbiddenAuditMetadataKeys =
  [
    "password",
    "passphrase",
    "secret",
    "apiKey",
    "api_key",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
    "authorization",
    "cookie",
    "otp",
    "privateKey",
    "private_key",
  ] as const;


export type ForbiddenAuditMetadataKey =
  (
    typeof forbiddenAuditMetadataKeys
  )[number];


/* ============================================================
   ERRORS
   ============================================================ */

export type AuditErrorCode =
  | "AUDIT_EVENT_NOT_FOUND"
  | "INVALID_ACTOR"
  | "INVALID_RESOURCE"
  | "INVALID_CHANGESET"
  | "SENSITIVE_METADATA_DETECTED"
  | "REASON_REQUIRED"
  | "REQUEST_ID_REQUIRED"
  | "INTEGRITY_CHECK_FAILED"
  | "LEGAL_HOLD_CONFLICT"
  | "EXPORT_FAILED"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface AuditDomainError {
  readonly code:
    AuditErrorCode;

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

export function isSensitiveAuditAction(
  action: AuditAction,
): action is SensitiveAuditAction {
  return (
    action ===
      "admin.permission_changed" ||
    action ===
      "order.refunded" ||
    action ===
      "payment.refunded" ||
    action ===
      "loyalty.points_adjusted" ||
    action ===
      "loyalty.reward_revoked" ||
    action ===
      "settings.changed" ||
    action ===
      "integration.configuration_changed" ||
    action ===
      "data.deleted" ||
    action ===
      "security.secret_rotated"
  );
}


export function isAuditFailure(
  event: AuditEvent,
): boolean {
  return (
    event.outcome === "failure" ||
    event.outcome === "denied"
  );
}


export function hasAuditChanges(
  event: AuditEvent,
): boolean {
  return Boolean(
    event.changes &&
    event.changes.changes.length >
      0,
  );
}


export function isAIGeneratedAuditEvent(
  event: AuditEvent,
): boolean {
  return (
    event.actor.type === "ai" ||
    event.source === "ai_assistant"
  );
}


export function isForbiddenAuditMetadataKey(
  key: string,
): boolean {
  const normalized =
    key.trim().toLowerCase();

  return forbiddenAuditMetadataKeys.some(
    (forbiddenKey) =>
      forbiddenKey
        .toLowerCase() ===
      normalized,
  );
}


export function containsForbiddenAuditMetadata(
  metadata:
    AuditMetadata | undefined,
): boolean {
  if (!metadata) {
    return false;
  }

  return Object.keys(
    metadata,
  ).some(
    isForbiddenAuditMetadataKey,
  );
}
