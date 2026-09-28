/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Search & Discovery Domain
 * ============================================================
 *
 * Motor universal de búsqueda y descubrimiento.
 *
 * Diseñado para:
 *
 * - menú
 * - productos
 * - restaurantes
 * - servicios
 * - catering
 * - cumpleaños
 * - empresas
 * - familias
 * - desayunos
 * - desayunos sorpresa
 * - decoración
 * - panadería
 * - eventos
 * - historias
 * - artículos
 * - promociones
 * - comunidad
 * - perfiles públicos
 * - videos y contenido multimedia
 *
 * Preparado para:
 *
 * - múltiples idiomas
 * - búsqueda textual
 * - búsqueda semántica
 * - búsqueda híbrida
 * - autocomplete
 * - synonyms
 * - typo tolerance
 * - filtros
 * - facets
 * - ranking
 * - popularidad
 * - personalización futura
 * - analytics
 * - SEO controlado
 *
 * PRINCIPIO:
 *
 * El buscador interno y Google NO son lo mismo.
 *
 * /search?q=...
 *
 * normalmente será NOINDEX.
 *
 * Las páginas SEO deberán ser páginas reales, editoriales
 * y administrables desde el CMS.
 */

import type {
  IsoDateTime,
  LocalizedText,
  RequestId,
} from "@/types/common";

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  RestaurantId,
} from "@/types/restaurant";

import type {
  MenuCategoryId,
  MenuItemId,
} from "@/types/menu";

import type {
  ArticleId,
  EventId,
  MediaAssetId,
  PageId,
  PromotionId,
  ServiceId,
  StoryId,
} from "@/types/content";

import type {
  CommunityPostId,
  CommunityProfileId,
} from "@/types/community";

import type {
  MarketingSessionId,
  VisitorId,
} from "@/types/marketing";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type SearchDocumentId =
  string;

export type SearchQueryId =
  string;

export type SearchSuggestionId =
  string;

export type SearchSynonymSetId =
  string;

export type SearchIndexJobId =
  string;

export type SearchAnalyticsEventId =
  string;


/* ============================================================
   SEARCH ENTITY TYPES
   ============================================================ */

export type SearchEntityType =
  | "menu_item"
  | "menu_category"
  | "restaurant"
  | "service"
  | "event"
  | "article"
  | "story"
  | "page"
  | "promotion"
  | "community_post"
  | "community_profile"
  | "media";


/* ============================================================
   SEARCH ENTITY REFERENCE
   ============================================================ */

export interface SearchEntityReference {
  readonly type:
    SearchEntityType;

  readonly id:
    string;
}


/* ============================================================
   PROVIDERS
   ============================================================ */

/**
 * La aplicación no debe depender para siempre
 * de un único proveedor.
 */

export type SearchProvider =
  | "postgres"
  | "meilisearch"
  | "typesense"
  | "algolia"
  | "opensearch"
  | "custom";


/* ============================================================
   SEARCH MODES
   ============================================================ */

export type SearchMode =
  | "keyword"
  | "semantic"
  | "hybrid";


/* ============================================================
   VISIBILITY
   ============================================================ */

/**
 * Solamente "public" puede aparecer
 * en el buscador público sin autenticación.
 */

export type SearchVisibility =
  | "public"
  | "authenticated"
  | "owner_only"
  | "admin_only";


/* ============================================================
   INDEXABILITY
   ============================================================ */

export interface SearchIndexability {
  /**
   * Disponible dentro del buscador interno.
   */
  readonly internalSearchable:
    boolean;

  /**
   * Puede formar parte de páginas públicas indexables.
   *
   * Esto NO obliga a Google a indexarlo.
   */
  readonly externalSearchEngineIndexable:
    boolean;

  /**
   * Visible en motores externos.
   */
  readonly allowWebCrawlers:
    boolean;
}


/* ============================================================
   SEARCH DOCUMENT
   ============================================================ */

/**
 * Representación normalizada de cualquier contenido
 * dentro del índice.
 */

export interface SearchDocument {
  readonly id:
    SearchDocumentId;

  readonly entity:
    SearchEntityReference;

  readonly locale:
    SupportedLocale;

  readonly title:
    string;

  readonly subtitle?:
    string;

  readonly summary?:
    string;

  /**
   * Texto normalizado usado para búsqueda.
   *
   * No necesariamente se muestra completo.
   */
  readonly searchableText:
    string;

  /**
   * Términos editoriales asociados.
   */
  readonly tags:
    readonly string[];

  /**
   * Variantes conocidas.
   *
   * Ejemplo:
   *
   * empanada
   * empanadas
   * colombian empanada
   */
  readonly searchTerms:
    readonly string[];

  readonly path:
    string;

  readonly canonicalPath:
    string;

  readonly visibility:
    SearchVisibility;

  readonly indexability:
    SearchIndexability;

  readonly restaurantIds:
    readonly RestaurantId[];

  readonly menuItemId?:
    MenuItemId;

  readonly menuCategoryId?:
    MenuCategoryId;

  readonly serviceId?:
    ServiceId;

  readonly eventId?:
    EventId;

  readonly articleId?:
    ArticleId;

  readonly storyId?:
    StoryId;

  readonly pageId?:
    PageId;

  readonly promotionId?:
    PromotionId;

  readonly communityPostId?:
    CommunityPostId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly mediaId?:
    MediaAssetId;

  /**
   * Imagen principal opcional.
   */
  readonly thumbnailMediaId?:
    MediaAssetId;

  /**
   * Señal editorial interna.
   *
   * NO se utiliza para manipular motores
   * de búsqueda externos.
   */
  readonly editorialPriority:
    number;

  /**
   * Señal agregada interna.
   */
  readonly popularityScore:
    number;

  /**
   * Calidad editorial / completitud.
   *
   * Debe calcularse mediante reglas internas.
   */
  readonly qualityScore:
    number;

  readonly publishedAt?:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly indexedAt:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   QUERY FILTERS
   ============================================================ */

export interface SearchFilters {
  readonly entityTypes?:
    readonly SearchEntityType[];

  readonly restaurantIds?:
    readonly RestaurantId[];

  readonly menuCategoryIds?:
    readonly MenuCategoryId[];

  readonly tags?:
    readonly string[];

  readonly publishedFrom?:
    IsoDateTime;

  readonly publishedUntil?:
    IsoDateTime;
}


/* ============================================================
   SORT
   ============================================================ */

export type SearchSort =
  | "relevance"
  | "newest"
  | "oldest"
  | "popular"
  | "editorial";


/* ============================================================
   SEARCH REQUEST
   ============================================================ */

export interface SearchRequest {
  readonly query:
    string;

  readonly locale:
    SupportedLocale;

  readonly mode:
    SearchMode;

  readonly filters:
    SearchFilters;

  readonly sort:
    SearchSort;

  readonly cursor?:
    string;

  readonly limit:
    number;

  readonly includeFacets:
    boolean;

  readonly requestId:
    RequestId;
}


/* ============================================================
   MATCH REASONS
   ============================================================ */

export type SearchMatchReason =
  | "title"
  | "subtitle"
  | "description"
  | "keyword"
  | "tag"
  | "synonym"
  | "semantic"
  | "popular"
  | "editorial";


/* ============================================================
   HIGHLIGHT
   ============================================================ */

export interface SearchHighlight {
  readonly field:
    string;

  /**
   * Texto ya procesado para mostrar.
   *
   * La implementación debe sanitizar cualquier HTML.
   */
  readonly snippet:
    string;
}


/* ============================================================
   SEARCH HIT
   ============================================================ */

export interface SearchHit {
  readonly documentId:
    SearchDocumentId;

  readonly entity:
    SearchEntityReference;

  readonly entityType:
    SearchEntityType;

  readonly title:
    string;

  readonly subtitle?:
    string;

  readonly summary?:
    string;

  readonly path:
    string;

  readonly thumbnailMediaId?:
    MediaAssetId;

  readonly score:
    number;

  readonly matchReasons:
    readonly SearchMatchReason[];

  readonly highlights:
    readonly SearchHighlight[];

  readonly restaurantIds:
    readonly RestaurantId[];
}


/* ============================================================
   FACETS
   ============================================================ */

export interface SearchFacetValue {
  readonly value:
    string;

  readonly count:
    number;
}


export interface SearchFacet {
  readonly key:
    string;

  readonly label:
    LocalizedText;

  readonly values:
    readonly SearchFacetValue[];
}


/* ============================================================
   SEARCH RESPONSE
   ============================================================ */

export interface SearchResponse {
  readonly queryId:
    SearchQueryId;

  readonly originalQuery:
    string;

  readonly normalizedQuery:
    string;

  readonly locale:
    SupportedLocale;

  readonly hits:
    readonly SearchHit[];

  readonly facets:
    readonly SearchFacet[];

  readonly totalApproximate:
    number;

  readonly nextCursor?:
    string;

  readonly hasMore:
    boolean;

  readonly processingTimeMs?:
    number;

  readonly provider:
    SearchProvider;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   QUERY NORMALIZATION
   ============================================================ */

export interface SearchNormalizedQuery {
  readonly original:
    string;

  readonly normalized:
    string;

  readonly locale:
    SupportedLocale;

  readonly tokens:
    readonly string[];

  readonly correctedQuery?:
    string;
}


/* ============================================================
   TYPO TOLERANCE
   ============================================================ */

export interface SearchTypoPolicy {
  readonly enabled:
    boolean;

  readonly minimumWordLength:
    number;

  readonly maximumTyposPerWord:
    number;
}


/* ============================================================
   SYNONYMS
   ============================================================ */

/**
 * Ejemplo:
 *
 * Polska:
 *
 * "empanada"
 * "empanadas"
 *
 * Español:
 *
 * "domicilio"
 * "delivery"
 * "entrega"
 */

export interface SearchSynonymSet {
  readonly id:
    SearchSynonymSetId;

  readonly locale:
    SupportedLocale;

  readonly terms:
    readonly string[];

  readonly bidirectional:
    boolean;

  readonly active:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   AUTOCOMPLETE
   ============================================================ */

export type SearchSuggestionType =
  | "query"
  | "menu_item"
  | "restaurant"
  | "service"
  | "event"
  | "article"
  | "community"
  | "category";


export interface SearchSuggestion {
  readonly id:
    SearchSuggestionId;

  readonly type:
    SearchSuggestionType;

  readonly label:
    string;

  readonly secondaryLabel?:
    string;

  readonly path?:
    string;

  readonly entity?:
    SearchEntityReference;

  readonly thumbnailMediaId?:
    MediaAssetId;

  readonly score:
    number;
}


/* ============================================================
   AUTOCOMPLETE REQUEST
   ============================================================ */

export interface SearchSuggestionRequest {
  readonly query:
    string;

  readonly locale:
    SupportedLocale;

  readonly restaurantId?:
    RestaurantId;

  readonly limit:
    number;

  readonly requestId:
    RequestId;
}


/* ============================================================
   DISCOVERY
   ============================================================ */

/**
 * Discovery no necesita una búsqueda escrita.
 *
 * Puede alimentar:
 *
 * - tendencia
 * - platos populares
 * - eventos
 * - historias
 * - contenido nuevo
 */

export type DiscoverySectionType =
  | "trending"
  | "popular_food"
  | "new_content"
  | "events"
  | "services"
  | "restaurants"
  | "community"
  | "recommended";


export interface DiscoverySection {
  readonly type:
    DiscoverySectionType;

  readonly title:
    LocalizedText;

  readonly items:
    readonly SearchHit[];

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   CURATED SEARCH LANDING PAGE
   ============================================================ */

/**
 * Las landing pages SEO NO nacen automáticamente
 * de cada consulta.
 *
 * Deben ser creadas/revisadas editorialmente.
 */

export interface CuratedSearchLandingPage {
  readonly id:
    string;

  readonly locale:
    SupportedLocale;

  readonly primaryQuery:
    string;

  readonly relatedQueries:
    readonly string[];

  readonly pageId:
    PageId;

  readonly canonicalPath:
    string;

  readonly indexable:
    boolean;

  readonly active:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   SEO POLICY
   ============================================================ */

export interface SearchSeoPolicy {
  /**
   * Las páginas /search?q= no deben
   * indexarse automáticamente.
   */
  readonly indexDynamicSearchPages:
    false;

  /**
   * Las landing pages creadas editorialmente
   * sí pueden ser candidatas a indexación.
   */
  readonly allowCuratedLandingPages:
    true;

  /**
   * URLs de búsqueda deben tener noindex.
   */
  readonly dynamicSearchRobots:
    "noindex,follow";
}


/* ============================================================
   DEFAULT SEO POLICY
   ============================================================ */

export const defaultSearchSeoPolicy:
  SearchSeoPolicy = {
    indexDynamicSearchPages:
      false,

    allowCuratedLandingPages:
      true,

    dynamicSearchRobots:
      "noindex,follow",
  };


/* ============================================================
   INDEXING JOB
   ============================================================ */

export type SearchIndexJobOperation =
  | "upsert"
  | "delete"
  | "reindex"
  | "rebuild";


export type SearchIndexJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";


export interface SearchIndexJob {
  readonly id:
    SearchIndexJobId;

  readonly operation:
    SearchIndexJobOperation;

  readonly status:
    SearchIndexJobStatus;

  readonly entityType?:
    SearchEntityType;

  readonly entityId?:
    string;

  readonly locale?:
    SupportedLocale;

  readonly attempt:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly startedAt?:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly errorCode?:
    string;

  readonly errorMessage?:
    string;
}


/* ============================================================
   SEARCH INDEX SNAPSHOT
   ============================================================ */

export interface SearchIndexSnapshot {
  readonly provider:
    SearchProvider;

  readonly version:
    string;

  readonly documentCount:
    number;

  readonly localeDocumentCounts:
    Readonly<
      Partial<
        Record<
          SupportedLocale,
          number
        >
      >
    >;

  readonly generatedAt:
    IsoDateTime;
}


/* ============================================================
   SEARCH ANALYTICS
   ============================================================ */

export type SearchAnalyticsEventType =
  | "search"
  | "zero_results"
  | "result_click"
  | "suggestion_click"
  | "filter_applied"
  | "conversion_after_search";


export interface SearchAnalyticsEvent {
  readonly id:
    SearchAnalyticsEventId;

  readonly type:
    SearchAnalyticsEventType;

  readonly queryId?:
    SearchQueryId;

  readonly query?:
    string;

  readonly normalizedQuery?:
    string;

  readonly locale:
    SupportedLocale;

  readonly resultCount?:
    number;

  readonly clickedDocumentId?:
    SearchDocumentId;

  readonly clickedPosition?:
    number;

  readonly visitorId?:
    VisitorId;

  readonly sessionId?:
    MarketingSessionId;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   ZERO RESULT ANALYTICS
   ============================================================ */

/**
 * Muy importante para descubrir demanda.
 *
 * Si 500 personas buscan:
 *
 * "desayuno sorpresa"
 *
 * y no tenemos contenido,
 * marketing puede crear una nueva página/servicio.
 */

export interface ZeroResultSearchSummary {
  readonly query:
    string;

  readonly locale:
    SupportedLocale;

  readonly searches:
    number;

  readonly uniqueSessions?:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   POPULAR QUERY
   ============================================================ */

export interface PopularSearchQuery {
  readonly query:
    string;

  readonly locale:
    SupportedLocale;

  readonly searches:
    number;

  readonly clicks:
    number;

  readonly conversions:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   SEARCH QUALITY
   ============================================================ */

export interface SearchQualityMetrics {
  readonly searches:
    number;

  readonly zeroResultRate:
    number;

  readonly clickThroughRate:
    number;

  readonly conversionRate:
    number;

  readonly averageClickedPosition?:
    number;

  readonly measuredFrom:
    IsoDateTime;

  readonly measuredUntil:
    IsoDateTime;
}


/* ============================================================
   SEARCH QUERY POLICY
   ============================================================ */

export interface SearchQueryPolicy {
  readonly minimumQueryLength:
    number;

  readonly maximumQueryLength:
    number;

  readonly typoTolerance:
    SearchTypoPolicy;

  readonly maximumResultsPerRequest:
    number;

  readonly maximumSuggestions:
    number;
}


/* ============================================================
   SEARCH ERRORS
   ============================================================ */

export type SearchErrorCode =
  | "QUERY_REQUIRED"
  | "QUERY_TOO_SHORT"
  | "QUERY_TOO_LONG"
  | "INVALID_FILTER"
  | "INVALID_LOCALE"
  | "SEARCH_UNAVAILABLE"
  | "INDEX_UNAVAILABLE"
  | "INDEXING_FAILED"
  | "DOCUMENT_NOT_FOUND"
  | "PROVIDER_ERROR"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "UNKNOWN";


export interface SearchDomainError {
  readonly code:
    SearchErrorCode;

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

/**
 * Normalización básica.
 *
 * El proveedor puede aplicar posteriormente
 * stemming, accent folding y procesamiento
 * específico por idioma.
 */
export function normalizeSearchQuery(
  query: string,
): string {
  return query
    .trim()
    .replace(
      /\s+/g,
      " ",
    )
    .toLocaleLowerCase();
}


/**
 * Solo documentos públicos y explícitamente
 * buscables deben aparecer en la búsqueda pública.
 */
export function canAppearInPublicSearch(
  document: SearchDocument,
): boolean {
  return (
    document.visibility ===
      "public" &&
    document.indexability
      .internalSearchable
  );
}


/**
 * Un documento público puede ser candidato
 * para SEO externo solamente si todas las
 * condiciones están habilitadas.
 */
export function canBeExternallyIndexed(
  document: SearchDocument,
): boolean {
  return (
    document.visibility ===
      "public" &&
    document.indexability
      .externalSearchEngineIndexable &&
    document.indexability
      .allowWebCrawlers
  );
}


/**
 * Las páginas de resultados generadas por búsquedas
 * arbitrarias NO se indexan.
 */
export function shouldIndexDynamicSearchPage(): false {
  return false;
}


/**
 * Valida límite solicitado.
 */
export function clampSearchLimit(
  requested:
    number,
  maximum:
    number,
): number {
  if (
    !Number.isFinite(
      requested,
    )
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.min(
      Math.floor(
        requested,
      ),
      maximum,
    ),
  );
}
