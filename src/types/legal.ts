/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Legal, Terms & Compliance Domain
 * ============================================================
 *
 * Sistema central de documentación legal y cumplimiento.
 *
 * Preparado para:
 *
 * - términos y condiciones
 * - comercio electrónico
 * - consumidores
 * - privacidad
 * - cookies
 * - comunidad
 * - moderación
 * - loyalty
 * - referidos
 * - promociones
 * - delivery
 * - reservas
 * - catering
 * - IA
 * - accesibilidad
 * - reclamaciones
 * - información empresarial
 * - expansión internacional
 *
 * PRINCIPIOS:
 *
 * 1. No existe un único "reglamento mundial".
 * 2. Cada jurisdicción puede tener requisitos diferentes.
 * 3. Los textos legales deben versionarse.
 * 4. Producción utiliza únicamente versiones publicadas.
 * 5. Debemos conservar qué versión aceptó un usuario.
 * 6. Aceptación de términos != consentimiento de marketing.
 * 7. Privacidad se mantiene en privacy.ts.
 * 8. Los textos viven en CMS; legal.ts gobierna su validez.
 * 9. Las reglas comerciales viven en sus dominios respectivos.
 * 10. Los textos legales finales pueden requerir
 *     revisión jurídica profesional.
 */

import type {
  CountryCode,
  IsoDateTime,
  LocalizedText,
  Money,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  PageId,
} from "@/types/content";

import type {
  RestaurantId,
} from "@/types/restaurant";

import type {
  CustomerId,
} from "@/types/customer";

import type {
  OrderId,
} from "@/types/order";

import type {
  AuthSessionId,
  AuthUserId,
} from "@/types/auth";

import type {
  CommunityProfileId,
} from "@/types/community";

import type {
  LoyaltyProgramId,
  ReferralCampaignId,
} from "@/types/loyalty";

import type {
  AIAssistantId,
} from "@/types/ai";

import type {
  PrivacyLegalRegion,
  PrivacyNoticeId,
  PrivacyNoticeVersionId,
  PrivacyPurpose,
} from "@/types/privacy";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type LegalDocumentId =
  string;

export type LegalDocumentVersionId =
  string;

export type LegalAcceptanceId =
  string;

export type LegalFrameworkId =
  string;

export type LegalAssessmentId =
  string;

export type LegalPublicationBundleId =
  string;

export type LegalDisclosureId =
  string;

export type LegalModerationNoticeId =
  string;


/* ============================================================
   JURISDICTION
   ============================================================ */

export type LegalScope =
  | {
      readonly type:
        "global";
    }
  | {
      readonly type:
        "region";

      readonly legalRegion:
        PrivacyLegalRegion;
    }
  | {
      readonly type:
        "country";

      readonly countryCode:
        CountryCode;
    }
  | {
      readonly type:
        "restaurant";

      readonly restaurantId:
        RestaurantId;

      readonly countryCode:
        CountryCode;
    };


/* ============================================================
   AUDIENCE
   ============================================================ */

export type LegalAudience =
  | "visitor"
  | "consumer"
  | "customer"
  | "business_customer"
  | "community_member"
  | "loyalty_member"
  | "referral_participant"
  | "staff"
  | "admin";


/* ============================================================
   DOCUMENT TYPES
   ============================================================ */

export type LegalDocumentType =
  | "terms_of_service"
  | "sales_terms"
  | "consumer_information"
  | "privacy_policy"
  | "cookie_policy"
  | "community_terms"
  | "community_guidelines"
  | "moderation_policy"
  | "loyalty_terms"
  | "referral_terms"
  | "promotion_terms"
  | "delivery_terms"
  | "reservation_terms"
  | "catering_terms"
  | "bakery_terms"
  | "ai_transparency_notice"
  | "accessibility_statement"
  | "complaint_policy"
  | "withdrawal_information"
  | "business_information"
  | "other";


/* ============================================================
   DOCUMENT STATUS
   ============================================================ */

export type LegalDocumentStatus =
  | "draft"
  | "active"
  | "archived";


/* ============================================================
   DOCUMENT
   ============================================================ */

export interface LegalDocument {
  readonly id:
    LegalDocumentId;

  readonly type:
    LegalDocumentType;

  readonly name:
    string;

  readonly status:
    LegalDocumentStatus;

  readonly scopes:
    readonly LegalScope[];

  readonly audiences:
    readonly LegalAudience[];

  readonly currentVersionId?:
    LegalDocumentVersionId;

  /**
   * Cuando el documento corresponde directamente
   * a un PrivacyNotice.
   */
  readonly privacyNoticeId?:
    PrivacyNoticeId;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   VERSION STATUS
   ============================================================ */

export type LegalVersionStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "published"
  | "superseded"
  | "archived";


/* ============================================================
   PROFESSIONAL REVIEW
   ============================================================ */

export type LegalReviewStatus =
  | "not_requested"
  | "pending"
  | "changes_requested"
  | "approved";


export interface LegalProfessionalReview {
  readonly status:
    LegalReviewStatus;

  /**
   * Identificador/referencia interna.
   *
   * No exige publicar datos personales
   * del profesional.
   */
  readonly reviewerReference?:
    string;

  readonly reviewedAt?:
    IsoDateTime;

  readonly nextReviewAt?:
    IsoDateTime;

  readonly notes?:
    string;
}


/* ============================================================
   ACCEPTANCE REQUIREMENT
   ============================================================ */

export type LegalAcceptanceRequirement =
  | "none"
  | "acknowledgement"
  | "explicit_acceptance";


/* ============================================================
   DOCUMENT VERSION
   ============================================================ */

/**
 * El contenido completo permanece en CMS.
 *
 * Esta estructura conserva:
 *
 * - qué contenido/version fue publicado
 * - cuándo entró en vigor
 * - si requiere nueva aceptación
 * - evidencia de integridad
 */

export interface LegalDocumentVersion {
  readonly id:
    LegalDocumentVersionId;

  readonly documentId:
    LegalDocumentId;

  readonly version:
    number;

  readonly status:
    LegalVersionStatus;

  readonly locale:
    SupportedLocale;

  readonly pageId:
    PageId;

  readonly acceptanceRequirement:
    LegalAcceptanceRequirement;

  readonly requiresReacceptance:
    boolean;

  readonly contentChecksumSha256:
    string;

  readonly effectiveAt:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;

  readonly supersedesVersionId?:
    LegalDocumentVersionId;

  readonly privacyNoticeVersionId?:
    PrivacyNoticeVersionId;

  readonly review:
    LegalProfessionalReview;

  readonly changeSummary?:
    string;

  readonly createdByUserId:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly approvedByUserId?:
    UserId;

  readonly approvedAt?:
    IsoDateTime;

  readonly publishedByUserId?:
    UserId;

  readonly publishedAt?:
    IsoDateTime;
}


/* ============================================================
   LEGAL SURFACES
   ============================================================ */

export type LegalSurface =
  | "footer"
  | "registration"
  | "login"
  | "checkout"
  | "reservation"
  | "inquiry"
  | "community_signup"
  | "community_posting"
  | "loyalty_join"
  | "referral"
  | "promotion"
  | "ai_chat"
  | "account"
  | "cookie_banner";


/* ============================================================
   LEGAL LINK
   ============================================================ */

export interface LegalDocumentLink {
  readonly documentId:
    LegalDocumentId;

  readonly versionId:
    LegalDocumentVersionId;

  readonly label:
    LocalizedText;

  readonly path:
    string;

  readonly surfaces:
    readonly LegalSurface[];

  readonly required:
    boolean;

  readonly sortOrder:
    number;
}


/* ============================================================
   ACCEPTANCE SUBJECT
   ============================================================ */

export interface LegalAcceptanceSubject {
  readonly authUserId?:
    AuthUserId;

  readonly customerId?:
    CustomerId;

  readonly communityProfileId?:
    CommunityProfileId;
}


/* ============================================================
   ACCEPTANCE ACTION
   ============================================================ */

export type LegalAcceptanceAction =
  | "accepted"
  | "acknowledged"
  | "declined";


/* ============================================================
   ACCEPTANCE METHOD
   ============================================================ */

export type LegalAcceptanceMethod =
  | "checkbox"
  | "registration"
  | "checkout"
  | "community_signup"
  | "loyalty_join"
  | "referral_join"
  | "button"
  | "admin"
  | "other";


/* ============================================================
   ACCEPTANCE EVIDENCE
   ============================================================ */

export interface LegalAcceptanceEvidence {
  readonly locale:
    SupportedLocale;

  readonly surface:
    LegalSurface;

  readonly method:
    LegalAcceptanceMethod;

  readonly sessionId?:
    AuthSessionId;

  readonly requestId?:
    RequestId;

  readonly ipHash?:
    string;

  readonly userAgent?:
    string;
}


/* ============================================================
   ACCEPTANCE RECORD
   ============================================================ */

/**
 * Append-only.
 *
 * No sobreescribimos qué versión fue aceptada.
 */

export interface LegalAcceptanceRecord {
  readonly id:
    LegalAcceptanceId;

  readonly documentId:
    LegalDocumentId;

  readonly versionId:
    LegalDocumentVersionId;

  readonly subject:
    LegalAcceptanceSubject;

  readonly action:
    LegalAcceptanceAction;

  readonly evidence:
    LegalAcceptanceEvidence;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   REACCEPTANCE
   ============================================================ */

export interface LegalReacceptanceRequirement {
  readonly documentId:
    LegalDocumentId;

  readonly previousVersionId?:
    LegalDocumentVersionId;

  readonly requiredVersionId:
    LegalDocumentVersionId;

  readonly required:
    boolean;

  readonly reason?:
    string;

  readonly effectiveAt:
    IsoDateTime;
}


/* ============================================================
   BUSINESS IDENTITY
   ============================================================ */

/**
 * Datos visibles jurídicamente relevantes de la empresa.
 *
 * Sus valores vendrán de configuración segura/CMS.
 */

export interface LegalBusinessIdentity {
  readonly legalName:
    string;

  readonly tradingName:
    string;

  readonly countryCode:
    CountryCode;

  readonly registeredAddress:
    string;

  readonly registrationNumber?:
    string;

  readonly taxNumber?:
    string;

  readonly vatNumber?:
    string;

  readonly registryCourt?:
    string;

  readonly email:
    string;

  readonly phone?:
    string;
}


/* ============================================================
   BUSINESS DISCLOSURE
   ============================================================ */

export interface LegalBusinessDisclosure {
  readonly id:
    LegalDisclosureId;

  readonly identity:
    LegalBusinessIdentity;

  readonly restaurantIds:
    readonly RestaurantId[];

  readonly locale:
    SupportedLocale;

  readonly active:
    boolean;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   CONSUMER INFORMATION
   ============================================================ */

export interface ConsumerContractInformation {
  readonly merchantIdentityProvided:
    boolean;

  readonly mainCharacteristicsProvided:
    boolean;

  readonly totalPriceProvided:
    boolean;

  readonly taxesIncludedWhereRequired:
    boolean;

  readonly additionalChargesDisclosed:
    boolean;

  readonly deliveryRestrictionsProvided:
    boolean;

  readonly paymentMethodsProvided:
    boolean;

  readonly complaintProcedureProvided:
    boolean;

  readonly withdrawalInformationProvided:
    boolean;

  readonly contractLanguageProvided:
    boolean;

  readonly termsAvailableBeforePurchase:
    boolean;
}


/* ============================================================
   CHECKOUT LEGAL SNAPSHOT
   ============================================================ */

/**
 * Evidencia de las condiciones jurídicas
 * mostradas en un checkout concreto.
 */

export interface CheckoutLegalSnapshot {
  readonly orderId?:
    OrderId;

  readonly customerId?:
    CustomerId;

  readonly locale:
    SupportedLocale;

  readonly restaurantId:
    RestaurantId;

  readonly termsVersionIds:
    readonly LegalDocumentVersionId[];

  readonly total:
    Money;

  readonly consumerInformation:
    ConsumerContractInformation;

  readonly capturedAt:
    IsoDateTime;

  readonly requestId:
    RequestId;
}


/* ============================================================
   COMPLAINTS
   ============================================================ */

export type LegalComplaintChannel =
  | "web"
  | "email"
  | "phone"
  | "in_person"
  | "postal"
  | "other";


export interface LegalComplaintPolicy {
  readonly documentVersionId:
    LegalDocumentVersionId;

  readonly channels:
    readonly LegalComplaintChannel[];

  readonly responseTargetDays?:
    number;

  readonly escalationAvailable:
    boolean;

  readonly locale:
    SupportedLocale;
}


/* ============================================================
   WITHDRAWAL / CANCELLATION
   ============================================================ */

/**
 * NO codificamos una única regla universal.
 *
 * La aplicabilidad real depende de:
 *
 * - producto/servicio
 * - momento de ejecución
 * - jurisdicción
 * - excepciones legales
 */

export type LegalWithdrawalApplicability =
  | "available"
  | "not_available"
  | "conditional"
  | "requires_review";


export interface LegalWithdrawalRule {
  readonly documentVersionId:
    LegalDocumentVersionId;

  readonly applicability:
    LegalWithdrawalApplicability;

  readonly withdrawalDays?:
    number;

  readonly explanation:
    LocalizedText;

  readonly legalFrameworkIds:
    readonly LegalFrameworkId[];
}


/* ============================================================
   COMMUNITY / DSA SUPPORT
   ============================================================ */

export interface CommunityLegalConfiguration {
  readonly termsVersionId:
    LegalDocumentVersionId;

  readonly guidelinesVersionId:
    LegalDocumentVersionId;

  readonly moderationPolicyVersionId:
    LegalDocumentVersionId;

  readonly reportingAvailable:
    boolean;

  readonly appealAvailable:
    boolean;

  readonly moderationReasonsVisible:
    boolean;

  readonly automatedModerationDisclosure:
    boolean;
}


/* ============================================================
   MODERATION NOTICE
   ============================================================ */

export type LegalModerationAction =
  | "content_restricted"
  | "content_removed"
  | "account_restricted"
  | "account_suspended"
  | "account_terminated";


export interface LegalModerationNotice {
  readonly id:
    LegalModerationNoticeId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly contentId?:
    string;

  readonly action:
    LegalModerationAction;

  readonly reason:
    string;

  readonly ruleReference?:
    string;

  readonly automatedDecision:
    boolean;

  readonly appealAvailable:
    boolean;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   LOYALTY TERMS
   ============================================================ */

export interface LoyaltyLegalConfiguration {
  readonly loyaltyProgramId:
    LoyaltyProgramId;

  readonly termsVersionId:
    LegalDocumentVersionId;

  readonly pointsHaveCashValue:
    boolean;

  readonly expirationRulesDisclosed:
    boolean;

  readonly redemptionRulesDisclosed:
    boolean;

  readonly suspensionRulesDisclosed:
    boolean;
}


/* ============================================================
   REFERRAL TERMS
   ============================================================ */

/**
 * La compra mínima (por ejemplo 80 PLN)
 * continúa perteneciendo a ReferralCampaign.
 *
 * Aquí enlazamos la campaña con sus términos publicados.
 */

export interface ReferralLegalConfiguration {
  readonly campaignId:
    ReferralCampaignId;

  readonly termsVersionId:
    LegalDocumentVersionId;

  readonly qualifyingPurchaseRulesDisclosed:
    boolean;

  readonly rewardRulesDisclosed:
    boolean;

  readonly antiAbuseRulesDisclosed:
    boolean;

  readonly expirationRulesDisclosed:
    boolean;
}


/* ============================================================
   AI TRANSPARENCY
   ============================================================ */

export interface AILegalTransparencyConfiguration {
  readonly assistantId:
    AIAssistantId;

  readonly noticeVersionId:
    LegalDocumentVersionId;

  /**
   * La interfaz debe identificar claramente
   * que el usuario interactúa con IA cuando
   * corresponda.
   */
  readonly identifyAsAI:
    boolean;

  readonly humanHandoffAvailable:
    boolean;

  readonly limitationsDisclosed:
    boolean;

  readonly privacyNoticeLinked:
    boolean;

  readonly locale:
    SupportedLocale;
}


/* ============================================================
   ACCESSIBILITY
   ============================================================ */

export type AccessibilityConformanceStatus =
  | "not_assessed"
  | "conformant"
  | "partially_conformant"
  | "not_conformant";


export interface LegalAccessibilityStatement {
  readonly documentVersionId:
    LegalDocumentVersionId;

  readonly status:
    AccessibilityConformanceStatus;

  /**
   * Ejemplo:
   *
   * WCAG 2.x AA
   *
   * El estándar concreto se configura y revisa,
   * no se presume automáticamente.
   */
  readonly standardReference?:
    string;

  readonly knownLimitations:
    readonly string[];

  readonly feedbackPath:
    string;

  readonly lastAssessmentAt?:
    IsoDateTime;

  readonly nextAssessmentAt?:
    IsoDateTime;
}


/* ============================================================
   COOKIE LEGAL CONFIGURATION
   ============================================================ */

/**
 * privacy.ts contiene la lógica de consentimiento.
 *
 * legal.ts gobierna las versiones de la documentación
 * y requisitos de presentación.
 */

export interface LegalCookieConfiguration {
  readonly cookiePolicyVersionId:
    LegalDocumentVersionId;

  readonly privacyNoticeVersionId:
    PrivacyNoticeVersionId;

  readonly optionalStorageRequiresDecision:
    boolean;

  readonly rejectOptionalAvailable:
    boolean;

  readonly granularSettingsAvailable:
    boolean;

  readonly withdrawalAccessible:
    boolean;

  readonly preferencesPersisted:
    boolean;
}


/* ============================================================
   CONSENT DISCLOSURE
   ============================================================ */

export interface LegalConsentDisclosure {
  readonly purpose:
    PrivacyPurpose;

  readonly description:
    LocalizedText;

  readonly optional:
    boolean;

  readonly withdrawalInstructionsProvided:
    boolean;
}


/* ============================================================
   CORE LEGAL FRAMEWORK KEYS
   ============================================================ */

/**
 * Registry operativo.
 *
 * NO sustituye el texto oficial de cada norma.
 */

export type CoreLegalFrameworkKey =
  | "eu.gdpr"
  | "eu.digital_services_act"
  | "eu.ai_act"
  | "eu.accessibility_act"
  | "poland.consumer_rights"
  | "poland.electronic_services"
  | "poland.electronic_communications"
  | "poland.accessibility"
  | "poland.price_information";


export type CustomLegalFrameworkKey =
  `custom.${string}`;


export type LegalFrameworkKey =
  | CoreLegalFrameworkKey
  | CustomLegalFrameworkKey;


/* ============================================================
   COMPLIANCE AREAS
   ============================================================ */

export type LegalComplianceArea =
  | "privacy"
  | "cookies"
  | "consumer"
  | "ecommerce"
  | "pricing"
  | "community"
  | "moderation"
  | "ai"
  | "accessibility"
  | "marketing"
  | "loyalty"
  | "referral"
  | "payments"
  | "other";


/* ============================================================
   LEGAL FRAMEWORK REFERENCE
   ============================================================ */

export interface LegalFrameworkReference {
  readonly id:
    LegalFrameworkId;

  readonly key:
    LegalFrameworkKey;

  readonly title:
    string;

  readonly jurisdiction:
    LegalScope;

  readonly areas:
    readonly LegalComplianceArea[];

  /**
   * Preferentemente fuente oficial.
   */
  readonly officialSourceUrl:
    string;

  readonly effectiveFrom?:
    IsoDateTime;

  readonly effectiveUntil?:
    IsoDateTime;

  readonly active:
    boolean;

  readonly lastReviewedAt:
    IsoDateTime;

  readonly nextReviewAt?:
    IsoDateTime;
}


/* ============================================================
   APPLICABILITY ASSESSMENT
   ============================================================ */

export type LegalApplicabilityStatus =
  | "not_assessed"
  | "applicable"
  | "partially_applicable"
  | "not_applicable"
  | "requires_legal_review";


export type LegalComplianceStatus =
  | "unknown"
  | "compliant"
  | "partially_compliant"
  | "remediation_required"
  | "not_applicable";


export interface LegalApplicabilityAssessment {
  readonly id:
    LegalAssessmentId;

  readonly frameworkId:
    LegalFrameworkId;

  readonly scope:
    LegalScope;

  readonly applicability:
    LegalApplicabilityStatus;

  readonly compliance:
    LegalComplianceStatus;

  readonly reasoning:
    string;

  readonly remediationNotes?:
    string;

  readonly assessedByUserId?:
    UserId;

  readonly assessedAt:
    IsoDateTime;

  readonly nextReviewAt?:
    IsoDateTime;
}


/* ============================================================
   PUBLICATION BUNDLE
   ============================================================ */

/**
 * Conjunto legal mínimo publicado para una
 * jurisdicción e idioma.
 */

export interface LegalPublicationBundle {
  readonly id:
    LegalPublicationBundleId;

  readonly scope:
    LegalScope;

  readonly locale:
    SupportedLocale;

  readonly versionIds:
    readonly LegalDocumentVersionId[];

  readonly active:
    boolean;

  readonly publishedAt:
    IsoDateTime;

  readonly publishedByUserId:
    UserId;
}


/* ============================================================
   REQUIRED DOCUMENT SET
   ============================================================ */

export interface LegalRequiredDocumentSet {
  readonly scope:
    LegalScope;

  readonly audience:
    LegalAudience;

  readonly surface:
    LegalSurface;

  readonly requiredTypes:
    readonly LegalDocumentType[];
}


/* ============================================================
   LEGAL PAGE DIRECTORY
   ============================================================ */

export interface PublicLegalDirectory {
  readonly locale:
    SupportedLocale;

  readonly scope:
    LegalScope;

  readonly links:
    readonly LegalDocumentLink[];

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   CREATE VERSION REQUEST
   ============================================================ */

export interface CreateLegalDocumentVersionRequest {
  readonly documentId:
    LegalDocumentId;

  readonly locale:
    SupportedLocale;

  readonly pageId:
    PageId;

  readonly acceptanceRequirement:
    LegalAcceptanceRequirement;

  readonly requiresReacceptance:
    boolean;

  readonly effectiveAt:
    IsoDateTime;

  readonly changeSummary?:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   PUBLISH VERSION REQUEST
   ============================================================ */

export interface PublishLegalDocumentVersionRequest {
  readonly versionId:
    LegalDocumentVersionId;

  readonly reason:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   RECORD ACCEPTANCE REQUEST
   ============================================================ */

export interface RecordLegalAcceptanceRequest {
  readonly documentId:
    LegalDocumentId;

  readonly versionId:
    LegalDocumentVersionId;

  readonly subject:
    LegalAcceptanceSubject;

  readonly action:
    LegalAcceptanceAction;

  readonly evidence:
    LegalAcceptanceEvidence;

  readonly requestId:
    RequestId;
}


/* ============================================================
   QUERY
   ============================================================ */

export interface LegalDocumentQuery {
  readonly type?:
    LegalDocumentType;

  readonly status?:
    LegalDocumentStatus;

  readonly locale?:
    SupportedLocale;

  readonly countryCode?:
    CountryCode;

  readonly audience?:
    LegalAudience;

  readonly cursor?:
    string;

  readonly limit?:
    number;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type LegalErrorCode =
  | "DOCUMENT_NOT_FOUND"
  | "VERSION_NOT_FOUND"
  | "VERSION_NOT_PUBLISHED"
  | "VERSION_NOT_EFFECTIVE"
  | "VERSION_EXPIRED"
  | "LEGAL_REVIEW_REQUIRED"
  | "ACCEPTANCE_REQUIRED"
  | "ACCEPTANCE_NOT_FOUND"
  | "REACCEPTANCE_REQUIRED"
  | "DOCUMENT_SET_INCOMPLETE"
  | "JURISDICTION_NOT_SUPPORTED"
  | "FRAMEWORK_NOT_FOUND"
  | "COMPLIANCE_REVIEW_REQUIRED"
  | "INVALID_SCOPE"
  | "INVALID_PUBLICATION"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "UNKNOWN";


export interface LegalDomainError {
  readonly code:
    LegalErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   HELPERS — VERSION EFFECTIVE
   ============================================================ */

export function isLegalVersionEffective(
  version: LegalDocumentVersion,
  now = new Date(),
): boolean {
  if (
    version.status !== "published"
  ) {
    return false;
  }

  const nowTime =
    now.getTime();

  const effectiveTime =
    new Date(
      version.effectiveAt,
    ).getTime();

  if (
    !Number.isFinite(
      effectiveTime,
    ) ||
    effectiveTime > nowTime
  ) {
    return false;
  }

  if (
    version.expiresAt
  ) {
    const expiryTime =
      new Date(
        version.expiresAt,
      ).getTime();

    if (
      Number.isFinite(
        expiryTime,
      ) &&
      expiryTime <= nowTime
    ) {
      return false;
    }
  }

  return true;
}


/* ============================================================
   HELPERS — ACCEPTANCE
   ============================================================ */

export function requiresLegalAcceptance(
  version:
    LegalDocumentVersion,
): boolean {
  return (
    version.acceptanceRequirement ===
    "explicit_acceptance"
  );
}


export function requiresLegalAcknowledgement(
  version:
    LegalDocumentVersion,
): boolean {
  return (
    version.acceptanceRequirement ===
    "acknowledgement"
  );
}


/* ============================================================
   HELPERS — REACCEPTANCE
   ============================================================ */

export function shouldRequireLegalReacceptance(
  version:
    LegalDocumentVersion,
  latestAcceptance:
    LegalAcceptanceRecord | undefined,
): boolean {
  if (
    !requiresLegalAcceptance(
      version,
    )
  ) {
    return false;
  }

  if (
    !latestAcceptance
  ) {
    return true;
  }

  if (
    latestAcceptance.action !==
    "accepted"
  ) {
    return true;
  }

  if (
    latestAcceptance.versionId ===
    version.id
  ) {
    return false;
  }

  return (
    version.requiresReacceptance
  );
}


/* ============================================================
   HELPERS — SCOPE
   ============================================================ */

export function legalScopeMatchesCountry(
  scope:
    LegalScope,
  countryCode:
    CountryCode,
  region?:
    PrivacyLegalRegion,
): boolean {
  switch (scope.type) {
    case "global":
      return true;

    case "region":
      return (
        region !== undefined &&
        scope.legalRegion ===
          region
      );

    case "country":
      return (
        scope.countryCode ===
        countryCode
      );

    case "restaurant":
      return (
        scope.countryCode ===
        countryCode
      );
  }
}


/* ============================================================
   HELPERS — PUBLICATION
   ============================================================ */

export function canPublishLegalVersion(
  version:
    LegalDocumentVersion,
): boolean {
  return (
    (
      version.status ===
        "approved" ||
      version.status ===
        "in_review"
    ) &&
    version.review.status ===
      "approved" &&
    version.contentChecksumSha256
      .trim()
      .length > 0
  );
}


/* ============================================================
   HELPERS — REQUIRED SET
   ============================================================ */

export function hasRequiredLegalDocuments(
  required:
    LegalRequiredDocumentSet,
  documents:
    readonly LegalDocument[],
): boolean {
  return required.requiredTypes.every(
    (requiredType) =>
      documents.some(
        (document) =>
          document.type ===
            requiredType &&
          document.status ===
            "active",
      ),
  );
}
