import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const AUTH_COOKIE = {
  pkceVerifier: "neptura_auth_pkce_verifier",
  state: "neptura_auth_state",
  returnTo: "neptura_auth_return_to",
  loginEmail: "neptura_auth_login_email",
  accessToken: "neptura_customer_access",
  refreshToken: "neptura_customer_refresh",
  expiresAt: "neptura_customer_expires",
  idToken: "neptura_customer_id_token",
  authFlash: "neptura_auth_flash",
  lastLoginEmail: "neptura_last_login_email",
  pendingLoginEmail: "neptura_pending_login_email",
} as const;

const TEN_MINUTES = 60 * 10;

export function isSecureCookieContext(): boolean {
  return process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;
}

export function baseCookieOptions(maxAge?: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isSecureCookieContext(),
    sameSite: "lax",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export const oauthFlowCookieOptions = baseCookieOptions(TEN_MINUTES);

export const sessionCookieOptions = (maxAge: number) => baseCookieOptions(maxAge);

/** id_token must outlive access tokens so Shopify logout keeps working. */
export const ID_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const authFlashCookieOptions = baseCookieOptions(120);

export const LAST_LOGIN_EMAIL_MAX_AGE = 60 * 60 * 24 * 365;
export const lastLoginEmailCookieOptions = baseCookieOptions(LAST_LOGIN_EMAIL_MAX_AGE);
