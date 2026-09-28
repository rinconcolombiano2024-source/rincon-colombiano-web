/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * Restaurant / Location Configuration
 * ============================================================
 *
 * Fuente inicial de configuración de las sedes.
 *
 * IMPORTANTE:
 *
 * En una fase posterior los datos operativos dinámicos
 * (estado, horarios especiales, delivery, disponibilidad,
 * pedidos, etc.) deberán provenir de RC ORDERA / Supabase.
 *
 * Este archivo define:
 * - contrato de datos
 * - IDs estables
 * - slugs públicos
 * - estructura multi-sede
 * - valores iniciales/fallback
 *
 * NUNCA utilizar el nombre visible del restaurante como ID.
 */


/* ============================================================
   TYPES
   ============================================================ */

export type RestaurantStatus =
  | "open"
  | "coming_soon"
  | "temporarily_closed"
  | "closed";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type ServiceType =
  | "dine_in"
  | "pickup"
  | "delivery"
  | "reservations"
  | "catering";

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface AddressConfig {
  readonly street: string;
  readonly postalCode?: string;
  readonly city: string;
  readonly district?: string;
  readonly country: string;
  readonly countryCode: string;
}

export interface OpeningInterval {
  /**
   * HH:mm
   *
   * Ejemplo:
   * 11:30
   */
  readonly opensAt: string;

  /**
   * HH:mm
   *
   * Ejemplo:
   * 21:00
   */
  readonly closesAt: string;
}

export interface DaySchedule {
  readonly closed: boolean;

  /**
   * Un día podría tener más de un intervalo en el futuro:
   *
   * 11:00–15:00
   * 17:00–22:00
   */
  readonly intervals: readonly OpeningInterval[];
}

export type WeeklySchedule =
  Readonly<Record<DayOfWeek, DaySchedule>>;

export interface RestaurantServices {
  readonly dineIn: boolean;
  readonly pickup: boolean;
  readonly delivery: boolean;
  readonly reservations: boolean;
  readonly catering: boolean;
}

export interface RestaurantSeoConfig {
  readonly title: string;
  readonly description: string;

  /**
   * Keywords editoriales internas.
   *
   * No confundir con la antigua meta keywords.
   * Servirán para planificación de contenido y SEO.
   */
  readonly searchTopics: readonly string[];
}

export interface RestaurantConfig {
  /**
   * ID estable interno.
   *
   * Este valor NO debe cambiar aunque cambie:
   * - nombre
   * - dirección visual
   * - textos
   * - idioma
   */
  readonly id: string;

  /**
   * Slug estable utilizado en URLs.
   *
   * Ejemplo:
   *
   * /lokale/czapelska
   */
  readonly slug: string;

  readonly name: string;

  readonly shortName: string;

  readonly status: RestaurantStatus;

  readonly timezone: string;

  readonly address: AddressConfig;

  /**
   * Solo agregar coordenadas después de verificarlas.
   */
  readonly coordinates?: Coordinates;

  readonly services: RestaurantServices;

  readonly weeklyHours?: WeeklySchedule;

  readonly phone?: string;

  readonly email?: string;

  readonly googleMapsUrl?: string;

  /**
   * ID correspondiente dentro de RC ORDERA.
   *
   * En desarrollo puede estar vacío/no definido.
   */
  readonly rcOrderaLocationId?: string;

  readonly seo: RestaurantSeoConfig;
}


/* ============================================================
   SCHEDULE HELPERS
   ============================================================ */

const closedDay: DaySchedule = {
  closed: true,
  intervals: [],
};

function openDay(
  opensAt: string,
  closesAt: string,
): DaySchedule {
  return {
    closed: false,

    intervals: [
      {
        opensAt,
        closesAt,
      },
    ],
  };
}


/* ============================================================
   CZAPELSKA HOURS
   ============================================================ */

const czapelskaWeeklyHours: WeeklySchedule = {
  monday: openDay(
    "11:30",
    "21:00",
  ),

  tuesday: openDay(
    "11:30",
    "21:00",
  ),

  wednesday: openDay(
    "11:30",
    "21:00",
  ),

  thursday: openDay(
    "11:30",
    "21:00",
  ),

  friday: openDay(
    "11:30",
    "21:00",
  ),

  saturday: openDay(
    "10:00",
    "21:00",
  ),

  sunday: openDay(
    "10:00",
    "20:00",
  ),
};


/* ============================================================
   RESTAURANTS
   ============================================================ */

export const restaurants = [
  {
    id: "rc-location-czapelska",

    slug: "czapelska",

    name:
      "Rincón Colombiano – Czapelska",

    shortName:
      "Czapelska",

    status:
      "open",

    timezone:
      "Europe/Warsaw",

    address: {
      street:
        "Czapelska 33",

      city:
        "Warszawa",

      district:
        "Praga-Południe",

      country:
        "Polska",

      countryCode:
        "PL",
    },

    services: {
      dineIn: true,
      pickup: true,
      delivery: true,
      reservations: true,
      catering: true,
    },

    weeklyHours:
      czapelskaWeeklyHours,

    seo: {
      title:
        "Rincón Colombiano Czapelska | Restauracja kolumbijska Warszawa",

      description:
        "Rincón Colombiano przy Czapelskiej 33 w Warszawie. Autentyczna kuchnia kolumbijska, zamówienia, odbiór osobisty, dostawa i catering.",

      searchTopics: [
        "restauracja kolumbijska Warszawa",
        "kuchnia kolumbijska Praga Południe",
        "Rincón Colombiano Czapelska",
        "kolumbijskie jedzenie Warszawa",
        "arepas Warszawa",
        "empanadas Warszawa",
        "bandeja paisa Warszawa",
      ],
    },
  },

  {
    id: "rc-location-brzeska",

    slug: "brzeska",

    name:
      "Rincón Colombiano – Brzeska",

    shortName:
      "Brzeska",

    status:
      "coming_soon",

    timezone:
      "Europe/Warsaw",

    address: {
      street:
        "Brzeska 10",

      city:
        "Warszawa",

      district:
        "Praga-Północ",

      country:
        "Polska",

      countryCode:
        "PL",
    },

    services: {
      dineIn: false,
      pickup: false,
      delivery: false,
      reservations: false,
      catering: false,
    },

    seo: {
      title:
        "Rincón Colombiano Brzeska | Praga Północ Warszawa",

      description:
        "Nowy lokal Rincón Colombiano przy Brzeskiej 10 na Pradze Północ w Warszawie. Otwarcie wkrótce.",

      searchTopics: [
        "Rincón Colombiano Brzeska",
        "restauracja kolumbijska Praga Północ",
        "kuchnia kolumbijska Warszawa",
        "kolumbijskie jedzenie Praga",
      ],
    },
  },
] as const satisfies readonly RestaurantConfig[];


/* ============================================================
   DERIVED TYPES
   ============================================================ */

export type Restaurant =
  (typeof restaurants)[number];

export type RestaurantSlug =
  Restaurant["slug"];

export type RestaurantId =
  Restaurant["id"];


/* ============================================================
   QUERY HELPERS
   ============================================================ */

/**
 * Busca una sede por slug público.
 */
export function getRestaurantBySlug(
  slug: string,
): Restaurant | undefined {
  return restaurants.find(
    (restaurant) =>
      restaurant.slug === slug,
  );
}


/**
 * Busca una sede utilizando ID interno estable.
 */
export function getRestaurantById(
  id: string,
): Restaurant | undefined {
  return restaurants.find(
    (restaurant) =>
      restaurant.id === id,
  );
}


/**
 * Sedes actualmente abiertas.
 */
export function getOpenRestaurants():
  readonly Restaurant[] {
  return restaurants.filter(
    (restaurant) =>
      restaurant.status === "open",
  );
}


/**
 * Sedes visibles públicamente.
 *
 * Una sede cerrada permanentemente puede permanecer
 * en registros históricos sin aparecer públicamente.
 */
export function getPublicRestaurants():
  readonly Restaurant[] {
  return restaurants.filter(
    (restaurant) =>
      restaurant.status !== "closed",
  );
}


/**
 * Sedes que actualmente aceptan pedidos para recoger.
 */
export function getPickupRestaurants():
  readonly Restaurant[] {
  return restaurants.filter(
    (restaurant) =>
      restaurant.status === "open" &&
      restaurant.services.pickup,
  );
}


/**
 * Sedes con delivery activado.
 */
export function getDeliveryRestaurants():
  readonly Restaurant[] {
  return restaurants.filter(
    (restaurant) =>
      restaurant.status === "open" &&
      restaurant.services.delivery,
  );
}


/**
 * Sedes con reservas habilitadas.
 */
export function getReservableRestaurants():
  readonly Restaurant[] {
  return restaurants.filter(
    (restaurant) =>
      restaurant.status === "open" &&
      restaurant.services.reservations,
  );
}


/**
 * Comprueba si una sede tiene un servicio determinado.
 */
export function restaurantSupportsService(
  restaurant: Restaurant,
  service: ServiceType,
): boolean {
  switch (service) {
    case "dine_in":
      return restaurant.services.dineIn;

    case "pickup":
      return restaurant.services.pickup;

    case "delivery":
      return restaurant.services.delivery;

    case "reservations":
      return restaurant.services.reservations;

    case "catering":
      return restaurant.services.catering;
  }
}


/* ============================================================
   STATUS HELPERS
   ============================================================ */

export function isRestaurantOperational(
  restaurant: Restaurant,
): boolean {
  return restaurant.status === "open";
}


export function isComingSoon(
  restaurant: Restaurant,
): boolean {
  return (
    restaurant.status ===
    "coming_soon"
  );
}


/* ============================================================
   SAFETY ASSERTION
   ============================================================ */

/**
 * Para procesos donde una sede DEBE existir.
 *
 * Ejemplo:
 *
 * const restaurant =
 *   requireRestaurantBySlug("czapelska");
 *
 * Si el slug es inválido, fallamos explícitamente en lugar de
 * continuar con datos undefined.
 */
export function requireRestaurantBySlug(
  slug: string,
): Restaurant {
  const restaurant =
    getRestaurantBySlug(slug);

  if (!restaurant) {
    throw new Error(
      `Restaurant not found for slug: ${slug}`,
    );
  }

  return restaurant;
}


/* ============================================================
   RESERVED
   ============================================================ */

/**
 * Mantener exportado para futuros horarios especiales.
 *
 * Ejemplo:
 *
 * - Navidad
 * - Año Nuevo
 * - festivos
 * - cierre técnico
 * - evento privado
 *
 * Los horarios especiales NO deben sobrescribir manualmente
 * el horario semanal.
 */
export const restaurantScheduleDefaults = {
  closedDay,
} as const;
