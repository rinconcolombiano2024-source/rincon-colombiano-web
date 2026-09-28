/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise AI Assistant & Customer Intelligence Domain
 * ============================================================
 *
 * Capa central de inteligencia artificial.
 *
 * Diseñada para:
 *
 * - atención al cliente
 * - preguntas generales
 * - menú
 * - restaurantes
 * - horarios
 * - productos
 * - delivery
 * - estado de pedidos
 * - reservas
 * - catering
 * - eventos
 * - cumpleaños
 * - empresas
 * - familias
 * - desayunos
 * - panadería
 * - comunidad
 * - loyalty
 * - puntos
 * - recompensas
 * - referidos
 * - problemas técnicos
 * - soporte
 * - derivación a humano
 *
 * PRINCIPIOS:
 *
 * 1. La IA NO es la fuente de verdad.
 * 2. Debe consultar datos reales antes de responder
 *    cuestiones operativas.
 * 3. No debe inventar precios, horarios, disponibilidad,
 *    pedidos, alergias, recompensas ni políticas.
 * 4. Información privada requiere autenticación.
 * 5. Acciones que cambian datos requieren autorización.
 * 6. Acciones sensibles requieren confirmación explícita.
 * 7. Cuando no tenga información suficiente debe decirlo
 *    y ofrecer escalación humana.
 * 8. Las respuestas importantes deben poder indicar
 *    qué fuente oficial utilizaron.
 * 9. UGC/comunidad nunca debe tratarse automáticamente
 *    como una fuente oficial.
 */

import type {
  IsoDateTime,
  RequestId,
  UserId,
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
  ReservationId,
} from "@/types/reservation";

import type {
  InquiryId,
} from "@/types/inquiry";

import type {
  CommunityPostId,
  CommunityProfileId,
} from "@/types/community";

import type {
  LoyaltyAccountId,
  ReferralId,
  RewardGrantId,
} from "@/types/loyalty";

import type {
  AuthSessionId,
  AuthUserId,
} from "@/types/auth";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type AIAssistantId =
  string;

export type AIConversationId =
  string;

export type AIMessageId =
  string;

export type AIRunId =
  string;

export type AIToolId =
  string;

export type AIToolCallId =
  string;

export type AIKnowledgeDocumentId =
  string;

export type AIKnowledgeChunkId =
  string;

export type AIRetrievalId =
  string;

export type AIHandoffId =
  string;

export type AIFeedbackId =
  string;

export type AIActionConfirmationId =
  string;


/* ============================================================
   ASSISTANT AUDIENCE
   ============================================================ */

export type AIAudience =
  | "visitor"
  | "customer"
  | "community_member"
  | "staff"
  | "admin";


/* ============================================================
   ASSISTANT CHANNEL
   ============================================================ */

export type AIChannel =
  | "website"
  | "community"
  | "admin"
  | "mobile_app"
  | "whatsapp"
  | "other";


/* ============================================================
   ASSISTANT STATUS
   ============================================================ */

export type AIAssistantStatus =
  | "draft"
  | "active"
  | "paused"
  | "disabled";


/* ============================================================
   ASSISTANT
   ============================================================ */

export interface AIAssistant {
  readonly id:
    AIAssistantId;

  readonly name:
    string;

  readonly status:
    AIAssistantStatus;

  readonly audiences:
    readonly AIAudience[];

  readonly supportedLocales:
    readonly SupportedLocale[];

  readonly channels:
    readonly AIChannel[];

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   PROVIDER ABSTRACTION
   ============================================================ */

/**
 * No acoplamos todo el negocio a un único proveedor.
 *
 * modelKey es configuración de servidor.
 *
 * API keys NUNCA pertenecen a este contrato.
 */

export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "azure"
  | "custom";


export interface AIModelConfiguration {
  readonly provider:
    AIProvider;

  readonly modelKey:
    string;

  readonly enabled:
    boolean;

  readonly maximumOutputTokens?:
    number;

  readonly timeoutMs:
    number;
}


/* ============================================================
   CONVERSATION STATUS
   ============================================================ */

export type AIConversationStatus =
  | "active"
  | "waiting_for_user"
  | "waiting_for_human"
  | "handed_off"
  | "resolved"
  | "closed";


/* ============================================================
   CONVERSATION
   ============================================================ */

export interface AIConversation {
  readonly id:
    AIConversationId;

  readonly assistantId:
    AIAssistantId;

  readonly channel:
    AIChannel;

  readonly status:
    AIConversationStatus;

  readonly locale:
    SupportedLocale;

  readonly authUserId?:
    AuthUserId;

  readonly authSessionId?:
    AuthSessionId;

  readonly customerId?:
    CustomerId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly restaurantId?:
    RestaurantId;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly resolvedAt?:
    IsoDateTime;

  readonly closedAt?:
    IsoDateTime;
}


/* ============================================================
   MESSAGE ROLE
   ============================================================ */

export type AIMessageRole =
  | "user"
  | "assistant"
  | "system"
  | "tool";


/* ============================================================
   MESSAGE STATUS
   ============================================================ */

export type AIMessageStatus =
  | "created"
  | "processing"
  | "completed"
  | "failed"
  | "blocked";


/* ============================================================
   MESSAGE
   ============================================================ */

export interface AIMessage {
  readonly id:
    AIMessageId;

  readonly conversationId:
    AIConversationId;

  readonly role:
    AIMessageRole;

  readonly status:
    AIMessageStatus;

  readonly content:
    string;

  readonly locale:
    SupportedLocale;

  readonly runId?:
    AIRunId;

  readonly createdAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;
}


/* ============================================================
   INTENTS
   ============================================================ */

export type AIIntent =
  | "greeting"
  | "general_question"
  | "menu_question"
  | "product_recommendation"
  | "ingredient_question"
  | "allergen_question"
  | "dietary_question"
  | "restaurant_information"
  | "opening_hours"
  | "location_question"
  | "delivery_question"
  | "order_status"
  | "order_problem"
  | "reservation_help"
  | "catering"
  | "corporate_event"
  | "family_event"
  | "birthday"
  | "breakfast"
  | "surprise_breakfast"
  | "table_decoration"
  | "bakery"
  | "loyalty"
  | "points"
  | "reward"
  | "referral"
  | "account"
  | "community"
  | "complaint"
  | "feedback"
  | "technical_support"
  | "human_support"
  | "unknown";


/* ============================================================
   INTENT CLASSIFICATION
   ============================================================ */

export interface AIIntentClassification {
  readonly primary:
    AIIntent;

  readonly alternatives:
    readonly AIIntent[];

  /**
   * Señal interna.
   *
   * No debe utilizarse como sustituto de
   * validación factual.
   */
  readonly confidence:
    number;
}


/* ============================================================
   ENTITY REFERENCES
   ============================================================ */

export type AIEntityReference =
  | {
      readonly type:
        "restaurant";

      readonly id:
        RestaurantId;
    }
  | {
      readonly type:
        "menu_item";

      readonly id:
        MenuItemId;
    }
  | {
      readonly type:
        "order";

      readonly id:
        OrderId;
    }
  | {
      readonly type:
        "reservation";

      readonly id:
        ReservationId;
    }
  | {
      readonly type:
        "inquiry";

      readonly id:
        InquiryId;
    }
  | {
      readonly type:
        "reward";

      readonly id:
        RewardGrantId;
    }
  | {
      readonly type:
        "referral";

      readonly id:
        ReferralId;
    }
  | {
      readonly type:
        "community_post";

      readonly id:
        CommunityPostId;
    };


/* ============================================================
   KNOWLEDGE SOURCE TYPE
   ============================================================ */

export type AIKnowledgeSourceType =
  | "website"
  | "cms"
  | "menu"
  | "restaurant"
  | "policy"
  | "faq"
  | "order_system"
  | "reservation_system"
  | "inquiry_system"
  | "loyalty_system"
  | "community"
  | "manual";


/* ============================================================
   SOURCE AUTHORITY
   ============================================================ */

/**
 * La IA debe distinguir:
 *
 * official:
 * contenido controlado por Rincón Colombiano.
 *
 * operational:
 * datos en tiempo real de sistemas internos.
 *
 * community:
 * contenido generado por usuarios.
 */

export type AIKnowledgeAuthority =
  | "official"
  | "operational"
  | "community";


/* ============================================================
   KNOWLEDGE DOCUMENT
   ============================================================ */

export interface AIKnowledgeDocument {
  readonly id:
    AIKnowledgeDocumentId;

  readonly sourceType:
    AIKnowledgeSourceType;

  readonly authority:
    AIKnowledgeAuthority;

  readonly locale:
    SupportedLocale;

  readonly title:
    string;

  readonly canonicalPath?:
    string;

  readonly restaurantId?:
    RestaurantId;

  readonly entity?:
    AIEntityReference;

  readonly published:
    boolean;

  readonly searchable:
    boolean;

  readonly updatedAt:
    IsoDateTime;

  readonly indexedAt?:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   KNOWLEDGE CHUNK
   ============================================================ */

export interface AIKnowledgeChunk {
  readonly id:
    AIKnowledgeChunkId;

  readonly documentId:
    AIKnowledgeDocumentId;

  readonly text:
    string;

  readonly position:
    number;

  readonly tokenCount?:
    number;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   RETRIEVAL
   ============================================================ */

export interface AIRetrievalRequest {
  readonly query:
    string;

  readonly locale:
    SupportedLocale;

  readonly restaurantId?:
    RestaurantId;

  readonly intent?:
    AIIntent;

  readonly maximumResults:
    number;

  readonly requestId:
    RequestId;
}


/* ============================================================
   RETRIEVAL RESULT
   ============================================================ */

export interface AIRetrievalResult {
  readonly chunkId:
    AIKnowledgeChunkId;

  readonly documentId:
    AIKnowledgeDocumentId;

  readonly authority:
    AIKnowledgeAuthority;

  readonly title:
    string;

  readonly canonicalPath?:
    string;

  readonly text:
    string;

  readonly score:
    number;
}


/* ============================================================
   KNOWLEDGE REFERENCE
   ============================================================ */

/**
 * Referencias que podemos utilizar en la interfaz para
 * explicar de dónde proviene una respuesta.
 */

export interface AIKnowledgeReference {
  readonly documentId:
    AIKnowledgeDocumentId;

  readonly title:
    string;

  readonly sourceType:
    AIKnowledgeSourceType;

  readonly authority:
    AIKnowledgeAuthority;

  readonly path?:
    string;

  readonly updatedAt?:
    IsoDateTime;
}


/* ============================================================
   GROUNDING
   ============================================================ */

export interface AIGroundingState {
  /**
   * True cuando las afirmaciones operativas/factuales
   * relevantes se apoyan en fuentes recuperadas.
   */
  readonly grounded:
    boolean;

  readonly references:
    readonly AIKnowledgeReference[];

  readonly insufficientInformation:
    boolean;
}


/* ============================================================
   TOOL ACCESS LEVEL
   ============================================================ */

export type AIToolAccess =
  | "public_read"
  | "customer_read"
  | "customer_write"
  | "staff_read"
  | "staff_write"
  | "admin_write";


/* ============================================================
   TOOL RISK
   ============================================================ */

export type AIToolRisk =
  | "low"
  | "medium"
  | "high"
  | "critical";


/* ============================================================
   TOOL CATEGORY
   ============================================================ */

export type AIToolCategory =
  | "search"
  | "menu"
  | "restaurant"
  | "delivery"
  | "order"
  | "reservation"
  | "inquiry"
  | "loyalty"
  | "referral"
  | "community"
  | "support";


/* ============================================================
   TOOL
   ============================================================ */

export interface AIToolDefinition {
  readonly id:
    AIToolId;

  readonly name:
    string;

  readonly description:
    string;

  readonly category:
    AIToolCategory;

  readonly access:
    AIToolAccess;

  readonly risk:
    AIToolRisk;

  /**
   * Acciones que cambian datos normalmente
   * deben pedir confirmación.
   */
  readonly requiresExplicitConfirmation:
    boolean;

  readonly enabled:
    boolean;
}


/* ============================================================
   TOOL CALL STATUS
   ============================================================ */

export type AIToolCallStatus =
  | "requested"
  | "awaiting_confirmation"
  | "authorized"
  | "running"
  | "completed"
  | "failed"
  | "denied"
  | "cancelled";


/* ============================================================
   SAFE TOOL ARGUMENT
   ============================================================ */

export type AIToolArgumentValue =
  | string
  | number
  | boolean
  | null;


/* ============================================================
   TOOL CALL
   ============================================================ */

export interface AIToolCall {
  readonly id:
    AIToolCallId;

  readonly runId:
    AIRunId;

  readonly conversationId:
    AIConversationId;

  readonly toolId:
    AIToolId;

  readonly status:
    AIToolCallStatus;

  readonly arguments:
    Readonly<
      Record<
        string,
        AIToolArgumentValue
      >
    >;

  readonly confirmationId?:
    AIActionConfirmationId;

  readonly requestId:
    RequestId;

  readonly createdAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;
}


/* ============================================================
   TOOL RESULT
   ============================================================ */

export interface AIToolResult {
  readonly toolCallId:
    AIToolCallId;

  readonly successful:
    boolean;

  readonly summary:
    string;

  /**
   * Resultado técnico pequeño y sanitizado.
   *
   * No almacenar secretos aquí.
   */
  readonly data?:
    Readonly<
      Record<
        string,
        string | number | boolean | null
      >
    >;

  readonly errorCode?:
    string;

  readonly completedAt:
    IsoDateTime;
}


/* ============================================================
   USER CONFIRMATION
   ============================================================ */

export type AIConfirmationStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "expired";


export interface AIActionConfirmation {
  readonly id:
    AIActionConfirmationId;

  readonly conversationId:
    AIConversationId;

  readonly toolCallId:
    AIToolCallId;

  readonly status:
    AIConfirmationStatus;

  readonly actionDescription:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly confirmedAt?:
    IsoDateTime;

  readonly declinedAt?:
    IsoDateTime;
}


/* ============================================================
   RUN STATUS
   ============================================================ */

export type AIRunStatus =
  | "queued"
  | "retrieving"
  | "reasoning"
  | "waiting_for_tool"
  | "waiting_for_confirmation"
  | "completed"
  | "failed"
  | "cancelled";


/* ============================================================
   AI RUN
   ============================================================ */

export interface AIRun {
  readonly id:
    AIRunId;

  readonly assistantId:
    AIAssistantId;

  readonly conversationId:
    AIConversationId;

  readonly status:
    AIRunStatus;

  readonly inputMessageId:
    AIMessageId;

  readonly outputMessageId?:
    AIMessageId;

  readonly intent?:
    AIIntentClassification;

  readonly grounding?:
    AIGroundingState;

  readonly toolCallIds:
    readonly AIToolCallId[];

  readonly startedAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly requestId:
    RequestId;
}


/* ============================================================
   AUTHORIZATION CONTEXT
   ============================================================ */

export interface AIAuthorizationContext {
  readonly audience:
    AIAudience;

  readonly authenticated:
    boolean;

  readonly authUserId?:
    AuthUserId;

  readonly authSessionId?:
    AuthSessionId;

  readonly customerId?:
    CustomerId;

  readonly staffUserId?:
    UserId;
}


/* ============================================================
   PRIVATE DATA CATEGORY
   ============================================================ */

export type AIPrivateDataCategory =
  | "order"
  | "reservation"
  | "customer_profile"
  | "loyalty"
  | "reward"
  | "referral"
  | "inquiry";


/* ============================================================
   ANSWER SAFETY
   ============================================================ */

export type AIAnswerSafetyStatus =
  | "safe"
  | "needs_clarification"
  | "needs_grounding"
  | "needs_human"
  | "blocked";


export interface AIAnswerSafety {
  readonly status:
    AIAnswerSafetyStatus;

  readonly reason?:
    string;

  readonly requiresHumanReview:
    boolean;
}


/* ============================================================
   HIGH-RISK INFORMATION
   ============================================================ */

/**
 * En estos temas la IA debe ser especialmente estricta.
 *
 * Ejemplo:
 *
 * alergias:
 * nunca inferir que un plato es seguro solamente
 * porque "parece" no contener un ingrediente.
 */

export type AIHighRiskTopic =
  | "allergens"
  | "food_safety"
  | "payment_dispute"
  | "refund"
  | "account_security"
  | "privacy"
  | "legal";


/* ============================================================
   ESCALATION REASONS
   ============================================================ */

export type AIHandoffReason =
  | "user_requested_human"
  | "insufficient_information"
  | "complaint"
  | "payment_problem"
  | "order_problem"
  | "allergen_uncertainty"
  | "security_issue"
  | "privacy_issue"
  | "high_value_inquiry"
  | "tool_failure"
  | "policy"
  | "other";


/* ============================================================
   HUMAN HANDOFF
   ============================================================ */

export type AIHandoffStatus =
  | "requested"
  | "queued"
  | "assigned"
  | "accepted"
  | "resolved"
  | "cancelled";


export interface AIHumanHandoff {
  readonly id:
    AIHandoffId;

  readonly conversationId:
    AIConversationId;

  readonly reason:
    AIHandoffReason;

  readonly status:
    AIHandoffStatus;

  readonly customerId?:
    CustomerId;

  readonly inquiryId?:
    InquiryId;

  readonly assignedToUserId?:
    UserId;

  readonly summary:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly assignedAt?:
    IsoDateTime;

  readonly resolvedAt?:
    IsoDateTime;
}


/* ============================================================
   FEEDBACK
   ============================================================ */

export type AIFeedbackRating =
  | "helpful"
  | "not_helpful";


export type AIFeedbackReason =
  | "incorrect"
  | "outdated"
  | "did_not_answer"
  | "too_long"
  | "too_short"
  | "unsafe"
  | "other";


export interface AIFeedback {
  readonly id:
    AIFeedbackId;

  readonly conversationId:
    AIConversationId;

  readonly messageId:
    AIMessageId;

  readonly rating:
    AIFeedbackRating;

  readonly reason?:
    AIFeedbackReason;

  readonly comment?:
    string;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   CUSTOMER CONTEXT
   ============================================================ */

/**
 * Resumen mínimo que la IA puede recibir.
 *
 * No debemos introducir todo el perfil del cliente
 * en cada petición.
 */

export interface AICustomerContext {
  readonly customerId:
    CustomerId;

  readonly loyaltyAccountId?:
    LoyaltyAccountId;

  readonly locale:
    SupportedLocale;

  readonly activeOrderIds:
    readonly OrderId[];

  readonly activeReservationIds:
    readonly ReservationId[];

  readonly availableRewardIds:
    readonly RewardGrantId[];
}


/* ============================================================
   RECOMMENDATION CONTEXT
   ============================================================ */

export interface AIRecommendationContext {
  readonly restaurantId?:
    RestaurantId;

  readonly locale:
    SupportedLocale;

  readonly dietaryPreferences?:
    readonly string[];

  readonly excludedIngredients?:
    readonly string[];

  readonly budgetText?:
    string;
}


/* ============================================================
   AI RECOMMENDATION
   ============================================================ */

/**
 * Recomendación comercial.
 *
 * No sustituye información oficial de alérgenos.
 */

export interface AIMenuRecommendation {
  readonly menuItemId:
    MenuItemId;

  readonly reason:
    string;

  readonly grounded:
    boolean;
}


/* ============================================================
   AI PROBLEM RESOLUTION
   ============================================================ */

export type AIProblemResolutionStatus =
  | "answered"
  | "action_completed"
  | "awaiting_customer"
  | "escalated"
  | "unresolved";


export interface AIProblemResolution {
  readonly conversationId:
    AIConversationId;

  readonly intent:
    AIIntent;

  readonly status:
    AIProblemResolutionStatus;

  readonly summary:
    string;

  readonly relatedEntities:
    readonly AIEntityReference[];

  readonly handoffId?:
    AIHandoffId;

  readonly resolvedAt?:
    IsoDateTime;
}


/* ============================================================
   AI POLICY
   ============================================================ */

export interface AIAssistantPolicy {
  /**
   * Operaciones privadas requieren autenticación.
   */
  readonly requireAuthenticationForPrivateData:
    true;

  /**
   * Escrituras requieren autorización server-side.
   */
  readonly requireAuthorizationForWrites:
    true;

  /**
   * Operaciones sensibles requieren confirmación.
   */
  readonly requireConfirmationForSensitiveActions:
    true;

  /**
   * Si no existen datos oficiales suficientes,
   * no inventar.
   */
  readonly refuseUnsupportedFactualClaims:
    true;

  /**
   * Permitir escalación a humano.
   */
  readonly humanHandoffEnabled:
    true;
}


/* ============================================================
   DEFAULT POLICY
   ============================================================ */

export const defaultAIAssistantPolicy:
  AIAssistantPolicy = {
    requireAuthenticationForPrivateData:
      true,

    requireAuthorizationForWrites:
      true,

    requireConfirmationForSensitiveActions:
      true,

    refuseUnsupportedFactualClaims:
      true,

    humanHandoffEnabled:
      true,
  };


/* ============================================================
   USAGE
   ============================================================ */

export interface AIUsageRecord {
  readonly runId:
    AIRunId;

  readonly provider:
    AIProvider;

  readonly modelKey:
    string;

  readonly inputTokens?:
    number;

  readonly outputTokens?:
    number;

  readonly totalTokens?:
    number;

  readonly latencyMs?:
    number;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   RATE LIMIT
   ============================================================ */

export interface AIRateLimitPolicy {
  readonly anonymousMessagesPerHour:
    number;

  readonly authenticatedMessagesPerHour:
    number;

  readonly maximumMessageLength:
    number;
}


/* ============================================================
   CREATE CONVERSATION
   ============================================================ */

export interface CreateAIConversationRequest {
  readonly assistantId:
    AIAssistantId;

  readonly channel:
    AIChannel;

  readonly locale:
    SupportedLocale;

  readonly authorization:
    AIAuthorizationContext;

  readonly restaurantId?:
    RestaurantId;

  readonly requestId:
    RequestId;
}


/* ============================================================
   SEND MESSAGE
   ============================================================ */

export interface SendAIMessageRequest {
  readonly conversationId:
    AIConversationId;

  readonly content:
    string;

  readonly locale:
    SupportedLocale;

  readonly requestId:
    RequestId;
}


/* ============================================================
   QUERY
   ============================================================ */

export interface AIConversationQuery {
  readonly customerId?:
    CustomerId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly status?:
    AIConversationStatus;

  readonly channel?:
    AIChannel;

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

export type AIErrorCode =
  | "ASSISTANT_NOT_FOUND"
  | "ASSISTANT_DISABLED"
  | "CONVERSATION_NOT_FOUND"
  | "MESSAGE_TOO_LONG"
  | "RATE_LIMITED"
  | "AUTHENTICATION_REQUIRED"
  | "PERMISSION_DENIED"
  | "CONFIRMATION_REQUIRED"
  | "KNOWLEDGE_UNAVAILABLE"
  | "INSUFFICIENT_INFORMATION"
  | "TOOL_NOT_FOUND"
  | "TOOL_DISABLED"
  | "TOOL_FAILED"
  | "MODEL_UNAVAILABLE"
  | "MODEL_TIMEOUT"
  | "HUMAN_HANDOFF_REQUIRED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface AIDomainError {
  readonly code:
    AIErrorCode;

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

export function aiToolRequiresAuthentication(
  tool: AIToolDefinition,
): boolean {
  return (
    tool.access !==
      "public_read"
  );
}


export function aiToolChangesData(
  tool: AIToolDefinition,
): boolean {
  return (
    tool.access ===
      "customer_write" ||
    tool.access ===
      "staff_write" ||
    tool.access ===
      "admin_write"
  );
}


export function aiToolRequiresConfirmation(
  tool: AIToolDefinition,
): boolean {
  return (
    tool.requiresExplicitConfirmation ||
    tool.risk === "high" ||
    tool.risk === "critical"
  );
}


export function canUseAITool(
  tool: AIToolDefinition,
  context: AIAuthorizationContext,
): boolean {
  if (
    !tool.enabled
  ) {
    return false;
  }

  if (
    tool.access === "public_read"
  ) {
    return true;
  }

  if (
    !context.authenticated
  ) {
    return false;
  }

  if (
    tool.access ===
      "customer_read" ||
    tool.access ===
      "customer_write"
  ) {
    return Boolean(
      context.customerId,
    );
  }

  if (
    tool.access ===
      "staff_read" ||
    tool.access ===
      "staff_write" ||
    tool.access ===
      "admin_write"
  ) {
    return Boolean(
      context.staffUserId,
    );
  }

  return false;
}


export function shouldAIHandoffToHuman(
  safety:
    AIAnswerSafety,
): boolean {
  return (
    safety.status ===
      "needs_human" ||
    safety.requiresHumanReview
  );
}


export function canUseCommunityAsAuthoritativeSource(
  authority:
    AIKnowledgeAuthority,
): boolean {
  return (
    authority ===
      "official" ||
    authority ===
      "operational"
  );
}
