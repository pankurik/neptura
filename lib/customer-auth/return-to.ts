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

export function buildAuthLoginPath(returnTo?: string): string {
  const safe = sanitizeReturnTo(returnTo);
  if (safe === DEFAULT_RETURN_TO) return "/api/auth/login";
  return `/api/auth/login?returnTo=${encodeURIComponent(safe)}`;
}
