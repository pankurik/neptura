import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const AUTH_COOKIE = {
  pkceVerifier: "neptura_auth_pkce_verifier",
  state: "neptura_auth_state",
  returnTo: "neptura_auth_return_to",
  accessToken: "neptura_customer_access",
  refreshToken: "neptura_customer_refresh",
  expiresAt: "neptura_customer_expires",
  idToken: "neptura_customer_id_token",
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
