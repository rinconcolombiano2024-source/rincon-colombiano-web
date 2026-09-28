/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Reservation Domain
 * ============================================================
 *
 * Contrato central de reservas.
 *
 * Diseñado para:
 *
 * - múltiples restaurantes
 * - múltiples países y zonas horarias
 * - mesas y áreas
 * - reservas web
 * - reservas administrativas
 * - reservas telefónicas
 * - disponibilidad
 * - turnos
 * - lista de espera
 * - cumpleaños
 * - aniversarios
 * - ocasiones especiales
 * - depósitos
 * - confirmaciones
 * - recordatorios
 * - cancelaciones
 * - no-show
 * - atribución de marketing
 * - integración con RC ORDERA
 *
 * PRINCIPIO:
 *
 * DISCOVERY
 *    ↓
 * RINCONCOLOMBIANO.PL
 *    ↓
 * RESTAURANT / EVENT / SERVICE
 *    ↓
 * RESERVATION
 *    ↓
 * CONFIRMATION
 *    ↓
 * VISIT
 *    ↓
 * CUSTOMER / LOYALTY / COMMUNITY
 */

import type {
  CurrencyCode,
  IsoDate,
  IsoDateTime,
  LocalTime,
  Money,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  CustomerId,
} from "@/types/customer";

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

export type ReservationId =
  string;

export type ReservationNumber =
  string;

export type ReservationAreaId =
  string;

export type RestaurantTableId =
  string;

export type ReservationSlotId =
  string;

export type WaitlistEntryId =
  string;

export type ReservationDepositId =
  string;

export type ReservationEventId =
  string;

export type ReservationNotificationId =
  string;


/* ============================================================
   RESERVATION SOURCE
   ============================================================ */

export type ReservationSource =
  | "website"
  | "mobile_web"
  | "app"
  | "phone"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "google"
  | "google_business"
  | "walk_in"
  | "admin"
  | "integration"
  | "other";


/* ============================================================
   RESERVATION STATUS
   ============================================================ */

export type ReservationStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "waitlisted"
  | "checked_in"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rejected";


/* ============================================================
   OCCASION
   ============================================================ */

export type ReservationOccasion =
  | "regular"
  | "birthday"
  | "anniversary"
  | "family"
  | "business"
  | "date"
  | "celebration"
  | "communion"
  | "graduation"
  | "other";


/* ============================================================
   SEATING PREFERENCE
   ============================================================ */

export type SeatingPreference =
  | "indoor"
  | "outdoor"
  | "terrace"
  | "quiet"
  | "window"
  | "accessible"
  | "no_preference";


/* ============================================================
   GUEST
   ============================================================ */

/**
 * Snapshot del contacto.
 *
 * La reserva debe seguir conservando los datos
 * utilizados en ese momento aunque el cliente
 * posteriormente modifique su perfil.
 */

export interface ReservationGuest {
  readonly customerId?:
    CustomerId;

  readonly firstName:
    string;

  readonly lastName?:
    string;

  readonly phone:
    string;

  readonly email?:
    string;

  readonly preferredLanguage?:
    string;
}


/* ============================================================
   PARTY
   ============================================================ */

export interface ReservationParty {
  readonly adults:
    number;

  readonly children:
    number;

  readonly highChairs?:
    number;

  readonly wheelchairPlaces?:
    number;

  readonly totalGuests:
    number;
}


/* ============================================================
   AREA
   ============================================================ */

export type ReservationAreaStatus =
  | "active"
  | "inactive"
  | "temporarily_closed";


export interface ReservationArea {
  readonly id:
    ReservationAreaId;

  readonly restaurantId:
    RestaurantId;

  readonly name:
    string;

  readonly description?:
    string;

  readonly status:
    ReservationAreaStatus;

  readonly indoor:
    boolean;

  readonly capacity:
    number;

  readonly sortOrder:
    number;
}


/* ============================================================
   TABLE
   ============================================================ */

export type RestaurantTableStatus =
  | "active"
  | "inactive"
  | "maintenance";


export type RestaurantTableShape =
  | "square"
  | "rectangle"
  | "round"
  | "custom";


export interface RestaurantTable {
  readonly id:
    RestaurantTableId;

  readonly restaurantId:
    RestaurantId;

  readonly areaId:
    ReservationAreaId;

  readonly label:
    string;

  readonly status:
    RestaurantTableStatus;

  readonly minimumCapacity:
    number;

  readonly maximumCapacity:
    number;

  readonly shape?:
    RestaurantTableShape;

  /**
   * Mesas que pueden físicamente combinarse.
   */
  readonly combinableWith:
    readonly RestaurantTableId[];

  readonly accessible:
    boolean;

  readonly sortOrder:
    number;
}


/* ============================================================
   TABLE ASSIGNMENT
   ============================================================ */

export interface ReservationTableAssignment {
  readonly tableIds:
    readonly RestaurantTableId[];

  readonly areaId:
    ReservationAreaId;

  readonly assignedAt:
    IsoDateTime;

  readonly assignedByUserId?:
    UserId;
}


/* ============================================================
   SCHEDULE
   ============================================================ */

export interface ReservationSchedule {
  readonly date:
    IsoDate;

  readonly time:
    LocalTime;

  /**
   * Duración estimada de ocupación.
   */
  readonly durationMinutes:
    number;

  /**
   * Momento exacto calculado por backend.
   */
  readonly startsAt:
    IsoDateTime;

  readonly endsAt:
    IsoDateTime;
}


/* ============================================================
   SPECIAL REQUESTS
   ============================================================ */

export interface ReservationSpecialRequests {
  readonly occasion:
    ReservationOccasion;

  readonly seatingPreference:
    SeatingPreference;

  readonly allergies:
    readonly string[];

  readonly dietaryRequirements:
    readonly string[];

  readonly accessibilityNotes?:
    string;

  readonly celebrationName?:
    string;

  readonly birthdayAge?:
    number;

  readonly cakeRequested:
    boolean;

  readonly decorationRequested:
    boolean;

  readonly flowersRequested:
    boolean;

  readonly personalizedMessage?:
    string;

  readonly notes?:
    string;
}


/* ============================================================
   RESERVATION POLICY
   ============================================================ */

export interface ReservationPolicy {
  readonly restaurantId:
    RestaurantId;

  readonly enabled:
    boolean;

  readonly minimumPartySize:
    number;

  readonly maximumOnlinePartySize:
    number;

  readonly minimumAdvanceMinutes:
    number;

  readonly maximumAdvanceDays:
    number;

  readonly defaultDurationMinutes:
    number;

  /**
   * Margen entre una reserva y otra.
   */
  readonly turnoverBufferMinutes:
    number;

  readonly confirmationRequired:
    boolean;

  readonly depositEnabled:
    boolean;

  readonly cancellationDeadlineMinutes?:
    number;

  readonly noShowTrackingEnabled:
    boolean;
}


/* ============================================================
   DEPOSIT RULES
   ============================================================ */

export type ReservationDepositStrategy =
  | "none"
  | "fixed"
  | "per_person"
  | "percentage"
  | "manual";


export interface ReservationDepositRule {
  readonly strategy:
    ReservationDepositStrategy;

  readonly currency:
    CurrencyCode;

  readonly fixedAmount?:
    Money;

  readonly perPersonAmount?:
    Money;

  /**
   * Basis points:
   *
   * 2500 = 25%
   */
  readonly percentageBasisPoints?:
    number;

  readonly minimumPartySize?:
    number;

  readonly requiredForOccasions?:
    readonly ReservationOccasion[];
}


/* ============================================================
   DEPOSIT
   ============================================================ */

export type ReservationDepositStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "forfeited"
  | "failed"
  | "cancelled";


export interface ReservationDeposit {
  readonly id:
    ReservationDepositId;

  readonly reservationId:
    ReservationId;

  readonly amount:
    Money;

  readonly status:
    ReservationDepositStatus;

  readonly paymentId?:
    string;

  readonly requiredAt?:
    IsoDateTime;

  readonly paidAt?:
    IsoDateTime;

  readonly refundedAt?:
    IsoDateTime;
}


/* ============================================================
   AVAILABILITY REQUEST
   ============================================================ */

export interface ReservationAvailabilityRequest {
  readonly restaurantId:
    RestaurantId;

  readonly date:
    IsoDate;

  readonly partySize:
    number;

  readonly preferredTime?:
    LocalTime;

  readonly seatingPreference?:
    SeatingPreference;

  readonly requestId:
    RequestId;
}


/* ============================================================
   SLOT
   ============================================================ */

export type ReservationSlotStatus =
  | "available"
  | "limited"
  | "unavailable";


export interface ReservationSlot {
  readonly id:
    ReservationSlotId;

  readonly restaurantId:
    RestaurantId;

  readonly startsAt:
    IsoDateTime;

  readonly endsAt:
    IsoDateTime;

  readonly status:
    ReservationSlotStatus;

  readonly availableCapacity:
    number;

  readonly eligibleAreaIds:
    readonly ReservationAreaId[];

  /**
   * True si el backend ya verificó
   * que existe una configuración real de mesas.
   */
  readonly tableConfigurationAvailable:
    boolean;

  readonly depositRequired:
    boolean;

  readonly depositAmount?:
    Money;
}


/* ============================================================
   AVAILABILITY RESPONSE
   ============================================================ */

export interface ReservationAvailabilityResponse {
  readonly restaurantId:
    RestaurantId;

  readonly date:
    IsoDate;

  readonly partySize:
    number;

  readonly slots:
    readonly ReservationSlot[];

  readonly generatedAt:
    IsoDateTime;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   MARKETING ATTRIBUTION
   ============================================================ */

export interface ReservationAcquisition {
  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly campaignId?:
    CampaignId;

  readonly landingPath?:
    string;

  readonly source:
    ReservationSource;
}


/* ============================================================
   RESERVATION
   ============================================================ */

export interface Reservation {
  readonly id:
    ReservationId;

  /**
   * Número visible para cliente.
   *
   * Ejemplo:
   *
   * RES-2026-000123
   */
  readonly reservationNumber:
    ReservationNumber;

  readonly restaurantId:
    RestaurantId;

  readonly customerId?:
    CustomerId;

  readonly guest:
    ReservationGuest;

  readonly party:
    ReservationParty;

  readonly schedule:
    ReservationSchedule;

  readonly status:
    ReservationStatus;

  readonly source:
    ReservationSource;

  readonly requests:
    ReservationSpecialRequests;

  readonly acquisition:
    ReservationAcquisition;

  readonly tableAssignment?:
    ReservationTableAssignment;

  readonly depositId?:
    ReservationDepositId;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly confirmedAt?:
    IsoDateTime;

  readonly checkedInAt?:
    IsoDateTime;

  readonly seatedAt?:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly cancelledAt?:
    IsoDateTime;

  readonly noShowAt?:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   CREATE RESERVATION
   ============================================================ */

export interface CreateReservationRequest {
  readonly restaurantId:
    RestaurantId;

  readonly slotId:
    ReservationSlotId;

  readonly guest:
    ReservationGuest;

  readonly party:
    ReservationParty;

  readonly requests:
    ReservationSpecialRequests;

  readonly acquisition:
    ReservationAcquisition;

  readonly requestId:
    RequestId;

  /**
   * Evita reservas duplicadas causadas
   * por reintentos del navegador.
   */
  readonly idempotencyKey:
    string;
}


/* ============================================================
   UPDATE RESERVATION
   ============================================================ */

export interface UpdateReservationRequest {
  readonly reservationId:
    ReservationId;

  readonly schedule?:
    ReservationSchedule;

  readonly party?:
    ReservationParty;

  readonly requests?:
    ReservationSpecialRequests;

  readonly requestId:
    RequestId;
}


/* ============================================================
   CANCELLATION
   ============================================================ */

export type ReservationCancellationReason =
  | "customer_request"
  | "restaurant_request"
  | "restaurant_closed"
  | "duplicate"
  | "payment_not_completed"
  | "capacity_problem"
  | "weather"
  | "technical_problem"
  | "other";


export interface CancelReservationRequest {
  readonly reservationId:
    ReservationId;

  readonly reason:
    ReservationCancellationReason;

  readonly description?:
    string;

  readonly requestId:
    RequestId;
}


/* ============================================================
   NO SHOW
   ============================================================ */

export interface ReservationNoShowRecord {
  readonly reservationId:
    ReservationId;

  readonly customerId?:
    CustomerId;

  readonly markedAt:
    IsoDateTime;

  readonly markedByUserId:
    UserId;

  readonly notes?:
    string;
}


/* ============================================================
   WAITLIST
   ============================================================ */

export type WaitlistStatus =
  | "waiting"
  | "notified"
  | "accepted"
  | "expired"
  | "cancelled"
  | "converted";


export interface WaitlistEntry {
  readonly id:
    WaitlistEntryId;

  readonly restaurantId:
    RestaurantId;

  readonly guest:
    ReservationGuest;

  readonly party:
    ReservationParty;

  readonly date:
    IsoDate;

  readonly preferredTime?:
    LocalTime;

  readonly timeFlexibilityMinutes?:
    number;

  readonly status:
    WaitlistStatus;

  readonly createdAt:
    IsoDateTime;

  readonly notifiedAt?:
    IsoDateTime;

  readonly expiresAt?:
    IsoDateTime;

  readonly convertedReservationId?:
    ReservationId;
}


/* ============================================================
   WAITLIST REQUEST
   ============================================================ */

export interface JoinWaitlistRequest {
  readonly restaurantId:
    RestaurantId;

  readonly guest:
    ReservationGuest;

  readonly party:
    ReservationParty;

  readonly date:
    IsoDate;

  readonly preferredTime?:
    LocalTime;

  readonly timeFlexibilityMinutes?:
    number;

  readonly requestId:
    RequestId;
}


/* ============================================================
   NOTIFICATION CHANNELS
   ============================================================ */

export type ReservationNotificationChannel =
  | "email"
  | "sms"
  | "whatsapp"
  | "push";


/* ============================================================
   NOTIFICATION TYPES
   ============================================================ */

export type ReservationNotificationType =
  | "confirmation"
  | "reminder"
  | "update"
  | "waitlist_available"
  | "deposit_required"
  | "deposit_received"
  | "cancellation"
  | "thank_you";


/* ============================================================
   NOTIFICATION
   ============================================================ */

export type ReservationNotificationStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed"
  | "cancelled";


export interface ReservationNotification {
  readonly id:
    ReservationNotificationId;

  readonly reservationId:
    ReservationId;

  readonly type:
    ReservationNotificationType;

  readonly channel:
    ReservationNotificationChannel;

  readonly status:
    ReservationNotificationStatus;

  readonly scheduledAt?:
    IsoDateTime;

  readonly sentAt?:
    IsoDateTime;

  readonly deliveredAt?:
    IsoDateTime;

  readonly failedAt?:
    IsoDateTime;
}


/* ============================================================
   RESERVATION EVENT HISTORY
   ============================================================ */

export type ReservationEventType =
  | "created"
  | "confirmed"
  | "updated"
  | "table_assigned"
  | "deposit_requested"
  | "deposit_paid"
  | "reminder_sent"
  | "checked_in"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show"
  | "waitlisted";


export interface ReservationEvent {
  readonly id:
    ReservationEventId;

  readonly reservationId:
    ReservationId;

  readonly type:
    ReservationEventType;

  readonly actorType:
    | "customer"
    | "staff"
    | "system"
    | "integration";

  readonly actorUserId?:
    UserId;

  readonly occurredAt:
    IsoDateTime;

  readonly requestId?:
    RequestId;

  readonly metadata?:
    Readonly<
      Record<
        string,
        string | number | boolean | null
      >
    >;
}


/* ============================================================
   RESERVATION QUERY
   ============================================================ */

export interface ReservationQuery {
  readonly restaurantId?:
    RestaurantId;

  readonly customerId?:
    CustomerId;

  readonly status?:
    ReservationStatus;

  readonly dateFrom?:
    IsoDate;

  readonly dateUntil?:
    IsoDate;

  readonly search?:
    string;

  readonly cursor?:
    string;

  readonly limit?:
    number;
}


/* ============================================================
   CAPACITY SNAPSHOT
   ============================================================ */

export interface ReservationCapacitySnapshot {
  readonly restaurantId:
    RestaurantId;

  readonly startsAt:
    IsoDateTime;

  readonly totalSeats:
    number;

  readonly reservedSeats:
    number;

  readonly availableSeats:
    number;

  readonly totalTables:
    number;

  readonly availableTables:
    number;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   ERROR MODEL
   ============================================================ */

export type ReservationErrorCode =
  | "RESERVATION_NOT_FOUND"
  | "RESTAURANT_NOT_FOUND"
  | "RESTAURATIONS_DISABLED"
  | "INVALID_PARTY_SIZE"
  | "INVALID_DATE"
  | "INVALID_TIME"
  | "SLOT_NOT_AVAILABLE"
  | "TABLE_NOT_AVAILABLE"
  | "CAPACITY_REACHED"
  | "DEPOSIT_REQUIRED"
  | "DEPOSIT_FAILED"
  | "CANCELLATION_NOT_ALLOWED"
  | "ALREADY_CANCELLED"
  | "ALREADY_COMPLETED"
  | "DUPLICATE_REQUEST"
  | "WAITLIST_UNAVAILABLE"
  | "INVALID_STATUS_TRANSITION"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface ReservationDomainError {
  readonly code:
    ReservationErrorCode;

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

export function isReservationActive(
  reservation: Reservation,
): boolean {
  return (
    reservation.status ===
      "pending" ||
    reservation.status ===
      "confirmed" ||
    reservation.status ===
      "checked_in" ||
    reservation.status ===
      "seated"
  );
}


export function isReservationFinal(
  status: ReservationStatus,
): boolean {
  return (
    status === "completed" ||
    status === "cancelled" ||
    status === "no_show" ||
    status === "rejected"
  );
}


export function canCancelReservation(
  reservation: Reservation,
): boolean {
  return (
    !isReservationFinal(
      reservation.status,
    ) &&
    reservation.status !==
      "seated"
  );
}


export function calculatePartySize(
  party: Pick<
    ReservationParty,
    "adults" | "children"
  >,
): number {
  return (
    party.adults +
    party.children
  );
}


export function isReservationSlotAvailable(
  slot: ReservationSlot,
): boolean {
  return (
    (
      slot.status ===
        "available" ||
      slot.status ===
        "limited"
    ) &&
    slot.availableCapacity > 0 &&
    slot.tableConfigurationAvailable
  );
}


export function reservationRequiresDeposit(
  slot: ReservationSlot,
): boolean {
  return (
    slot.depositRequired
  );
}
