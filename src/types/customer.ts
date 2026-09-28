/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Customer Domain
 * ============================================================
 *
 * Contrato central del cliente.
 *
 * Preparado para:
 *
 * - clientes invitados
 * - clientes registrados
 * - múltiples países
 * - múltiples idiomas
 * - direcciones
 * - pedidos
 * - delivery
 * - pickup
 * - preferencias
 * - GDPR / consentimiento
 * - marketing
 * - fidelización
 * - cumpleaños
 * - promociones
 * - CRM
 * - RC ORDERA
 *
 * PRINCIPIO:
 *
 * La identidad comercial del cliente pertenece al ecosistema
 * Rincón Colombiano, no a una plataforma externa.
 */

import type {
  AuditTimestamps,
  CountryCode,
  CurrencyCode,
  IsoDate,
  IsoDateTime,
  LocalizedText,
  Money,
  PostalAddress,
  RequestId,
} from "@/types/common";

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  RestaurantId,
} from "@/types/restaurant";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type CustomerId =
  string;

export type CustomerAddressId =
  string;

export type CustomerConsentId =
  string;

export type LoyaltyAccountId =
  string;

export type LoyaltyTransactionId =
  string;

export type CustomerSessionId =
  string;


/* ============================================================
   CUSTOMER TYPE
   ============================================================ */

export type CustomerType =
  | "guest"
  | "registered";


export type CustomerStatus =
  | "active"
  | "inactive"
  | "blocked"
  | "deleted";


/* ============================================================
   PROFILE
   ============================================================ */

export interface CustomerProfile {
  readonly firstName?:
    string;

  readonly lastName?:
    string;

  readonly displayName?:
    string;

  readonly phone?:
    string;

  readonly email?:
    string;

  /**
   * Fecha opcional.
   *
   * YYYY-MM-DD
   */
  readonly birthDate?:
    IsoDate;
}


/* ============================================================
   LOCALE / MARKET
   ============================================================ */

export interface CustomerLocalePreferences {
  readonly locale:
    SupportedLocale;

  readonly countryCode?:
    CountryCode;

  readonly currency?:
    CurrencyCode;

  readonly timezone?:
    string;
}


/* ============================================================
   ADDRESS
   ============================================================ */

export type CustomerAddressType =
  | "home"
  | "work"
  | "other";


export interface CustomerAddress {
  readonly id:
    CustomerAddressId;

  readonly customerId:
    CustomerId;

  readonly type:
    CustomerAddressType;

  readonly label?:
    string;

  readonly address:
    PostalAddress;

  readonly apartment?:
    string;

  readonly floor?:
    string;

  readonly entrance?:
    string;

  readonly instructions?:
    string;

  readonly latitude?:
    number;

  readonly longitude?:
    number;

  /**
   * Dirección verificada mediante geocodificación.
   */
  readonly verified:
    boolean;

  readonly defaultDeliveryAddress:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   ORDER PREFERENCES
   ============================================================ */

export type PreferredFulfillment =
  | "delivery"
  | "pickup"
  | "dine_in";


export interface CustomerOrderPreferences {
  readonly preferredFulfillment?:
    PreferredFulfillment;

  readonly preferredRestaurantId?:
    RestaurantId;

  readonly defaultDeliveryInstructions?:
    string;

  readonly contactlessDeliveryPreferred?:
    boolean;
}


/* ============================================================
   FOOD PREFERENCES
   ============================================================ */

export interface CustomerFoodPreferences {
  readonly dietaryPreferences:
    readonly string[];

  readonly allergenWarnings:
    readonly string[];

  readonly favoriteProductIds:
    readonly string[];

  readonly dislikedProductIds:
    readonly string[];
}


/* ============================================================
   COMMUNICATION PREFERENCES
   ============================================================ */

export interface CustomerCommunicationPreferences {
  readonly orderEmail:
    boolean;

  readonly orderSms:
    boolean;

  readonly orderPush:
    boolean;

  readonly marketingEmail:
    boolean;

  readonly marketingSms:
    boolean;

  readonly marketingPush:
    boolean;
}


/* ============================================================
   CONSENT
   ============================================================ */

export type CustomerConsentType =
  | "privacy_policy"
  | "terms"
  | "marketing_email"
  | "marketing_sms"
  | "marketing_push"
  | "analytics"
  | "personalization";


export type ConsentStatus =
  | "granted"
  | "withdrawn";


export interface CustomerConsent {
  readonly id:
    CustomerConsentId;

  readonly customerId:
    CustomerId;

  readonly type:
    CustomerConsentType;

  readonly status:
    ConsentStatus;

  /**
   * Versión del documento aceptado.
   *
   * Ejemplo:
   *
   * privacy-v3
   */
  readonly documentVersion?:
    string;

  readonly grantedAt?:
    IsoDateTime;

  readonly withdrawnAt?:
    IsoDateTime;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   ACQUISITION / FUNNEL
   ============================================================ */

/**
 * Nos permitirá entender cómo descubren Rincón Colombiano.
 *
 * No debe utilizarse para almacenar información sensible.
 */

export type CustomerAcquisitionChannel =
  | "organic_search"
  | "google_business"
  | "direct"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "qr"
  | "referral"
  | "paid_search"
  | "paid_social"
  | "event"
  | "offline"
  | "unknown";


export interface MarketingAttribution {
  readonly channel:
    CustomerAcquisitionChannel;

  readonly source?:
    string;

  readonly medium?:
    string;

  readonly campaign?:
    string;

  readonly content?:
    string;

  readonly term?:
    string;

  /**
   * Landing page inicial.
   *
   * Ejemplo:
   *
   * /pl/menu/bandeja-paisa
   */
  readonly landingPath?:
    string;

  readonly capturedAt:
    IsoDateTime;
}


/* ============================================================
   CUSTOMER ACQUISITION
   ============================================================ */

export interface CustomerAcquisition {
  /**
   * Primera interacción conocida con la marca.
   */
  readonly firstTouch?:
    MarketingAttribution;

  /**
   * Última interacción antes de conversión.
   */
  readonly lastTouch?:
    MarketingAttribution;
}


/* ============================================================
   LOYALTY
   ============================================================ */

export type LoyaltyAccountStatus =
  | "active"
  | "paused"
  | "closed";


export interface LoyaltyAccount {
  readonly id:
    LoyaltyAccountId;

  readonly customerId:
    CustomerId;

  readonly status:
    LoyaltyAccountStatus;

  readonly pointsBalance:
    number;

  readonly lifetimePointsEarned:
    number;

  readonly lifetimePointsRedeemed:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   LOYALTY TRANSACTION
   ============================================================ */

export type LoyaltyTransactionType =
  | "earn"
  | "redeem"
  | "adjustment"
  | "expire"
  | "bonus";


export interface LoyaltyTransaction {
  readonly id:
    LoyaltyTransactionId;

  readonly loyaltyAccountId:
    LoyaltyAccountId;

  readonly type:
    LoyaltyTransactionType;

  readonly points:
    number;

  readonly orderId?:
    string;

  readonly description?:
    string;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   CUSTOMER VALUE
   ============================================================ */

/**
 * Snapshot analítico.
 *
 * No debe convertirse en fuente contable oficial.
 */

export interface CustomerValueSummary {
  readonly orderCount:
    number;

  readonly completedOrderCount:
    number;

  readonly cancelledOrderCount:
    number;

  readonly lastOrderAt?:
    IsoDateTime;

  readonly firstOrderAt?:
    IsoDateTime;

  readonly totalSpent?:
    Money;

  readonly averageOrderValue?:
    Money;
}


/* ============================================================
   CUSTOMER
   ============================================================ */

export interface Customer
  extends AuditTimestamps {
  readonly id:
    CustomerId;

  readonly type:
    CustomerType;

  readonly status:
    CustomerStatus;

  readonly profile:
    CustomerProfile;

  readonly locale:
    CustomerLocalePreferences;

  readonly orderPreferences:
    CustomerOrderPreferences;

  readonly foodPreferences:
    CustomerFoodPreferences;

  readonly communicationPreferences:
    CustomerCommunicationPreferences;

  readonly acquisition:
    CustomerAcquisition;

  readonly loyaltyAccountId?:
    LoyaltyAccountId;

  readonly valueSummary?:
    CustomerValueSummary;

  readonly lastActiveAt?:
    IsoDateTime;

  /**
   * Versión del modelo.
   */
  readonly schemaVersion:
    number;
}


/* ============================================================
   GUEST CUSTOMER
   ============================================================ */

/**
 * Una compra NO debe exigir obligatoriamente crear cuenta.
 *
 * El cliente invitado puede convertirse posteriormente
 * en usuario registrado sin perder su pedido.
 */

export interface GuestCustomer {
  readonly type:
    "guest";

  readonly sessionId:
    CustomerSessionId;

  readonly email?:
    string;

  readonly phone?:
    string;

  readonly firstName?:
    string;

  readonly locale:
    SupportedLocale;

  readonly acquisition?:
    CustomerAcquisition;
}


/* ============================================================
   CUSTOMER REGISTRATION
   ============================================================ */

export interface CreateCustomerRequest {
  readonly firstName?:
    string;

  readonly lastName?:
    string;

  readonly email?:
    string;

  readonly phone?:
    string;

  readonly locale:
    SupportedLocale;

  readonly acquisition?:
    CustomerAcquisition;

  readonly requestId:
    RequestId;
}


/* ============================================================
   CUSTOMER UPDATE
   ============================================================ */

export interface UpdateCustomerProfileRequest {
  readonly customerId:
    CustomerId;

  readonly profile:
    Partial<CustomerProfile>;

  readonly requestId:
    RequestId;
}


/* ============================================================
   CUSTOMER QUERY
   ============================================================ */

export interface CustomerQuery {
  readonly search?:
    string;

  readonly status?:
    CustomerStatus;

  readonly type?:
    CustomerType;

  readonly preferredRestaurantId?:
    RestaurantId;

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
   CUSTOMER ERROR MODEL
   ============================================================ */

export type CustomerErrorCode =
  | "CUSTOMER_NOT_FOUND"
  | "CUSTOMER_BLOCKED"
  | "INVALID_EMAIL"
  | "INVALID_PHONE"
  | "DUPLICATE_EMAIL"
  | "DUPLICATE_PHONE"
  | "CONSENT_REQUIRED"
  | "INVALID_ADDRESS"
  | "LOYALTY_ACCOUNT_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface CustomerDomainError {
  readonly code:
    CustomerErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   CUSTOMER HELPERS
   ============================================================ */

export function isRegisteredCustomer(
  customer: Customer,
): boolean {
  return (
    customer.type ===
    "registered"
  );
}


export function isActiveCustomer(
  customer: Customer,
): boolean {
  return (
    customer.status ===
    "active"
  );
}


export function customerCanReceiveMarketing(
  customer:
    Customer,
): boolean {
  return (
    customer.status ===
      "active" &&
    (
      customer
        .communicationPreferences
        .marketingEmail ||
      customer
        .communicationPreferences
        .marketingSms ||
      customer
        .communicationPreferences
        .marketingPush
    )
  );
}
