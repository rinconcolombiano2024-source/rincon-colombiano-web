/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Menu Domain Types
 * ============================================================
 *
 * Contrato central del dominio de menú.
 *
 * Diseñado para soportar:
 * - múltiples restaurantes
 * - múltiples países
 * - múltiples monedas
 * - múltiples idiomas
 * - delivery / pickup / dine-in / catering
 * - IVA / impuestos
 * - modificadores
 * - variantes
 * - disponibilidad por sede
 * - horarios
 * - alérgenos
 * - información nutricional
 * - promociones futuras
 * - integración con RC ORDERA
 *
 * PRINCIPIO:
 *
 * RC ORDERA / backend = fuente operativa de verdad.
 * Website = consumidor del dominio.
 *
 * Este archivo contiene TIPOS.
 * No contiene productos reales.
 */

import type {
  SupportedLocale,
} from "@/config/site";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

/**
 * Los IDs deben ser estables.
 *
 * NUNCA utilizar nombres visibles como identificadores.
 */

export type MenuItemId = string;

export type MenuCategoryId = string;

export type ModifierGroupId = string;

export type ModifierOptionId = string;

export type LocationId = string;

export type MediaAssetId = string;

export type ExternalProductId = string;


/* ============================================================
   LOCALIZATION
   ============================================================ */

export interface LocalizedText {
  /**
   * Texto principal/fallback.
   *
   * Debe existir siempre.
   */
  readonly default: string;

  /**
   * Traducciones adicionales.
   */
  readonly translations?: Readonly<
    Partial<
      Record<
        SupportedLocale,
        string
      >
    >
  >;
}


export interface LocalizedContent {
  readonly name: LocalizedText;

  readonly description?: LocalizedText;

  readonly shortDescription?: LocalizedText;
}


/* ============================================================
   MONEY
   ============================================================ */

/**
 * IMPORTANTE:
 *
 * Los precios se almacenan en unidades menores.
 *
 * Ejemplo:
 *
 * 60,00 PLN
 *
 * amountMinor = 6000
 * currency = "PLN"
 *
 * Esto evita errores clásicos de coma flotante:
 *
 * 0.1 + 0.2 !== 0.3
 */

export interface Money {
  readonly amountMinor: number;

  /**
   * Código ISO 4217.
   *
   * Ejemplos:
   *
   * PLN
   * EUR
   * USD
   * COP
   */
  readonly currency: string;
}


/* ============================================================
   TAX
   ============================================================ */

export type TaxCategory =
  | "food"
  | "beverage"
  | "alcohol"
  | "service"
  | "other";


export interface TaxConfig {
  readonly category: TaxCategory;

  /**
   * Basis points.
   *
   * 800  = 8.00%
   * 2300 = 23.00%
   *
   * Evitamos almacenar:
   *
   * 0.08
   *
   * para reducir ambigüedad.
   */
  readonly rateBasisPoints: number;

  /**
   * Indica si el precio mostrado ya incluye impuesto.
   */
  readonly includedInPrice: boolean;
}


/* ============================================================
   MEDIA
   ============================================================ */

export type MediaAssetType =
  | "image"
  | "video";


export interface MediaAsset {
  readonly id: MediaAssetId;

  readonly type: MediaAssetType;

  readonly url: string;

  readonly alt: LocalizedText;

  readonly width?: number;

  readonly height?: number;

  readonly mimeType?: string;

  /**
   * Posición dentro de galería.
   */
  readonly sortOrder: number;

  /**
   * Imagen principal del producto.
   */
  readonly primary: boolean;
}


/* ============================================================
   MENU CHANNELS
   ============================================================ */

export type MenuChannel =
  | "website"
  | "dine_in"
  | "pickup"
  | "delivery"
  | "catering";


/* ============================================================
   PRODUCT STATUS
   ============================================================ */

export type MenuItemStatus =
  | "draft"
  | "active"
  | "inactive"
  | "archived";


export type AvailabilityStatus =
  | "available"
  | "sold_out"
  | "temporarily_unavailable"
  | "scheduled"
  | "hidden";


/* ============================================================
   DIETARY INFORMATION
   ============================================================ */

export type DietaryTag =
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "lactose_free"
  | "spicy"
  | "very_spicy"
  | "halal"
  | "kosher"
  | "high_protein"
  | "contains_alcohol";


/* ============================================================
   ALLERGENS
   ============================================================ */

/**
 * Basado principalmente en alérgenos comunes utilizados
 * en la Unión Europea.
 */

export type AllergenCode =
  | "gluten"
  | "crustaceans"
  | "eggs"
  | "fish"
  | "peanuts"
  | "soybeans"
  | "milk"
  | "nuts"
  | "celery"
  | "mustard"
  | "sesame"
  | "sulphites"
  | "lupin"
  | "molluscs"
  | "other";


export interface AllergenInfo {
  readonly code: AllergenCode;

  readonly label?: LocalizedText;

  /**
   * Puede contener trazas.
   */
  readonly mayContain: boolean;
}


/* ============================================================
   NUTRITION
   ============================================================ */

export interface NutritionInfo {
  readonly servingSizeGrams?: number;

  readonly caloriesKcal?: number;

  readonly proteinGrams?: number;

  readonly carbohydrateGrams?: number;

  readonly fatGrams?: number;

  readonly saturatedFatGrams?: number;

  readonly sugarGrams?: number;

  readonly saltGrams?: number;

  readonly fiberGrams?: number;
}


/* ============================================================
   SCHEDULING
   ============================================================ */

export type MenuDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";


export interface MenuTimeWindow {
  readonly day: MenuDay;

  /**
   * HH:mm
   */
  readonly startsAt: string;

  /**
   * HH:mm
   */
  readonly endsAt: string;
}


/* ============================================================
   AVAILABILITY
   ============================================================ */

export interface ItemAvailability {
  readonly status: AvailabilityStatus;

  /**
   * Canales donde está permitido vender.
   */
  readonly channels: readonly MenuChannel[];

  /**
   * Ventanas horarias opcionales.
   *
   * Ejemplo:
   * un sancocho disponible únicamente fines de semana.
   */
  readonly schedule?: readonly MenuTimeWindow[];

  /**
   * Fecha ISO opcional.
   */
  readonly availableFrom?: string;

  readonly availableUntil?: string;
}


/* ============================================================
   MODIFIERS
   ============================================================ */

/**
 * Ejemplos:
 *
 * "Elige salsa"
 * "Elige proteína"
 * "Extras"
 * "Nivel de picante"
 */

export interface ModifierOption {
  readonly id: ModifierOptionId;

  readonly content: LocalizedContent;

  readonly priceDelta: Money;

  readonly status: MenuItemStatus;

  readonly sortOrder: number;

  readonly defaultSelected: boolean;

  /**
   * Permite utilizar un producto real como opción.
   *
   * Ejemplo:
   * agregar chorizo existente.
   */
  readonly linkedMenuItemId?: MenuItemId;
}


export interface ModifierGroup {
  readonly id: ModifierGroupId;

  readonly content: LocalizedContent;

  /**
   * Cantidad mínima de opciones.
   */
  readonly minSelections: number;

  /**
   * Cantidad máxima de opciones.
   */
  readonly maxSelections: number;

  readonly options:
    readonly ModifierOption[];

  readonly sortOrder: number;
}


/* ============================================================
   VARIANTS
   ============================================================ */

/**
 * Una variante representa otra versión del MISMO producto.
 *
 * Ejemplo:
 *
 * Limonada:
 *
 * 300 ml
 * 500 ml
 *
 * No confundir con modificadores.
 */

export interface MenuItemVariant {
  readonly id: string;

  readonly name: LocalizedText;

  readonly sku?: string;

  readonly price: Money;

  readonly status: MenuItemStatus;

  readonly sortOrder: number;
}


/* ============================================================
   LOCATION OVERRIDES
   ============================================================ */

/**
 * Permite que un producto tenga comportamiento diferente
 * dependiendo del restaurante.
 *
 * Ejemplo:
 *
 * Bandeja Paisa:
 *
 * Czapelska:
 * 60 zł
 *
 * Brzeska:
 * 62 zł
 *
 * sin crear dos productos independientes.
 */

export interface MenuItemLocationOverride {
  readonly locationId: LocationId;

  readonly enabled: boolean;

  readonly price?: Money;

  readonly availability?: ItemAvailability;

  readonly tax?: TaxConfig;
}


/* ============================================================
   MENU CATEGORY
   ============================================================ */

export type MenuCategoryStatus =
  | "active"
  | "hidden"
  | "archived";


export interface MenuCategory {
  readonly id: MenuCategoryId;

  readonly slug: string;

  readonly content: LocalizedContent;

  readonly status: MenuCategoryStatus;

  readonly sortOrder: number;

  /**
   * Imagen opcional de categoría.
   */
  readonly media?: readonly MediaAsset[];

  /**
   * Categoría padre.
   *
   * Permite:
   *
   * Bebidas
   * ├── Frías
   * └── Calientes
   */
  readonly parentCategoryId?: MenuCategoryId;
}


/* ============================================================
   MENU ITEM
   ============================================================ */

export interface MenuItem {
  /**
   * ID interno estable.
   */
  readonly id: MenuItemId;

  /**
   * ID del producto dentro del sistema comercial / RC ORDERA.
   */
  readonly externalProductId?: ExternalProductId;

  /**
   * URL pública.
   *
   * Ejemplo:
   *
   * bandeja-paisa
   */
  readonly slug: string;

  readonly categoryId: MenuCategoryId;

  readonly content: LocalizedContent;

  /**
   * SKU interno opcional.
   */
  readonly sku?: string;

  readonly status: MenuItemStatus;

  readonly basePrice: Money;

  readonly tax: TaxConfig;

  readonly availability: ItemAvailability;

  readonly media:
    readonly MediaAsset[];

  readonly dietaryTags:
    readonly DietaryTag[];

  readonly allergens:
    readonly AllergenInfo[];

  readonly nutrition?: NutritionInfo;

  readonly variants?:
    readonly MenuItemVariant[];

  readonly modifierGroupIds:
    readonly ModifierGroupId[];

  readonly locationOverrides:
    readonly MenuItemLocationOverride[];

  /**
   * Posición dentro de categoría.
   */
  readonly sortOrder: number;

  /**
   * Producto destacado.
   */
  readonly featured: boolean;

  /**
   * Producto nuevo.
   */
  readonly newProduct: boolean;

  /**
   * Producto recomendado.
   */
  readonly recommended: boolean;

  /**
   * Permite indexar una página propia del plato en Google.
   */
  readonly seoIndexable: boolean;

  /**
   * Fecha ISO.
   */
  readonly createdAt: string;

  /**
   * Fecha ISO.
   */
  readonly updatedAt: string;
}


/* ============================================================
   MENU SNAPSHOT
   ============================================================ */

/**
 * Representación completa de un menú enviado desde RC ORDERA
 * hacia otros consumidores.
 *
 * Permite cachear y versionar el menú como una unidad.
 */

export interface MenuSnapshot {
  /**
   * Versión lógica.
   *
   * Ejemplo:
   *
   * 1745929923
   *
   * o UUID/hash generado por backend.
   */
  readonly version: string;

  readonly locationId: LocationId;

  readonly currency: string;

  readonly generatedAt: string;

  readonly categories:
    readonly MenuCategory[];

  readonly items:
    readonly MenuItem[];

  readonly modifierGroups:
    readonly ModifierGroup[];
}


/* ============================================================
   RESOLVED MENU TYPES
   ============================================================ */

/**
 * Producto después de resolver:
 *
 * - restaurante
 * - precio
 * - disponibilidad
 * - override
 *
 * Esta es normalmente la forma que debería recibir
 * el componente visual.
 */

export interface ResolvedMenuItem
  extends MenuItem {
  readonly resolvedLocationId: LocationId;

  readonly resolvedPrice: Money;

  readonly resolvedTax: TaxConfig;

  readonly resolvedAvailability: ItemAvailability;
}


/* ============================================================
   QUERY TYPES
   ============================================================ */

export interface MenuQuery {
  readonly locationId: LocationId;

  readonly channel: MenuChannel;

  readonly locale: SupportedLocale;

  readonly categoryId?: MenuCategoryId;

  readonly featuredOnly?: boolean;

  readonly availableOnly?: boolean;
}


/* ============================================================
   MENU API RESPONSE
   ============================================================ */

export interface MenuResponse {
  readonly menu: MenuSnapshot;

  readonly requestId?: string;

  readonly cached: boolean;
}


/* ============================================================
   ERROR MODEL
   ============================================================ */

export type MenuErrorCode =
  | "MENU_NOT_FOUND"
  | "LOCATION_NOT_FOUND"
  | "PRODUCT_NOT_FOUND"
  | "INVALID_CURRENCY"
  | "INVALID_PRICE"
  | "SERVICE_UNAVAILABLE"
  | "UPSTREAM_ERROR"
  | "UNKNOWN";


export interface MenuDomainError {
  readonly code: MenuErrorCode;

  readonly message: string;

  readonly requestId?: string;

  readonly retryable: boolean;
}


/* ============================================================
   TYPE GUARDS
   ============================================================ */

export function isMenuItemAvailable(
  item: MenuItem,
): boolean {
  return (
    item.status === "active" &&
    item.availability.status ===
      "available"
  );
}


export function isMenuCategoryVisible(
  category: MenuCategory,
): boolean {
  return (
    category.status ===
    "active"
  );
}


export function supportsMenuChannel(
  item: MenuItem,
  channel: MenuChannel,
): boolean {
  return item.availability.channels.includes(
    channel,
  );
}


/* ============================================================
   MONEY HELPERS
   ============================================================ */

/**
 * Convierte unidades menores a unidades normales.
 *
 * Ejemplo:
 *
 * 6000 PLN
 *
 * =>
 *
 * 60
 */
export function moneyToMajorUnits(
  money: Money,
): number {
  return money.amountMinor / 100;
}


/**
 * Compara dos monedas.
 */
export function sameCurrency(
  first: Money,
  second: Money,
): boolean {
  return (
    first.currency ===
    second.currency
  );
}
