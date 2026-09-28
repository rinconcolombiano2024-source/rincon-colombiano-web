/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Order Domain
 * ============================================================
 *
 * Contrato central de pedidos.
 *
 * Este dominio debe poder ser compartido por:
 *
 * - rinconcolombiano.pl
 * - RC ORDERA
 * - POS
 * - delivery
 * - apps móviles
 * - kitchen display
 * - administración
 * - analytics
 * - pagos
 *
 * PRINCIPIOS:
 *
 * 1. Un pedido tiene un ID estable.
 * 2. Nunca recalculamos un pedido histórico usando precios actuales.
 * 3. Los importes se guardan como snapshots.
 * 4. Cada cambio importante deja trazabilidad.
 * 5. Los intentos repetidos deben ser idempotentes.
 * 6. Delivery y pickup son fulfillment, no tipos de producto.
 */

import type {
  ApiResponseMetadata,
  AuditTimestamps,
  CorrelationId,
  CurrencyCode,
  DomainError,
  IsoDateTime,
  LocalizedText,
  Money,
  RequestId,
  Result,
  UserId,
} from "@/types/common";

import type {
  MenuChannel,
  MenuItemId,
  ModifierOptionId,
} from "@/types/menu";

import type {
  DeliveryQuoteId,
  DeliveryTrackingId,
} from "@/types/delivery";

import type {
  RestaurantId,
} from "@/types/restaurant";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type OrderId =
  string;

export type OrderLineId =
  string;

export type CartId =
  string;

export type CustomerId =
  string;

export type PaymentId =
  string;

export type RefundId =
  string;

export type PromotionId =
  string;

export type CouponId =
  string;

export type OrderEventId =
  string;

export type IdempotencyKey =
  string;


/* ============================================================
   ORDER NUMBER
   ============================================================ */

/**
 * ID técnico:
 *
 * ord_01J...
 *
 * Número humano:
 *
 * RC-2026-000123
 *
 * Nunca utilizar el número visible como ID de base de datos.
 */

export interface OrderIdentity {
  readonly id:
    OrderId;

  readonly orderNumber:
    string;
}


/* ============================================================
   CHANNEL
   ============================================================ */

export type OrderChannel =
  | "website"
  | "mobile_web"
  | "app"
  | "pos"
  | "phone"
  | "admin"
  | "integration";


/* ============================================================
   ORDER TYPE
   ============================================================ */

export type FulfillmentType =
  | "pickup"
  | "delivery"
  | "dine_in";


/* ============================================================
   ORDER STATUS
   ============================================================ */

/**
 * Estado comercial principal.
 *
 * Debe permanecer independiente del estado del pago
 * y del estado del delivery.
 */

export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "rejected";


/* ============================================================
   FULFILLMENT STATUS
   ============================================================ */

export type FulfillmentStatus =
  | "pending"
  | "scheduled"
  | "preparing"
  | "ready_for_pickup"
  | "awaiting_courier"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "collected"
  | "failed"
  | "cancelled";


/* ============================================================
   PAYMENT STATUS
   ============================================================ */

export type PaymentStatus =
  | "not_required"
  | "pending"
  | "authorized"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "failed"
  | "cancelled";


/* ============================================================
   PAYMENT METHOD
   ============================================================ */

export type PaymentMethod =
  | "cash"
  | "card"
  | "online_card"
  | "blik"
  | "bank_transfer"
  | "terminal"
  | "voucher"
  | "other";


/* ============================================================
   CUSTOMER
   ============================================================ */

/**
 * Snapshot de cliente.
 *
 * No queremos que un pedido histórico cambie si el cliente
 * modifica posteriormente su perfil.
 */

export interface OrderCustomer {
  readonly customerId?:
    CustomerId;

  readonly firstName?:
    string;

  readonly lastName?:
    string;

  readonly phone?:
    string;

  readonly email?:
    string;

  readonly locale?:
    string;
}


/* ============================================================
   LINE SNAPSHOT
   ============================================================ */

/**
 * El nombre y precio se guardan como snapshot.
 *
 * Si mañana una Bandeja Paisa cambia de 60 PLN a 65 PLN,
 * el pedido histórico debe seguir mostrando 60 PLN.
 */

export interface OrderLineProductSnapshot {
  readonly menuItemId:
    MenuItemId;

  readonly productName:
    string;

  readonly sku?:
    string;

  readonly unitPrice:
    Money;

  readonly taxRateBasisPoints:
    number;

  readonly taxIncluded:
    boolean;
}


/* ============================================================
   MODIFIER SNAPSHOT
   ============================================================ */

export interface OrderLineModifier {
  readonly modifierOptionId:
    ModifierOptionId;

  readonly name:
    string;

  readonly quantity:
    number;

  readonly unitPriceDelta:
    Money;

  readonly totalPriceDelta:
    Money;
}


/* ============================================================
   ORDER LINE
   ============================================================ */

export interface OrderLine {
  readonly id:
    OrderLineId;

  readonly product:
    OrderLineProductSnapshot;

  readonly quantity:
    number;

  readonly modifiers:
    readonly OrderLineModifier[];

  readonly notes?:
    string;

  /**
   * Precio de una unidad incluyendo modificadores.
   */
  readonly resolvedUnitPrice:
    Money;

  /**
   * Precio total antes de descuentos.
   */
  readonly subtotal:
    Money;

  readonly discountTotal:
    Money;

  readonly taxTotal:
    Money;

  readonly total:
    Money;
}


/* ============================================================
   CART
   ============================================================ */

export type CartStatus =
  | "active"
  | "converted"
  | "abandoned"
  | "expired";


export interface Cart {
  readonly id:
    CartId;

  readonly restaurantId:
    RestaurantId;

  readonly channel:
    MenuChannel;

  readonly currency:
    CurrencyCode;

  readonly status:
    CartStatus;

  readonly lines:
    readonly OrderLine[];

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;
}


/* ============================================================
   DISCOUNTS
   ============================================================ */

export type DiscountType =
  | "fixed"
  | "percentage"
  | "free_delivery"
  | "manual";


export type DiscountSource =
  | "promotion"
  | "coupon"
  | "loyalty"
  | "manual"
  | "campaign";


export interface OrderDiscount {
  readonly id:
    string;

  readonly type:
    DiscountType;

  readonly source:
    DiscountSource;

  readonly promotionId?:
    PromotionId;

  readonly couponId?:
    CouponId;

  readonly name:
    string;

  readonly amount:
    Money;
}


/* ============================================================
   TAX BREAKDOWN
   ============================================================ */

export interface OrderTaxLine {
  readonly rateBasisPoints:
    number;

  readonly taxableAmount:
    Money;

  readonly taxAmount:
    Money;
}


/* ============================================================
   TOTALS
   ============================================================ */

export interface OrderTotals {
  /**
   * Productos antes de descuentos.
   */
  readonly itemsSubtotal:
    Money;

  readonly discounts:
    Money;

  readonly itemsAfterDiscounts:
    Money;

  readonly deliveryFee:
    Money;

  readonly serviceFee:
    Money;

  readonly tip:
    Money;

  readonly taxTotal:
    Money;

  /**
   * Importe que debe pagar el cliente.
   */
  readonly grandTotal:
    Money;

  readonly taxBreakdown:
    readonly OrderTaxLine[];
}


/* ============================================================
   PICKUP
   ============================================================ */

export interface PickupFulfillment {
  readonly type:
    "pickup";

  readonly restaurantId:
    RestaurantId;

  readonly requestedFor?:
    IsoDateTime;

  readonly estimatedReadyAt?:
    IsoDateTime;

  readonly collectedAt?:
    IsoDateTime;
}


/* ============================================================
   DINE-IN
   ============================================================ */

export interface DineInFulfillment {
  readonly type:
    "dine_in";

  readonly restaurantId:
    RestaurantId;

  readonly tableId?:
    string;

  readonly tableLabel?:
    string;
}


/* ============================================================
   DELIVERY
   ============================================================ */

/**
 * El dominio de delivery mantiene los detalles geográficos.
 *
 * Order únicamente guarda las referencias necesarias
 * y un snapshot comercial.
 */

export interface DeliveryAddressSnapshot {
  readonly formattedAddress:
    string;

  readonly street?:
    string;

  readonly streetNumber?:
    string;

  readonly apartment?:
    string;

  readonly postalCode?:
    string;

  readonly city:
    string;

  readonly instructions?:
    string;
}


export interface DeliveryFulfillment {
  readonly type:
    "delivery";

  readonly restaurantId:
    RestaurantId;

  readonly quoteId:
    DeliveryQuoteId;

  readonly trackingId?:
    DeliveryTrackingId;

  readonly address:
    DeliveryAddressSnapshot;

  readonly requestedFor?:
    IsoDateTime;

  readonly estimatedDeliveryAt?:
    IsoDateTime;

  readonly deliveredAt?:
    IsoDateTime;
}


export type OrderFulfillment =
  | PickupFulfillment
  | DeliveryFulfillment
  | DineInFulfillment;


/* ============================================================
   PAYMENT
   ============================================================ */

export interface OrderPayment {
  readonly id:
    PaymentId;

  readonly method:
    PaymentMethod;

  readonly status:
    PaymentStatus;

  readonly amount:
    Money;

  /**
   * Nunca guardar datos de tarjeta.
   *
   * Solamente IDs seguros del proveedor.
   */
  readonly provider?:
    string;

  readonly providerPaymentId?:
    string;

  readonly authorizedAt?:
    IsoDateTime;

  readonly paidAt?:
    IsoDateTime;

  readonly failedAt?:
    IsoDateTime;
}


/* ============================================================
   REFUNDS
   ============================================================ */

export type RefundStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";


export interface OrderRefund {
  readonly id:
    RefundId;

  readonly paymentId:
    PaymentId;

  readonly amount:
    Money;

  readonly status:
    RefundStatus;

  readonly reason?:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;
}


/* ============================================================
   CUSTOMER NOTES
   ============================================================ */

export interface OrderNotes {
  /**
   * Nota visible para cocina.
   */
  readonly kitchen?:
    string;

  /**
   * Nota logística.
   */
  readonly fulfillment?:
    string;

  /**
   * Nota administrativa interna.
   *
   * Nunca mostrar al cliente.
   */
  readonly internal?:
    string;
}


/* ============================================================
   ORDER
   ============================================================ */

export interface Order
  extends AuditTimestamps {
  readonly id:
    OrderId;

  readonly orderNumber:
    string;

  readonly restaurantId:
    RestaurantId;

  readonly customer:
    OrderCustomer;

  readonly channel:
    OrderChannel;

  readonly status:
    OrderStatus;

  readonly fulfillmentStatus:
    FulfillmentStatus;

  readonly paymentStatus:
    PaymentStatus;

  readonly currency:
    CurrencyCode;

  readonly lines:
    readonly OrderLine[];

  readonly fulfillment:
    OrderFulfillment;

  readonly totals:
    OrderTotals;

  readonly discounts:
    readonly OrderDiscount[];

  readonly payments:
    readonly OrderPayment[];

  readonly refunds:
    readonly OrderRefund[];

  readonly notes:
    OrderNotes;

  /**
   * Fecha solicitada por cliente.
   */
  readonly requestedFor?:
    IsoDateTime;

  readonly confirmedAt?:
    IsoDateTime;

  readonly acceptedAt?:
    IsoDateTime;

  readonly preparingAt?:
    IsoDateTime;

  readonly readyAt?:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly cancelledAt?:
    IsoDateTime;

  readonly rejectedAt?:
    IsoDateTime;

  /**
   * Copia del locale utilizado durante checkout.
   */
  readonly locale:
    string;

  /**
   * Versión del modelo de pedido.
   *
   * Facilita migraciones futuras.
   */
  readonly schemaVersion:
    number;
}


/* ============================================================
   ORDER EVENTS
   ============================================================ */

/**
 * Historial append-only.
 *
 * No reemplaza el estado actual.
 * Explica cómo llegó el pedido hasta él.
 */

export type OrderEventType =
  | "order_created"
  | "order_confirmed"
  | "order_accepted"
  | "order_rejected"
  | "preparation_started"
  | "order_ready"
  | "courier_assigned"
  | "order_picked_up"
  | "order_delivered"
  | "order_collected"
  | "order_cancelled"
  | "payment_authorized"
  | "payment_completed"
  | "payment_failed"
  | "refund_created"
  | "refund_completed"
  | "note_added"
  | "order_updated";


export interface OrderEvent {
  readonly id:
    OrderEventId;

  readonly orderId:
    OrderId;

  readonly type:
    OrderEventType;

  readonly occurredAt:
    IsoDateTime;

  readonly actorType:
    | "customer"
    | "staff"
    | "courier"
    | "system"
    | "integration";

  readonly actorId?:
    UserId;

  readonly requestId?:
    RequestId;

  readonly correlationId?:
    CorrelationId;

  /**
   * Payload técnico pequeño.
   *
   * Nunca guardar secretos.
   */
  readonly metadata?:
    Readonly<
      Record<
        string,
        string | number | boolean | null
      >
    >;
}


/* ============================================================
   CREATE ORDER
   ============================================================ */

export interface CreateOrderRequest {
  /**
   * Obligatorio para evitar pedidos duplicados.
   */
  readonly idempotencyKey:
    IdempotencyKey;

  readonly cartId:
    CartId;

  readonly restaurantId:
    RestaurantId;

  readonly customer:
    OrderCustomer;

  readonly fulfillment:
    OrderFulfillment;

  readonly paymentMethod:
    PaymentMethod;

  readonly notes?:
    OrderNotes;

  readonly locale:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   CREATE ORDER RESPONSE
   ============================================================ */

export interface CreateOrderSuccess {
  readonly order:
    Order;

  readonly metadata?:
    ApiResponseMetadata;
}


/* ============================================================
   IDEMPOTENCY
   ============================================================ */

/**
 * Ejemplo:
 *
 * cliente pulsa "Pagar"
 *
 * navegador reintenta
 *
 * API recibe dos solicitudes
 *
 * ambas llevan la MISMA idempotencyKey.
 *
 * Resultado:
 *
 * 1 pedido.
 *
 * No 2.
 */

export interface IdempotencyRecord {
  readonly key:
    IdempotencyKey;

  readonly operation:
    string;

  readonly requestHash:
    string;

  readonly orderId?:
    OrderId;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;
}


/* ============================================================
   ORDER TRANSITIONS
   ============================================================ */

export interface OrderStatusTransition {
  readonly from:
    OrderStatus;

  readonly to:
    OrderStatus;

  readonly occurredAt:
    IsoDateTime;

  readonly actorId?:
    UserId;

  readonly reason?:
    string;
}


/* ============================================================
   CANCELLATION
   ============================================================ */

export type OrderCancellationReason =
  | "customer_request"
  | "restaurant_request"
  | "payment_failed"
  | "product_unavailable"
  | "delivery_unavailable"
  | "duplicate_order"
  | "fraud_prevention"
  | "technical_error"
  | "other";


export interface CancelOrderRequest {
  readonly orderId:
    OrderId;

  readonly reason:
    OrderCancellationReason;

  readonly description?:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   REJECTION
   ============================================================ */

export type OrderRejectionReason =
  | "restaurant_closed"
  | "product_unavailable"
  | "capacity_reached"
  | "delivery_unavailable"
  | "invalid_order"
  | "payment_problem"
  | "other";


export interface RejectOrderRequest {
  readonly orderId:
    OrderId;

  readonly reason:
    OrderRejectionReason;

  readonly publicMessage?:
    LocalizedText;

  readonly requestId:
    RequestId;
}


/* ============================================================
   ORDER QUERY
   ============================================================ */

export interface OrderQuery {
  readonly restaurantId?:
    RestaurantId;

  readonly customerId?:
    CustomerId;

  readonly status?:
    OrderStatus;

  readonly fulfillmentType?:
    FulfillmentType;

  readonly createdFrom?:
    IsoDateTime;

  readonly createdUntil?:
    IsoDateTime;

  readonly search?:
    string;

  readonly cursor?:
    string;

  readonly limit?:
    number;
}


/* ============================================================
   ORDER SNAPSHOT
   ============================================================ */

/**
 * Para integraciones, reporting y cache.
 */

export interface OrderSnapshot {
  readonly version:
    string;

  readonly generatedAt:
    IsoDateTime;

  readonly order:
    Order;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type OrderErrorCode =
  | "CART_NOT_FOUND"
  | "CART_EXPIRED"
  | "CART_EMPTY"
  | "ORDER_NOT_FOUND"
  | "RESTAURANT_NOT_FOUND"
  | "RESTAURANT_CLOSED"
  | "PRODUCT_UNAVAILABLE"
  | "PRICE_CHANGED"
  | "CURRENCY_MISMATCH"
  | "INVALID_FULFILLMENT"
  | "DELIVERY_QUOTE_EXPIRED"
  | "DELIVERY_UNAVAILABLE"
  | "MINIMUM_ORDER_NOT_MET"
  | "PAYMENT_FAILED"
  | "PAYMENT_REQUIRED"
  | "DUPLICATE_REQUEST"
  | "INVALID_ORDER_STATE"
  | "CAPACITY_REACHED"
  | "VALIDATION_ERROR"
  | "UPSTREAM_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export type OrderDomainError =
  DomainError<OrderErrorCode>;


/* ============================================================
   RESULT TYPES
   ============================================================ */

export type CreateOrderResult =
  Result<
    CreateOrderSuccess,
    OrderDomainError
  >;


export type CancelOrderResult =
  Result<
    Order,
    OrderDomainError
  >;


/* ============================================================
   DOMAIN HELPERS
   ============================================================ */

export function isTerminalOrderStatus(
  status: OrderStatus,
): boolean {
  return (
    status === "completed" ||
    status === "cancelled" ||
    status === "rejected"
  );
}


export function isPaidOrder(
  order: Order,
): boolean {
  return (
    order.paymentStatus ===
      "paid" ||
    order.paymentStatus ===
      "partially_refunded"
  );
}


export function canCancelOrder(
  order: Order,
): boolean {
  return (
    !isTerminalOrderStatus(
      order.status,
    ) &&
    order.fulfillmentStatus !==
      "delivered" &&
    order.fulfillmentStatus !==
      "collected"
  );
}


export function isDeliveryOrder(
  order: Order,
): order is Order & {
  readonly fulfillment:
    DeliveryFulfillment;
} {
  return (
    order.fulfillment.type ===
    "delivery"
  );
}


export function isPickupOrder(
  order: Order,
): order is Order & {
  readonly fulfillment:
    PickupFulfillment;
} {
  return (
    order.fulfillment.type ===
    "pickup"
  );
}


export function isDineInOrder(
  order: Order,
): order is Order & {
  readonly fulfillment:
    DineInFulfillment;
} {
  return (
    order.fulfillment.type ===
    "dine_in"
  );
}
