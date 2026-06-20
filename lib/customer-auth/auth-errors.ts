export class CustomerAuthError extends Error {
  constructor(message = "Access token is invalid or revoked") {
    super(message);
    this.name = "CustomerAuthError";
  }
}

export function isCustomerAuthError(message: string): boolean {
  const lower = message.toLowerCase();

  return (
    lower.includes("invalid or revoked") ||
    lower.includes("not a valid access token") ||
    lower.includes("invalid_token") ||
    lower.includes("unauthorized")
  );
}

export function isAdminAuthError(message: string): boolean {
  const lower = message.toLowerCase();

  return (
    lower.includes("invalid or revoked") ||
    lower.includes("invalid api key") ||
    lower.includes("unrecognized login") ||
    lower.includes("wrong password") ||
    lower.includes("unauthorized")
  );
}

export function friendlyAuthError(message: string): string {
  if (isCustomerAuthError(message) || isAdminAuthError(message)) {
    return "Your session expired. Please sign in again.";
  }

  return message;
}
