/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Inquiry, Lead & Quotation Domain
 * ============================================================
 *
 * Sistema central para convertir visitantes en oportunidades.
 *
 * Preparado para:
 *
 * - catering
 * - empresas
 * - eventos corporativos
 * - familias
 * - cumpleaños
 * - aniversarios
 * - desayunos
 * - desayunos sorpresa
 * - decoración de mesas
 * - panadería
 * - celebraciones
 * - eventos culturales
 * - eventos privados
 * - bodas
 * - comuniones
 * - reuniones
 * - solicitudes personalizadas
 *
 * Canales:
 *
 * - formulario web
 * - WhatsApp
 * - Instagram
 * - Facebook
 * - Messenger
 * - TikTok
 * - teléfono
 * - email
 * - presencial
 *
 * PRINCIPIO:
 *
 * INTERNET
 *    ↓
 * RINCONCOLOMBIANO.PL
 *    ↓
 * INTERÉS
 *    ↓
 * INQUIRY / LEAD
 *    ↓
 * SEGUIMIENTO
 *    ↓
 * COTIZACIÓN
 *    ↓
 * ACEPTACIÓN
 *    ↓
 * PEDIDO / EVENTO / CLIENTE
 */

import type {
  CurrencyCode,
  IsoDate,
  IsoDateTime,
  LocalTime,
  Money,
  PostalAddress,
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
  OrderId,
} from "@/types/order";

import type {
  MediaAssetId,
  ServiceId,
} from "@/types/content";

import type {
  CampaignId,
  MarketingSessionId,
  VisitorId,
} from "@/types/marketing";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type InquiryId =
  string;

export type InquiryActivityId =
  string;

export type InquiryMessageId =
  string;

export type InquiryQuoteId =
  string;

export type InquiryQuoteLineId =
  string;

export type InquiryAssignmentId =
  string;

export type InquiryAttachmentId =
  string;


/* ============================================================
   INTENT
   ============================================================ */

export type InquiryIntent =
  | "catering"
  | "corporate_event"
  | "business_meeting"
  | "family_event"
  | "birthday"
  | "anniversary"
  | "wedding"
  | "communion"
  | "breakfast"
  | "surprise_breakfast"
  | "table_decoration"
  | "bakery"
  | "private_event"
  | "cultural_event"
  | "festival"
  | "restaurant_group"
  | "custom";


/* ============================================================
   STATUS
   ============================================================ */

export type InquiryStatus =
  | "new"
  | "qualified"
  | "assigned"
  | "contacted"
  | "awaiting_customer"
  | "quote_preparing"
  | "quote_sent"
  | "negotiation"
  | "accepted"
  | "converted"
  | "rejected"
  | "cancelled"
  | "archived";


/* ============================================================
   PRIORITY
   ============================================================ */

export type InquiryPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";


/* ============================================================
   CONTACT CHANNELS
   ============================================================ */

export type InquiryContactChannel =
  | "website_form"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "messenger"
  | "tiktok"
  | "email"
  | "phone"
  | "in_person"
  | "referral"
  | "other";


/* ============================================================
   PREFERRED CONTACT
   ============================================================ */

export interface InquiryContactPreferences {
  readonly preferredChannel:
    InquiryContactChannel;

  readonly alternativeChannels?:
    readonly InquiryContactChannel[];

  readonly preferredContactTime?:
    string;

  readonly allowPhoneCall:
    boolean;

  readonly allowWhatsApp:
    boolean;

  readonly allowEmail:
    boolean;
}


/* ============================================================
   CUSTOMER SNAPSHOT
   ============================================================ */

/**
 * Guardamos snapshot porque un lead puede existir
 * sin una cuenta de cliente.
 */

export interface InquiryContact {
  readonly customerId?:
    CustomerId;

  readonly firstName:
    string;

  readonly lastName?:
    string;

  readonly companyName?:
    string;

  readonly phone?:
    string;

  readonly email?:
    string;

  readonly socialUsername?:
    string;

  readonly preferredLanguage?:
    string;

  readonly preferences:
    InquiryContactPreferences;
}


/* ============================================================
   EVENT LOCATION
   ============================================================ */

export type InquiryLocationType =
  | "rincon_restaurant"
  | "customer_location"
  | "external_venue"
  | "delivery"
  | "to_be_decided";


export interface InquiryLocation {
  readonly type:
    InquiryLocationType;

  readonly restaurantId?:
    RestaurantId;

  readonly venueName?:
    string;

  readonly address?:
    PostalAddress;

  readonly notes?:
    string;
}


/* ============================================================
   EVENT SCHEDULE
   ============================================================ */

export interface InquirySchedule {
  readonly eventDate?:
    IsoDate;

  readonly startTime?:
    LocalTime;

  readonly endTime?:
    LocalTime;

  /**
   * Si el cliente todavía no conoce la fecha.
   */
  readonly flexibleDate:
    boolean;

  readonly alternativeDates?:
    readonly IsoDate[];
}


/* ============================================================
   PARTY
   ============================================================ */

export interface InquiryParty {
  readonly adults?:
    number;

  readonly children?:
    number;

  readonly totalGuests?:
    number;

  readonly minimumGuests?:
    number;

  readonly maximumGuests?:
    number;
}


/* ============================================================
   BUDGET
   ============================================================ */

export interface InquiryBudget {
  readonly currency:
    CurrencyCode;

  readonly minimum?:
    Money;

  readonly maximum?:
    Money;

  readonly flexible:
    boolean;
}


/* ============================================================
   CATERING REQUIREMENTS
   ============================================================ */

export interface CateringRequirements {
  readonly deliveryRequired:
    boolean;

  readonly staffRequired:
    boolean;

  readonly tablewareRequired:
    boolean;

  readonly setupRequired:
    boolean;

  readonly cleanupRequired:
    boolean;

  readonly hotServiceRequired:
    boolean;

  readonly dietaryRequirements?:
    readonly string[];

  readonly preferredDishes?:
    readonly string[];
}


/* ============================================================
   CORPORATE REQUIREMENTS
   ============================================================ */

export interface CorporateRequirements {
  readonly companyName?:
    string;

  readonly taxInvoiceRequired:
    boolean;

  readonly recurringService:
    boolean;

  readonly frequency?:
    | "one_time"
    | "daily"
    | "weekly"
    | "monthly"
    | "custom";

  readonly purchaseOrderRequired?:
    boolean;

  readonly paymentTermsRequested?:
    string;
}


/* ============================================================
   BIRTHDAY / CELEBRATION
   ============================================================ */

export interface CelebrationRequirements {
  readonly celebrantName?:
    string;

  readonly celebrantAge?:
    number;

  readonly cakeRequired:
    boolean;

  readonly candlesRequired:
    boolean;

  readonly balloonsRequired:
    boolean;

  readonly musicRequested:
    boolean;

  readonly personalizedMessage?:
    string;

  readonly theme?:
    string;

  readonly preferredColors?:
    readonly string[];
}


/* ============================================================
   BREAKFAST / SURPRISE
   ============================================================ */

export interface BreakfastRequirements {
  readonly surprise:
    boolean;

  readonly recipientName?:
    string;

  readonly recipientPhone?:
    string;

  readonly deliveryTime?:
    LocalTime;

  readonly personalMessage?:
    string;

  readonly flowersRequested:
    boolean;

  readonly balloonRequested:
    boolean;

  readonly giftRequested:
    boolean;
}


/* ============================================================
   TABLE DECORATION
   ============================================================ */

export interface DecorationRequirements {
  readonly tables?:
    number;

  readonly theme?:
    string;

  readonly colors?:
    readonly string[];

  readonly flowers:
    boolean;

  readonly balloons:
    boolean;

  readonly candles:
    boolean;

  readonly signage:
    boolean;

  readonly customDecorationNotes?:
    string;
}


/* ============================================================
   BAKERY
   ============================================================ */

export type BakeryProductType =
  | "cake"
  | "bread"
  | "pastry"
  | "dessert"
  | "cookies"
  | "custom";


export interface BakeryRequirements {
  readonly productTypes:
    readonly BakeryProductType[];

  readonly portions?:
    number;

  readonly inscription?:
    string;

  readonly flavorPreferences?:
    readonly string[];

  readonly decorationNotes?:
    string;

  readonly dietaryRequirements?:
    readonly string[];
}


/* ============================================================
   REQUIREMENTS
   ============================================================ */

export interface InquiryRequirements {
  readonly catering?:
    CateringRequirements;

  readonly corporate?:
    CorporateRequirements;

  readonly celebration?:
    CelebrationRequirements;

  readonly breakfast?:
    BreakfastRequirements;

  readonly decoration?:
    DecorationRequirements;

  readonly bakery?:
    BakeryRequirements;

  /**
   * Necesidades adicionales.
   */
  readonly notes?:
    string;
}


/* ============================================================
   ATTACHMENTS
   ============================================================ */

/**
 * El cliente podrá adjuntar inspiración:
 *
 * - foto de decoración
 * - logo de empresa
 * - referencia de torta
 * - documento
 */

export interface InquiryAttachment {
  readonly id:
    InquiryAttachmentId;

  readonly inquiryId:
    InquiryId;

  readonly mediaAssetId:
    MediaAssetId;

  readonly uploadedBy:
    "customer" | "staff";

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   MARKETING SOURCE
   ============================================================ */

/**
 * Conecta la solicitud con el embudo central.
 */

export interface InquiryAcquisition {
  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly campaignId?:
    CampaignId;

  readonly landingPath?:
    string;

  readonly sourceChannel?:
    InquiryContactChannel;

  readonly referrer?:
    string;
}


/* ============================================================
   ASSIGNMENT
   ============================================================ */

export interface InquiryAssignment {
  readonly id:
    InquiryAssignmentId;

  readonly inquiryId:
    InquiryId;

  readonly assignedToUserId:
    UserId;

  readonly assignedByUserId?:
    UserId;

  readonly assignedAt:
    IsoDateTime;

  readonly unassignedAt?:
    IsoDateTime;
}


/* ============================================================
   SLA
   ============================================================ */

/**
 * Nos permitirá medir si respondemos rápido.
 */

export interface InquirySla {
  readonly targetFirstResponseMinutes:
    number;

  readonly firstResponseAt?:
    IsoDateTime;

  readonly breached:
    boolean;
}


/* ============================================================
   INQUIRY
   ============================================================ */

export interface Inquiry {
  readonly id:
    InquiryId;

  readonly intent:
    InquiryIntent;

  readonly status:
    InquiryStatus;

  readonly priority:
    InquiryPriority;

  readonly serviceId?:
    ServiceId;

  readonly contact:
    InquiryContact;

  readonly location:
    InquiryLocation;

  readonly schedule:
    InquirySchedule;

  readonly party:
    InquiryParty;

  readonly budget?:
    InquiryBudget;

  readonly requirements:
    InquiryRequirements;

  readonly acquisition:
    InquiryAcquisition;

  readonly attachmentIds:
    readonly InquiryAttachmentId[];

  readonly assignedToUserId?:
    UserId;

  readonly restaurantId?:
    RestaurantId;

  readonly sla:
    InquirySla;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly qualifiedAt?:
    IsoDateTime;

  readonly contactedAt?:
    IsoDateTime;

  readonly acceptedAt?:
    IsoDateTime;

  readonly convertedAt?:
    IsoDateTime;

  readonly closedAt?:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   COMMUNICATION
   ============================================================ */

export type InquiryMessageDirection =
  | "incoming"
  | "outgoing";


export interface InquiryMessage {
  readonly id:
    InquiryMessageId;

  readonly inquiryId:
    InquiryId;

  readonly direction:
    InquiryMessageDirection;

  readonly channel:
    InquiryContactChannel;

  readonly body:
    string;

  readonly sentByUserId?:
    UserId;

  readonly externalMessageId?:
    string;

  readonly createdAt:
    IsoDateTime;
}


/* ============================================================
   QUOTE STATUS
   ============================================================ */

export type InquiryQuoteStatus =
  | "draft"
  | "ready"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled"
  | "superseded";


/* ============================================================
   QUOTE LINE
   ============================================================ */

export interface InquiryQuoteLine {
  readonly id:
    InquiryQuoteLineId;

  readonly description:
    string;

  readonly quantity:
    number;

  readonly unitPrice:
    Money;

  readonly taxRateBasisPoints:
    number;

  readonly taxIncluded:
    boolean;

  readonly subtotal:
    Money;

  readonly taxTotal:
    Money;

  readonly total:
    Money;

  readonly sortOrder:
    number;
}


/* ============================================================
   QUOTE TOTALS
   ============================================================ */

export interface InquiryQuoteTotals {
  readonly subtotal:
    Money;

  readonly discount:
    Money;

  readonly taxTotal:
    Money;

  readonly delivery:
    Money;

  readonly additionalFees:
    Money;

  readonly grandTotal:
    Money;
}


/* ============================================================
   DEPOSIT
   ============================================================ */

export interface InquiryDeposit {
  readonly required:
    boolean;

  readonly amount?:
    Money;

  readonly percentageBasisPoints?:
    number;

  readonly dueAt?:
    IsoDateTime;
}


/* ============================================================
   QUOTE
   ============================================================ */

export interface InquiryQuote {
  readonly id:
    InquiryQuoteId;

  readonly inquiryId:
    InquiryId;

  readonly version:
    number;

  readonly status:
    InquiryQuoteStatus;

  readonly currency:
    CurrencyCode;

  readonly lines:
    readonly InquiryQuoteLine[];

  readonly totals:
    InquiryQuoteTotals;

  readonly deposit:
    InquiryDeposit;

  readonly customerNotes?:
    string;

  readonly internalNotes?:
    string;

  readonly validUntil:
    IsoDateTime;

  readonly createdBy:
    UserId;

  readonly createdAt:
    IsoDateTime;

  readonly sentAt?:
    IsoDateTime;

  readonly viewedAt?:
    IsoDateTime;

  readonly acceptedAt?:
    IsoDateTime;

  readonly rejectedAt?:
    IsoDateTime;
}


/* ============================================================
   ACTIVITY TIMELINE
   ============================================================ */

export type InquiryActivityType =
  | "created"
  | "qualified"
  | "assigned"
  | "contacted"
  | "message_received"
  | "message_sent"
  | "attachment_added"
  | "quote_created"
  | "quote_sent"
  | "quote_viewed"
  | "quote_accepted"
  | "quote_rejected"
  | "status_changed"
  | "note_added"
  | "converted"
  | "cancelled";


export interface InquiryActivity {
  readonly id:
    InquiryActivityId;

  readonly inquiryId:
    InquiryId;

  readonly type:
    InquiryActivityType;

  readonly actorUserId?:
    UserId;

  readonly description?:
    string;

  readonly metadata?:
    Readonly<
      Record<
        string,
        string | number | boolean | null
      >
    >;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   CONVERSION
   ============================================================ */

export type InquiryConversionType =
  | "order"
  | "reservation"
  | "event"
  | "customer"
  | "other";


export interface InquiryConversion {
  readonly inquiryId:
    InquiryId;

  readonly type:
    InquiryConversionType;

  readonly orderId?:
    OrderId;

  readonly customerId?:
    CustomerId;

  readonly externalEntityId?:
    string;

  readonly convertedAt:
    IsoDateTime;
}


/* ============================================================
   CREATE INQUIRY
   ============================================================ */

export interface CreateInquiryRequest {
  readonly intent:
    InquiryIntent;

  readonly serviceId?:
    ServiceId;

  readonly contact:
    InquiryContact;

  readonly location:
    InquiryLocation;

  readonly schedule:
    InquirySchedule;

  readonly party:
    InquiryParty;

  readonly budget?:
    InquiryBudget;

  readonly requirements:
    InquiryRequirements;

  readonly acquisition:
    InquiryAcquisition;

  readonly requestId:
    RequestId;
}


/* ============================================================
   UPDATE STATUS
   ============================================================ */

export interface UpdateInquiryStatusRequest {
  readonly inquiryId:
    InquiryId;

  readonly status:
    InquiryStatus;

  readonly reason?:
    string;

  readonly userId:
    UserId;

  readonly requestId:
    RequestId;
}


/* ============================================================
   QUERY
   ============================================================ */

export interface InquiryQuery {
  readonly intent?:
    InquiryIntent;

  readonly status?:
    InquiryStatus;

  readonly priority?:
    InquiryPriority;

  readonly restaurantId?:
    RestaurantId;

  readonly assignedToUserId?:
    UserId;

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
   ERRORS
   ============================================================ */

export type InquiryErrorCode =
  | "INQUIRY_NOT_FOUND"
  | "INVALID_CONTACT"
  | "INVALID_EVENT_DATE"
  | "INVALID_PARTY_SIZE"
  | "INVALID_BUDGET"
  | "INVALID_STATUS_TRANSITION"
  | "QUOTE_NOT_FOUND"
  | "QUOTE_EXPIRED"
  | "QUOTE_ALREADY_ACCEPTED"
  | "ASSIGNMENT_FAILED"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface InquiryDomainError {
  readonly code:
    InquiryErrorCode;

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

export function isInquiryTerminal(
  status: InquiryStatus,
): boolean {
  return (
    status === "converted" ||
    status === "rejected" ||
    status === "cancelled" ||
    status === "archived"
  );
}


export function isInquiryOpen(
  inquiry: Inquiry,
): boolean {
  return !isInquiryTerminal(
    inquiry.status,
  );
}


export function isQuoteValid(
  quote: InquiryQuote,
  now = new Date(),
): boolean {
  if (
    quote.status === "accepted" ||
    quote.status === "rejected" ||
    quote.status === "cancelled" ||
    quote.status === "expired" ||
    quote.status === "superseded"
  ) {
    return false;
  }

  return (
    new Date(
      quote.validUntil,
    ).getTime() >
    now.getTime()
  );
}


export function inquiryNeedsResponse(
  inquiry: Inquiry,
): boolean {
  return (
    inquiry.status === "new" ||
    inquiry.status ===
      "assigned" ||
    inquiry.status ===
      "awaiting_customer"
  );
}
