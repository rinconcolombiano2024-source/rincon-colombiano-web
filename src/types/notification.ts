/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Notification & Communication Domain
 * ============================================================
 *
 * Sistema central de comunicaciones.
 *
 * Preparado para:
 *
 * - pedidos
 * - delivery
 * - reservas
 * - catering
 * - cotizaciones
 * - eventos
 * - cumpleaños
 * - clientes
 * - comunidad
 * - fidelización
 * - seguridad
 * - marketing
 * - administración
 *
 * Canales:
 *
 * - email
 * - SMS
 * - WhatsApp
 * - push
 * - web push
 * - notificaciones internas
 *
 * PRINCIPIOS:
 *
 * 1. Las plantillas son administrables.
 * 2. Los secretos de proveedores NUNCA llegan al frontend.
 * 3. Marketing respeta consentimiento.
 * 4. Mensajes transaccionales y marketing son diferentes.
 * 5. Todo envío importante debe ser trazable.
 * 6. Los reintentos deben ser seguros.
 * 7. Idempotencia evita envíos duplicados.
 */

import type {
  IsoDateTime,
  LocalizedText,
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
  OrderId,
} from "@/types/order";

import type {
  ReservationId,
} from "@/types/reservation";

import type {
  InquiryId,
  InquiryQuoteId,
} from "@/types/inquiry";

import type {
  CommunityPostId,
  CommunityProfileId,
} from "@/types/community";

import type {
  CampaignId,
} from "@/types/marketing";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type NotificationId =
  string;

export type NotificationTemplateId =
  string;

export type NotificationTemplateVersionId =
  string;

export type NotificationAttemptId =
  string;

export type NotificationProviderId =
  string;

export type NotificationEventId =
  string;

export type NotificationPreferenceId =
  string;

export type NotificationIdempotencyKey =
  string;


/* ============================================================
   CHANNELS
   ============================================================ */

export type NotificationChannel =
  | "email"
  | "sms"
  | "whatsapp"
  | "push"
  | "web_push"
  | "in_app";


/* ============================================================
   PURPOSE
   ============================================================ */

export type NotificationPurpose =
  | "transactional"
  | "operational"
  | "security"
  | "community"
  | "marketing";


/* ============================================================
   TOPICS
   ============================================================ */

export type NotificationTopic =
  /* Orders */
  | "order_created"
  | "order_confirmed"
  | "order_accepted"
  | "order_preparing"
  | "order_ready"
  | "order_out_for_delivery"
  | "order_delivered"
  | "order_cancelled"
  | "payment_received"
  | "payment_failed"
  | "refund_processed"

  /* Reservations */
  | "reservation_received"
  | "reservation_confirmed"
  | "reservation_reminder"
  | "reservation_updated"
  | "reservation_cancelled"
  | "reservation_waitlist"
  | "reservation_table_available"

  /* Inquiries / quotations */
  | "inquiry_received"
  | "inquiry_assigned"
  | "quote_ready"
  | "quote_sent"
  | "quote_reminder"
  | "quote_accepted"

  /* Community */
  | "community_reaction"
  | "community_comment"
  | "community_reply"
  | "community_follow"
  | "community_mention"
  | "community_moderation"

  /* Customer */
  | "welcome"
  | "account_created"
  | "loyalty_update"
  | "birthday"

  /* Marketing */
  | "promotion"
  | "event"
  | "newsletter"

  /* Security */
  | "security_login"
  | "security_new_device"
  | "security_password_changed"
  | "security_mfa_changed"

  /* Custom */
  | "custom";


/* ============================================================
   STATUS
   ============================================================ */

export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "processing"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "suppressed"
  | "cancelled";


/* ============================================================
   TEMPLATE STATUS
   ============================================================ */

export type NotificationTemplateStatus =
  | "draft"
  | "active"
  | "inactive"
  | "archived";


/* ============================================================
   RECIPIENT
   ============================================================ */

/**
 * Una notificación puede dirigirse a un cliente
 * registrado o simplemente a un contacto temporal.
 */

export interface NotificationRecipient {
  readonly customerId?:
    CustomerId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly email?:
    string;

  readonly phone?:
    string;

  readonly pushSubscriptionId?:
    string;

  readonly locale:
    SupportedLocale;
}


/* ============================================================
   TEMPLATE CONTENT
   ============================================================ */

export interface NotificationTemplateContent {
  /**
   * Utilizado principalmente por email / push.
   */
  readonly subject?:
    string;

  /**
   * Texto plano.
   */
  readonly text:
    string;

  /**
   * HTML permitido exclusivamente en canales
   * compatibles y después de sanitización.
   */
  readonly html?:
    string;

  /**
   * Título corto para push / in-app.
   */
  readonly title?:
    string;

  /**
   * CTA opcional.
   */
  readonly actionLabel?:
    string;

  readonly actionPath?:
    string;
}


/* ============================================================
   LOCALIZED TEMPLATE
   ============================================================ */

export type LocalizedNotificationContent =
  Readonly<
    Partial<
      Record<
        SupportedLocale,
        NotificationTemplateContent
      >
    >
  >;


/* ============================================================
   TEMPLATE VARIABLE
   ============================================================ */

export interface NotificationTemplateVariable {
  /**
   * Ejemplo:
   *
   * customerName
   * orderNumber
   * restaurantName
   */
  readonly key:
    string;

  readonly required:
    boolean;

  readonly description?:
    string;
}


/* ============================================================
   TEMPLATE
   ============================================================ */

export interface NotificationTemplate {
  readonly id:
    NotificationTemplateId;

  readonly key:
    string;

  readonly name:
    string;

  readonly purpose:
    NotificationPurpose;

  readonly topic:
    NotificationTopic;

  readonly status:
    NotificationTemplateStatus;

  readonly supportedChannels:
    readonly NotificationChannel[];

  readonly defaultLocale:
    SupportedLocale;

  readonly content:
    LocalizedNotificationContent;

  readonly variables:
    readonly NotificationTemplateVariable[];

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly currentVersion:
    number;
}


/* ============================================================
   TEMPLATE VERSION
   ============================================================ */

/**
 * Los cambios de una plantilla deben conservar historial.
 */

export interface NotificationTemplateVersion {
  readonly id:
    NotificationTemplateVersionId;

  readonly templateId:
    NotificationTemplateId;

  readonly version:
    number;

  readonly content:
    LocalizedNotificationContent;

  readonly createdAt:
    IsoDateTime;

  readonly createdByUserId:
    string;

  readonly changeNote?:
    string;
}


/* ============================================================
   PROVIDERS
   ============================================================ */

export type NotificationProviderType =
  | "resend"
  | "sendgrid"
  | "twilio"
  | "meta_whatsapp"
  | "firebase"
  | "web_push"
  | "internal"
  | "custom";


/**
 * IMPORTANTE:
 *
 * providerConfigKey es solamente una referencia
 * interna a configuración segura.
 *
 * NUNCA guardar API keys aquí.
 */

export interface NotificationProvider {
  readonly id:
    NotificationProviderId;

  readonly type:
    NotificationProviderType;

  readonly name:
    string;

  readonly channels:
    readonly NotificationChannel[];

  readonly enabled:
    boolean;

  readonly priority:
    number;

  readonly providerConfigKey:
    string;
}


/* ============================================================
   SOURCE
   ============================================================ */

/**
 * Permite saber qué objeto empresarial produjo
 * la notificación.
 */

export interface NotificationSource {
  readonly restaurantId?:
    RestaurantId;

  readonly orderId?:
    OrderId;

  readonly reservationId?:
    ReservationId;

  readonly inquiryId?:
    InquiryId;

  readonly quoteId?:
    InquiryQuoteId;

  readonly communityPostId?:
    CommunityPostId;

  readonly campaignId?:
    CampaignId;
}


/* ============================================================
   VARIABLES
   ============================================================ */

export type NotificationVariableValue =
  | string
  | number
  | boolean
  | null;


export type NotificationVariables =
  Readonly<
    Record<
      string,
      NotificationVariableValue
    >
  >;


/* ============================================================
   NOTIFICATION
   ============================================================ */

export interface OutboundNotification {
  readonly id:
    NotificationId;

  readonly templateId?:
    NotificationTemplateId;

  readonly templateVersion?:
    number;

  readonly purpose:
    NotificationPurpose;

  readonly topic:
    NotificationTopic;

  readonly channel:
    NotificationChannel;

  readonly recipient:
    NotificationRecipient;

  readonly source:
    NotificationSource;

  readonly locale:
    SupportedLocale;

  readonly variables:
    NotificationVariables;

  /**
   * Contenido final renderizado.
   *
   * Se conserva para auditoría.
   */
  readonly renderedContent:
    NotificationTemplateContent;

  readonly status:
    NotificationStatus;

  readonly providerId?:
    NotificationProviderId;

  readonly scheduledFor?:
    IsoDateTime;

  readonly queuedAt?:
    IsoDateTime;

  readonly sentAt?:
    IsoDateTime;

  readonly deliveredAt?:
    IsoDateTime;

  readonly readAt?:
    IsoDateTime;

  readonly failedAt?:
    IsoDateTime;

  readonly cancelledAt?:
    IsoDateTime;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly requestId?:
    RequestId;

  readonly idempotencyKey?:
    NotificationIdempotencyKey;
}


/* ============================================================
   DELIVERY ATTEMPT
   ============================================================ */

export type NotificationAttemptStatus =
  | "started"
  | "accepted"
  | "delivered"
  | "failed"
  | "rejected";


export interface NotificationAttempt {
  readonly id:
    NotificationAttemptId;

  readonly notificationId:
    NotificationId;

  readonly providerId:
    NotificationProviderId;

  readonly attemptNumber:
    number;

  readonly status:
    NotificationAttemptStatus;

  readonly providerMessageId?:
    string;

  readonly safeProviderCode?:
    string;

  readonly errorCode?:
    string;

  /**
   * Mensaje técnico sanitizado.
   *
   * Nunca guardar secretos.
   */
  readonly errorMessage?:
    string;

  readonly startedAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;
}


/* ============================================================
   PROVIDER EVENTS
   ============================================================ */

export type NotificationProviderEventType =
  | "accepted"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "failed"
  | "bounced"
  | "complained"
  | "unsubscribed";


export interface NotificationProviderEvent {
  readonly id:
    NotificationEventId;

  readonly notificationId?:
    NotificationId;

  readonly providerId:
    NotificationProviderId;

  readonly providerMessageId:
    string;

  readonly type:
    NotificationProviderEventType;

  readonly occurredAt:
    IsoDateTime;

  readonly receivedAt:
    IsoDateTime;
}


/* ============================================================
   SUPPRESSION
   ============================================================ */

export type NotificationSuppressionReason =
  | "user_opt_out"
  | "marketing_consent_missing"
  | "invalid_destination"
  | "blocked_recipient"
  | "frequency_limit"
  | "duplicate"
  | "provider_suppression"
  | "policy"
  | "other";


export interface NotificationSuppression {
  readonly notificationId:
    NotificationId;

  readonly reason:
    NotificationSuppressionReason;

  readonly createdAt:
    IsoDateTime;

  readonly details?:
    string;
}


/* ============================================================
   CUSTOMER PREFERENCES
   ============================================================ */

export interface NotificationChannelPreference {
  readonly channel:
    NotificationChannel;

  readonly transactional:
    boolean;

  readonly community:
    boolean;

  readonly marketing:
    boolean;
}


export interface NotificationPreferences {
  readonly id:
    NotificationPreferenceId;

  readonly customerId:
    CustomerId;

  readonly channels:
    readonly NotificationChannelPreference[];

  readonly preferredLocale:
    SupportedLocale;

  /**
   * Horas silenciosas opcionales.
   *
   * Ejemplo:
   *
   * 22:00 → 08:00
   */
  readonly quietHoursStart?:
    string;

  readonly quietHoursEnd?:
    string;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   MARKETING CONSENT
   ============================================================ */

export interface NotificationMarketingConsent {
  readonly customerId:
    CustomerId;

  readonly email:
    boolean;

  readonly sms:
    boolean;

  readonly whatsapp:
    boolean;

  readonly push:
    boolean;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   SCHEDULING
   ============================================================ */

export interface NotificationSchedule {
  readonly notificationId:
    NotificationId;

  readonly scheduledFor:
    IsoDateTime;

  readonly timezone:
    string;
}


/* ============================================================
   RETRY POLICY
   ============================================================ */

export interface NotificationRetryPolicy {
  readonly maximumAttempts:
    number;

  readonly initialDelaySeconds:
    number;

  readonly maximumDelaySeconds:
    number;

  /**
   * Ejemplo:
   *
   * 2 = 30s, 60s, 120s...
   */
  readonly backoffMultiplier:
    number;
}


/* ============================================================
   RATE LIMIT
   ============================================================ */

export interface NotificationFrequencyPolicy {
  readonly purpose:
    NotificationPurpose;

  readonly maximumPerHour?:
    number;

  readonly maximumPerDay?:
    number;

  readonly maximumPerWeek?:
    number;
}


/* ============================================================
   CREATE REQUEST
   ============================================================ */

export interface CreateNotificationRequest {
  readonly templateId:
    NotificationTemplateId;

  readonly channel:
    NotificationChannel;

  readonly recipient:
    NotificationRecipient;

  readonly source:
    NotificationSource;

  readonly variables:
    NotificationVariables;

  readonly locale:
    SupportedLocale;

  readonly scheduledFor?:
    IsoDateTime;

  readonly idempotencyKey:
    NotificationIdempotencyKey;

  readonly requestId:
    RequestId;
}


/* ============================================================
   DIRECT MESSAGE REQUEST
   ============================================================ */

/**
 * Utilizado únicamente cuando no procede una plantilla.
 */

export interface CreateDirectNotificationRequest {
  readonly purpose:
    NotificationPurpose;

  readonly topic:
    NotificationTopic;

  readonly channel:
    NotificationChannel;

  readonly recipient:
    NotificationRecipient;

  readonly content:
    NotificationTemplateContent;

  readonly source:
    NotificationSource;

  readonly locale:
    SupportedLocale;

  readonly idempotencyKey:
    NotificationIdempotencyKey;

  readonly requestId:
    RequestId;
}


/* ============================================================
   BATCH
   ============================================================ */

/**
 * Para campañas masivas el sistema deberá trabajar mediante
 * jobs/colas, nunca enviando miles de mensajes dentro
 * de una petición HTTP.
 */

export interface NotificationBatch {
  readonly id:
    string;

  readonly campaignId?:
    CampaignId;

  readonly templateId:
    NotificationTemplateId;

  readonly channel:
    NotificationChannel;

  readonly recipientCount:
    number;

  readonly queuedCount:
    number;

  readonly sentCount:
    number;

  readonly deliveredCount:
    number;

  readonly failedCount:
    number;

  readonly suppressedCount:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;
}


/* ============================================================
   IN-APP NOTIFICATIONS
   ============================================================ */

export interface InAppNotification {
  readonly notificationId:
    NotificationId;

  readonly customerId?:
    CustomerId;

  readonly communityProfileId?:
    CommunityProfileId;

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
   QUERY
   ============================================================ */

export interface NotificationQuery {
  readonly customerId?:
    CustomerId;

  readonly restaurantId?:
    RestaurantId;

  readonly channel?:
    NotificationChannel;

  readonly purpose?:
    NotificationPurpose;

  readonly status?:
    NotificationStatus;

  readonly topic?:
    NotificationTopic;

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
   ERRORS
   ============================================================ */

export type NotificationErrorCode =
  | "TEMPLATE_NOT_FOUND"
  | "TEMPLATE_INACTIVE"
  | "CHANNEL_NOT_SUPPORTED"
  | "RECIPIENT_INVALID"
  | "CONSENT_REQUIRED"
  | "RECIPIENT_SUPPRESSED"
  | "FREQUENCY_LIMIT_REACHED"
  | "DUPLICATE_NOTIFICATION"
  | "PROVIDER_NOT_AVAILABLE"
  | "PROVIDER_REJECTED"
  | "DELIVERY_FAILED"
  | "INVALID_VARIABLES"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface NotificationDomainError {
  readonly code:
    NotificationErrorCode;

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

export function isTerminalNotificationStatus(
  status: NotificationStatus,
): boolean {
  return (
    status === "delivered" ||
    status === "read" ||
    status === "failed" ||
    status === "suppressed" ||
    status === "cancelled"
  );
}


export function notificationCanRetry(
  notification: OutboundNotification,
): boolean {
  return (
    notification.status === "failed"
  );
}


export function isTransactionalNotification(
  notification: OutboundNotification,
): boolean {
  return (
    notification.purpose ===
    "transactional"
  );
}


export function requiresMarketingConsent(
  purpose: NotificationPurpose,
): boolean {
  return purpose === "marketing";
}


export function hasRequiredDestination(
  recipient: NotificationRecipient,
  channel: NotificationChannel,
): boolean {
  switch (channel) {
    case "email":
      return Boolean(
        recipient.email,
      );

    case "sms":
    case "whatsapp":
      return Boolean(
        recipient.phone,
      );

    case "push":
    case "web_push":
      return Boolean(
        recipient.pushSubscriptionId,
      );

    case "in_app":
      return Boolean(
        recipient.customerId ||
        recipient.communityProfileId
      );
  }
}
