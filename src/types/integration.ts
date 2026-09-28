/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Integration Platform Domain
 * ============================================================
 *
 * Capa central de integraciones externas e internas.
 *
 * Preparada para:
 *
 * - RC ORDERA
 * - Supabase
 * - Google Search Console
 * - Google Business Profile
 * - Google Maps
 * - Google Analytics
 * - Meta
 * - WhatsApp Business
 * - Instagram
 * - Facebook
 * - TikTok
 * - YouTube
 * - email
 * - SMS
 * - pagos
 * - almacenamiento multimedia
 * - observabilidad
 * - futuros proveedores
 *
 * Capacidades:
 *
 * - APIs
 * - webhooks
 * - sincronización
 * - OAuth
 * - idempotencia
 * - retries
 * - circuit breakers
 * - rate limits
 * - health checks
 * - outbox
 * - dead-letter queue
 * - external ID mapping
 * - trazabilidad
 *
 * PRINCIPIOS:
 *
 * 1. El navegador no recibe secretos privilegiados.
 * 2. Las API keys nunca se guardan como valores de este dominio.
 * 3. Los secretos se referencian mediante SecretReferenceId.
 * 4. Todo webhook importante debe verificarse.
 * 5. Todo evento debe ser idempotente cuando sea posible.
 * 6. Los fallos transitorios deben poder reintentarse.
 * 7. Los fallos permanentes no deben reintentarse infinitamente.
 * 8. Las integraciones deben poder degradarse sin tumbar
 *    toda la plataforma.
 * 9. Las sincronizaciones deben declarar explícitamente
 *    qué sistema es fuente de verdad.
 * 10. Ningún límite arbitrario debe convertir datos parciales
 *     en datos "completos".
 */

import type {
  CountryCode,
  IsoDateTime,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  RestaurantId,
} from "@/types/restaurant";

import type {
  SecretReferenceId,
  SettingsEnvironment,
} from "@/types/settings";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type IntegrationId =
  string;

export type IntegrationConnectionId =
  string;

export type IntegrationEndpointId =
  string;

export type IntegrationWebhookId =
  string;

export type IntegrationWebhookEventId =
  string;

export type IntegrationSyncDefinitionId =
  string;

export type IntegrationSyncJobId =
  string;

export type IntegrationCursorId =
  string;

export type IntegrationMappingId =
  string;

export type IntegrationOutboxEventId =
  string;

export type IntegrationDeadLetterId =
  string;

export type IntegrationHealthCheckId =
  string;


/* ============================================================
   ENVIRONMENT
   ============================================================ */

export type IntegrationEnvironment =
  SettingsEnvironment;


/* ============================================================
   PROVIDERS
   ============================================================ */

export type IntegrationProvider =
  | "rc_ordera"
  | "supabase"
  | "google_search_console"
  | "google_business"
  | "google_maps"
  | "google_analytics"
  | "google"
  | "meta"
  | "whatsapp_business"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "resend"
  | "sendgrid"
  | "twilio"
  | "stripe"
  | "przelewy24"
  | "payu"
  | "cloudinary"
  | "mux"
  | "sentry"
  | "custom";


/* ============================================================
   CATEGORIES
   ============================================================ */

export type IntegrationCategory =
  | "commerce"
  | "database"
  | "seo"
  | "analytics"
  | "maps"
  | "social"
  | "messaging"
  | "payments"
  | "media"
  | "observability"
  | "identity"
  | "other";


/* ============================================================
   CONNECTION STATUS
   ============================================================ */

export type IntegrationStatus =
  | "draft"
  | "connecting"
  | "active"
  | "degraded"
  | "paused"
  | "error"
  | "disabled"
  | "archived";


/* ============================================================
   SCOPE
   ============================================================ */

export type IntegrationScope =
  | {
      readonly type:
        "global";
    }
  | {
      readonly type:
        "country";

      readonly countryCode:
        CountryCode;
    }
  | {
      readonly type:
        "city";

      readonly countryCode:
        CountryCode;

      readonly city:
        string;
    }
  | {
      readonly type:
        "restaurant";

      readonly restaurantId:
        RestaurantId;
    };


/* ============================================================
   CAPABILITIES
   ============================================================ */

export interface IntegrationCapabilities {
  readonly read:
    boolean;

  readonly write:
    boolean;

  readonly webhooks:
    boolean;

  readonly sync:
    boolean;

  readonly realtime:
    boolean;

  readonly oauth:
    boolean;
}


/* ============================================================
   AUTHENTICATION METHOD
   ============================================================ */

export type IntegrationAuthMethod =
  | "none"
  | "api_key"
  | "bearer_token"
  | "oauth2"
  | "service_role"
  | "basic"
  | "signed_request"
  | "custom";


/* ============================================================
   AUTH CONFIGURATION
   ============================================================ */

/**
 * Nunca contiene el secreto real.
 *
 * secretReferenceIds apuntan a infraestructura segura.
 */

export interface IntegrationAuthConfiguration {
  readonly method:
    IntegrationAuthMethod;

  readonly secretReferenceIds:
    readonly SecretReferenceId[];

  readonly oauthConnectionKey?:
    string;

  readonly scopes?:
    readonly string[];
}


/* ============================================================
   CONNECTION
   ============================================================ */

export interface IntegrationConnection {
  readonly id:
    IntegrationConnectionId;

  readonly integrationId:
    IntegrationId;

  readonly provider:
    IntegrationProvider;

  readonly category:
    IntegrationCategory;

  readonly name:
    string;

  readonly environment:
    IntegrationEnvironment;

  readonly scope:
    IntegrationScope;

  readonly status:
    IntegrationStatus;

  readonly capabilities:
    IntegrationCapabilities;

  readonly auth:
    IntegrationAuthConfiguration;

  readonly endpointIds:
    readonly IntegrationEndpointId[];

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly activatedAt?:
    IsoDateTime;

  readonly pausedAt?:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   HTTP METHODS
   ============================================================ */

export type IntegrationHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";


/* ============================================================
   ENDPOINT TYPE
   ============================================================ */

export type IntegrationEndpointType =
  | "api"
  | "webhook"
  | "oauth"
  | "health";


/* ============================================================
   DIRECTION
   ============================================================ */

export type IntegrationDirection =
  | "inbound"
  | "outbound"
  | "bidirectional";


/* ============================================================
   RETRY POLICY
   ============================================================ */

export interface IntegrationRetryPolicy {
  readonly enabled:
    boolean;

  readonly maximumAttempts:
    number;

  readonly initialDelayMs:
    number;

  readonly maximumDelayMs:
    number;

  readonly backoffMultiplier:
    number;

  readonly jitter:
    boolean;

  /**
   * HTTP status que normalmente pueden reintentarse.
   *
   * Ejemplo:
   *
   * 408
   * 429
   * 500
   * 502
   * 503
   * 504
   */
  readonly retryableStatusCodes:
    readonly number[];
}


/* ============================================================
   CIRCUIT BREAKER
   ============================================================ */

export interface IntegrationCircuitBreakerPolicy {
  readonly enabled:
    boolean;

  readonly failureThreshold:
    number;

  readonly resetTimeoutMs:
    number;

  readonly halfOpenMaximumRequests:
    number;
}


export type IntegrationCircuitState =
  | "closed"
  | "open"
  | "half_open";


export interface IntegrationCircuitBreakerState {
  readonly endpointId:
    IntegrationEndpointId;

  readonly state:
    IntegrationCircuitState;

  readonly consecutiveFailures:
    number;

  readonly openedAt?:
    IsoDateTime;

  readonly nextProbeAt?:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   RATE LIMIT POLICY
   ============================================================ */

export interface IntegrationRateLimitPolicy {
  readonly enabled:
    boolean;

  readonly requestsPerSecond?:
    number;

  readonly requestsPerMinute?:
    number;

  readonly requestsPerHour?:
    number;

  readonly burstLimit?:
    number;
}


/* ============================================================
   TIMEOUTS
   ============================================================ */

export interface IntegrationTimeoutPolicy {
  readonly connectionTimeoutMs:
    number;

  readonly requestTimeoutMs:
    number;
}


/* ============================================================
   ENDPOINT
   ============================================================ */

export interface IntegrationEndpoint {
  readonly id:
    IntegrationEndpointId;

  readonly connectionId:
    IntegrationConnectionId;

  readonly name:
    string;

  readonly type:
    IntegrationEndpointType;

  readonly direction:
    IntegrationDirection;

  readonly baseUrl?:
    string;

  readonly path?:
    string;

  readonly allowedMethods:
    readonly IntegrationHttpMethod[];

  readonly timeout:
    IntegrationTimeoutPolicy;

  readonly retry:
    IntegrationRetryPolicy;

  readonly circuitBreaker:
    IntegrationCircuitBreakerPolicy;

  readonly rateLimit:
    IntegrationRateLimitPolicy;

  /**
   * Si true, nunca debe incorporarse a configuración
   * serializada hacia el navegador.
   */
  readonly serverOnly:
    boolean;

  readonly enabled:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   IDEMPOTENCY
   ============================================================ */

export type IntegrationIdempotencyStrategy =
  | "none"
  | "request_id"
  | "external_event_id"
  | "idempotency_key"
  | "payload_hash";


export interface IntegrationIdempotencyPolicy {
  readonly strategy:
    IntegrationIdempotencyStrategy;

  readonly retentionSeconds:
    number;
}


/* ============================================================
   WEBHOOK VERIFICATION
   ============================================================ */

export type WebhookVerificationMethod =
  | "none"
  | "hmac_sha256"
  | "signed_header"
  | "provider_signature"
  | "custom";


export interface WebhookVerificationPolicy {
  readonly method:
    WebhookVerificationMethod;

  readonly secretReferenceId?:
    SecretReferenceId;

  readonly signatureHeader?:
    string;

  readonly timestampHeader?:
    string;

  readonly timestampToleranceSeconds?:
    number;
}


/* ============================================================
   WEBHOOK DEFINITION
   ============================================================ */

export type IntegrationWebhookStatus =
  | "active"
  | "paused"
  | "disabled";


export interface IntegrationWebhook {
  readonly id:
    IntegrationWebhookId;

  readonly connectionId:
    IntegrationConnectionId;

  readonly name:
    string;

  /**
   * Ruta interna.
   *
   * Ejemplo:
   *
   * /api/webhooks/meta
   */
  readonly path:
    string;

  readonly status:
    IntegrationWebhookStatus;

  readonly supportedEvents:
    readonly string[];

  readonly verification:
    WebhookVerificationPolicy;

  readonly idempotency:
    IntegrationIdempotencyPolicy;

  readonly maximumBodyBytes:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   WEBHOOK EVENT STATUS
   ============================================================ */

export type IntegrationWebhookEventStatus =
  | "received"
  | "verified"
  | "processing"
  | "processed"
  | "ignored"
  | "failed"
  | "dead_lettered";


/* ============================================================
   WEBHOOK EVENT
   ============================================================ */

/**
 * Evitamos almacenar el payload bruto aquí.
 *
 * payloadHash:
 * verificación/deduplicación.
 *
 * payloadReference:
 * referencia interna opcional si existe una
 * necesidad legítima de conservar el cuerpo.
 */

export interface IntegrationWebhookEvent {
  readonly id:
    IntegrationWebhookEventId;

  readonly webhookId:
    IntegrationWebhookId;

  readonly provider:
    IntegrationProvider;

  readonly externalEventId?:
    string;

  readonly eventType:
    string;

  readonly status:
    IntegrationWebhookEventStatus;

  readonly signatureVerified:
    boolean;

  readonly payloadHash:
    string;

  readonly payloadReference?:
    string;

  readonly idempotencyKey?:
    string;

  readonly receivedAt:
    IsoDateTime;

  readonly processedAt?:
    IsoDateTime;

  readonly failedAt?:
    IsoDateTime;

  readonly errorCode?:
    string;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   SYNC ENTITY TYPES
   ============================================================ */

export type IntegrationEntityType =
  | "restaurant"
  | "menu_category"
  | "menu_item"
  | "menu_availability"
  | "customer"
  | "order"
  | "payment"
  | "delivery"
  | "reservation"
  | "inquiry"
  | "content"
  | "media"
  | "loyalty_account"
  | "reward"
  | "referral"
  | "social_profile"
  | "seo_metric"
  | "analytics_metric"
  | "other";


/* ============================================================
   SOURCE OF TRUTH
   ============================================================ */

export type IntegrationSourceOfTruth =
  | "local"
  | "remote"
  | "shared";


/* ============================================================
   SYNC DIRECTION
   ============================================================ */

export type IntegrationSyncDirection =
  | "pull"
  | "push"
  | "bidirectional";


/* ============================================================
   SYNC MODE
   ============================================================ */

export type IntegrationSyncMode =
  | "webhook"
  | "realtime"
  | "scheduled"
  | "manual";


/* ============================================================
   CONFLICT STRATEGY
   ============================================================ */

export type IntegrationConflictStrategy =
  | "local_wins"
  | "remote_wins"
  | "latest_write_wins"
  | "manual_review"
  | "reject_conflict";


/* ============================================================
   SYNC DEFINITION
   ============================================================ */

export interface IntegrationSyncDefinition {
  readonly id:
    IntegrationSyncDefinitionId;

  readonly connectionId:
    IntegrationConnectionId;

  readonly entityType:
    IntegrationEntityType;

  readonly direction:
    IntegrationSyncDirection;

  readonly mode:
    IntegrationSyncMode;

  readonly sourceOfTruth:
    IntegrationSourceOfTruth;

  readonly conflictStrategy:
    IntegrationConflictStrategy;

  readonly enabled:
    boolean;

  readonly batchSize:
    number;

  readonly maximumRecordsPerRun?:
    number;

  readonly cursorEnabled:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   SYNC CURSOR
   ============================================================ */

export interface IntegrationSyncCursor {
  readonly id:
    IntegrationCursorId;

  readonly syncDefinitionId:
    IntegrationSyncDefinitionId;

  readonly cursor:
    string;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   SYNC JOB
   ============================================================ */

export type IntegrationSyncJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "partially_completed"
  | "failed"
  | "cancelled";


export interface IntegrationSyncJob {
  readonly id:
    IntegrationSyncJobId;

  readonly syncDefinitionId:
    IntegrationSyncDefinitionId;

  readonly status:
    IntegrationSyncJobStatus;

  readonly requestId?:
    RequestId;

  readonly startedAt?:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly recordsRead:
    number;

  readonly recordsCreated:
    number;

  readonly recordsUpdated:
    number;

  readonly recordsSkipped:
    number;

  readonly recordsFailed:
    number;

  /**
   * True solamente cuando sabemos que el cursor
   * o dataset de esta ejecución fue completamente
   * agotado.
   */
  readonly cursorExhausted:
    boolean;

  readonly errorCode?:
    string;

  readonly errorMessage?:
    string;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   EXTERNAL ID MAPPING
   ============================================================ */

/**
 * Nunca utilizar nombres como identidad.
 *
 * Ejemplo correcto:
 *
 * internal:
 * restaurant_123
 *
 * RC ORDERA:
 * loc_908
 *
 * Google:
 * location_4829
 */

export type IntegrationMappingStatus =
  | "active"
  | "inactive"
  | "conflict";


export interface IntegrationExternalMapping {
  readonly id:
    IntegrationMappingId;

  readonly connectionId:
    IntegrationConnectionId;

  readonly entityType:
    IntegrationEntityType;

  readonly internalId:
    string;

  readonly externalId:
    string;

  readonly externalParentId?:
    string;

  readonly status:
    IntegrationMappingStatus;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   OUTBOX
   ============================================================ */

/**
 * Transactional Outbox Pattern.
 *
 * Ejemplo:
 *
 * pedido completado
 *     ↓
 * misma transacción guarda outbox event
 *     ↓
 * worker entrega integración
 *
 * Evita:
 *
 * "pedido se guardó pero webhook nunca salió".
 */

export type IntegrationOutboxStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "failed"
  | "dead_lettered";


export interface IntegrationOutboxEvent {
  readonly id:
    IntegrationOutboxEventId;

  readonly connectionId:
    IntegrationConnectionId;

  readonly topic:
    string;

  readonly aggregateType:
    IntegrationEntityType;

  readonly aggregateId:
    string;

  /**
   * Referencia al payload almacenado de forma controlada.
   *
   * No obligamos a copiar datos sensibles al outbox.
   */
  readonly payloadReference:
    string;

  readonly idempotencyKey:
    string;

  readonly status:
    IntegrationOutboxStatus;

  readonly attemptCount:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly nextAttemptAt?:
    IsoDateTime;

  readonly deliveredAt?:
    IsoDateTime;
}


/* ============================================================
   DEAD LETTER
   ============================================================ */

/**
 * Operaciones que agotaron sus reintentos.
 *
 * Requieren inspección/reproceso.
 */

export interface IntegrationDeadLetter {
  readonly id:
    IntegrationDeadLetterId;

  readonly connectionId:
    IntegrationConnectionId;

  readonly outboxEventId?:
    IntegrationOutboxEventId;

  readonly webhookEventId?:
    IntegrationWebhookEventId;

  readonly syncJobId?:
    IntegrationSyncJobId;

  readonly errorCode:
    string;

  readonly errorMessage:
    string;

  readonly attemptCount:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly resolvedAt?:
    IsoDateTime;

  readonly resolvedByUserId?:
    UserId;

  readonly resolutionNote?:
    string;
}


/* ============================================================
   HEALTH
   ============================================================ */

export type IntegrationHealthStatus =
  | "healthy"
  | "degraded"
  | "down"
  | "disabled"
  | "unknown";


export interface IntegrationHealthState {
  readonly connectionId:
    IntegrationConnectionId;

  readonly status:
    IntegrationHealthStatus;

  readonly lastSuccessfulRequestAt?:
    IsoDateTime;

  readonly lastFailedRequestAt?:
    IsoDateTime;

  readonly consecutiveFailures:
    number;

  readonly averageLatencyMs?:
    number;

  readonly lastCheckedAt:
    IsoDateTime;
}


/* ============================================================
   HEALTH CHECK
   ============================================================ */

export type IntegrationHealthCheckStatus =
  | "success"
  | "failure"
  | "timeout";


export interface IntegrationHealthCheck {
  readonly id:
    IntegrationHealthCheckId;

  readonly connectionId:
    IntegrationConnectionId;

  readonly endpointId?:
    IntegrationEndpointId;

  readonly status:
    IntegrationHealthCheckStatus;

  readonly latencyMs?:
    number;

  readonly safeStatusCode?:
    number;

  readonly checkedAt:
    IsoDateTime;
}


/* ============================================================
   REQUEST TRACE
   ============================================================ */

/**
 * Registro técnico sanitizado.
 *
 * NO guardar:
 *
 * Authorization headers
 * cookies
 * API keys
 * access tokens
 * refresh tokens
 */

export interface IntegrationRequestTrace {
  readonly connectionId:
    IntegrationConnectionId;

  readonly endpointId:
    IntegrationEndpointId;

  readonly requestId:
    RequestId;

  readonly method:
    IntegrationHttpMethod;

  readonly safePath:
    string;

  readonly statusCode?:
    number;

  readonly attempt:
    number;

  readonly durationMs?:
    number;

  readonly outcome:
    "success" | "failure" | "timeout" | "rate_limited";

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   PROVIDER ERROR CLASSIFICATION
   ============================================================ */

export type IntegrationFailureType =
  | "validation"
  | "authentication"
  | "authorization"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "timeout"
  | "provider_unavailable"
  | "network"
  | "invalid_response"
  | "permanent"
  | "unknown";


export interface IntegrationFailure {
  readonly type:
    IntegrationFailureType;

  readonly code:
    string;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly statusCode?:
    number;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   PROVIDER METRICS
   ============================================================ */

export interface IntegrationPerformanceSnapshot {
  readonly connectionId:
    IntegrationConnectionId;

  readonly requests:
    number;

  readonly successes:
    number;

  readonly failures:
    number;

  readonly timeouts:
    number;

  readonly rateLimited:
    number;

  readonly averageLatencyMs:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   OAUTH CONNECTION STATE
   ============================================================ */

/**
 * No almacena access tokens.
 *
 * Solamente estado empresarial de la conexión.
 */

export type IntegrationOAuthStatus =
  | "not_connected"
  | "authorization_pending"
  | "connected"
  | "reauthorization_required"
  | "revoked"
  | "error";


export interface IntegrationOAuthConnectionState {
  readonly connectionId:
    IntegrationConnectionId;

  readonly status:
    IntegrationOAuthStatus;

  readonly providerAccountId?:
    string;

  readonly grantedScopes:
    readonly string[];

  readonly connectedAt?:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;

  readonly revokedAt?:
    IsoDateTime;
}


/* ============================================================
   CREATE CONNECTION
   ============================================================ */

export interface CreateIntegrationConnectionRequest {
  readonly provider:
    IntegrationProvider;

  readonly category:
    IntegrationCategory;

  readonly name:
    string;

  readonly environment:
    IntegrationEnvironment;

  readonly scope:
    IntegrationScope;

  readonly capabilities:
    IntegrationCapabilities;

  readonly auth:
    IntegrationAuthConfiguration;

  readonly requestId:
    RequestId;
}


/* ============================================================
   UPDATE CONNECTION
   ============================================================ */

export interface UpdateIntegrationConnectionRequest {
  readonly connectionId:
    IntegrationConnectionId;

  readonly status?:
    IntegrationStatus;

  readonly name?:
    string;

  readonly capabilities?:
    IntegrationCapabilities;

  readonly requestId:
    RequestId;
}


/* ============================================================
   MANUAL SYNC REQUEST
   ============================================================ */

export interface TriggerIntegrationSyncRequest {
  readonly syncDefinitionId:
    IntegrationSyncDefinitionId;

  readonly requestedByUserId:
    UserId;

  readonly requestId:
    RequestId;
}


/* ============================================================
   REPROCESS DEAD LETTER
   ============================================================ */

export interface ReprocessDeadLetterRequest {
  readonly deadLetterId:
    IntegrationDeadLetterId;

  readonly requestedByUserId:
    UserId;

  readonly reason:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   QUERY
   ============================================================ */

export interface IntegrationQuery {
  readonly provider?:
    IntegrationProvider;

  readonly category?:
    IntegrationCategory;

  readonly status?:
    IntegrationStatus;

  readonly environment?:
    IntegrationEnvironment;

  readonly restaurantId?:
    RestaurantId;

  readonly search?:
    string;

  readonly cursor?:
    string;

  readonly limit?:
    number;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type IntegrationErrorCode =
  | "INTEGRATION_NOT_FOUND"
  | "CONNECTION_NOT_FOUND"
  | "CONNECTION_DISABLED"
  | "ENDPOINT_NOT_FOUND"
  | "INVALID_CONFIGURATION"
  | "AUTHENTICATION_FAILED"
  | "AUTHORIZATION_FAILED"
  | "SECRET_REFERENCE_MISSING"
  | "WEBHOOK_SIGNATURE_INVALID"
  | "WEBHOOK_EXPIRED"
  | "DUPLICATE_EVENT"
  | "RATE_LIMITED"
  | "REQUEST_TIMEOUT"
  | "CIRCUIT_OPEN"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_PROVIDER_RESPONSE"
  | "SYNC_DEFINITION_NOT_FOUND"
  | "SYNC_FAILED"
  | "SYNC_CONFLICT"
  | "DATASET_INCOMPLETE"
  | "MAPPING_NOT_FOUND"
  | "DEAD_LETTER_CREATED"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "UNKNOWN";


export interface IntegrationDomainError {
  readonly code:
    IntegrationErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   HELPERS — CONNECTION
   ============================================================ */

export function isIntegrationConnectionActive(
  connection:
    IntegrationConnection,
): boolean {
  return (
    connection.status === "active" ||
    connection.status === "degraded"
  );
}


/* ============================================================
   HELPERS — HEALTH
   ============================================================ */

export function isIntegrationHealthy(
  health:
    IntegrationHealthState,
): boolean {
  return (
    health.status === "healthy"
  );
}


/* ============================================================
   HELPERS — CIRCUIT BREAKER
   ============================================================ */

export function canCallIntegrationEndpoint(
  connection:
    IntegrationConnection,
  endpoint:
    IntegrationEndpoint,
  circuit:
    IntegrationCircuitBreakerState | undefined,
): boolean {
  if (
    !isIntegrationConnectionActive(
      connection,
    )
  ) {
    return false;
  }

  if (
    !endpoint.enabled
  ) {
    return false;
  }

  if (
    circuit?.state === "open"
  ) {
    return false;
  }

  return true;
}


/* ============================================================
   HELPERS — RETRY
   ============================================================ */

export function shouldRetryIntegrationFailure(
  failure:
    IntegrationFailure,
  attempt:
    number,
  policy:
    IntegrationRetryPolicy,
): boolean {
  if (
    !policy.enabled ||
    !failure.retryable
  ) {
    return false;
  }

  return (
    attempt <
    policy.maximumAttempts
  );
}


/* ============================================================
   HELPERS — RETRY DELAY
   ============================================================ */

export function calculateIntegrationRetryDelayMs(
  attempt:
    number,
  policy:
    IntegrationRetryPolicy,
): number {
  if (
    attempt <= 0
  ) {
    return policy.initialDelayMs;
  }

  const calculated =
    policy.initialDelayMs *
    Math.pow(
      policy.backoffMultiplier,
      attempt - 1,
    );

  return Math.min(
    Math.round(
      calculated,
    ),
    policy.maximumDelayMs,
  );
}


/* ============================================================
   HELPERS — WEBHOOK TIMESTAMP
   ============================================================ */

export function isWebhookTimestampAcceptable(
  timestamp:
    IsoDateTime,
  toleranceSeconds:
    number,
  now = new Date(),
): boolean {
  const timestampMs =
    new Date(
      timestamp,
    ).getTime();

  if (
    !Number.isFinite(
      timestampMs,
    )
  ) {
    return false;
  }

  const differenceMs =
    Math.abs(
      now.getTime() -
      timestampMs,
    );

  return (
    differenceMs <=
    toleranceSeconds * 1000
  );
}


/* ============================================================
   HELPERS — SYNC COMPLETENESS
   ============================================================ */

export function isIntegrationSyncComplete(
  job:
    IntegrationSyncJob,
): boolean {
  return (
    job.status === "completed" &&
    job.cursorExhausted
  );
}


/* ============================================================
   HELPERS — EXTERNAL MAPPING
   ============================================================ */

export function isExternalMappingUsable(
  mapping:
    IntegrationExternalMapping,
): boolean {
  return (
    mapping.status === "active"
  );
}
