/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Domain Foundation
 * ============================================================
 *
 * Tipos fundamentales compartidos por todo el ecosistema.
 *
 * Este archivo debe permanecer:
 * - pequeño
 * - estable
 * - independiente de dominios específicos
 *
 * Puede ser utilizado por:
 *
 * - website
 * - RC ORDERA
 * - menu
 * - orders
 * - delivery
 * - restaurants
 * - customers
 * - reservations
 * - catering
 * - inventory
 * - analytics
 * - POS
 *
 * PRINCIPIO:
 *
 * Conceptos universales deben definirse UNA sola vez.
 */

import type {
  SupportedLocale,
} from "@/config/site";


/* ============================================================
   GENERIC UTILITIES
   ============================================================ */

/**
 * Marca tipos primitivos para evitar mezclar IDs
 * pertenecientes a dominios diferentes.
 *
 * Ejemplo:
 *
 * type OrderId =
 *   Brand<string, "OrderId">;
 *
 * type RestaurantId =
 *   Brand<string, "RestaurantId">;
 */

export type Brand<
  TValue,
  TBrand extends string,
> = TValue & {
  readonly __brand: TBrand;
};


/**
 * Hace todas las propiedades profundamente readonly.
 */
export type DeepReadonly<T> =
  T extends (
    string |
    number |
    boolean |
    bigint |
    symbol |
    null |
    undefined
  )
    ? T
    : T extends readonly (
        infer U
      )[]
      ? readonly DeepReadonly<U>[]
      : {
          readonly [
            K in keyof T
          ]: DeepReadonly<T[K]>;
        };


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type EntityId =
  string;

export type RequestId =
  string;

export type CorrelationId =
  string;

export type UserId =
  string;

export type OrganizationId =
  string;

export type LocationId =
  string;


/* ============================================================
   DATE / TIME
   ============================================================ */

/**
 * YYYY-MM-DD
 */
export type IsoDate =
  string;


/**
 * ISO-8601 datetime.
 *
 * Ejemplo:
 *
 * 2026-09-28T20:30:00Z
 */
export type IsoDateTime =
  string;


/**
 * HH:mm
 */
export type LocalTime =
  string;


/**
 * IANA timezone.
 *
 * Ejemplos:
 *
 * Europe/Warsaw
 * America/Bogota
 */
export type IanaTimeZone =
  string;


/* ============================================================
   INTERNATIONALIZATION
   ============================================================ */

export type LocaleCode =
  SupportedLocale;


/**
 * Texto con fallback obligatorio.
 */
export interface LocalizedText {
  readonly default:
    string;

  readonly translations?:
    Readonly<
      Partial<
        Record<
          SupportedLocale,
          string
        >
      >
    >;
}


/**
 * Contenido textual común.
 */
export interface LocalizedContent {
  readonly name:
    LocalizedText;

  readonly description?:
    LocalizedText;

  readonly shortDescription?:
    LocalizedText;
}


/* ============================================================
   COUNTRY / CURRENCY
   ============================================================ */

/**
 * ISO 3166-1 alpha-2.
 *
 * Ejemplos:
 *
 * PL
 * CO
 * ES
 * DE
 */
export type CountryCode =
  string;


/**
 * ISO 4217.
 *
 * Ejemplos:
 *
 * PLN
 * EUR
 * COP
 * USD
 */
export type CurrencyCode =
  string;


/* ============================================================
   MONEY
   ============================================================ */

/**
 * El dinero SIEMPRE se representa en unidades menores.
 *
 * Ejemplos:
 *
 * 60,00 PLN
 *
 * amountMinor = 6000
 *
 * 65.000 COP
 *
 * amountMinor = 6500000
 */
export interface Money {
  readonly amountMinor:
    number;

  readonly currency:
    CurrencyCode;
}


/**
 * Dinero igual a cero.
 */
export function zeroMoney(
  currency: CurrencyCode,
): Money {
  return {
    amountMinor: 0,
    currency,
  };
}


/**
 * Convierte a unidades principales.
 */
export function moneyToMajorUnits(
  money: Money,
): number {
  return (
    money.amountMinor /
    100
  );
}


/**
 * Comprueba si dos cantidades
 * utilizan la misma moneda.
 */
export function hasSameCurrency(
  first: Money,
  second: Money,
): boolean {
  return (
    first.currency ===
    second.currency
  );
}


/**
 * Suma dinero únicamente si
 * las monedas coinciden.
 */
export function addMoney(
  first: Money,
  second: Money,
): Money {
  if (
    !hasSameCurrency(
      first,
      second,
    )
  ) {
    throw new Error(
      "Cannot add money with different currencies.",
    );
  }

  return {
    amountMinor:
      first.amountMinor +
      second.amountMinor,

    currency:
      first.currency,
  };
}


/**
 * Resta dinero únicamente si
 * las monedas coinciden.
 */
export function subtractMoney(
  first: Money,
  second: Money,
): Money {
  if (
    !hasSameCurrency(
      first,
      second,
    )
  ) {
    throw new Error(
      "Cannot subtract money with different currencies.",
    );
  }

  return {
    amountMinor:
      first.amountMinor -
      second.amountMinor,

    currency:
      first.currency,
  };
}


/* ============================================================
   GEOGRAPHY
   ============================================================ */

export interface GeoCoordinates {
  readonly latitude:
    number;

  readonly longitude:
    number;
}


export interface GeoBoundingBox {
  readonly north:
    number;

  readonly south:
    number;

  readonly east:
    number;

  readonly west:
    number;
}


/* ============================================================
   ADDRESS
   ============================================================ */

export interface PostalAddress {
  readonly street:
    string;

  readonly streetNumber?:
    string;

  readonly unit?:
    string;

  readonly postalCode?:
    string;

  readonly city:
    string;

  readonly district?:
    string;

  readonly region?:
    string;

  readonly country:
    string;

  readonly countryCode:
    CountryCode;

  readonly formattedAddress?:
    string;
}


/* ============================================================
   AUDIT
   ============================================================ */

export interface AuditTimestamps {
  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


export interface AuditMetadata
  extends AuditTimestamps {
  readonly createdBy?:
    UserId;

  readonly updatedBy?:
    UserId;
}


/* ============================================================
   VERSIONING
   ============================================================ */

export interface VersionedEntity {
  readonly version:
    string;
}


export interface RevisionMetadata {
  readonly revision:
    number;

  readonly version:
    string;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   API METADATA
   ============================================================ */

export interface ApiRequestMetadata {
  readonly requestId:
    RequestId;

  readonly correlationId?:
    CorrelationId;
}


export interface ApiResponseMetadata {
  readonly requestId?:
    RequestId;

  readonly correlationId?:
    CorrelationId;

  readonly generatedAt?:
    IsoDateTime;

  readonly cached?:
    boolean;
}


/* ============================================================
   RESULT TYPE
   ============================================================ */

/**
 * Resultado explícito.
 *
 * Evita depender siempre de excepciones para
 * errores esperados de negocio.
 */

export type Result<
  TValue,
  TError,
> =
  | {
      readonly ok: true;

      readonly value: TValue;
    }
  | {
      readonly ok: false;

      readonly error: TError;
    };


export function success<
  TValue,
>(
  value: TValue,
): Result<TValue, never> {
  return {
    ok: true,
    value,
  };
}


export function failure<
  TError,
>(
  error: TError,
): Result<never, TError> {
  return {
    ok: false,
    error,
  };
}


/* ============================================================
   STANDARD API RESPONSE
   ============================================================ */

export interface ApiSuccessResponse<
  TData,
> {
  readonly success:
    true;

  readonly data:
    TData;

  readonly meta?:
    ApiResponseMetadata;
}


export interface ApiFailureResponse<
  TError,
> {
  readonly success:
    false;

  readonly error:
    TError;

  readonly meta?:
    ApiResponseMetadata;
}


export type ApiResponse<
  TData,
  TError,
> =
  | ApiSuccessResponse<TData>
  | ApiFailureResponse<TError>;


/* ============================================================
   DOMAIN ERROR
   ============================================================ */

export type ErrorSeverity =
  | "info"
  | "warning"
  | "error"
  | "critical";


export interface DomainError<
  TCode extends string =
    string,
> {
  readonly code:
    TCode;

  /**
   * Mensaje técnico seguro.
   *
   * No debe contener:
   *
   * - passwords
   * - tokens
   * - claves privadas
   * - información sensible
   */
  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly severity:
    ErrorSeverity;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   PAGINATION
   ============================================================ */

export interface PagePaginationRequest {
  readonly page:
    number;

  readonly pageSize:
    number;
}


export interface PagePaginationMetadata {
  readonly page:
    number;

  readonly pageSize:
    number;

  readonly totalItems:
    number;

  readonly totalPages:
    number;

  readonly hasNextPage:
    boolean;

  readonly hasPreviousPage:
    boolean;
}


/**
 * Para datasets grandes preferiremos
 * cursor pagination.
 */

export interface CursorPaginationRequest {
  readonly cursor?:
    string;

  readonly limit:
    number;
}


export interface CursorPaginationMetadata {
  readonly nextCursor?:
    string;

  readonly previousCursor?:
    string;

  readonly hasMore:
    boolean;
}


export interface PaginatedResponse<
  TItem,
> {
  readonly items:
    readonly TItem[];

  readonly pagination:
    PagePaginationMetadata;
}


export interface CursorPaginatedResponse<
  TItem,
> {
  readonly items:
    readonly TItem[];

  readonly pagination:
    CursorPaginationMetadata;
}


/* ============================================================
   SORTING
   ============================================================ */

export type SortDirection =
  | "asc"
  | "desc";


export interface SortOption<
  TField extends string =
    string,
> {
  readonly field:
    TField;

  readonly direction:
    SortDirection;
}


/* ============================================================
   ENTITY STATUS
   ============================================================ */

export type GenericEntityStatus =
  | "draft"
  | "active"
  | "inactive"
  | "archived";


/* ============================================================
   FEATURE STATE
   ============================================================ */

export interface FeatureState {
  readonly enabled:
    boolean;

  readonly publiclyVisible:
    boolean;

  readonly temporarilyPaused:
    boolean;

  readonly pauseReason?:
    LocalizedText;
}


/* ============================================================
   VALIDATION
   ============================================================ */

export interface ValidationIssue {
  readonly field?:
    string;

  readonly code:
    string;

  readonly message:
    string;
}


export interface ValidationResult {
  readonly valid:
    boolean;

  readonly issues:
    readonly ValidationIssue[];
}


/* ============================================================
   CACHE
   ============================================================ */

export interface CacheMetadata {
  readonly cached:
    boolean;

  readonly cacheKey?:
    string;

  readonly generatedAt:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   REQUEST CONTEXT
   ============================================================ */

/**
 * Contexto interno de una solicitud.
 *
 * Especialmente útil para:
 *
 * logs
 * tracing
 * auditoría
 * debugging
 */

export interface RequestContext {
  readonly requestId:
    RequestId;

  readonly correlationId?:
    CorrelationId;

  readonly locale:
    SupportedLocale;

  readonly timestamp:
    IsoDateTime;

  readonly userId?:
    UserId;

  readonly organizationId?:
    OrganizationId;

  readonly locationId?:
    LocationId;
}


/* ============================================================
   SAFE STRING HELPERS
   ============================================================ */

export function isNonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value ===
      "string" &&
    value.trim().length >
      0
  );
}


/* ============================================================
   COORDINATE VALIDATION
   ============================================================ */

export function isValidLatitude(
  latitude: number,
): boolean {
  return (
    Number.isFinite(
      latitude,
    ) &&
    latitude >= -90 &&
    latitude <= 90
  );
}


export function isValidLongitude(
  longitude: number,
): boolean {
  return (
    Number.isFinite(
      longitude,
    ) &&
    longitude >= -180 &&
    longitude <= 180
  );
}


export function isValidCoordinates(
  coordinates:
    GeoCoordinates,
): boolean {
  return (
    isValidLatitude(
      coordinates.latitude,
    ) &&
    isValidLongitude(
      coordinates.longitude,
    )
  );
}
