import { cookies } from "next/headers";
import { AUTH_COOKIE, ID_TOKEN_COOKIE_MAX_AGE, baseCookieOptions, sessionCookieOptions } from "./cookies";
import { refreshAccessToken } from "./tokens";

const DEFAULT_EXPIRES_IN = 3600;
const REFRESH_BUFFER_MS = 60_000;

function readExpiresAt(cookieStore: ReturnType<typeof cookies>): number | null {
  const raw = cookieStore.get(AUTH_COOKIE.expiresAt)?.value;
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

async function persistTokens(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
}) {
  const cookieStore = cookies();
  const expiresIn = tokens.expires_in ?? DEFAULT_EXPIRES_IN;
  const expiresAt = Date.now() + expiresIn * 1000;
  const options = sessionCookieOptions(expiresIn);

  cookieStore.set(AUTH_COOKIE.accessToken, tokens.access_token, options);
  cookieStore.set(AUTH_COOKIE.expiresAt, String(expiresAt), options);

  if (tokens.refresh_token) {
    cookieStore.set(AUTH_COOKIE.refreshToken, tokens.refresh_token, {
      ...options,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (tokens.id_token) {
    cookieStore.set(AUTH_COOKIE.idToken, tokens.id_token, {
      ...baseCookieOptions(ID_TOKEN_COOKIE_MAX_AGE),
      maxAge: ID_TOKEN_COOKIE_MAX_AGE,
    });
  }
}

export async function saveCustomerSession(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
}) {
  await persistTokens(tokens);
}

/** Route Handlers / Server Actions only — clears auth cookies. */
export function clearCustomerSession() {
  const cookieStore = cookies();
  for (const name of Object.values(AUTH_COOKIE)) {
    cookieStore.delete(name);
  }
}

/** Server Components — read access token without modifying cookies. */
export function readCustomerAccessToken(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(AUTH_COOKIE.accessToken)?.value ?? null;
}

/** Route Handlers / Server Actions only — refresh and persist tokens. */
export async function forceRefreshCustomerAccessToken(): Promise<string | null> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE.refreshToken)?.value;

  if (!refreshToken) {
    clearCustomerSession();
    return null;
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    await persistTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? refreshToken,
      expires_in: tokens.expires_in,
      id_token: tokens.id_token,
    });
    return tokens.access_token;
  } catch {
    clearCustomerSession();
    return null;
  }
}

/** Route Handlers / Server Actions only — returns a valid token, refreshing if needed. */
export async function getCustomerAccessToken(): Promise<string | null> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE.accessToken)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE.refreshToken)?.value;
  const expiresAt = readExpiresAt(cookieStore);

  if (!accessToken) return null;

  const needsRefresh =
    expiresAt !== null && Date.now() >= expiresAt - REFRESH_BUFFER_MS;

  if (!needsRefresh) return accessToken;

  if (!refreshToken) return null;

  try {
    const tokens = await refreshAccessToken(refreshToken);
    await persistTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? refreshToken,
      expires_in: tokens.expires_in,
      id_token: tokens.id_token,
    });
    return tokens.access_token;
  } catch {
    clearCustomerSession();
    return null;
  }
}
