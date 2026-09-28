/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Delivery Domain
 * ============================================================
 *
 * Contrato central del sistema de delivery.
 *
 * Diseñado para soportar:
 *
 * - múltiples restaurantes
 * - selección automática de sede
 * - múltiples países
 * - geocodificación
 * - delivery por distancia
 * - delivery por polígonos
 * - delivery por códigos postales
 * - tarifas variables
 * - pedido mínimo
 * - ETA
 * - repartidores internos
 * - partners externos
 * - zonas exclusivas
 * - cierres temporales
 * - saturación
 * - validación de dirección
 * - tracking
 * - RC ORDERA
 *
 * PRINCIPIO:
 *
 * La web NO decide por sí sola si una dirección tiene delivery.
 *
 * La web solicita una evaluación al motor de delivery.
 */


/* ============================================================
   IMPORTS
   ============================================================ */

import type {
  Money,
} from "@/types/menu";

import type {
  RestaurantId,
  GeoCoordinates,
  IsoDateTime,
  CountryCode,
} from "@/types/restaurant";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type DeliveryZoneId = string;

export type DeliveryQuoteId = string;

export type DeliveryRequestId = string;

export type DeliveryProviderId = string;

export type CourierId = string;

export type DeliveryTrackingId = string;

export type AddressId = string;

export type RouteId = string;


/* ============================================================
   ADDRESS
   ============================================================ */

export interface DeliveryAddress {
  readonly id?: AddressId;

  readonly street: string;

  readonly streetNumber?: string;

  readonly apartment?: string;

  readonly floor?: string;

  readonly entrance?: string;

  readonly postalCode?: string;

  readonly city: string;

  readonly district?: string;

  readonly region?: string;

  readonly country: string;

  readonly countryCode: CountryCode;

  /**
   * Dirección completa para mostrar.
   */
  readonly formattedAddress?: string;

  /**
   * Instrucciones proporcionadas por el cliente.
   *
   * Ejemplo:
   *
   * "Portero 24"
   * "Entrada por el patio"
   * "Llamar al llegar"
   */
  readonly deliveryInstructions?: string;
}


/* ============================================================
   GEOCODING
   ============================================================ */

export type GeocodingProvider =
  | "google"
  | "mapbox"
  | "here"
  | "osm"
  | "internal";


export type GeocodingPrecision =
  | "rooftop"
  | "parcel"
  | "street"
  | "postal_code"
  | "city"
  | "approximate"
  | "unknown";


export interface GeocodedAddress {
  readonly address:
    DeliveryAddress;

  readonly coordinates:
    GeoCoordinates;

  readonly provider:
    GeocodingProvider;

  readonly providerPlaceId?: string;

  readonly precision:
    GeocodingPrecision;

  readonly verified:
    boolean;

  readonly verifiedAt:
    IsoDateTime;
}


/* ============================================================
   DELIVERY STRATEGY
   ============================================================ */

export type DeliveryZoneStrategy =
  | "distance"
  | "polygon"
  | "postal_code"
  | "district"
  | "hybrid";


/* ============================================================
   DELIVERY MODES
   ============================================================ */

export type DeliveryFulfillmentMode =
  | "internal"
  | "partner"
  | "hybrid";


/* ============================================================
   DELIVERY PROVIDERS
   ============================================================ */

export type DeliveryProviderType =
  | "internal"
  | "wolt"
  | "uber"
  | "bolt"
  | "glovo"
  | "stuart"
  | "custom";


export interface DeliveryProvider {
  readonly id:
    DeliveryProviderId;

  readonly type:
    DeliveryProviderType;

  readonly name:
    string;

  readonly enabled:
    boolean;

  readonly supportsTracking:
    boolean;

  readonly supportsQuotes:
    boolean;

  readonly supportsCancellation:
    boolean;

  readonly supportsScheduledDelivery:
    boolean;
}


/* ============================================================
   DISTANCE
   ============================================================ */

export interface DeliveryDistance {
  /**
   * Distancia por carretera.
   */
  readonly roadMeters:
    number;

  /**
   * Distancia geográfica directa.
   */
  readonly straightLineMeters?:
    number;

  /**
   * Duración aproximada de trayecto.
   */
  readonly durationSeconds?:
    number;
}


/* ============================================================
   DELIVERY ZONE
   ============================================================ */

export type DeliveryZoneStatus =
  | "active"
  | "inactive"
  | "scheduled"
  | "archived";


export interface DeliveryZone {
  readonly id:
    DeliveryZoneId;

  readonly restaurantId:
    RestaurantId;

  readonly name:
    string;

  readonly status:
    DeliveryZoneStatus;

  readonly strategy:
    DeliveryZoneStrategy;

  /**
   * Prioridad.
   *
   * Una zona con menor número tiene prioridad superior.
   */
  readonly priority:
    number;

  readonly currency:
    string;

  /**
   * Precio base del delivery.
   */
  readonly deliveryFee:
    Money;

  /**
   * Pedido mínimo.
   */
  readonly minimumOrder?:
    Money;

  /**
   * Entrega gratuita a partir de cierto valor.
   */
  readonly freeDeliveryThreshold?:
    Money;

  /**
   * Máxima distancia permitida.
   *
   * Solo se utiliza cuando la estrategia corresponde.
   */
  readonly maxDistanceMeters?:
    number;

  /**
   * Mínima distancia.
   *
   * Útil cuando tenemos varias franjas:
   *
   * 0–3 km
   * 3–5 km
   * 5–7 km
   */
  readonly minDistanceMeters?:
    number;

  /**
   * Códigos postales admitidos.
   */
  readonly postalCodes?:
    readonly string[];

  /**
   * Distritos admitidos.
   */
  readonly districts?:
    readonly string[];

  /**
   * Polígono geográfico.
   *
   * Orden:
   *
   * longitude, latitude
   */
  readonly polygon?: readonly (
    readonly [
      number,
      number,
    ]
  )[];

  /**
   * Tiempo adicional que añade esta zona.
   */
  readonly additionalEtaMinutes?:
    number;
}


/* ============================================================
   DELIVERY SURCHARGE
   ============================================================ */

export type DeliverySurchargeReason =
  | "distance"
  | "peak_hours"
  | "weather"
  | "high_demand"
  | "partner_fee"
  | "special_zone"
  | "other";


export interface DeliverySurcharge {
  readonly reason:
    DeliverySurchargeReason;

  readonly label:
    string;

  readonly amount:
    Money;
}


/* ============================================================
   DELIVERY DISCOUNT
   ============================================================ */

export type DeliveryDiscountReason =
  | "free_delivery_threshold"
  | "promotion"
  | "loyalty"
  | "manual"
  | "other";


export interface DeliveryDiscount {
  readonly reason:
    DeliveryDiscountReason;

  readonly label:
    string;

  readonly amount:
    Money;
}


/* ============================================================
   DELIVERY FEE BREAKDOWN
   ============================================================ */

export interface DeliveryFeeBreakdown {
  readonly baseFee:
    Money;

  readonly surcharges:
    readonly DeliverySurcharge[];

  readonly discounts:
    readonly DeliveryDiscount[];

  readonly finalFee:
    Money;
}


/* ============================================================
   SERVICEABILITY
   ============================================================ */

export type DeliveryServiceabilityStatus =
  | "available"
  | "outside_zone"
  | "restaurant_closed"
  | "delivery_paused"
  | "capacity_reached"
  | "address_invalid"
  | "address_not_precise"
  | "minimum_order_not_met"
  | "temporarily_unavailable"
  | "unsupported_country"
  | "unsupported_city";


export interface DeliveryServiceability {
  readonly available:
    boolean;

  readonly status:
    DeliveryServiceabilityStatus;

  readonly restaurantId?:
    RestaurantId;

  readonly zoneId?:
    DeliveryZoneId;

  readonly message?:
    string;
}


/* ============================================================
   RESTAURANT CANDIDATE
   ============================================================ */

/**
 * Cuando varias sedes pueden entregar a una dirección,
 * el motor puede evaluarlas.
 */

export interface DeliveryRestaurantCandidate {
  readonly restaurantId:
    RestaurantId;

  readonly serviceable:
    boolean;

  readonly zoneId?:
    DeliveryZoneId;

  readonly distance?:
    DeliveryDistance;

  readonly estimatedDeliveryMinutes?:
    number;

  readonly estimatedPreparationMinutes?:
    number;

  readonly deliveryFee?:
    Money;

  /**
   * Score interno.
   *
   * No mostrar directamente al cliente.
   */
  readonly score?:
    number;

  readonly rejectionReason?:
    DeliveryServiceabilityStatus;
}


/* ============================================================
   LOCATION SELECTION
   ============================================================ */

export type RestaurantSelectionStrategy =
  | "nearest"
  | "fastest"
  | "lowest_delivery_fee"
  | "capacity_balanced"
  | "priority"
  | "hybrid";


export interface DeliveryRestaurantSelection {
  readonly strategy:
    RestaurantSelectionStrategy;

  readonly selectedRestaurantId:
    RestaurantId;

  readonly candidates:
    readonly DeliveryRestaurantCandidate[];

  readonly selectedAt:
    IsoDateTime;
}


/* ============================================================
   DELIVERY QUOTE REQUEST
   ============================================================ */

export interface DeliveryQuoteRequest {
  readonly requestId:
    DeliveryRequestId;

  readonly destination:
    DeliveryAddress;

  /**
   * Valor de productos.
   *
   * Sin delivery.
   */
  readonly subtotal:
    Money;

  readonly preferredRestaurantId?:
    RestaurantId;

  readonly scheduledFor?:
    IsoDateTime;
}


/* ============================================================
   DELIVERY ETA
   ============================================================ */

export interface DeliveryEta {
  /**
   * Preparación.
   */
  readonly preparationMinutes:
    number;

  /**
   * Espera estimada antes de asignar courier.
   */
  readonly dispatchMinutes:
    number;

  /**
   * Transporte.
   */
  readonly travelMinutes:
    number;

  readonly totalMinutes:
    number;

  /**
   * Ventana estimada.
   *
   * Ejemplo:
   *
   * 45–60 minutos
   */
  readonly minimumMinutes:
    number;

  readonly maximumMinutes:
    number;
}


/* ============================================================
   DELIVERY QUOTE
   ============================================================ */

export interface DeliveryQuote {
  readonly id:
    DeliveryQuoteId;

  readonly requestId:
    DeliveryRequestId;

  readonly available:
    boolean;

  readonly serviceability:
    DeliveryServiceability;

  readonly restaurantId?:
    RestaurantId;

  readonly zoneId?:
    DeliveryZoneId;

  readonly destination:
    GeocodedAddress;

  readonly distance?:
    DeliveryDistance;

  readonly fees?:
    DeliveryFeeBreakdown;

  readonly minimumOrder?:
    Money;

  readonly eta?:
    DeliveryEta;

  readonly fulfillmentMode?:
    DeliveryFulfillmentMode;

  readonly providerId?:
    DeliveryProviderId;

  readonly restaurantSelection?:
    DeliveryRestaurantSelection;

  /**
   * Un quote no debe vivir indefinidamente.
   *
   * Tarifas y disponibilidad pueden cambiar.
   */
  readonly expiresAt:
    IsoDateTime;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   DELIVERY JOB
   ============================================================ */

export type DeliveryJobStatus =
  | "pending"
  | "awaiting_assignment"
  | "assigned"
  | "courier_arriving"
  | "picked_up"
  | "in_transit"
  | "arriving"
  | "delivered"
  | "failed"
  | "cancelled";


export interface DeliveryJob {
  readonly id:
    string;

  readonly trackingId:
    DeliveryTrackingId;

  readonly orderId:
    string;

  readonly restaurantId:
    RestaurantId;

  readonly destination:
    GeocodedAddress;

  readonly status:
    DeliveryJobStatus;

  readonly providerId?:
    DeliveryProviderId;

  readonly courierId?:
    CourierId;

  readonly routeId?:
    RouteId;

  readonly estimatedArrivalAt?:
    IsoDateTime;

  readonly pickedUpAt?:
    IsoDateTime;

  readonly deliveredAt?:
    IsoDateTime;

  readonly cancelledAt?:
    IsoDateTime;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   COURIER
   ============================================================ */

export type CourierStatus =
  | "offline"
  | "available"
  | "assigned"
  | "busy"
  | "paused";


export interface Courier {
  readonly id:
    CourierId;

  readonly displayName:
    string;

  readonly status:
    CourierStatus;

  readonly providerId?:
    DeliveryProviderId;

  readonly currentLocation?:
    GeoCoordinates;

  readonly lastLocationUpdateAt?:
    IsoDateTime;
}


/* ============================================================
   TRACKING
   ============================================================ */

export interface DeliveryTrackingEvent {
  readonly id:
    string;

  readonly trackingId:
    DeliveryTrackingId;

  readonly status:
    DeliveryJobStatus;

  readonly occurredAt:
    IsoDateTime;

  readonly coordinates?:
    GeoCoordinates;

  readonly publicMessage?:
    string;
}


export interface DeliveryTrackingSnapshot {
  readonly trackingId:
    DeliveryTrackingId;

  readonly status:
    DeliveryJobStatus;

  readonly estimatedArrivalAt?:
    IsoDateTime;

  readonly events:
    readonly DeliveryTrackingEvent[];

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   CAPACITY
   ============================================================ */

/**
 * Una sede puede tener cobertura geográfica correcta
 * pero estar saturada.
 */

export interface DeliveryCapacity {
  readonly restaurantId:
    RestaurantId;

  readonly acceptingOrders:
    boolean;

  readonly activeDeliveries:
    number;

  readonly maximumConcurrentDeliveries?:
    number;

  readonly estimatedPreparationMinutes:
    number;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   ROUTING
   ============================================================ */

export interface DeliveryRoute {
  readonly id:
    RouteId;

  readonly origin:
    GeoCoordinates;

  readonly destination:
    GeoCoordinates;

  readonly distance:
    DeliveryDistance;

  /**
   * Línea codificada del mapa.
   */
  readonly polyline?: string;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   API RESPONSES
   ============================================================ */

export interface DeliveryQuoteResponse {
  readonly quote:
    DeliveryQuote;

  readonly cached:
    boolean;

  readonly requestId:
    string;
}


export interface DeliveryTrackingResponse {
  readonly tracking:
    DeliveryTrackingSnapshot;

  readonly requestId?:
    string;
}


/* ============================================================
   ERROR MODEL
   ============================================================ */

export type DeliveryErrorCode =
  | "ADDRESS_REQUIRED"
  | "ADDRESS_INVALID"
  | "ADDRESS_NOT_PRECISE"
  | "GEOCODING_FAILED"
  | "OUTSIDE_DELIVERY_ZONE"
  | "RESTAURANT_NOT_FOUND"
  | "RESTAURANT_CLOSED"
  | "DELIVERY_PAUSED"
  | "CAPACITY_REACHED"
  | "MINIMUM_ORDER_NOT_MET"
  | "NO_DELIVERY_PROVIDER"
  | "QUOTE_EXPIRED"
  | "PROVIDER_ERROR"
  | "ROUTING_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UPSTREAM_ERROR"
  | "UNKNOWN";


export interface DeliveryDomainError {
  readonly code:
    DeliveryErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?:
    string;

  readonly restaurantId?:
    RestaurantId;
}


/* ============================================================
   HELPERS
   ============================================================ */

export function metersToKilometers(
  meters: number,
): number {
  return meters / 1000;
}


export function kilometersToMeters(
  kilometers: number,
): number {
  return kilometers * 1000;
}


export function isDeliveryQuoteValid(
  quote: DeliveryQuote,
  now = new Date(),
): boolean {
  return (
    new Date(
      quote.expiresAt,
    ).getTime() >
    now.getTime()
  );
}


export function isDeliveryAvailable(
  quote: DeliveryQuote,
): boolean {
  return (
    quote.available &&
    quote.serviceability.available
  );
}


export function isFinalDeliveryStatus(
  status: DeliveryJobStatus,
): boolean {
  return (
    status === "delivered" ||
    status === "failed" ||
    status === "cancelled"
  );
}


/* ============================================================
   MONEY VALIDATION
   ============================================================ */

export function hasSameCurrency(
  first: Money,
  second: Money,
): boolean {
  return (
    first.currency ===
    second.currency
  );
}
