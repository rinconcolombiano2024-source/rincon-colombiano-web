/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Administration & Authorization Domain
 * ============================================================
 *
 * Contrato del panel administrativo privado.
 *
 * El sistema administrativo controlará:
 *
 * - contenido
 * - páginas
 * - fotos
 * - videos
 * - historias
 * - artículos
 * - promociones
 * - eventos
 * - servicios
 * - SEO
 * - restaurantes
 * - menú
 * - pedidos
 * - clientes
 * - comunidad
 * - moderación
 * - analítica
 * - usuarios administrativos
 *
 * PRINCIPIOS DE SEGURIDAD:
 *
 * 1. Deny by default.
 * 2. Least privilege.
 * 3. Roles + permisos explícitos.
 * 4. MFA para cuentas sensibles.
 * 5. Auditoría de acciones importantes.
 * 6. Sesiones revocables.
 * 7. Administración separada del frontend público.
 * 8. Ningún secreto debe llegar al navegador.
 */

import type {
  IsoDateTime,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  RestaurantId,
} from "@/types/restaurant";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type AdminUserId =
  UserId;

export type AdminRoleId =
  string;

export type AdminSessionId =
  string;

export type AuditEventId =
  string;


/* ============================================================
   ADMIN STATUS
   ============================================================ */

export type AdminUserStatus =
  | "invited"
  | "active"
  | "suspended"
  | "disabled";


/* ============================================================
   STANDARD ROLES
   ============================================================ */

export type SystemAdminRole =
  | "super_admin"
  | "administrator"
  | "marketing"
  | "content_editor"
  | "seo_manager"
  | "restaurant_manager"
  | "customer_support"
  | "community_moderator"
  | "analytics_viewer"
  | "viewer";


/* ============================================================
   PERMISSION NAMESPACES
   ============================================================ */

export type AdminPermission =
  /* ----------------------------------------------------------
     CONTENT
     ---------------------------------------------------------- */

  | "content.read"
  | "content.create"
  | "content.update"
  | "content.delete"
  | "content.publish"
  | "content.unpublish"
  | "content.restore_revision"

  /* ----------------------------------------------------------
     MEDIA
     ---------------------------------------------------------- */

  | "media.read"
  | "media.upload"
  | "media.update"
  | "media.delete"

  /* ----------------------------------------------------------
     SEO
     ---------------------------------------------------------- */

  | "seo.read"
  | "seo.update"
  | "seo.publish"

  /* ----------------------------------------------------------
     MENU
     ---------------------------------------------------------- */

  | "menu.read"
  | "menu.create"
  | "menu.update"
  | "menu.delete"
  | "menu.publish"

  /* ----------------------------------------------------------
     RESTAURANTS
     ---------------------------------------------------------- */

  | "restaurants.read"
  | "restaurants.create"
  | "restaurants.update"
  | "restaurants.delete"
  | "restaurants.manage_hours"
  | "restaurants.manage_services"

  /* ----------------------------------------------------------
     ORDERS
     ---------------------------------------------------------- */

  | "orders.read"
  | "orders.update"
  | "orders.cancel"
  | "orders.refund"
  | "orders.export"

  /* ----------------------------------------------------------
     CUSTOMERS
     ---------------------------------------------------------- */

  | "customers.read"
  | "customers.update"
  | "customers.export"
  | "customers.manage_loyalty"

  /* ----------------------------------------------------------
     DELIVERY
     ---------------------------------------------------------- */

  | "delivery.read"
  | "delivery.manage_zones"
  | "delivery.manage_pricing"
  | "delivery.pause"
  | "delivery.resume"

  /* ----------------------------------------------------------
     PROMOTIONS
     ---------------------------------------------------------- */

  | "promotions.read"
  | "promotions.create"
  | "promotions.update"
  | "promotions.delete"
  | "promotions.publish"

  /* ----------------------------------------------------------
     EVENTS
     ---------------------------------------------------------- */

  | "events.read"
  | "events.create"
  | "events.update"
  | "events.delete"
  | "events.publish"

  /* ----------------------------------------------------------
     COMMUNITY
     ---------------------------------------------------------- */

  | "community.read"
  | "community.moderate"
  | "community.remove_post"
  | "community.remove_comment"
  | "community.suspend_user"
  | "community.restore_content"

  /* ----------------------------------------------------------
     ANALYTICS
     ---------------------------------------------------------- */

  | "analytics.read"
  | "analytics.export"

  /* ----------------------------------------------------------
     ADMINISTRATION
     ---------------------------------------------------------- */

  | "admin.read"
  | "admin.invite"
  | "admin.update"
  | "admin.suspend"
  | "admin.manage_roles"
  | "admin.manage_permissions"

  /* ----------------------------------------------------------
     SETTINGS
     ---------------------------------------------------------- */

  | "settings.read"
  | "settings.update";


/* ============================================================
   ADMIN ROLE
   ============================================================ */

export interface AdminRole {
  readonly id:
    AdminRoleId;

  readonly name:
    string;

  readonly systemRole?:
    SystemAdminRole;

  readonly description?:
    string;

  readonly permissions:
    readonly AdminPermission[];

  /**
   * Roles protegidos no pueden eliminarse
   * desde la interfaz.
   */
  readonly protected:
    boolean;
}


/* ============================================================
   RESTAURANT ACCESS
   ============================================================ */

/**
 * Un administrador puede tener acceso:
 *
 * - global
 * - solamente a determinadas sedes
 */

export type AdminAccessScope =
  | "global"
  | "restaurants";


export interface AdminRestaurantAccess {
  readonly scope:
    AdminAccessScope;

  readonly restaurantIds:
    readonly RestaurantId[];
}


/* ============================================================
   ADMIN USER
   ============================================================ */

export interface AdminUser {
  readonly id:
    AdminUserId;

  readonly email:
    string;

  readonly displayName:
    string;

  readonly status:
    AdminUserStatus;

  readonly roleIds:
    readonly AdminRoleId[];

  readonly restaurantAccess:
    AdminRestaurantAccess;

  readonly mfaEnabled:
    boolean;

  readonly lastLoginAt?:
    IsoDateTime;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;
}


/* ============================================================
   AUTHENTICATION
   ============================================================ */

export type AdminAuthenticationMethod =
  | "password"
  | "magic_link"
  | "oauth"
  | "passkey";


export interface AdminAuthenticationState {
  readonly authenticated:
    boolean;

  readonly userId?:
    AdminUserId;

  readonly method?:
    AdminAuthenticationMethod;

  readonly mfaVerified:
    boolean;

  readonly authenticatedAt?:
    IsoDateTime;
}


/* ============================================================
   MULTI-FACTOR AUTHENTICATION
   ============================================================ */

export type AdminMfaMethod =
  | "totp"
  | "passkey"
  | "recovery_code";


export interface AdminMfaState {
  readonly enabled:
    boolean;

  readonly methods:
    readonly AdminMfaMethod[];

  readonly verifiedAt?:
    IsoDateTime;
}


/* ============================================================
   ADMIN SESSION
   ============================================================ */

export interface AdminSession {
  readonly id:
    AdminSessionId;

  readonly adminUserId:
    AdminUserId;

  readonly createdAt:
    IsoDateTime;

  readonly lastActivityAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly revokedAt?:
    IsoDateTime;

  readonly ipHash?:
    string;

  readonly userAgent?:
    string;
}


/* ============================================================
   AUTHORIZATION CONTEXT
   ============================================================ */

export interface AuthorizationContext {
  readonly adminUserId:
    AdminUserId;

  readonly permissions:
    readonly AdminPermission[];

  readonly restaurantAccess:
    AdminRestaurantAccess;

  readonly mfaVerified:
    boolean;
}


/* ============================================================
   PERMISSION CHECK
   ============================================================ */

export function hasPermission(
  context: AuthorizationContext,
  permission: AdminPermission,
): boolean {
  return context.permissions.includes(
    permission,
  );
}


/**
 * Para operaciones relacionadas con una sede.
 */
export function canAccessRestaurant(
  context: AuthorizationContext,
  restaurantId: RestaurantId,
): boolean {
  if (
    context.restaurantAccess.scope ===
    "global"
  ) {
    return true;
  }

  return context
    .restaurantAccess
    .restaurantIds
    .includes(
      restaurantId,
    );
}


/* ============================================================
   SENSITIVE ACTIONS
   ============================================================ */

/**
 * Operaciones que deberán exigir MFA.
 */

export type SensitiveAdminAction =
  | "admin.manage_permissions"
  | "admin.manage_roles"
  | "admin.suspend"
  | "orders.refund"
  | "restaurants.delete"
  | "settings.update";


export function actionRequiresMfa(
  action: AdminPermission,
): boolean {
  const sensitiveActions:
    readonly AdminPermission[] = [
      "admin.manage_permissions",
      "admin.manage_roles",
      "admin.suspend",
      "orders.refund",
      "restaurants.delete",
      "settings.update",
    ];

  return sensitiveActions.includes(
    action,
  );
}


/* ============================================================
   AUTHORIZATION RESULT
   ============================================================ */

export interface AuthorizationDecision {
  readonly allowed:
    boolean;

  readonly reason?:
    | "NOT_AUTHENTICATED"
    | "MISSING_PERMISSION"
    | "RESTAURANT_ACCESS_DENIED"
    | "MFA_REQUIRED"
    | "ACCOUNT_DISABLED";
}


/* ============================================================
   ADMIN AUDIT
   ============================================================ */

export type AdminAuditAction =
  | "login"
  | "logout"
  | "login_failed"

  | "admin_invited"
  | "admin_updated"
  | "admin_suspended"

  | "content_created"
  | "content_updated"
  | "content_deleted"
  | "content_published"
  | "content_unpublished"
  | "content_restored"

  | "media_uploaded"
  | "media_deleted"

  | "menu_created"
  | "menu_updated"
  | "menu_deleted"

  | "restaurant_created"
  | "restaurant_updated"

  | "order_updated"
  | "order_cancelled"
  | "order_refunded"

  | "customer_updated"

  | "community_post_removed"
  | "community_comment_removed"
  | "community_user_suspended"

  | "settings_updated";


export interface AdminAuditEvent {
  readonly id:
    AuditEventId;

  readonly action:
    AdminAuditAction;

  readonly actorAdminUserId?:
    AdminUserId;

  readonly targetType?:
    string;

  readonly targetId?:
    string;

  readonly restaurantId?:
    RestaurantId;

  readonly requestId?:
    RequestId;

  readonly occurredAt:
    IsoDateTime;

  /**
   * Nunca introducir:
   *
   * passwords
   * tokens
   * cookies
   * claves
   * información de tarjetas
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
   CHANGE APPROVAL
   ============================================================ */

/**
 * Para cambios sensibles podremos introducir
 * revisión antes de publicación.
 */

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";


export interface AdminApprovalRequest {
  readonly id:
    string;

  readonly requestedBy:
    AdminUserId;

  readonly permission:
    AdminPermission;

  readonly targetType:
    string;

  readonly targetId:
    string;

  readonly status:
    ApprovalStatus;

  readonly requestedAt:
    IsoDateTime;

  readonly reviewedAt?:
    IsoDateTime;

  readonly reviewedBy?:
    AdminUserId;

  readonly reviewNote?:
    string;
}


/* ============================================================
   ADMIN INVITATION
   ============================================================ */

export interface AdminInvitation {
  readonly id:
    string;

  readonly email:
    string;

  readonly roleIds:
    readonly AdminRoleId[];

  readonly restaurantAccess:
    AdminRestaurantAccess;

  readonly invitedBy:
    AdminUserId;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly acceptedAt?:
    IsoDateTime;
}


/* ============================================================
   SECURITY EVENTS
   ============================================================ */

export type AdminSecurityEventType =
  | "new_device"
  | "password_changed"
  | "mfa_enabled"
  | "mfa_disabled"
  | "session_revoked"
  | "suspicious_login"
  | "permission_changed";


export interface AdminSecurityEvent {
  readonly id:
    string;

  readonly adminUserId:
    AdminUserId;

  readonly type:
    AdminSecurityEventType;

  readonly occurredAt:
    IsoDateTime;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   ADMIN ERRORS
   ============================================================ */

export type AdminErrorCode =
  | "NOT_AUTHENTICATED"
  | "PERMISSION_DENIED"
  | "MFA_REQUIRED"
  | "ADMIN_NOT_FOUND"
  | "ADMIN_DISABLED"
  | "INVALID_ROLE"
  | "INVALID_PERMISSION"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "INVITATION_EXPIRED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface AdminDomainError {
  readonly code:
    AdminErrorCode;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly requestId?:
    RequestId;
}
