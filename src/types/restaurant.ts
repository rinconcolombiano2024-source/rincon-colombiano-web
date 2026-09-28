/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Restaurant Domain
 * ============================================================
 *
 * Contrato empresarial universal para una sede.
 *
 * Diseñado para soportar:
 *
 * - múltiples países
 * - múltiples ciudades
 * - múltiples monedas
 * - múltiples idiomas
 * - diferentes zonas horarias
 * - dine-in
 * - pickup
 * - delivery
 * - reservas
 * - catering
 * - horarios especiales
 * - aperturas futuras
 * - cierres temporales
 * - información legal
 * - SEO local
 * - integración con RC ORDERA
 * - integración con mapas
 * - franquicias futuras
 *
 * PRINCIPIO:
 *
 * Una sede NO se identifica por su nombre.
 * Se identifica mediante un ID estable.
 */

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  Money,
} from "@/types/menu";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type RestaurantId = string;

export type BrandId = string;

export type OrganizationId = string;

export type ExternalLocationId = string;

export type DeliveryZoneId = string;


/* ============================================================
   BASIC ISO TYPES
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
 * US
 */
export type CountryCode = string;


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
export type CurrencyCode = string;


/**
 * Zona horaria IANA.
 *
 * Ejemplos:
 *
 * Europe/Warsaw
 * America/Bogota
 * Europe/Madrid
 */
export type IanaTimeZone = string;


/**
 * Fecha ISO:
 *
 * YYYY-MM-DD
 */
export type IsoDate = string;


/**
 * Fecha y hora ISO.
 */
export type IsoDateTime = string;


/**
 * Hora local:
 *
 * HH:mm
 */
export type LocalTime = string;


/* ============================================================
   LOCALIZED TEXT
   ============================================================ */

export interface RestaurantLocalizedText {
  readonly default: string;

  readonly translations?: Readonly<
    Partial<
      Record<
        SupportedLocale,
        string
      >
    >
  >;
}


/* ============================================================
   LOCATION STATUS
   ============================================================ */

export type RestaurantLifecycleStatus =
  | "planned"
  | "coming_soon"
  | "open"
  | "temporarily_closed"
  | "renovation"
  | "permanently_closed";


/**
 * Estado operativo en tiempo real.
 *
 * No confundir con lifecycleStatus.
 *
 * Una sede puede ser:
 *
 * lifecycleStatus = open
 *
 * pero:
 *
 * operationalStatus = paused
 *
 * debido a un problema temporal.
 */
export type RestaurantOperationalStatus =
  | "operational"
  | "paused"
  | "offline";


/* ============================================================
   OWNERSHIP / BUSINESS MODEL
   ============================================================ */

export type RestaurantOwnershipType =
  | "company_owned"
  | "franchise"
  | "licensed"
  | "joint_venture";


/* ============================================================
   ADDRESS
   ============================================================ */

export interface RestaurantAddress {
  readonly street: string;

  readonly streetNumber?: string;

  readonly unit?: string;

  readonly postalCode?: string;

  readonly city: string;

  readonly district?: string;

  readonly region?: string;

  readonly country: string;

  readonly countryCode: CountryCode;

  /**
   * Dirección preparada para mostrar al usuario.
   *
   * Ejemplo:
   *
   * Czapelska 33, 04-081 Warszawa
   */
  readonly formattedAddress?: string;
}


/* ============================================================
   GEOLOCATION
   ============================================================ */

export interface GeoCoordinates {
  readonly latitude: number;

  readonly longitude: number;
}


/**
 * Información geográfica que debe provenir de una fuente
 * verificada antes de utilizarse para delivery.
 */
export interface RestaurantGeoLocation {
  readonly coordinates: GeoCoordinates;

  readonly placeId?: string;

  readonly geohash?: string;

  readonly verified: boolean;

  readonly verifiedAt?: IsoDateTime;
}


/* ============================================================
   CONTACT
   ============================================================ */

export interface RestaurantContact {
  readonly phone?: string;

  readonly whatsapp?: string;

  readonly email?: string;

  readonly reservationPhone?: string;

  readonly cateringEmail?: string;
}


/* ============================================================
   SERVICES
   ============================================================ */

export type RestaurantService =
  | "dine_in"
  | "pickup"
  | "delivery"
  | "reservations"
  | "catering";


export interface RestaurantServiceState {
  /**
   * Capacidad técnicamente disponible.
   */
  readonly enabled: boolean;

  /**
   * Visible públicamente.
   *
   * Puede ser false aunque enabled sea true durante
   * una fase de lanzamiento.
   */
  readonly publiclyVisible: boolean;

  /**
   * Temporalmente pausado.
   */
  readonly temporarilyPaused: boolean;

  readonly pauseReason?: RestaurantLocalizedText;
}


export interface RestaurantServices {
  readonly dineIn: RestaurantServiceState;

  readonly pickup: RestaurantServiceState;

  readonly delivery: RestaurantServiceState;

  readonly reservations: RestaurantServiceState;

  readonly catering: RestaurantServiceState;
}


/* ============================================================
   OPENING HOURS
   ============================================================ */

export type RestaurantWeekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";


export interface OpeningPeriod {
  readonly opensAt: LocalTime;

  readonly closesAt: LocalTime;
}


export interface DailyOpeningHours {
  readonly closed: boolean;

  /**
   * Permite horario partido.
   *
   * Ejemplo:
   *
   * 11:00–15:00
   * 17:00–22:00
   */
  readonly periods:
    readonly OpeningPeriod[];
}


export type WeeklyOpeningHours =
  Readonly<
    Record<
      RestaurantWeekday,
      DailyOpeningHours
    >
  >;


/* ============================================================
   SPECIAL HOURS
   ============================================================ */

/**
 * No modificamos el horario semanal para Navidad,
 * Año Nuevo, eventos, cierres técnicos, etc.
 *
 * Creamos overrides específicos.
 */
export interface SpecialOpeningHours {
  readonly id: string;

  readonly date: IsoDate;

  readonly closed: boolean;

  readonly periods:
    readonly OpeningPeriod[];

  readonly reason?: RestaurantLocalizedText;

  readonly publicNotice?: RestaurantLocalizedText;
}


/* ============================================================
   ORDERING
   ============================================================ */

export type OrderingChannel =
  | "website"
  | "mobile_web"
  | "app"
  | "pos"
  | "phone"
  | "admin";


export interface OrderingConfiguration {
  readonly enabled: boolean;

  readonly acceptedChannels:
    readonly OrderingChannel[];

  /**
   * Moneda principal de esta sede.
   */
  readonly currency: CurrencyCode;

  /**
   * Importe mínimo para pedidos.
   *
   * Opcional porque puede variar por delivery zone.
   */
  readonly minimumOrder?: Money;

  /**
   * Tiempo mínimo estimado.
   */
  readonly preparationTimeMinMinutes?: number;

  /**
   * Tiempo máximo estimado.
   */
  readonly preparationTimeMaxMinutes?: number;
}


/* ============================================================
   DELIVERY
   ============================================================ */

export type DeliveryMode =
  | "internal"
  | "partner"
  | "hybrid";


export type DeliveryZoneStrategy =
  | "distance"
  | "polygon"
  | "postal_code"
  | "custom";


export interface RestaurantDeliveryConfiguration {
  readonly enabled: boolean;

  readonly mode: DeliveryMode;

  readonly zoneStrategy: DeliveryZoneStrategy;

  readonly deliveryZoneIds:
    readonly DeliveryZoneId[];

  /**
   * ID opcional de la sede logística.
   *
   * Útil si el restaurante y la cocina de despacho
   * no son exactamente la misma entidad.
   */
  readonly fulfillmentLocationId?: string;
}


/* ============================================================
   RESERVATIONS
   ============================================================ */

export interface RestaurantReservationConfiguration {
  readonly enabled: boolean;

  /**
   * Máximo de personas por reserva online.
   *
   * Reservas superiores pueden requerir contacto manual.
   */
  readonly maxOnlinePartySize?: number;

  readonly minimumAdvanceMinutes?: number;

  readonly maximumAdvanceDays?: number;
}


/* ============================================================
   CATERING
   ============================================================ */

export interface RestaurantCateringConfiguration {
  readonly enabled: boolean;

  readonly minimumOrder?: Money;

  readonly advanceNoticeHours?: number;

  /**
   * Distancia logística orientativa.
   *
   * No reemplaza el motor real de delivery.
   */
  readonly serviceRadiusKm?: number;
}


/* ============================================================
   DIGITAL LINKS
   ============================================================ */

export interface RestaurantDigitalLinks {
  readonly website?: string;

  readonly menu?: string;

  readonly ordering?: string;

  readonly reservations?: string;

  readonly googleMaps?: string;

  readonly googleBusinessProfile?: string;
}


/* ============================================================
   SOCIAL NETWORKS
   ============================================================ */

export interface RestaurantSocialLinks {
  readonly instagram?: string;

  readonly facebook?: string;

  readonly tiktok?: string;

  readonly youtube?: string;
}


/* ============================================================
   LEGAL
   ============================================================ */

export interface RestaurantLegalInformation {
  /**
   * Empresa que opera la sede.
   */
  readonly legalEntityName?: string;

  readonly organizationId?: OrganizationId;

  readonly taxId?: string;

  readonly vatId?: string;

  readonly registrationNumber?: string;
}


/* ============================================================
   SEO
   ============================================================ */

export interface RestaurantSeo {
  readonly indexable: boolean;

  readonly title: RestaurantLocalizedText;

  readonly description: RestaurantLocalizedText;

  /**
   * URL canónica lógica.
   *
   * Ejemplo:
   *
   * /lokale/czapelska
   */
  readonly canonicalPath: string;

  readonly searchTopics:
    readonly string[];

  readonly imageUrl?: string;
}


/* ============================================================
   BRAND
   ============================================================ */

export interface RestaurantBrand {
  readonly brandId: BrandId;

  readonly brandName: string;

  /**
   * Permite en el futuro utilizar el mismo backend
   * para conceptos secundarios sin mezclar marcas.
   */
  readonly conceptId?: string;
}


/* ============================================================
   LOCALES / INTERNATIONALIZATION
   ============================================================ */

export interface RestaurantLocaleConfiguration {
  readonly defaultLocale:
    SupportedLocale;

  readonly supportedLocales:
    readonly SupportedLocale[];
}


/* ============================================================
   EXTERNAL SYSTEM MAPPINGS
   ============================================================ */

/**
 * Nunca debemos utilizar IDs externos como nuestro ID principal.
 *
 * Guardamos los mapeos.
 */
export interface RestaurantExternalMappings {
  readonly rcOrderaLocationId?: ExternalLocationId;

  readonly supabaseLocationId?: ExternalLocationId;

  readonly posLocationId?: ExternalLocationId;

  readonly googlePlaceId?: string;

  readonly accountingLocationId?: string;
}


/* ============================================================
   RESTAURANT
   ============================================================ */

export interface RestaurantLocation {
  /**
   * ID interno y estable.
   *
   * Este ID nunca debería cambiar.
   */
  readonly id: RestaurantId;

  /**
   * Slug de URL.
   *
   * Ejemplo:
   *
   * czapelska
   * brzeska
   */
  readonly slug: string;

  /**
   * Código humano interno.
   *
   * Ejemplos:
   *
   * PL-WAW-CZA-001
   * PL-WAW-BRZ-002
   *
   * Útil para operaciones, soporte y reporting.
   */
  readonly code: string;

  readonly brand: RestaurantBrand;

  readonly name: string;

  readonly shortName: string;

  readonly lifecycleStatus:
    RestaurantLifecycleStatus;

  readonly operationalStatus:
    RestaurantOperationalStatus;

  readonly ownershipType:
    RestaurantOwnershipType;

  readonly timezone:
    IanaTimeZone;

  readonly currency:
    CurrencyCode;

  readonly locale:
    RestaurantLocaleConfiguration;

  readonly address:
    RestaurantAddress;

  readonly geo?: RestaurantGeoLocation;

  readonly contact:
    RestaurantContact;

  readonly services:
    RestaurantServices;

  readonly weeklyOpeningHours:
    WeeklyOpeningHours;

  readonly specialOpeningHours:
    readonly SpecialOpeningHours[];

  readonly ordering:
    OrderingConfiguration;

  readonly delivery:
    RestaurantDeliveryConfiguration;

  readonly reservations:
    RestaurantReservationConfiguration;

  readonly catering:
    RestaurantCateringConfiguration;

  readonly digital:
    RestaurantDigitalLinks;

  readonly social:
    RestaurantSocialLinks;

  readonly legal:
    RestaurantLegalInformation;

  readonly seo:
    RestaurantSeo;

  readonly external:
    RestaurantExternalMappings;

  /**
   * Fecha ISO de creación.
   */
  readonly createdAt: IsoDateTime;

  /**
   * Última actualización.
   */
  readonly updatedAt: IsoDateTime;
}


/* ============================================================
   DIRECTORY SNAPSHOT
   ============================================================ */

/**
 * Snapshot versionado de todas las sedes.
 *
 * Útil para:
 * - cache
 * - CDN
 * - website
 * - apps
 * - sincronización
 */
export interface RestaurantDirectorySnapshot {
  readonly version: string;

  readonly generatedAt: IsoDateTime;

  readonly restaurants:
    readonly RestaurantLocation[];
}


/* ============================================================
   RESTAURANT QUERY
   ============================================================ */

export interface RestaurantQuery {
  readonly countryCode?: CountryCode;

  readonly city?: string;

  readonly lifecycleStatus?:
    RestaurantLifecycleStatus;

  readonly service?:
    RestaurantService;

  readonly locale?: SupportedLocale;
}


/* ============================================================
   API RESPONSE
   ============================================================ */

export interface RestaurantDirectoryResponse {
  readonly directory:
    RestaurantDirectorySnapshot;

  readonly cached: boolean;

  readonly requestId?: string;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type RestaurantErrorCode =
  | "RESTAURANT_NOT_FOUND"
  | "RESTAURANT_NOT_OPERATIONAL"
  | "SERVICE_NOT_AVAILABLE"
  | "INVALID_LOCATION"
  | "DIRECTORY_UNAVAILABLE"
  | "UPSTREAM_ERROR"
  | "UNKNOWN";


export interface RestaurantDomainError {
  readonly code:
    RestaurantErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?: string;
}


/* ============================================================
   TYPE GUARDS / DOMAIN HELPERS
   ============================================================ */

export function isRestaurantOpen(
  restaurant: RestaurantLocation,
): boolean {
  return (
    restaurant.lifecycleStatus ===
      "open" &&
    restaurant.operationalStatus ===
      "operational"
  );
}


export function isRestaurantPublic(
  restaurant: RestaurantLocation,
): boolean {
  return (
    restaurant.lifecycleStatus !==
    "permanently_closed"
  );
}


export function restaurantHasService(
  restaurant: RestaurantLocation,
  service: RestaurantService,
): boolean {
  const serviceState =
    restaurant.services[
      service === "dine_in"
        ? "dineIn"
        : service
    ];

  return (
    serviceState.enabled &&
    serviceState.publiclyVisible &&
    !serviceState.temporarilyPaused
  );
}


export function restaurantAcceptsOrders(
  restaurant: RestaurantLocation,
): boolean {
  return (
    isRestaurantOpen(
      restaurant,
    ) &&
    restaurant.ordering.enabled
  );
}


/* ============================================================
   RESTAURANT CODE
   ============================================================ */

/**
 * Valida el formato interno aproximado:
 *
 * PL-WAW-CZA-001
 *
 * Esto NO sustituye validación de backend.
 */
export function isValidRestaurantCode(
  value: string,
): boolean {
  return /^[A-Z]{2}-[A-Z0-9]{3}-[A-Z0-9]{3}-\d{3}$/.test(
    value,
  );
}
