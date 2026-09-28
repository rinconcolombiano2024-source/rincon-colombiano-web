/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Privacy, Consent & Data Rights Domain
 * ============================================================
 *
 * Sistema central de privacidad.
 *
 * Preparado para:
 *
 * - GDPR / RODO
 * - consentimiento
 * - cookies
 * - analytics
 * - marketing
 * - personalización
 * - comunicaciones
 * - comunidad
 * - IA
 * - exportación de datos
 * - rectificación
 * - eliminación
 * - restricción
 * - oposición
 * - portabilidad
 * - retención
 * - anonimización
 * - menores
 * - tutores
 * - procesadores
 * - transferencias
 * - privacy notices
 * - auditoría
 *
 * PRINCIPIOS:
 *
 * 1. Consentimiento debe poder probarse.
 * 2. Consentimiento debe poder retirarse.
 * 3. Cookies esenciales y marketing no son lo mismo.
 * 4. Marketing no debe confundirse con mensajes transaccionales.
 * 5. Retirar consentimiento no significa necesariamente
 *    borrar obligaciones contables o legales.
 * 6. Eliminar cuenta no significa destruir automáticamente
 *    registros que legalmente deban conservarse.
 * 7. Debemos minimizar datos.
 * 8. Los datos privados no se convierten en contenido público.
 * 9. IA no recibe más información de la necesaria.
 * 10. La política sobre menores depende de jurisdicción.
 * 11. Nunca almacenar passwords, OTP, access tokens,
 *     secretos o datos completos de tarjetas en este dominio.
 */

import type {
  CountryCode,
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
  CommunityProfileId,
} from "@/types/community";

import type {
  AuthSessionId,
  AuthUserId,
} from "@/types/auth";

import type {
  PageId,
} from "@/types/content";

import type {
  RestaurantId,
} from "@/types/restaurant";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type PrivacySubjectId =
  string;

export type PrivacyConsentRecordId =
  string;

export type PrivacyNoticeId =
  string;

export type PrivacyNoticeVersionId =
  string;

export type PrivacyRequestId =
  string;

export type PrivacyExportId =
  string;

export type PrivacyDeletionJobId =
  string;

export type PrivacyRetentionRuleId =
  string;

export type PrivacyProcessingActivityId =
  string;

export type PrivacyProcessorId =
  string;

export type PrivacyTransferId =
  string;

export type PrivacyGuardianConsentId =
  string;

export type PrivacyLegalHoldId =
  string;


/* ============================================================
   DATA SUBJECT
   ============================================================ */

export type PrivacySubjectType =
  | "anonymous_visitor"
  | "customer"
  | "community_member"
  | "staff"
  | "admin";


export interface PrivacySubject {
  readonly id:
    PrivacySubjectId;

  readonly type:
    PrivacySubjectType;

  readonly authUserId?:
    AuthUserId;

  readonly customerId?:
    CustomerId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly countryCode?:
    CountryCode;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   JURISDICTION
   ============================================================ */

/**
 * countryCode es la clave principal.
 *
 * legalRegion sirve para agrupaciones operativas.
 *
 * Las reglas legales definitivas no deben inferirse
 * únicamente desde legalRegion.
 */

export type PrivacyLegalRegion =
  | "eea"
  | "uk"
  | "switzerland"
  | "united_states"
  | "latin_america"
  | "other";


export interface PrivacyJurisdiction {
  readonly countryCode:
    CountryCode;

  readonly legalRegion:
    PrivacyLegalRegion;

  readonly active:
    boolean;
}


/* ============================================================
   DATA CATEGORIES
   ============================================================ */

export type PersonalDataCategory =
  | "identity"
  | "contact"
  | "account"
  | "authentication_security"
  | "address"
  | "transaction"
  | "payment_metadata"
  | "delivery"
  | "reservation"
  | "inquiry"
  | "community_profile"
  | "community_content"
  | "media"
  | "loyalty"
  | "referral"
  | "support"
  | "ai_conversation"
  | "device"
  | "technical"
  | "analytics"
  | "marketing"
  | "consent"
  | "legal"
  | "other";


/* ============================================================
   DATA SENSITIVITY
   ============================================================ */

export type PrivacyDataSensitivity =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";


/* ============================================================
   PROCESSING PURPOSE
   ============================================================ */

export type PrivacyPurpose =
  | "service_delivery"
  | "account_management"
  | "authentication"
  | "security"
  | "fraud_prevention"
  | "order_processing"
  | "delivery"
  | "reservation"
  | "customer_support"
  | "community"
  | "loyalty"
  | "referrals"
  | "transactional_communications"
  | "analytics"
  | "personalization"
  | "marketing"
  | "marketing_email"
  | "marketing_sms"
  | "marketing_whatsapp"
  | "marketing_push"
  | "social_media"
  | "ai_assistance"
  | "legal_compliance"
  | "accounting"
  | "claims"
  | "other";


/* ============================================================
   LAWFUL BASIS
   ============================================================ */

export type PrivacyLawfulBasis =
  | "consent"
  | "contract"
  | "legal_obligation"
  | "legitimate_interest"
  | "vital_interest"
  | "public_task";


/* ============================================================
   CONSENT STATUS
   ============================================================ */

export type PrivacyConsentStatus =
  | "unknown"
  | "granted"
  | "denied"
  | "withdrawn";


/* ============================================================
   CONSENT ACTION
   ============================================================ */

/**
 * Consent log append-only.
 *
 * Si una persona cambia de decisión,
 * no reemplazamos el registro histórico:
 * añadimos otro evento.
 */

export type PrivacyConsentAction =
  | "granted"
  | "denied"
  | "withdrawn";


/* ============================================================
   CONSENT SOURCE
   ============================================================ */

export type PrivacyConsentSource =
  | "cookie_banner"
  | "registration"
  | "account_settings"
  | "checkout"
  | "community"
  | "loyalty"
  | "marketing_form"
  | "admin"
  | "api"
  | "import";


/* ============================================================
   CONSENT EVIDENCE
   ============================================================ */

export interface PrivacyConsentEvidence {
  readonly source:
    PrivacyConsentSource;

  readonly privacyNoticeVersionId:
    PrivacyNoticeVersionId;

  readonly locale:
    SupportedLocale;

  readonly interfaceVersion?:
    string;

  readonly sessionId?:
    AuthSessionId;

  /**
   * Hash opcional.
   *
   * Evitamos almacenar datos de red completos
   * cuando no sean necesarios.
   */
  readonly ipHash?:
    string;

  readonly userAgent?:
    string;
}


/* ============================================================
   CONSENT RECORD
   ============================================================ */

export interface PrivacyConsentRecord {
  readonly id:
    PrivacyConsentRecordId;

  readonly subjectId:
    PrivacySubjectId;

  readonly purpose:
    PrivacyPurpose;

  readonly action:
    PrivacyConsentAction;

  readonly evidence:
    PrivacyConsentEvidence;

  readonly occurredAt:
    IsoDateTime;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   CONSENT SNAPSHOT
   ============================================================ */

/**
 * Estado materializado para lectura rápida.
 *
 * La evidencia histórica real continúa en
 * PrivacyConsentRecord.
 */

export interface PrivacyConsentSnapshot {
  readonly subjectId:
    PrivacySubjectId;

  readonly purposes:
    Readonly<
      Partial<
        Record<
          PrivacyPurpose,
          PrivacyConsentStatus
        >
      >
    >;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   COOKIE CATEGORIES
   ============================================================ */

export type CookieCategory =
  | "essential"
  | "preferences"
  | "analytics"
  | "marketing"
  | "social_media";


/* ============================================================
   COOKIE PREFERENCES
   ============================================================ */

export interface CookieConsentPreferences {
  /**
   * Siempre true.
   *
   * Cookies realmente esenciales no dependen
   * de consentimiento opcional.
   */
  readonly essential:
    true;

  readonly preferences:
    boolean;

  readonly analytics:
    boolean;

  readonly marketing:
    boolean;

  readonly socialMedia:
    boolean;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   COOKIE DEFINITION
   ============================================================ */

export type CookieDurationType =
  | "session"
  | "persistent";


export interface CookieDefinition {
  readonly name:
    string;

  readonly category:
    CookieCategory;

  readonly provider:
    string;

  readonly purpose:
    LocalizedTextValue;

  readonly durationType:
    CookieDurationType;

  readonly maximumAgeSeconds?:
    number;

  readonly thirdParty:
    boolean;
}


/* ============================================================
   LOCALIZED TEXT VALUE
   ============================================================ */

/**
 * Definición local para evitar convertir el contrato de
 * privacidad en contenido CMS.
 */

export type LocalizedTextValue =
  Readonly<
    Partial<
      Record<
        SupportedLocale,
        string
      >
    >
  >;


/* ============================================================
   PRIVACY SIGNALS
   ============================================================ */

/**
 * Señales del navegador como Global Privacy Control.
 *
 * La forma exacta de cumplimiento puede depender
 * de jurisdicción/política.
 */

export interface PrivacyBrowserSignals {
  readonly globalPrivacyControl:
    boolean;

  readonly doNotTrack?:
    boolean;
}


/* ============================================================
   COOKIE POLICY DECISION
   ============================================================ */

export interface CookieRuntimeDecision {
  readonly allowEssential:
    true;

  readonly allowPreferences:
    boolean;

  readonly allowAnalytics:
    boolean;

  readonly allowMarketing:
    boolean;

  readonly allowSocialMedia:
    boolean;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   PRIVACY NOTICE
   ============================================================ */

export type PrivacyNoticeStatus =
  | "draft"
  | "published"
  | "archived";


export type PrivacyNoticeType =
  | "privacy_policy"
  | "cookie_policy"
  | "community_privacy"
  | "loyalty_privacy"
  | "ai_privacy"
  | "marketing_privacy";


export interface PrivacyNotice {
  readonly id:
    PrivacyNoticeId;

  readonly type:
    PrivacyNoticeType;

  readonly status:
    PrivacyNoticeStatus;

  readonly pageId:
    PageId;

  readonly currentVersionId:
    PrivacyNoticeVersionId;

  readonly countryCodes:
    readonly CountryCode[];

  readonly locales:
    readonly SupportedLocale[];

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   PRIVACY NOTICE VERSION
   ============================================================ */

export interface PrivacyNoticeVersion {
  readonly id:
    PrivacyNoticeVersionId;

  readonly noticeId:
    PrivacyNoticeId;

  readonly version:
    number;

  readonly effectiveAt:
    IsoDateTime;

  readonly publishedAt:
    IsoDateTime;

  readonly publishedByUserId:
    UserId;

  readonly changeSummary?:
    string;
}


/* ============================================================
   MARKETING CHANNELS
   ============================================================ */

export type PrivacyMarketingChannel =
  | "email"
  | "sms"
  | "whatsapp"
  | "push";


/* ============================================================
   MARKETING PREFERENCES
   ============================================================ */

export interface PrivacyMarketingPreferences {
  readonly subjectId:
    PrivacySubjectId;

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
   AI PRIVACY PREFERENCES
   ============================================================ */

export interface AIPrivacyPreferences {
  readonly subjectId:
    PrivacySubjectId;

  /**
   * Permite conservar historial visible al usuario.
   */
  readonly retainConversationHistory:
    boolean;

  /**
   * Permite utilizar contexto previo dentro del
   * producto para personalización.
   */
  readonly personalization:
    boolean;

  /**
   * No significa autorización automática para
   * entrenamiento externo.
   *
   * Cualquier uso adicional requeriría política
   * y base jurídica propias.
   */
  readonly productImprovement:
    boolean;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   PROCESSING ACTIVITY
   ============================================================ */

/**
 * Registro de actividad de tratamiento.
 *
 * Útil para gobierno interno y documentación
 * de privacidad.
 */

export interface PrivacyProcessingActivity {
  readonly id:
    PrivacyProcessingActivityId;

  readonly name:
    string;

  readonly purposes:
    readonly PrivacyPurpose[];

  readonly lawfulBases:
    readonly PrivacyLawfulBasis[];

  readonly dataCategories:
    readonly PersonalDataCategory[];

  readonly subjectTypes:
    readonly PrivacySubjectType[];

  readonly processorIds:
    readonly PrivacyProcessorId[];

  readonly retentionRuleIds:
    readonly PrivacyRetentionRuleId[];

  readonly countries:
    readonly CountryCode[];

  readonly active:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   PROCESSORS
   ============================================================ */

export type PrivacyProcessorStatus =
  | "active"
  | "under_review"
  | "inactive";


export interface PrivacyProcessor {
  readonly id:
    PrivacyProcessorId;

  readonly name:
    string;

  readonly status:
    PrivacyProcessorStatus;

  readonly categories:
    readonly PersonalDataCategory[];

  readonly processingCountries:
    readonly CountryCode[];

  readonly transferIds:
    readonly PrivacyTransferId[];

  readonly agreementReference?:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   INTERNATIONAL TRANSFER
   ============================================================ */

export type PrivacyTransferMechanism =
  | "not_required"
  | "adequacy"
  | "standard_contractual_clauses"
  | "binding_corporate_rules"
  | "derogation"
  | "other";


export interface PrivacyTransfer {
  readonly id:
    PrivacyTransferId;

  readonly processorId:
    PrivacyProcessorId;

  readonly originCountries:
    readonly CountryCode[];

  readonly destinationCountries:
    readonly CountryCode[];

  readonly mechanism:
    PrivacyTransferMechanism;

  readonly documentationReference?:
    string;

  readonly active:
    boolean;

  readonly reviewedAt?:
    IsoDateTime;
}


/* ============================================================
   RETENTION
   ============================================================ */

export type PrivacyRetentionTrigger =
  | "record_created"
  | "last_activity"
  | "order_completed"
  | "reservation_completed"
  | "inquiry_closed"
  | "account_closed"
  | "consent_withdrawn"
  | "contract_ended"
  | "legal_requirement"
  | "manual_review";


export type PrivacyRetentionAction =
  | "delete"
  | "anonymize"
  | "archive"
  | "review";


export interface PrivacyRetentionRule {
  readonly id:
    PrivacyRetentionRuleId;

  readonly name:
    string;

  readonly dataCategories:
    readonly PersonalDataCategory[];

  readonly trigger:
    PrivacyRetentionTrigger;

  /**
   * Puede quedar undefined cuando el período
   * se determina por una obligación específica.
   */
  readonly retentionDays?:
    number;

  readonly action:
    PrivacyRetentionAction;

  readonly legalReason?:
    string;

  readonly countryCodes:
    readonly CountryCode[];

  readonly active:
    boolean;
}


/* ============================================================
   LEGAL HOLD
   ============================================================ */

export type PrivacyLegalHoldStatus =
  | "active"
  | "released";


export interface PrivacyLegalHold {
  readonly id:
    PrivacyLegalHoldId;

  readonly subjectId?:
    PrivacySubjectId;

  readonly dataCategories:
    readonly PersonalDataCategory[];

  readonly reason:
    string;

  readonly status:
    PrivacyLegalHoldStatus;

  readonly createdByUserId:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly releasedByUserId?:
    UserId;

  readonly releasedAt?:
    IsoDateTime;
}


/* ============================================================
   DATA SUBJECT RIGHTS
   ============================================================ */

export type PrivacyRightType =
  | "access"
  | "rectification"
  | "erasure"
  | "restriction"
  | "objection"
  | "portability"
  | "withdraw_consent";


/* ============================================================
   REQUEST STATUS
   ============================================================ */

export type PrivacyRequestStatus =
  | "submitted"
  | "identity_verification"
  | "accepted"
  | "in_progress"
  | "partially_completed"
  | "completed"
  | "rejected"
  | "cancelled";


/* ============================================================
   IDENTITY VERIFICATION
   ============================================================ */

export type PrivacyIdentityVerificationMethod =
  | "authenticated_session"
  | "email"
  | "phone"
  | "manual"
  | "other";


export type PrivacyIdentityVerificationStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "failed";


export interface PrivacyIdentityVerification {
  readonly method:
    PrivacyIdentityVerificationMethod;

  readonly status:
    PrivacyIdentityVerificationStatus;

  readonly verifiedAt?:
    IsoDateTime;

  readonly verifiedByUserId?:
    UserId;
}


/* ============================================================
   DATA SUBJECT REQUEST
   ============================================================ */

export interface PrivacyRequest {
  readonly id:
    PrivacyRequestId;

  readonly subjectId:
    PrivacySubjectId;

  readonly right:
    PrivacyRightType;

  readonly status:
    PrivacyRequestStatus;

  readonly countryCode?:
    CountryCode;

  readonly locale:
    SupportedLocale;

  readonly verification:
    PrivacyIdentityVerification;

  readonly description?:
    string;

  readonly submittedAt:
    IsoDateTime;

  readonly dueAt?:
    IsoDateTime;

  readonly acceptedAt?:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly rejectedAt?:
    IsoDateTime;

  readonly rejectionReason?:
    string;

  readonly assignedToUserId?:
    UserId;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   ERASURE EXCEPTIONS
   ============================================================ */

/**
 * Razones por las que parte de los datos
 * puede legítimamente no borrarse inmediatamente.
 *
 * La determinación concreta debe hacerse
 * conforme a la jurisdicción aplicable.
 */

export type PrivacyErasureException =
  | "legal_obligation"
  | "accounting_requirement"
  | "active_contract"
  | "fraud_prevention"
  | "security"
  | "legal_claim"
  | "legal_hold"
  | "other";


export interface PrivacyErasureDecision {
  readonly requestId:
    PrivacyRequestId;

  readonly canFullyErase:
    boolean;

  readonly exceptions:
    readonly PrivacyErasureException[];

  readonly dataCategoriesRetained:
    readonly PersonalDataCategory[];

  readonly dataCategoriesErasable:
    readonly PersonalDataCategory[];

  readonly decidedAt:
    IsoDateTime;

  readonly decidedByUserId?:
    UserId;
}


/* ============================================================
   EXPORT
   ============================================================ */

export type PrivacyExportStatus =
  | "queued"
  | "processing"
  | "ready"
  | "failed"
  | "expired";


export type PrivacyExportFormat =
  | "json"
  | "zip";


export interface PrivacyExport {
  readonly id:
    PrivacyExportId;

  readonly privacyRequestId:
    PrivacyRequestId;

  readonly subjectId:
    PrivacySubjectId;

  readonly format:
    PrivacyExportFormat;

  readonly status:
    PrivacyExportStatus;

  /**
   * Referencia interna.
   *
   * No es una URL pública permanente.
   */
  readonly storageReference?:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   DELETION / ANONYMIZATION
   ============================================================ */

export type PrivacyDeletionJobStatus =
  | "queued"
  | "running"
  | "partially_completed"
  | "completed"
  | "failed";


export interface PrivacyDeletionDomainResult {
  readonly domain:
    string;

  readonly action:
    "deleted"
    | "anonymized"
    | "retained"
    | "failed";

  readonly recordsAffected:
    number;

  readonly reason?:
    string;
}


export interface PrivacyDeletionJob {
  readonly id:
    PrivacyDeletionJobId;

  readonly privacyRequestId:
    PrivacyRequestId;

  readonly subjectId:
    PrivacySubjectId;

  readonly status:
    PrivacyDeletionJobStatus;

  readonly results:
    readonly PrivacyDeletionDomainResult[];

  readonly createdAt:
    IsoDateTime;

  readonly startedAt?:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly errorCode?:
    string;
}


/* ============================================================
   MINOR / AGE ASSURANCE
   ============================================================ */

/**
 * No hardcodeamos una edad universal.
 *
 * La edad mínima y requisitos de consentimiento
 * dependen de la jurisdicción aplicable.
 */

export type PrivacyAgeAssuranceStatus =
  | "unknown"
  | "self_declared"
  | "verified"
  | "guardian_verified";


export interface PrivacyAgeAssurance {
  readonly subjectId:
    PrivacySubjectId;

  readonly status:
    PrivacyAgeAssuranceStatus;

  readonly declaredAgeBand?:
    "child"
    | "teen"
    | "adult";

  readonly verifiedAt?:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   MINOR POLICY
   ============================================================ */

export interface PrivacyMinorPolicy {
  readonly countryCode:
    CountryCode;

  /**
   * Se configura por jurisdicción.
   *
   * No asumir una cifra global.
   */
  readonly minimumAgeWithoutGuardianConsent:
    number;

  readonly communityPostingRequiresGuardianConsent:
    boolean;

  readonly targetedMarketingAllowedForMinors:
    boolean;

  readonly personalizationAllowedForMinors:
    boolean;

  readonly active:
    boolean;
}


/* ============================================================
   GUARDIAN CONSENT
   ============================================================ */

export type PrivacyGuardianConsentStatus =
  | "pending"
  | "verified"
  | "withdrawn"
  | "expired";


export interface PrivacyGuardianConsent {
  readonly id:
    PrivacyGuardianConsentId;

  readonly subjectId:
    PrivacySubjectId;

  readonly status:
    PrivacyGuardianConsentStatus;

  readonly purposes:
    readonly PrivacyPurpose[];

  /**
   * Referencia segura a evidencia/verificación.
   *
   * No guardar documentos sensibles directamente
   * en este objeto.
   */
  readonly verificationReference?:
    string;

  readonly grantedAt?:
    IsoDateTime;

  readonly withdrawnAt?:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   DATA MINIMIZATION
   ============================================================ */

export interface PrivacyDataMinimizationPolicy {
  readonly purpose:
    PrivacyPurpose;

  readonly allowedCategories:
    readonly PersonalDataCategory[];

  readonly prohibitedCategories:
    readonly PersonalDataCategory[];

  readonly reviewedAt:
    IsoDateTime;
}


/* ============================================================
   PRIVACY RUNTIME CONTEXT
   ============================================================ */

export interface PrivacyRuntimeContext {
  readonly subjectId?:
    PrivacySubjectId;

  readonly countryCode?:
    CountryCode;

  readonly locale:
    SupportedLocale;

  readonly authenticated:
    boolean;

  readonly browserSignals:
    PrivacyBrowserSignals;
}


/* ============================================================
   PROCESSING DECISION
   ============================================================ */

export interface PrivacyProcessingDecision {
  readonly allowed:
    boolean;

  readonly purpose:
    PrivacyPurpose;

  readonly lawfulBasis?:
    PrivacyLawfulBasis;

  readonly reason:
    | "consent_granted"
    | "consent_missing"
    | "consent_withdrawn"
    | "contract"
    | "legal_obligation"
    | "legitimate_interest"
    | "minor_restriction"
    | "policy"
    | "not_applicable";
}


/* ============================================================
   PRIVACY ADMIN QUERY
   ============================================================ */

export interface PrivacyRequestQuery {
  readonly status?:
    PrivacyRequestStatus;

  readonly right?:
    PrivacyRightType;

  readonly countryCode?:
    CountryCode;

  readonly assignedToUserId?:
    UserId;

  readonly submittedFrom?:
    IsoDateTime;

  readonly submittedUntil?:
    IsoDateTime;

  readonly cursor?:
    string;

  readonly limit?:
    number;
}


/* ============================================================
   RESTAURANT-SPECIFIC PRIVACY REFERENCE
   ============================================================ */

/**
 * Algunas operaciones físicas pueden estar relacionadas
 * con una sede específica.
 */

export interface PrivacyRestaurantContext {
  readonly restaurantId:
    RestaurantId;

  readonly countryCode:
    CountryCode;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type PrivacyErrorCode =
  | "SUBJECT_NOT_FOUND"
  | "CONSENT_NOT_FOUND"
  | "CONSENT_REQUIRED"
  | "CONSENT_WITHDRAWN"
  | "NOTICE_NOT_FOUND"
  | "NOTICE_VERSION_NOT_FOUND"
  | "PRIVACY_REQUEST_NOT_FOUND"
  | "IDENTITY_VERIFICATION_REQUIRED"
  | "IDENTITY_VERIFICATION_FAILED"
  | "REQUEST_ALREADY_COMPLETED"
  | "ERASURE_RESTRICTED"
  | "LEGAL_HOLD_ACTIVE"
  | "EXPORT_FAILED"
  | "DELETION_FAILED"
  | "GUARDIAN_CONSENT_REQUIRED"
  | "MINOR_RESTRICTION"
  | "PROCESSING_NOT_ALLOWED"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface PrivacyDomainError {
  readonly code:
    PrivacyErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   HELPERS — CONSENT
   ============================================================ */

export function isConsentGranted(
  snapshot:
    PrivacyConsentSnapshot,
  purpose:
    PrivacyPurpose,
): boolean {
  return (
    snapshot.purposes[
      purpose
    ] === "granted"
  );
}


/* ============================================================
   HELPERS — OPTIONAL COOKIES
   ============================================================ */

export function isOptionalCookieCategory(
  category:
    CookieCategory,
): boolean {
  return (
    category !== "essential"
  );
}


/* ============================================================
   HELPERS — COOKIE DECISION
   ============================================================ */

export function buildCookieRuntimeDecision(
  preferences:
    CookieConsentPreferences,
  signals:
    PrivacyBrowserSignals,
): CookieRuntimeDecision {
  /**
   * GPC se utiliza aquí como señal conservadora
   * para marketing/social.
   *
   * La política concreta puede ampliarse
   * por jurisdicción.
   */
  const externalMarketingAllowed =
    !signals.globalPrivacyControl;

  return {
    allowEssential:
      true,

    allowPreferences:
      preferences.preferences,

    allowAnalytics:
      preferences.analytics,

    allowMarketing:
      (
        preferences.marketing &&
        externalMarketingAllowed
      ),

    allowSocialMedia:
      (
        preferences.socialMedia &&
        externalMarketingAllowed
      ),

    generatedAt:
      new Date()
        .toISOString(),
  };
}


/* ============================================================
   HELPERS — MARKETING
   ============================================================ */

export function canSendMarketingViaChannel(
  preferences:
    PrivacyMarketingPreferences,
  channel:
    PrivacyMarketingChannel,
): boolean {
  switch (channel) {
    case "email":
      return preferences.email;

    case "sms":
      return preferences.sms;

    case "whatsapp":
      return preferences.whatsapp;

    case "push":
      return preferences.push;
  }
}


/* ============================================================
   HELPERS — REQUESTS
   ============================================================ */

export function isPrivacyRequestOpen(
  request:
    PrivacyRequest,
): boolean {
  return (
    request.status ===
      "submitted" ||
    request.status ===
      "identity_verification" ||
    request.status ===
      "accepted" ||
    request.status ===
      "in_progress" ||
    request.status ===
      "partially_completed"
  );
}


/* ============================================================
   HELPERS — NOTICE
   ============================================================ */

export function isPrivacyNoticePublished(
  notice:
    PrivacyNotice,
): boolean {
  return (
    notice.status ===
    "published"
  );
}


/* ============================================================
   HELPERS — RETENTION
   ============================================================ */

export function isRetentionPeriodElapsed(
  triggerAt:
    IsoDateTime,
  retentionDays:
    number,
  now = new Date(),
): boolean {
  if (
    retentionDays < 0
  ) {
    return false;
  }

  const triggerTime =
    new Date(
      triggerAt,
    ).getTime();

  if (
    !Number.isFinite(
      triggerTime,
    )
  ) {
    return false;
  }

  const retentionMs =
    retentionDays *
    24 *
    60 *
    60 *
    1000;

  return (
    now.getTime() >=
    triggerTime +
      retentionMs
  );
}


/* ============================================================
   HELPERS — MINORS
   ============================================================ */

export function requiresGuardianConsent(
  age:
    number,
  policy:
    PrivacyMinorPolicy,
): boolean {
  return (
    age <
    policy
      .minimumAgeWithoutGuardianConsent
  );
}


/* ============================================================
   HELPERS — PROCESSING
   ============================================================ */

export function canProcessWithConsent(
  snapshot:
    PrivacyConsentSnapshot,
  purpose:
    PrivacyPurpose,
): PrivacyProcessingDecision {
  const status =
    snapshot.purposes[
      purpose
    ];

  if (
    status === "granted"
  ) {
    return {
      allowed:
        true,

      purpose,

      lawfulBasis:
        "consent",

      reason:
        "consent_granted",
    };
  }

  if (
    status === "withdrawn"
  ) {
    return {
      allowed:
        false,

      purpose,

      reason:
        "consent_withdrawn",
    };
  }

  return {
    allowed:
      false,

    purpose,

    reason:
      "consent_missing",
  };
}
