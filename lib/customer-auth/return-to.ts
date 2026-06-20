const DEFAULT_RETURN_TO = "/";

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) return DEFAULT_RETURN_TO;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_RETURN_TO;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return DEFAULT_RETURN_TO;
  }

  return trimmed;
}

export function buildAuthLoginPath(returnTo?: string, email?: string): string {
  const safe = sanitizeReturnTo(returnTo);
  const params = new URLSearchParams();
  if (safe !== DEFAULT_RETURN_TO) params.set("returnTo", safe);
  if (email?.trim()) params.set("email", email.trim().toLowerCase());
  const query = params.toString();
  return query ? `/api/auth/login?${query}` : "/api/auth/login";
}

/** @deprecated Use buildAuthLoginPath — sign-in and sign-up share one flow */
export function buildAuthSignupPath(returnTo?: string, email?: string): string {
  return buildAuthLoginPath(returnTo, email);
}
