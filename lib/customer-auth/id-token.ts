/** Decode JWT exp without verifying signature — used only for logout timing. */
export function isIdTokenValidForLogout(idToken: string): boolean {
  try {
    const segment = idToken.split(".")[1];
    if (!segment) return false;

    const payload = JSON.parse(
      Buffer.from(segment.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    ) as { exp?: number };

    if (!payload.exp) return true;

    return Date.now() < payload.exp * 1000 - 60_000;
  } catch {
    return false;
  }
}
