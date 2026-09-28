/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Runtime Settings, Feature Flags & Configuration
 * ============================================================
 *
 * Sistema central de configuración empresarial.
 *
 * Permite administrar sin cambiar código:
 *
 * - marca
 * - sitio web
 * - SEO
 * - idiomas
 * - navegación
 * - redes sociales
 * - pedidos
 * - delivery
 * - reservas
 * - catering
 * - comunidad
 * - loyalty
 * - recompensas
 * - referidos
 * - multimedia
 * - notificaciones
 * - IA
 * - analytics
 * - privacidad
 * - seguridad
 * - funcionalidades
 * - integraciones
 *
 * NIVELES:
 *
 * GLOBAL
 *   ↓
 * PAÍS
 *   ↓
 * CIUDAD
 *   ↓
 * RESTAURANTE
 *
 * PRINCIPIOS:
 *
 * 1. Configuración != contenido.
 * 2. Configuración != secretos.
 * 3. Los secretos jamás se almacenan como setting normal.
 * 4. Cambios críticos requieren autorización.
 * 5. Cambios sensibles pueden requerir MFA.
 * 6. Producción debe utilizar solamente versiones publicadas.
 * 7. Debemos poder volver a una configuración anterior.
 * 8. Todos los cambios importantes deben terminar en Audit.
 * 9. Feature flags permiten activar funciones progresivamente.
 */

import type {
  CountryCode,
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

import type {
  SocialChannelId,
} from "@/types/social";

import type {
  LoyaltyProgramId,
  ReferralCampaignId,
} from "@/types/loyalty";

import type {
  AIAssistantId,
} from "@/types/ai";

import type {
  NotificationProviderId,
} from "@/types/notification";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type SettingDefinitionId =
  string;

export type SettingOverrideId =
  string;

export type SettingsVersionId =
  string;

export type SettingsPublicationId =
  string;

export type FeatureFlagId =
  string;

export type SecretReferenceId =
  string;


/* ============================================================
   ENVIRONMENT
   ============================================================ */

export type SettingsEnvironment =
  | "development"
  | "preview"
  | "production";


/* ============================================================
   CATEGORIES
   ============================================================ */

export type SettingCategory =
  | "brand"
  | "web"
  | "navigation"
  | "localization"
  | "seo"
  | "content"
  | "social"
  | "commerce"
  | "delivery"
  | "reservation"
  | "inquiry"
  | "community"
  | "loyalty"
  | "referral"
  | "media"
  | "notification"
  | "ai"
  | "analytics"
  | "privacy"
  | "security"
  | "integration"
  | "system";


/* ============================================================
   CORE SETTING KEYS
   ============================================================ */

/**
 * Las configuraciones críticas conocidas tienen keys estables.
 *
 * Esto evita terminar con:
 *
 * "whatsapp"
 * "whatsapp_number"
 * "wa_number"
 * "whatsAppNumber2"
 *
 * representando la misma cosa.
 */

export type CoreSettingKey =
  /* Brand */
  | "brand.name"
  | "brand.short_name"
  | "brand.tagline"

  /* Web */
  | "web.primary_domain"
  | "web.maintenance_mode"
  | "web.home_enabled"
  | "web.community_enabled"
  | "web.ai_assistant_enabled"
  | "web.loyalty_enabled"
  | "web.referrals_enabled"
  | "web.reservations_enabled"
  | "web.catering_enabled"
  | "web.bakery_enabled"
  | "web.social_hub_enabled"

  /* Localization */
  | "localization.default_locale"
  | "localization.supported_locales"

  /* SEO */
  | "seo.indexing_enabled"
  | "seo.site_name"
  | "seo.default_title_template"
  | "seo.default_description"
  | "seo.dynamic_search_noindex"

  /* Social */
  | "social.primary_whatsapp_channel"
  | "social.show_header_links"
  | "social.show_footer_links"
  | "social.show_floating_contact"

  /* Commerce */
  | "commerce.ordering_enabled"
  | "commerce.guest_checkout_enabled"
  | "commerce.minimum_order_enabled"

  /* Delivery */
  | "delivery.enabled"

  /* Reservations */
  | "reservation.enabled"
  | "reservation.waitlist_enabled"
  | "reservation.deposit_enabled"

  /* Inquiry */
  | "inquiry.enabled"

  /* Community */
  | "community.enabled"
  | "community.registration_enabled"
  | "community.posting_enabled"
  | "community.stories_enabled"

  /* Loyalty */
  | "loyalty.enabled"
  | "loyalty.program_id"

  /* Referral */
  | "referral.enabled"
  | "referral.default_campaign_id"

  /* Notification */
  | "notification.email_enabled"
  | "notification.sms_enabled"
  | "notification.whatsapp_enabled"
  | "notification.push_enabled"

  /* AI */
  | "ai.enabled"
  | "ai.assistant_id"
  | "ai.human_handoff_enabled"

  /* Analytics */
  | "analytics.enabled"

  /* Privacy */
  | "privacy.analytics_consent_required"
  | "privacy.marketing_consent_required"

  /* Security */
  | "security.admin_mfa_required"
  | "security.community_rate_limits_enabled";


/* ============================================================
   CUSTOM SETTING KEY
   ============================================================ */

/**
 * Para extensiones futuras controladas.
 *
 * Ejemplo:
 *
 * custom.poland.special_feature
 */

export type CustomSettingKey =
  `custom.${string}`;


export type SettingKey =
  | CoreSettingKey
  | CustomSettingKey;


/* ============================================================
   VALUE TYPE
   ============================================================ */

export type SettingValueType =
  | "boolean"
  | "string"
  | "number"
  | "integer"
  | "string_array"
  | "number_array"
  | "localized_text"
  | "json";


/* ============================================================
   JSON-LIKE VALUE
   ============================================================ */

export type SettingObjectValue =
  Readonly<
    Record<
      string,
      string | number | boolean | null
    >
  >;


/* ============================================================
   SETTING VALUE
   ============================================================ */

export type SettingValue =
  | boolean
  | string
  | number
  | readonly string[]
  | readonly number[]
  | LocalizedText
  | SettingObjectValue;


/* ============================================================
   VISIBILITY
   ============================================================ */

export type SettingVisibility =
  /**
   * Puede incorporarse a configuración pública
   * entregada al navegador.
   */
  | "public"

  /**
   * Solo backend.
   */
  | "server"

  /**
   * Visible únicamente dentro de administración.
   */
  | "admin";


/* ============================================================
   SENSITIVITY
   ============================================================ */

export type SettingSensitivity =
  | "normal"
  | "internal"
  | "sensitive_reference";


/* ============================================================
   SCOPE TYPES
   ============================================================ */

export type SettingsScopeType =
  | "global"
  | "country"
  | "city"
  | "restaurant";


/* ============================================================
   SETTINGS SCOPE
   ============================================================ */

export type SettingsScope =
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
   ALLOWED SCOPE
   ============================================================ */

export interface SettingScopePolicy {
  readonly global:
    boolean;

  readonly country:
    boolean;

  readonly city:
    boolean;

  readonly restaurant:
    boolean;
}


/* ============================================================
   VALIDATION
   ============================================================ */

export interface SettingValidationRules {
  readonly required:
    boolean;

  readonly minimumNumber?:
    number;

  readonly maximumNumber?:
    number;

  readonly minimumLength?:
    number;

  readonly maximumLength?:
    number;

  readonly pattern?:
    string;

  readonly allowedValues?:
    readonly string[];
}


/* ============================================================
   SETTING DEFINITION
   ============================================================ */

/**
 * Define qué significa una configuración.
 *
 * La definición normalmente vive en código/migraciones.
 *
 * El valor puede administrarse desde panel.
 */

export interface SettingDefinition {
  readonly id:
    SettingDefinitionId;

  readonly key:
    SettingKey;

  readonly category:
    SettingCategory;

  readonly name:
    LocalizedText;

  readonly description:
    LocalizedText;

  readonly valueType:
    SettingValueType;

  readonly defaultValue?:
    SettingValue;

  readonly visibility:
    SettingVisibility;

  readonly sensitivity:
    SettingSensitivity;

  readonly allowedScopes:
    SettingScopePolicy;

  readonly validation:
    SettingValidationRules;

  /**
   * Algunas configuraciones fundamentales
   * pueden bloquearse para administración normal.
   */
  readonly editable:
    boolean;

  readonly requiresApproval:
    boolean;

  readonly requiresMfa:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   OVERRIDE STATUS
   ============================================================ */

export type SettingOverrideStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived";


/* ============================================================
   OVERRIDE
   ============================================================ */

/**
 * Un override cambia el valor para un scope concreto.
 *
 * Ejemplo:
 *
 * global:
 * reservation.enabled = true
 *
 * restaurant Brzeska:
 * reservation.enabled = false
 *
 * Resultado Brzeska:
 * false
 */

export interface SettingOverride {
  readonly id:
    SettingOverrideId;

  readonly definitionId:
    SettingDefinitionId;

  readonly key:
    SettingKey;

  readonly environment:
    SettingsEnvironment;

  readonly scope:
    SettingsScope;

  readonly value:
    SettingValue;

  readonly status:
    SettingOverrideStatus;

  readonly version:
    number;

  readonly validFrom?:
    IsoDateTime;

  readonly validUntil?:
    IsoDateTime;

  readonly createdByUserId:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly publishedByUserId?:
    UserId;

  readonly publishedAt?:
    IsoDateTime;

  readonly archivedAt?:
    IsoDateTime;
}


/* ============================================================
   RESOLUTION CONTEXT
   ============================================================ */

export interface SettingsResolutionContext {
  readonly environment:
    SettingsEnvironment;

  readonly countryCode?:
    CountryCode;

  readonly city?:
    string;

  readonly restaurantId?:
    RestaurantId;

  readonly locale?:
    SupportedLocale;
}


/* ============================================================
   RESOLVED SETTING
   ============================================================ */

export interface ResolvedSetting {
  readonly definitionId:
    SettingDefinitionId;

  readonly key:
    SettingKey;

  readonly value:
    SettingValue;

  /**
   * Scope que finalmente ganó.
   */
  readonly resolvedFromScope:
    SettingsScope;

  /**
   * Override utilizado.
   *
   * No existe si se utilizó defaultValue.
   */
  readonly overrideId?:
    SettingOverrideId;

  readonly resolvedAt:
    IsoDateTime;
}


/* ============================================================
   SETTINGS VERSION
   ============================================================ */

/**
 * Snapshot lógico de configuración publicada.
 *
 * Muy útil para:
 *
 * - rollback
 * - auditoría
 * - despliegues
 * - reproducibilidad
 */

export interface SettingsVersion {
  readonly id:
    SettingsVersionId;

  readonly environment:
    SettingsEnvironment;

  readonly version:
    number;

  readonly overrideIds:
    readonly SettingOverrideId[];

  readonly createdByUserId:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly note?:
    string;
}


/* ============================================================
   PUBLICATION
   ============================================================ */

export type SettingsPublicationStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "failed"
  | "cancelled";


export interface SettingsPublication {
  readonly id:
    SettingsPublicationId;

  readonly environment:
    SettingsEnvironment;

  readonly status:
    SettingsPublicationStatus;

  readonly overrideIds:
    readonly SettingOverrideId[];

  readonly createdByUserId:
    UserId;

  readonly approvedByUserId?:
    UserId;

  readonly scheduledFor?:
    IsoDateTime;

  readonly createdAt:
    IsoDateTime;

  readonly publishedAt?:
    IsoDateTime;

  readonly failureReason?:
    string;
}


/* ============================================================
   SECRET REFERENCES
   ============================================================ */

/**
 * SOLO referencia.
 *
 * Nunca contiene:
 *
 * - API key
 * - password
 * - token
 * - secret
 */

export type SecretProvider =
  | "environment"
  | "vercel"
  | "supabase_vault"
  | "cloud_secret_manager"
  | "custom";


export interface SecretReference {
  readonly id:
    SecretReferenceId;

  readonly provider:
    SecretProvider;

  /**
   * Nombre lógico.
   *
   * Ejemplo:
   *
   * notification.whatsapp.api
   *
   * NO el secreto.
   */
  readonly referenceKey:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly rotatedAt?:
    IsoDateTime;
}


/* ============================================================
   ENTERPRISE REFERENCES
   ============================================================ */

/**
 * Referencias a configuraciones principales.
 *
 * Evita duplicar los objetos completos.
 */

export interface PlatformEntityReferences {
  readonly primarySocialChannelId?:
    SocialChannelId;

  readonly loyaltyProgramId?:
    LoyaltyProgramId;

  readonly referralCampaignId?:
    ReferralCampaignId;

  readonly aiAssistantId?:
    AIAssistantId;

  readonly defaultNotificationProviderId?:
    NotificationProviderId;
}


/* ============================================================
   PUBLIC SETTINGS SNAPSHOT
   ============================================================ */

/**
 * Configuración segura que puede llegar
 * al navegador.
 *
 * Nunca debe incluir server/admin settings.
 */

export interface PublicSettingsEntry {
  readonly key:
    SettingKey;

  readonly value:
    SettingValue;
}


export interface PublicSettingsSnapshot {
  readonly version:
    string;

  readonly environment:
    SettingsEnvironment;

  readonly locale:
    SupportedLocale;

  readonly entries:
    readonly PublicSettingsEntry[];

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   FEATURE FLAGS
   ============================================================ */

export type FeatureFlagKey =
  | "community"
  | "community_stories"
  | "community_video"
  | "loyalty"
  | "referrals"
  | "reward_qr"
  | "reservations"
  | "reservation_waitlist"
  | "catering"
  | "bakery"
  | "ai_assistant"
  | "ai_order_support"
  | "ai_loyalty_support"
  | "search_semantic"
  | "web_push"
  | "whatsapp_notifications"
  | "new_checkout";


export type FeatureFlagStatus =
  | "draft"
  | "active"
  | "paused"
  | "archived";


/* ============================================================
   FEATURE ROLLOUT STRATEGY
   ============================================================ */

export type FeatureRolloutStrategy =
  | "all"
  | "percentage"
  | "allowlist"
  | "denylist";


/* ============================================================
   FEATURE TARGETING
   ============================================================ */

export interface FeatureFlagTargeting {
  readonly countryCodes?:
    readonly CountryCode[];

  readonly restaurantIds?:
    readonly RestaurantId[];

  readonly locales?:
    readonly SupportedLocale[];

  /**
   * IDs internos estables.
   *
   * No emails ni teléfonos.
   */
  readonly subjectIds?:
    readonly string[];
}


/* ============================================================
   FEATURE FLAG
   ============================================================ */

export interface FeatureFlag {
  readonly id:
    FeatureFlagId;

  readonly key:
    FeatureFlagKey;

  readonly status:
    FeatureFlagStatus;

  readonly environment:
    SettingsEnvironment;

  readonly strategy:
    FeatureRolloutStrategy;

  /**
   * Basis points.
   *
   * 10000 = 100%
   * 5000 = 50%
   * 1000 = 10%
   */
  readonly rolloutBasisPoints?:
    number;

  readonly targeting:
    FeatureFlagTargeting;

  readonly startsAt?:
    IsoDateTime;

  readonly endsAt?:
    IsoDateTime;

  readonly createdByUserId:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   FEATURE EVALUATION CONTEXT
   ============================================================ */

export interface FeatureFlagEvaluationContext {
  readonly environment:
    SettingsEnvironment;

  readonly countryCode?:
    CountryCode;

  readonly restaurantId?:
    RestaurantId;

  readonly locale?:
    SupportedLocale;

  readonly subjectId?:
    string;

  /**
   * Bucket estable 0..9999 calculado a partir
   * de subjectId + featureKey.
   *
   * La función de dominio no genera hashes.
   */
  readonly stableBucket?:
    number;
}


/* ============================================================
   FEATURE DECISION
   ============================================================ */

export interface FeatureFlagDecision {
  readonly enabled:
    boolean;

  readonly flagId:
    FeatureFlagId;

  readonly key:
    FeatureFlagKey;

  readonly reason:
    | "active_for_all"
    | "percentage_match"
    | "percentage_miss"
    | "allowlisted"
    | "not_allowlisted"
    | "denylisted"
    | "not_targeted"
    | "inactive"
    | "outside_schedule";
}


/* ============================================================
   CHANGE REQUEST
   ============================================================ */

export interface CreateSettingOverrideRequest {
  readonly definitionId:
    SettingDefinitionId;

  readonly key:
    SettingKey;

  readonly environment:
    SettingsEnvironment;

  readonly scope:
    SettingsScope;

  readonly value:
    SettingValue;

  readonly validFrom?:
    IsoDateTime;

  readonly validUntil?:
    IsoDateTime;

  readonly reason:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   PUBLICATION REQUEST
   ============================================================ */

export interface PublishSettingsRequest {
  readonly environment:
    SettingsEnvironment;

  readonly overrideIds:
    readonly SettingOverrideId[];

  readonly reason:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   ROLLBACK
   ============================================================ */

export interface RollbackSettingsRequest {
  readonly environment:
    SettingsEnvironment;

  readonly targetVersionId:
    SettingsVersionId;

  readonly reason:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   SETTINGS QUERY
   ============================================================ */

export interface SettingsQuery {
  readonly environment?:
    SettingsEnvironment;

  readonly category?:
    SettingCategory;

  readonly key?:
    SettingKey;

  readonly status?:
    SettingOverrideStatus;

  readonly scopeType?:
    SettingsScopeType;

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
   CACHE SNAPSHOT
   ============================================================ */

/**
 * Producción no debería consultar cientos de overrides
 * en cada page view.
 *
 * El backend puede generar snapshots cacheables.
 */

export interface SettingsRuntimeSnapshot {
  readonly environment:
    SettingsEnvironment;

  readonly context:
    SettingsResolutionContext;

  readonly values:
    Readonly<
      Partial<
        Record<
          SettingKey,
          SettingValue
        >
      >
    >;

  readonly version:
    string;

  readonly generatedAt:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type SettingsErrorCode =
  | "SETTING_NOT_FOUND"
  | "SETTING_NOT_EDITABLE"
  | "INVALID_SETTING_VALUE"
  | "INVALID_SETTING_SCOPE"
  | "SCOPE_NOT_ALLOWED"
  | "SETTING_REQUIRES_APPROVAL"
  | "SETTING_REQUIRES_MFA"
  | "PUBLICATION_NOT_FOUND"
  | "PUBLICATION_FAILED"
  | "VERSION_NOT_FOUND"
  | "ROLLBACK_FAILED"
  | "FEATURE_FLAG_NOT_FOUND"
  | "INVALID_FEATURE_ROLLOUT"
  | "SECRET_VALUE_FORBIDDEN"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface SettingsDomainError {
  readonly code:
    SettingsErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   HELPERS — SCOPE SPECIFICITY
   ============================================================ */

/**
 * Cuanto mayor el número, más específico.
 *
 * restaurant > city > country > global
 */
export function getSettingsScopeSpecificity(
  scope: SettingsScope,
): number {
  switch (scope.type) {
    case "global":
      return 0;

    case "country":
      return 1;

    case "city":
      return 2;

    case "restaurant":
      return 3;
  }
}


/* ============================================================
   HELPERS — SCOPE MATCH
   ============================================================ */

export function settingScopeMatchesContext(
  scope: SettingsScope,
  context: SettingsResolutionContext,
): boolean {
  switch (scope.type) {
    case "global":
      return true;

    case "country":
      return (
        context.countryCode ===
        scope.countryCode
      );

    case "city":
      return (
        context.countryCode ===
          scope.countryCode &&
        context.city ===
          scope.city
      );

    case "restaurant":
      return (
        context.restaurantId ===
        scope.restaurantId
      );
  }
}


/* ============================================================
   HELPERS — ACTIVE OVERRIDE
   ============================================================ */

export function isSettingOverrideActive(
  override: SettingOverride,
  now = new Date(),
): boolean {
  if (
    override.status !== "published"
  ) {
    return false;
  }

  const nowTime =
    now.getTime();

  if (
    override.validFrom &&
    new Date(
      override.validFrom,
    ).getTime() > nowTime
  ) {
    return false;
  }

  if (
    override.validUntil &&
    new Date(
      override.validUntil,
    ).getTime() <= nowTime
  ) {
    return false;
  }

  return true;
}


/* ============================================================
   HELPERS — RESOLVE SETTING
   ============================================================ */

/**
 * Resolución:
 *
 * restaurant
 *   ↓
 * city
 *   ↓
 * country
 *   ↓
 * global
 *   ↓
 * defaultValue
 *
 * En igualdad de scope gana mayor version.
 */
export function resolveSetting(
  definition: SettingDefinition,
  overrides: readonly SettingOverride[],
  context: SettingsResolutionContext,
  now = new Date(),
): ResolvedSetting | undefined {
  const candidates =
    overrides
      .filter(
        (override) =>
          override.definitionId ===
            definition.id &&
          override.key ===
            definition.key &&
          override.environment ===
            context.environment &&
          isSettingOverrideActive(
            override,
            now,
          ) &&
          settingScopeMatchesContext(
            override.scope,
            context,
          ),
      )
      .sort(
        (
          left,
          right,
        ) => {
          const specificityDifference =
            getSettingsScopeSpecificity(
              right.scope,
            ) -
            getSettingsScopeSpecificity(
              left.scope,
            );

          if (
            specificityDifference !== 0
          ) {
            return specificityDifference;
          }

          return (
            right.version -
            left.version
          );
        },
      );

  const selected =
    candidates[0];

  if (selected) {
    return {
      definitionId:
        definition.id,

      key:
        definition.key,

      value:
        selected.value,

      resolvedFromScope:
        selected.scope,

      overrideId:
        selected.id,

      resolvedAt:
        now.toISOString(),
    };
  }

  if (
    definition.defaultValue ===
    undefined
  ) {
    return undefined;
  }

  return {
    definitionId:
      definition.id,

    key:
      definition.key,

    value:
      definition.defaultValue,

    resolvedFromScope: {
      type: "global",
    },

    resolvedAt:
      now.toISOString(),
  };
}


/* ============================================================
   HELPERS — PUBLIC EXPOSURE
   ============================================================ */

export function canExposeSettingPublicly(
  definition: SettingDefinition,
): boolean {
  return (
    definition.visibility ===
      "public" &&
    definition.sensitivity ===
      "normal"
  );
}


/* ============================================================
   HELPERS — FEATURE SCHEDULE
   ============================================================ */

export function isFeatureFlagWithinSchedule(
  flag: FeatureFlag,
  now = new Date(),
): boolean {
  const time =
    now.getTime();

  if (
    flag.startsAt &&
    new Date(
      flag.startsAt,
    ).getTime() > time
  ) {
    return false;
  }

  if (
    flag.endsAt &&
    new Date(
      flag.endsAt,
    ).getTime() <= time
  ) {
    return false;
  }

  return true;
}


/* ============================================================
   HELPERS — FEATURE TARGETING
   ============================================================ */

export function featureFlagMatchesTargeting(
  flag: FeatureFlag,
  context:
    FeatureFlagEvaluationContext,
): boolean {
  const targeting =
    flag.targeting;

  if (
    targeting.countryCodes &&
    targeting.countryCodes.length > 0
  ) {
    if (
      !context.countryCode ||
      !targeting.countryCodes.includes(
        context.countryCode,
      )
    ) {
      return false;
    }
  }

  if (
    targeting.restaurantIds &&
    targeting.restaurantIds.length > 0
  ) {
    if (
      !context.restaurantId ||
      !targeting.restaurantIds.includes(
        context.restaurantId,
      )
    ) {
      return false;
    }
  }

  if (
    targeting.locales &&
    targeting.locales.length > 0
  ) {
    if (
      !context.locale ||
      !targeting.locales.includes(
        context.locale,
      )
    ) {
      return false;
    }
  }

  return true;
}


/* ============================================================
   HELPERS — FEATURE EVALUATION
   ============================================================ */

export function evaluateFeatureFlag(
  flag: FeatureFlag,
  context:
    FeatureFlagEvaluationContext,
  now = new Date(),
): FeatureFlagDecision {
  if (
    flag.status !== "active"
  ) {
    return {
      enabled: false,
      flagId: flag.id,
      key: flag.key,
      reason: "inactive",
    };
  }

  if (
    flag.environment !==
    context.environment
  ) {
    return {
      enabled: false,
      flagId: flag.id,
      key: flag.key,
      reason: "not_targeted",
    };
  }

  if (
    !isFeatureFlagWithinSchedule(
      flag,
      now,
    )
  ) {
    return {
      enabled: false,
      flagId: flag.id,
      key: flag.key,
      reason:
        "outside_schedule",
    };
  }

  if (
    !featureFlagMatchesTargeting(
      flag,
      context,
    )
  ) {
    return {
      enabled: false,
      flagId: flag.id,
      key: flag.key,
      reason: "not_targeted",
    };
  }

  switch (flag.strategy) {
    case "all":
      return {
        enabled: true,
        flagId: flag.id,
        key: flag.key,
        reason:
          "active_for_all",
      };

    case "percentage": {
      const rollout =
        flag.rolloutBasisPoints ??
        0;

      const bucket =
        context.stableBucket;

      if (
        bucket === undefined
      ) {
        return {
          enabled: false,
          flagId: flag.id,
          key: flag.key,
          reason:
            "percentage_miss",
        };
      }

      const enabled =
        bucket >= 0 &&
        bucket < rollout;

      return {
        enabled,
        flagId: flag.id,
        key: flag.key,
        reason: enabled
          ? "percentage_match"
          : "percentage_miss",
      };
    }

    case "allowlist": {
      const subjects =
        flag.targeting
          .subjectIds ??
        [];

      const enabled =
        Boolean(
          context.subjectId &&
          subjects.includes(
            context.subjectId,
          ),
        );

      return {
        enabled,
        flagId: flag.id,
        key: flag.key,
        reason: enabled
          ? "allowlisted"
          : "not_allowlisted",
      };
    }

    case "denylist": {
      const subjects =
        flag.targeting
          .subjectIds ??
        [];

      const denied =
        Boolean(
          context.subjectId &&
          subjects.includes(
            context.subjectId,
          ),
        );

      return {
        enabled:
          !denied,

        flagId:
          flag.id,

        key:
          flag.key,

        reason:
          denied
            ? "denylisted"
            : "active_for_all",
      };
    }
  }
}


/* ============================================================
   HELPERS — ROLLOUT VALIDATION
   ============================================================ */

export function isValidRolloutBasisPoints(
  value: number,
): boolean {
  return (
    Number.isInteger(
      value,
    ) &&
    value >= 0 &&
    value <= 10000
  );
}
