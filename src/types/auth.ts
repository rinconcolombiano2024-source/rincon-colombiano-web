/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Identity, Authentication & Session Domain
 * ============================================================
 *
 * Contrato central de identidad y autenticación.
 *
 * Preparado para:
 *
 * - clientes
 * - miembros de comunidad
 * - administradores
 * - login
 * - registro
 * - email verification
 * - phone verification
 * - password
 * - magic link
 * - OAuth
 * - passkeys
 * - MFA
 * - recovery codes
 * - sesiones
 * - dispositivos
 * - revocación
 * - auditoría
 * - rate limiting
 * - risk detection
 *
 * PRINCIPIOS:
 *
 * 1. Auth != Profile.
 * 2. Credenciales nunca forman parte del perfil público.
 * 3. Admin y cliente tienen contextos de sesión separados.
 * 4. MFA debe proteger operaciones sensibles.
 * 5. Las sesiones deben ser revocables.
 * 6. Los códigos OTP nunca se almacenan en claro.
 * 7. Las contraseñas nunca se almacenan en este dominio.
 * 8. Refresh/access tokens nunca deben persistirse en frontend
 *    como información de aplicación.
 * 9. Toda operación sensible debe ser auditable.
 */

import type {
  IsoDateTime,
  RequestId,
  UserId,
} from "@/types/common";

import type {
  CustomerId,
} from "@/types/customer";

import type {
  CommunityProfileId,
} from "@/types/community";

import type {
  AdminUserId,
} from "@/types/admin";


/* ============================================================
   IDENTIFIERS
   ============================================================ */

export type AuthUserId =
  UserId;

export type AuthIdentityId =
  string;

export type AuthSessionId =
  string;

export type AuthDeviceId =
  string;

export type AuthChallengeId =
  string;

export type AuthVerificationId =
  string;

export type AuthPasskeyId =
  string;

export type AuthRecoverySetId =
  string;

export type AuthAuditEventId =
  string;

export type AuthLoginAttemptId =
  string;


/* ============================================================
   ACCOUNT STATUS
   ============================================================ */

export type AuthAccountStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "disabled"
  | "deleted";


/* ============================================================
   PRINCIPAL KINDS
   ============================================================ */

/**
 * Una sola identidad puede tener más de una relación.
 *
 * Ejemplo:
 *
 * customer
 * +
 * community_member
 */

export type AuthPrincipalKind =
  | "customer"
  | "community_member"
  | "admin";


/* ============================================================
   ACCOUNT LINKS
   ============================================================ */

export interface AuthPrincipalLinks {
  readonly customerId?:
    CustomerId;

  readonly communityProfileId?:
    CommunityProfileId;

  readonly adminUserId?:
    AdminUserId;
}


/* ============================================================
   PROVIDERS
   ============================================================ */

export type AuthProvider =
  | "email_password"
  | "email_magic_link"
  | "email_otp"
  | "phone_otp"
  | "google"
  | "apple"
  | "facebook"
  | "passkey";


/* ============================================================
   IDENTITY
   ============================================================ */

/**
 * Una cuenta puede vincular varias identidades.
 *
 * Ejemplo:
 *
 * email
 * +
 * Google
 * +
 * passkey
 *
 * sin crear tres clientes independientes.
 */

export interface AuthIdentity {
  readonly id:
    AuthIdentityId;

  readonly authUserId:
    AuthUserId;

  readonly provider:
    AuthProvider;

  /**
   * Identificador público/estable del proveedor.
   *
   * Nunca guardar aquí access tokens.
   */
  readonly providerSubject?:
    string;

  readonly email?:
    string;

  readonly phone?:
    string;

  readonly emailVerifiedAt?:
    IsoDateTime;

  readonly phoneVerifiedAt?:
    IsoDateTime;

  readonly linkedAt:
    IsoDateTime;

  readonly lastUsedAt?:
    IsoDateTime;
}


/* ============================================================
   SECURITY STATE
   ============================================================ */

export interface AuthSecurityState {
  readonly mfaEnabled:
    boolean;

  readonly passkeyEnabled:
    boolean;

  readonly recoveryCodesAvailable:
    boolean;

  readonly passwordConfigured:
    boolean;

  readonly forceReauthentication:
    boolean;

  readonly securityLocked:
    boolean;

  readonly lockedUntil?:
    IsoDateTime;

  readonly passwordChangedAt?:
    IsoDateTime;

  readonly lastSuccessfulLoginAt?:
    IsoDateTime;
}


/* ============================================================
   ACCOUNT
   ============================================================ */

export interface AuthAccount {
  readonly id:
    AuthUserId;

  readonly status:
    AuthAccountStatus;

  readonly principalKinds:
    readonly AuthPrincipalKind[];

  readonly principals:
    AuthPrincipalLinks;

  readonly identities:
    readonly AuthIdentity[];

  readonly security:
    AuthSecurityState;

  readonly createdAt:
    IsoDateTime;

  readonly updatedAt:
    IsoDateTime;

  readonly deletedAt?:
    IsoDateTime;

  readonly schemaVersion:
    number;
}


/* ============================================================
   AUTHENTICATION METHOD
   ============================================================ */

export type AuthenticationMethod =
  | "password"
  | "magic_link"
  | "email_otp"
  | "phone_otp"
  | "oauth"
  | "passkey"
  | "recovery_code";


/* ============================================================
   ASSURANCE LEVEL
   ============================================================ */

/**
 * Similar conceptualmente a:
 *
 * AAL1 = login normal
 * AAL2 = login + segundo factor
 */

export type AuthAssuranceLevel =
  | "aal1"
  | "aal2";


/* ============================================================
   SESSION AUDIENCE
   ============================================================ */

/**
 * Una sesión administrativa no debe utilizarse como si fuera
 * simplemente una sesión pública de cliente.
 */

export type AuthSessionAudience =
  | "public_app"
  | "admin_console";


/* ============================================================
   SESSION STATUS
   ============================================================ */

export type AuthSessionStatus =
  | "active"
  | "expired"
  | "revoked";


/* ============================================================
   SESSION
   ============================================================ */

export interface AuthSession {
  readonly id:
    AuthSessionId;

  readonly authUserId:
    AuthUserId;

  readonly audience:
    AuthSessionAudience;

  readonly status:
    AuthSessionStatus;

  readonly assuranceLevel:
    AuthAssuranceLevel;

  readonly authenticationMethods:
    readonly AuthenticationMethod[];

  readonly deviceId?:
    AuthDeviceId;

  /**
   * Hash opcional para auditoría.
   *
   * No almacenamos aquí información de red innecesaria
   * en texto abierto.
   */
  readonly ipHash?:
    string;

  readonly userAgent?:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly authenticatedAt:
    IsoDateTime;

  readonly lastActivityAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly idleExpiresAt?:
    IsoDateTime;

  readonly revokedAt?:
    IsoDateTime;

  readonly revokeReason?:
    AuthSessionRevokeReason;
}


/* ============================================================
   SESSION REVOCATION
   ============================================================ */

export type AuthSessionRevokeReason =
  | "logout"
  | "logout_all_devices"
  | "password_changed"
  | "security_event"
  | "admin_action"
  | "account_disabled"
  | "session_expired"
  | "user_request"
  | "other";


/* ============================================================
   DEVICE
   ============================================================ */

export interface AuthDevice {
  readonly id:
    AuthDeviceId;

  readonly authUserId:
    AuthUserId;

  readonly label?:
    string;

  readonly platform?:
    string;

  readonly browser?:
    string;

  readonly trusted:
    boolean;

  readonly firstSeenAt:
    IsoDateTime;

  readonly lastSeenAt:
    IsoDateTime;

  readonly trustedAt?:
    IsoDateTime;

  readonly revokedAt?:
    IsoDateTime;
}


/* ============================================================
   EMAIL VERIFICATION
   ============================================================ */

export type AuthVerificationStatus =
  | "pending"
  | "verified"
  | "expired"
  | "failed"
  | "cancelled";


export interface EmailVerification {
  readonly id:
    AuthVerificationId;

  readonly authUserId:
    AuthUserId;

  readonly email:
    string;

  readonly status:
    AuthVerificationStatus;

  readonly attempts:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly verifiedAt?:
    IsoDateTime;
}


/* ============================================================
   PHONE VERIFICATION
   ============================================================ */

export interface PhoneVerification {
  readonly id:
    AuthVerificationId;

  readonly authUserId:
    AuthUserId;

  readonly phone:
    string;

  readonly status:
    AuthVerificationStatus;

  readonly attempts:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly verifiedAt?:
    IsoDateTime;
}


/* ============================================================
   CHALLENGE
   ============================================================ */

export type AuthChallengeType =
  | "email_verification"
  | "phone_verification"
  | "login_otp"
  | "magic_link"
  | "mfa"
  | "password_reset"
  | "sensitive_action";


export type AuthChallengeStatus =
  | "pending"
  | "completed"
  | "expired"
  | "failed"
  | "cancelled";


export interface AuthChallenge {
  readonly id:
    AuthChallengeId;

  readonly authUserId?:
    AuthUserId;

  readonly type:
    AuthChallengeType;

  readonly status:
    AuthChallengeStatus;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly attemptCount:
    number;
}


/* ============================================================
   PASSWORD POLICY
   ============================================================ */

/**
 * La validación definitiva pertenece al backend.
 *
 * No imponemos reglas absurdas como cambiar contraseña
 * cada 30 días sin motivo.
 */

export interface PasswordPolicy {
  readonly minimumLength:
    number;

  readonly maximumLength:
    number;

  readonly requireUppercase:
    boolean;

  readonly requireLowercase:
    boolean;

  readonly requireNumber:
    boolean;

  readonly requireSymbol:
    boolean;

  readonly compromisedPasswordCheck:
    boolean;

  readonly preventRecentReuseCount:
    number;
}


/* ============================================================
   PASSWORD STATE
   ============================================================ */

export interface PasswordSecurityState {
  readonly configured:
    boolean;

  readonly changedAt?:
    IsoDateTime;

  readonly mustChange:
    boolean;

  readonly compromisedCheckAt?:
    IsoDateTime;
}


/* ============================================================
   PASSWORD RESET
   ============================================================ */

export type PasswordResetStatus =
  | "requested"
  | "completed"
  | "expired"
  | "cancelled";


export interface PasswordResetRequest {
  readonly id:
    string;

  readonly authUserId:
    AuthUserId;

  readonly status:
    PasswordResetStatus;

  readonly createdAt:
    IsoDateTime;

  readonly expiresAt:
    IsoDateTime;

  readonly completedAt?:
    IsoDateTime;

  readonly requestId?:
    RequestId;
}


/* ============================================================
   MFA METHODS
   ============================================================ */

export type MfaMethod =
  | "totp"
  | "passkey"
  | "recovery_code";


/* ============================================================
   MFA FACTOR
   ============================================================ */

export interface AuthMfaFactor {
  readonly id:
    string;

  readonly authUserId:
    AuthUserId;

  readonly method:
    MfaMethod;

  readonly verified:
    boolean;

  readonly createdAt:
    IsoDateTime;

  readonly verifiedAt?:
    IsoDateTime;

  readonly revokedAt?:
    IsoDateTime;
}


/* ============================================================
   PASSKEY
   ============================================================ */

/**
 * No contiene claves privadas.
 *
 * Las passkeys mantienen las claves privadas
 * en el dispositivo/autenticador del usuario.
 */

export interface AuthPasskey {
  readonly id:
    AuthPasskeyId;

  readonly authUserId:
    AuthUserId;

  readonly credentialId:
    string;

  readonly displayName?:
    string;

  readonly relyingPartyId:
    string;

  readonly createdAt:
    IsoDateTime;

  readonly lastUsedAt?:
    IsoDateTime;

  readonly revokedAt?:
    IsoDateTime;
}


/* ============================================================
   RECOVERY CODES
   ============================================================ */

/**
 * Los códigos reales no se guardan aquí.
 *
 * Backend debe almacenar solamente representaciones seguras.
 */

export interface AuthRecoveryCodeSet {
  readonly id:
    AuthRecoverySetId;

  readonly authUserId:
    AuthUserId;

  readonly totalCodes:
    number;

  readonly remainingCodes:
    number;

  readonly createdAt:
    IsoDateTime;

  readonly regeneratedAt?:
    IsoDateTime;
}


/* ============================================================
   LOGIN ATTEMPTS
   ============================================================ */

export type LoginAttemptResult =
  | "success"
  | "invalid_credentials"
  | "account_disabled"
  | "mfa_required"
  | "rate_limited"
  | "risk_blocked"
  | "failed";


export interface AuthLoginAttempt {
  readonly id:
    AuthLoginAttemptId;

  readonly authUserId?:
    AuthUserId;

  readonly identifierHash?:
    string;

  readonly method:
    AuthenticationMethod;

  readonly result:
    LoginAttemptResult;

  readonly requestId?:
    RequestId;

  readonly occurredAt:
    IsoDateTime;
}


/* ============================================================
   RATE LIMIT
   ============================================================ */

export type AuthRateLimitScope =
  | "login"
  | "registration"
  | "password_reset"
  | "email_verification"
  | "phone_verification"
  | "mfa";


export interface AuthRateLimitState {
  readonly scope:
    AuthRateLimitScope;

  readonly keyHash:
    string;

  readonly attempts:
    number;

  readonly maximumAttempts:
    number;

  readonly windowStartedAt:
    IsoDateTime;

  readonly windowEndsAt:
    IsoDateTime;

  readonly blockedUntil?:
    IsoDateTime;
}


/* ============================================================
   RISK
   ============================================================ */

export type AuthRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";


export type AuthRiskSignal =
  | "new_device"
  | "unusual_location"
  | "rapid_attempts"
  | "multiple_failed_logins"
  | "credential_stuffing"
  | "suspicious_user_agent"
  | "session_anomaly"
  | "other";


export interface AuthRiskAssessment {
  readonly level:
    AuthRiskLevel;

  readonly signals:
    readonly AuthRiskSignal[];

  readonly evaluatedAt:
    IsoDateTime;

  readonly requireMfa:
    boolean;

  readonly blockAuthentication:
    boolean;
}


/* ============================================================
   AUTHENTICATION RESULT
   ============================================================ */

export interface AuthenticationSuccess {
  readonly authenticated:
    true;

  readonly authUserId:
    AuthUserId;

  readonly session:
    AuthSession;

  readonly account:
    AuthAccount;
}


export interface AuthenticationFailure {
  readonly authenticated:
    false;

  readonly code:
    AuthErrorCode;

  readonly mfaRequired:
    boolean;

  readonly challengeId?:
    AuthChallengeId;
}


export type AuthenticationResult =
  | AuthenticationSuccess
  | AuthenticationFailure;


/* ============================================================
   REGISTRATION
   ============================================================ */

/**
 * Password, OTP o provider payload se reciben únicamente
 * durante el flujo seguro correspondiente.
 *
 * No se convierten en propiedades persistentes de AuthAccount.
 */

export interface RegisterAccountRequest {
  readonly email?:
    string;

  readonly phone?:
    string;

  readonly provider:
    AuthProvider;

  readonly principalKind:
    Exclude<
      AuthPrincipalKind,
      "admin"
    >;

  readonly requestId:
    RequestId;
}


/* ============================================================
   LOGIN
   ============================================================ */

export interface StartAuthenticationRequest {
  readonly provider:
    AuthProvider;

  readonly email?:
    string;

  readonly phone?:
    string;

  readonly audience:
    AuthSessionAudience;

  readonly requestId:
    RequestId;
}


/* ============================================================
   SESSION QUERY
   ============================================================ */

export interface AuthSessionQuery {
  readonly authUserId?:
    AuthUserId;

  readonly status?:
    AuthSessionStatus;

  readonly audience?:
    AuthSessionAudience;

  readonly deviceId?:
    AuthDeviceId;

  readonly cursor?:
    string;

  readonly limit?:
    number;
}


/* ============================================================
   SESSION REVOCATION REQUEST
   ============================================================ */

export interface RevokeAuthSessionRequest {
  readonly sessionId:
    AuthSessionId;

  readonly reason:
    AuthSessionRevokeReason;

  readonly requestId:
    RequestId;
}


/* ============================================================
   AUDIT EVENTS
   ============================================================ */

export type AuthAuditEventType =
  | "account_created"
  | "account_verified"
  | "login_success"
  | "login_failed"
  | "logout"
  | "session_revoked"
  | "password_changed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "email_verified"
  | "phone_verified"
  | "identity_linked"
  | "identity_unlinked"
  | "mfa_enabled"
  | "mfa_disabled"
  | "passkey_added"
  | "passkey_removed"
  | "recovery_codes_regenerated"
  | "account_suspended"
  | "account_reactivated"
  | "security_lock"
  | "security_unlock";


export interface AuthAuditEvent {
  readonly id:
    AuthAuditEventId;

  readonly authUserId?:
    AuthUserId;

  readonly sessionId?:
    AuthSessionId;

  readonly deviceId?:
    AuthDeviceId;

  readonly type:
    AuthAuditEventType;

  readonly requestId?:
    RequestId;

  readonly occurredAt:
    IsoDateTime;

  /**
   * Nunca almacenar:
   *
   * passwords
   * OTP
   * access tokens
   * refresh tokens
   * cookies
   * private keys
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
   SECURITY NOTIFICATION
   ============================================================ */

export interface AuthSecurityNotification {
  readonly authUserId:
    AuthUserId;

  readonly type:
    | "new_login"
    | "new_device"
    | "password_changed"
    | "mfa_changed"
    | "suspicious_activity";

  readonly occurredAt:
    IsoDateTime;

  readonly requiresAction:
    boolean;
}


/* ============================================================
   ERRORS
   ============================================================ */

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_NOT_FOUND"
  | "ACCOUNT_NOT_VERIFIED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_DISABLED"
  | "EMAIL_ALREADY_REGISTERED"
  | "PHONE_ALREADY_REGISTERED"
  | "EMAIL_NOT_VERIFIED"
  | "PHONE_NOT_VERIFIED"
  | "INVALID_OTP"
  | "OTP_EXPIRED"
  | "MAGIC_LINK_EXPIRED"
  | "PASSWORD_TOO_WEAK"
  | "PASSWORD_COMPROMISED"
  | "MFA_REQUIRED"
  | "MFA_FAILED"
  | "PASSKEY_FAILED"
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "RATE_LIMITED"
  | "RISK_BLOCKED"
  | "PROVIDER_ERROR"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";


export interface AuthDomainError {
  readonly code:
    AuthErrorCode;

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

export function canAuthenticateAccount(
  account: AuthAccount,
): boolean {
  return (
    account.status === "active" &&
    !account.security
      .securityLocked
  );
}


export function isAuthSessionActive(
  session: AuthSession,
  now = new Date(),
): boolean {
  if (
    session.status !== "active"
  ) {
    return false;
  }

  if (
    session.revokedAt
  ) {
    return false;
  }

  const nowTime =
    now.getTime();

  if (
    new Date(
      session.expiresAt,
    ).getTime() <= nowTime
  ) {
    return false;
  }

  if (
    session.idleExpiresAt &&
    new Date(
      session.idleExpiresAt,
    ).getTime() <= nowTime
  ) {
    return false;
  }

  return true;
}


export function isAdminAuthSession(
  session: AuthSession,
): boolean {
  return (
    session.audience ===
    "admin_console"
  );
}


export function hasVerifiedEmail(
  account: AuthAccount,
): boolean {
  return account.identities.some(
    (identity) =>
      Boolean(
        identity.email &&
        identity.emailVerifiedAt,
      ),
  );
}


export function hasVerifiedPhone(
  account: AuthAccount,
): boolean {
  return account.identities.some(
    (identity) =>
      Boolean(
        identity.phone &&
        identity.phoneVerifiedAt,
      ),
  );
}


export function sessionMeetsAssuranceLevel(
  session: AuthSession,
  required:
    AuthAssuranceLevel,
): boolean {
  if (
    required === "aal1"
  ) {
    return true;
  }

  return (
    session.assuranceLevel ===
    "aal2"
  );
}


export function accountHasPrincipal(
  account: AuthAccount,
  principal:
    AuthPrincipalKind,
): boolean {
  return (
    account.principalKinds.includes(
      principal,
    )
  );
}
