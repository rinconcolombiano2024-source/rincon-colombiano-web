/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Loyalty, Rewards & Referral Domain
 * ============================================================
 *
 * Sistema central de:
 *
 * - fidelización
 * - puntos
 * - recompensas por compras
 * - recompensas por visitas
 * - campañas especiales
 * - referidos
 * - códigos de invitación
 * - QR
 * - tokens de validación
 * - recompensas gratuitas
 * - productos gratis
 * - descuentos
 * - beneficios
 * - prevención de abuso
 *
 * EJEMPLO DE NEGOCIO:
 *
 * Cliente A refiere a Cliente B.
 *
 * Cliente B realiza su primera compra válida
 * por mínimo 80 PLN.
 *
 * RC ORDERA verifica:
 *
 * - pedido real
 * - pedido completado
 * - pago válido
 * - importe mínimo
 * - campaña activa
 * - no autorreferencia
 * - recompensa no entregada previamente
 *
 * Entonces:
 *
 * Cliente A recibe recompensa.
 *
 * PRINCIPIOS:
 *
 * 1. El frontend nunca decide si alguien ganó una recompensa.
 * 2. El QR nunca es prueba suficiente por sí solo.
 * 3. Los tokens de recompensa deben validarse en backend.
 * 4. Un token de redención sensible debe ser de un solo uso.
 * 5. El ledger de puntos es append-only.
 * 6. Las reglas se configuran desde administración.
 * 7. Nunca utilizar saldo editable como única fuente de verdad.
 */

import type {
  CurrencyCode,
  IsoDateTime,
  Money,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  CustomerId,
} from "@/types/customer";

import type {
  MenuChannel,
  MenuItemId,
} from "@/types/menu";

import type {
  OrderId,
} from "@/types/order";

import type {
  RestaurantId,
} from "@/types/restaurant";

import type {
  CampaignId,
  MarketingSessionId,
  VisitorId,
} from "@/types/marketing";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type LoyaltyProgramId =
  string;

export type LoyaltyAccountId =
  string;

export type LoyaltyLedgerEntryId =
  string;

export type LoyaltyTierId =
  string;

export type LoyaltyRuleId =
  string;

export type RewardDefinitionId =
  string;

export type RewardGrantId =
  string;

export type RewardRedemptionId =
  string;

export type ReferralCampaignId =
  string;

export type ReferralCodeId =
  string;

export type ReferralId =
  string;

export type LoyaltyTokenId =
  string;

export type LoyaltyScannerDeviceId =
  string;


/* ============================================================
   PROGRAM
   ============================================================ */

export type LoyaltyProgramStatus =
  | "draft"
  | "active"
  | "paused"
  | "archived";


export interface LoyaltyProgram {
  readonly id:
    LoyaltyProgramId;

  readonly name:
    string;

  readonly status:
    LoyaltyProgramStatus;

  readonly supportedCurrencies:
    readonly CurrencyCode[];

  readonly earningRuleIds:
    readonly LoyaltyRuleId[];

  readonly rewardDefinitionIds:
    readonly RewardDefinitionId[];

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   LOYALTY ACCOUNT
   ============================================================ */

export type LoyaltyAccountStatus =
  | "active"
  | "paused"
  | "closed";


export interface LoyaltyAccount {
  readonly id:
    LoyaltyAccountId;

  readonly programId:
    LoyaltyProgramId;

  readonly customerId:
    CustomerId;

  readonly status:
    LoyaltyAccountStatus;

  /**
   * Balance materializado para lectura rápida.
   *
   * La fuente histórica real continúa siendo el ledger.
   */
  readonly pointsBalance:
    number;

  readonly stampsBalance:
    number;

  readonly lifetimePointsEarned:
    number;

  readonly lifetimePointsRedeemed:
    number;

  readonly currentTierId?:
    LoyaltyTierId;

  readonly joinedAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   TIERS
   ============================================================ */

export interface LoyaltyTier {
  readonly id:
    LoyaltyTierId;

  readonly programId:
    LoyaltyProgramId;

  readonly name:
    string;

  readonly rank:
    number;

  readonly minimumLifetimePoints?:
    number;

  readonly pointsMultiplierBasisPoints:
    number;

  readonly active:
    boolean;
}


/* ============================================================
   EARNING RULES
   ============================================================ */

export type LoyaltyEarningRuleType =
  | "spend_points"
  | "order_points"
  | "visit_stamp"
  | "campaign_bonus"
  | "referral_bonus";


export interface LoyaltyEarningRule {
  readonly id:
    LoyaltyRuleId;

  readonly programId:
    LoyaltyProgramId;

  readonly name:
    string;

  readonly type:
    LoyaltyEarningRuleType;

  readonly active:
    boolean;

  /**
   * Ejemplo:
   *
   * Cada 10 PLN = 1 punto
   */
  readonly spendStep?:
    Money;

  readonly pointsPerSpendStep?:
    number;

  readonly pointsPerOrder?:
    number;

  readonly stampsPerOrder?:
    number;

  readonly minimumOrder?:
    Money;

  readonly allowedChannels:
    readonly MenuChannel[];

  readonly restaurantIds:
    readonly RestaurantId[];

  readonly startsAt?:
    IsoDateTime;

  readonly endsAt?:
    IsoDateTime;
}


/* ============================================================
   LEDGER
   ============================================================ */

/**
 * Ledger append-only.
 *
 * No debemos borrar una transacción para "arreglar"
 * el saldo.
 *
 * Si hay que corregir algo se crea una transacción
 * de ajuste o reversión.
 */

export type LoyaltyLedgerEntryType =
  | "earn"
  | "redeem"
  | "expire"
  | "adjustment"
  | "reversal";


export type LoyaltyLedgerSource =
  | "purchase"
  | "referral"
  | "promotion"
  | "campaign"
  | "reward"
  | "admin"
  | "system";


export interface LoyaltyLedgerEntry {
  readonly id:
    LoyaltyLedgerEntryId;

  readonly accountId:
    LoyaltyAccountId;

  readonly type:
    LoyaltyLedgerEntryType;

  readonly source:
    LoyaltyLedgerSource;

  readonly pointsDelta:
    number;

  readonly stampsDelta:
    number;

  readonly pointsBalanceAfter:
    number;

  readonly stampsBalanceAfter:
    number;

  readonly orderId?:
    OrderId;

  readonly referralId?:
    ReferralId;

  readonly rewardGrantId?:
    RewardGrantId;

  readonly campaignId?:
    CampaignId;

  readonly reason?:
    string;

  readonly createdByUserId?:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   REWARD TYPE
   ============================================================ */

export type RewardType =
  | "free_menu_item"
  | "fixed_discount"
  | "percentage_discount"
  | "free_delivery"
  | "bonus_points"
  | "custom";


/* ============================================================
   REWARD BENEFIT
   ============================================================ */

export type RewardBenefit =
  | {
      readonly type:
        "free_menu_item";

      readonly menuItemId:
        MenuItemId;

      readonly quantity:
        number;
    }
  | {
      readonly type:
        "fixed_discount";

      readonly amount:
        Money;
    }
  | {
      readonly type:
        "percentage_discount";

      /**
       * 1000 = 10%
       */
      readonly percentageBasisPoints:
        number;

      readonly maximumDiscount?:
        Money;
    }
  | {
      readonly type:
        "free_delivery";
    }
  | {
      readonly type:
        "bonus_points";

      readonly points:
        number;
    }
  | {
      readonly type:
        "custom";

      readonly code:
        string;
    };


/* ============================================================
   REWARD ELIGIBILITY
   ============================================================ */

export interface RewardEligibility {
  readonly minimumOrder?:
    Money;

  readonly allowedRestaurantIds:
    readonly RestaurantId[];

  readonly allowedChannels:
    readonly MenuChannel[];

  readonly minimumPoints?:
    number;

  readonly minimumStamps?:
    number;

  readonly firstOrderOnly:
    boolean;
}


/* ============================================================
   REWARD DEFINITION
   ============================================================ */

export type RewardDefinitionStatus =
  | "draft"
  | "active"
  | "paused"
  | "archived";


export interface RewardDefinition {
  readonly id:
    RewardDefinitionId;

  readonly programId:
    LoyaltyProgramId;

  readonly name:
    string;

  readonly description?:
    string;

  readonly status:
    RewardDefinitionStatus;

  readonly benefit:
    RewardBenefit;

  readonly eligibility:
    RewardEligibility;

  /**
   * Costo para canje voluntario.
   *
   * Una recompensa otorgada automáticamente
   * puede tener costo 0.
   */
  readonly pointsCost:
    number;

  readonly stampsCost:
    number;

  readonly validityDays?:
    number;

  /**
   * Define si puede coexistir con promociones.
   */
  readonly combinable:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   REWARD GRANT
   ============================================================ */

export type RewardGrantStatus =
  | "available"
  | "reserved"
  | "redeemed"
  | "expired"
  | "revoked";


export type RewardGrantSource =
  | "purchase"
  | "referral"
  | "campaign"
  | "loyalty_redemption"
  | "birthday"
  | "admin"
  | "system";


export interface RewardGrant {
  readonly id:
    RewardGrantId;

  readonly rewardDefinitionId:
    RewardDefinitionId;

  readonly accountId:
    LoyaltyAccountId;

  readonly customerId:
    CustomerId;

  readonly source:
    RewardGrantSource;

  readonly status:
    RewardGrantStatus;

  readonly sourceOrderId?:
    OrderId;

  readonly referralId?:
    ReferralId;

  readonly campaignId?:
    CampaignId;

  readonly grantedAt:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;

  readonly redeemedAt?:
    IsoDateTime;

  readonly revokedAt?:
    IsoDateTime;
}


/* ============================================================
   REFERRAL CAMPAIGN
   ============================================================ */

export type ReferralCampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "archived";


export type ReferralSpendBasis =
  | "items_after_discounts"
  | "eligible_items"
  | "grand_total";


export interface ReferralCampaign {
  readonly id:
    ReferralCampaignId;

  readonly name:
    string;

  readonly status:
    ReferralCampaignStatus;

  /**
   * Ejemplo que podremos configurar desde admin:
   *
   * 80 PLN =
   *
   * {
   *   amountMinor: 8000,
   *   currency: "PLN"
   * }
   */
  readonly minimumQualifyingSpend:
    Money;

  readonly spendBasis:
    ReferralSpendBasis;

  /**
   * Normalmente true:
   *
   * solamente la primera compra válida
   * del referido genera recompensa.
   */
  readonly firstCompletedOrderOnly:
    boolean;

  readonly paymentRequired:
    boolean;

  readonly referrerRewardDefinitionId:
    RewardDefinitionId;

  /**
   * También podemos premiar al amigo nuevo.
   */
  readonly refereeRewardDefinitionId?:
    RewardDefinitionId;

  readonly allowedRestaurantIds:
    readonly RestaurantId[];

  readonly allowedChannels:
    readonly MenuChannel[];

  readonly maximumRewardsPerReferrer?:
    number;

  readonly startsAt?:
    IsoDateTime;

  readonly endsAt?:
    IsoDateTime;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   REFERRAL CODE
   ============================================================ */

/**
 * Código público compartible.
 *
 * Ejemplo:
 *
 * RC-JUAN-7K4Q
 *
 * No es un secreto.
 */

export type ReferralCodeStatus =
  | "active"
  | "paused"
  | "revoked"
  | "expired";


export interface ReferralCode {
  readonly id:
    ReferralCodeId;

  readonly campaignId:
    ReferralCampaignId;

  readonly referrerCustomerId:
    CustomerId;

  readonly referrerAccountId:
    LoyaltyAccountId;

  readonly code:
    string;

  readonly status:
    ReferralCodeStatus;

  readonly successfulReferrals:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   REFERRAL
   ============================================================ */

export type ReferralStatus =
  | "created"
  | "claimed"
  | "registered"
  | "awaiting_purchase"
  | "qualified"
  | "rewarded"
  | "rejected"
  | "cancelled";


export interface Referral {
  readonly id:
    ReferralId;

  readonly campaignId:
    ReferralCampaignId;

  readonly referralCodeId:
    ReferralCodeId;

  readonly referrerCustomerId:
    CustomerId;

  readonly refereeCustomerId?:
    CustomerId;

  readonly status:
    ReferralStatus;

  readonly qualifyingOrderId?:
    OrderId;

  readonly referrerRewardGrantId?:
    RewardGrantId;

  readonly refereeRewardGrantId?:
    RewardGrantId;

  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly landingPath?:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly claimedAt?:
    IsoDateTime;

  readonly qualifiedAt?:
    IsoDateTime;

  readonly rewardedAt?:
    IsoDateTime;

  readonly rejectedAt?:
    IsoDateTime;
}


/* ============================================================
   REFERRAL RISK
   ============================================================ */

export type ReferralRiskSignal =
  | "self_referral"
  | "duplicate_identity"
  | "shared_device"
  | "shared_payment_instrument"
  | "excessive_velocity"
  | "multiple_accounts"
  | "suspicious_pattern"
  | "other";


export type ReferralRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";


export interface ReferralRiskAssessment {
  readonly referralId:
    ReferralId;

  readonly level:
    ReferralRiskLevel;

  readonly signals:
    readonly ReferralRiskSignal[];

  readonly manualReviewRequired:
    boolean;

  readonly evaluatedAt:
    IsoDateTime;
}


/* ============================================================
   ORDER QUALIFICATION
   ============================================================ */

/**
 * Resultado producido por backend después de evaluar
 * un pedido real.
 */

export interface LoyaltyOrderEvaluation {
  readonly orderId:
    OrderId;

  readonly customerId:
    CustomerId;

  readonly accountId:
    LoyaltyAccountId;

  readonly eligibleSpend:
    Money;

  readonly pointsEarned:
    number;

  readonly stampsEarned:
    number;

  readonly referralQualified:
    boolean;

  readonly rewardGrantIds:
    readonly RewardGrantId[];

  readonly evaluatedAt:
    IsoDateTime;
}


/* ============================================================
   REFERRAL QUALIFICATION CONTEXT
   ============================================================ */

export interface ReferralQualificationContext {
  readonly orderId:
    OrderId;

  readonly refereeCustomerId:
    CustomerId;

  readonly spend:
    Money;

  readonly orderCompleted:
    boolean;

  readonly paymentCompleted:
    boolean;

  readonly firstCompletedOrder:
    boolean;

  readonly restaurantId:
    RestaurantId;

  readonly channel:
    MenuChannel;
}


/* ============================================================
   TOKEN PURPOSE
   ============================================================ */

/**
 * Estos tokens NO son criptomonedas.
 *
 * Son credenciales temporales/operativas utilizadas
 * para validar una acción dentro del ecosistema.
 */

export type LoyaltyTokenPurpose =
  | "member_identification"
  | "referral_claim"
  | "reward_redemption";


/* ============================================================
   TOKEN MODE
   ============================================================ */

export type LoyaltyTokenMode =
  | "rotating"
  | "one_time";


/* ============================================================
   TOKEN STATUS
   ============================================================ */

export type LoyaltyTokenStatus =
  | "active"
  | "used"
  | "expired"
  | "revoked";


/* ============================================================
   TOKEN RECORD
   ============================================================ */

/**
 * IMPORTANTE:
 *
 * Backend guarda tokenHash.
 *
 * No necesitamos guardar el token secreto original.
 */

export interface LoyaltyTokenRecord {
  readonly id:
    LoyaltyTokenId;

  readonly purpose:
    LoyaltyTokenPurpose;

  readonly mode:
    LoyaltyTokenMode;

  readonly status:
    LoyaltyTokenStatus;

  readonly tokenHash:
    string;

  readonly customerId?:
    CustomerId;

  readonly accountId?:
    LoyaltyAccountId;

  readonly referralCodeId?:
    ReferralCodeId;

  readonly referralId?:
    ReferralId;

  readonly rewardGrantId?:
    RewardGrantId;

  readonly allowedRestaurantIds:
    readonly RestaurantId[];

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly usedAt?:
    IsoDateTime;

  readonly revokedAt?:
    IsoDateTime;
}


/* ============================================================
   QR PUBLIC PAYLOAD
   ============================================================ */

/**
 * Esto es lo que puede representarse dentro del QR.
 *
 * No contiene:
 *
 * - customerId
 * - puntos
 * - rewardId
 * - datos personales
 *
 * Backend resuelve el token.
 */

export interface LoyaltyQrPayload {
  readonly version:
    1;

  readonly token:
    string;
}


/* ============================================================
   SCAN REQUEST
   ============================================================ */

export interface LoyaltyTokenScanRequest {
  readonly token:
    string;

  readonly restaurantId:
    RestaurantId;

  readonly scannerDeviceId?:
    LoyaltyScannerDeviceId;

  readonly staffUserId?:
    UserId;

  readonly orderId?:
    OrderId;

  readonly requestId:
    RequestId;
}


/* ============================================================
   TOKEN VALIDATION
   ============================================================ */

export type LoyaltyTokenInvalidReason =
  | "TOKEN_NOT_FOUND"
  | "TOKEN_EXPIRED"
  | "TOKEN_ALREADY_USED"
  | "TOKEN_REVOKED"
  | "WRONG_PURPOSE"
  | "RESTAURANT_NOT_ALLOWED"
  | "REWARD_NOT_AVAILABLE"
  | "REFERRAL_NOT_ELIGIBLE"
  | "ORDER_NOT_ELIGIBLE"
  | "CUSTOMER_NOT_ELIGIBLE"
  | "RISK_REVIEW_REQUIRED";


export interface LoyaltyTokenValidation {
  readonly valid:
    boolean;

  readonly tokenId?:
    LoyaltyTokenId;

  readonly purpose?:
    LoyaltyTokenPurpose;

  readonly customerId?:
    CustomerId;

  readonly referralId?:
    ReferralId;

  readonly rewardGrantId?:
    RewardGrantId;

  readonly invalidReason?:
    LoyaltyTokenInvalidReason;

  readonly validatedAt:
    IsoDateTime;
}


/* ============================================================
   REDEMPTION
   ============================================================ */

export type RewardRedemptionStatus =
  | "pending"
  | "completed"
  | "rejected"
  | "reversed";


export interface RewardRedemption {
  readonly id:
    RewardRedemptionId;

  readonly rewardGrantId:
    RewardGrantId;

  readonly customerId:
    CustomerId;

  readonly accountId:
    LoyaltyAccountId;

  readonly restaurantId:
    RestaurantId;

  readonly orderId?:
    OrderId;

  readonly tokenId?:
    LoyaltyTokenId;

  readonly status:
    RewardRedemptionStatus;

  readonly redeemedByUserId?:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly reversedAt?:
    IsoDateTime;
}


/* ============================================================
   REDEEM REQUEST
   ============================================================ */

export interface RedeemRewardRequest {
  readonly token:
    string;

  readonly restaurantId:
    RestaurantId;

  readonly orderId?:
    OrderId;

  readonly staffUserId?:
    UserId;

  readonly requestId:
    RequestId;
}


/* ============================================================
   MEMBER IDENTIFICATION
   ============================================================ */

/**
 * Permite que un cliente presente su QR en caja.
 *
 * El POS/RC ORDERA podrá asociar la compra
 * con su cuenta de fidelización.
 */

export interface LoyaltyMemberIdentification {
  readonly customerId:
    CustomerId;

  readonly accountId:
    LoyaltyAccountId;

  readonly programId:
    LoyaltyProgramId;

  readonly identifiedAt:
    IsoDateTime;
}


/* ============================================================
   REFERRAL CLAIM
   ============================================================ */

export interface ClaimReferralRequest {
  readonly referralCode:
    string;

  readonly refereeCustomerId:
    CustomerId;

  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly requestId:
    RequestId;
}


/* ============================================================
   PUBLIC REFERRAL LINK
   ============================================================ */

/**
 * La invitación vive dentro del dominio propio.
 *
 * Ejemplo:
 *
 * /r/RC-JUAN-7K4Q
 *
 * Estas URLs personalizadas normalmente deberán ser noindex
 * para no contaminar el SEO público.
 */

export function buildReferralPath(
  code: string,
): string {
  return (
    `/r/${encodeURIComponent(
      code,
    )}`
  );
}


/* ============================================================
   CUSTOMER LOYALTY SUMMARY
   ============================================================ */

export interface CustomerLoyaltySummary {
  readonly accountId:
    LoyaltyAccountId;

  readonly customerId:
    CustomerId;

  readonly points:
    number;

  readonly stamps:
    number;

  readonly tierId?:
    LoyaltyTierId;

  readonly availableRewards:
    readonly RewardGrant[];

  readonly referralCode?:
    string;
}


/* ============================================================
   ADMIN ANALYTICS
   ============================================================ */

export interface LoyaltyProgramPerformance {
  readonly programId:
    LoyaltyProgramId;

  readonly activeMembers:
    number;

  readonly pointsIssued:
    number;

  readonly pointsRedeemed:
    number;

  readonly rewardsGranted:
    number;

  readonly rewardsRedeemed:
    number;

  readonly successfulReferrals:
    number;

  readonly referralRevenue?:
    Money;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type LoyaltyErrorCode =
  | "PROGRAM_NOT_FOUND"
  | "ACCOUNT_NOT_FOUND"
  | "ACCOUNT_INACTIVE"
  | "RULE_NOT_FOUND"
  | "REWARD_NOT_FOUND"
  | "REWARD_NOT_AVAILABLE"
  | "REWARD_EXPIRED"
  | "INSUFFICIENT_POINTS"
  | "INSUFFICIENT_STAMPS"
  | "REFERRAL_CODE_NOT_FOUND"
  | "REFERRAL_CODE_INACTIVE"
  | "SELF_REFERRAL"
  | "REFERRAL_ALREADY_CLAIMED"
  | "REFERRAL_NOT_QUALIFIED"
  | "MINIMUM_SPEND_NOT_MET"
  | "QUALIFYING_ORDER_REQUIRED"
  | "TOKEN_NOT_FOUND"
  | "TOKEN_EXPIRED"
  | "TOKEN_ALREADY_USED"
  | "TOKEN_REVOKED"
  | "TOKEN_INVALID"
  | "RESTAURANT_NOT_ALLOWED"
  | "RISK_REVIEW_REQUIRED"
  | "DUPLICATE_OPERATION"
  | "CURRENCY_MISMATCH"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface LoyaltyDomainError {
  readonly code:
    LoyaltyErrorCode;

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

export function isLoyaltyAccountActive(
  account: LoyaltyAccount,
): boolean {
  return (
    account.status === "active"
  );
}


export function isRewardAvailable(
  reward: RewardGrant,
  now = new Date(),
): boolean {
  if (
    reward.status !== "available"
  ) {
    return false;
  }

  if (
    !reward.expiresAt
  ) {
    return true;
  }

  return (
    new Date(
      reward.expiresAt,
    ).getTime() >
    now.getTime()
  );
}


export function isReferralCampaignActive(
  campaign: ReferralCampaign,
  now = new Date(),
): boolean {
  if (
    campaign.status !== "active"
  ) {
    return false;
  }

  const time =
    now.getTime();

  if (
    campaign.startsAt &&
    new Date(
      campaign.startsAt,
    ).getTime() > time
  ) {
    return false;
  }

  if (
    campaign.endsAt &&
    new Date(
      campaign.endsAt,
    ).getTime() < time
  ) {
    return false;
  }

  return true;
}


export function moneyMeetsMinimum(
  value: Money,
  minimum: Money,
): boolean {
  return (
    value.currency ===
      minimum.currency &&
    value.amountMinor >=
      minimum.amountMinor
  );
}


export function isSelfReferral(
  referrerCustomerId:
    CustomerId,
  refereeCustomerId:
    CustomerId,
): boolean {
  return (
    referrerCustomerId ===
    refereeCustomerId
  );
}


export function canQualifyReferral(
  campaign: ReferralCampaign,
  referral: Referral,
  context:
    ReferralQualificationContext,
): boolean {
  if (
    !isReferralCampaignActive(
      campaign,
    )
  ) {
    return false;
  }

  if (
    isSelfReferral(
      referral.referrerCustomerId,
      context.refereeCustomerId,
    )
  ) {
    return false;
  }

  if (
    !context.orderCompleted
  ) {
    return false;
  }

  if (
    campaign.paymentRequired &&
    !context.paymentCompleted
  ) {
    return false;
  }

  if (
    campaign.firstCompletedOrderOnly &&
    !context.firstCompletedOrder
  ) {
    return false;
  }

  if (
    !moneyMeetsMinimum(
      context.spend,
      campaign.minimumQualifyingSpend,
    )
  ) {
    return false;
  }

  if (
    campaign.allowedRestaurantIds
      .length > 0 &&
    !campaign.allowedRestaurantIds
      .includes(
        context.restaurantId,
      )
  ) {
    return false;
  }

  if (
    campaign.allowedChannels
      .length > 0 &&
    !campaign.allowedChannels
      .includes(
        context.channel,
      )
  ) {
    return false;
  }

  return true;
}


export function rewardCanBeUsedAtRestaurant(
  reward:
    RewardDefinition,
  restaurantId:
    RestaurantId,
): boolean {
  const allowed =
    reward.eligibility
      .allowedRestaurantIds;

  return (
    allowed.length === 0 ||
    allowed.includes(
      restaurantId,
    )
  );
}


export function isOneTimeRewardToken(
  token:
    LoyaltyTokenRecord,
): boolean {
  return (
    token.purpose ===
      "reward_redemption" &&
    token.mode ===
      "one_time"
  );
}
