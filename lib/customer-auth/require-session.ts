import { NextResponse } from "next/server";
import { CustomerAuthError } from "./auth-errors";
import { fetchCustomerProfile } from "./customer";
import {
  clearCustomerSession,
  forceRefreshCustomerAccessToken,
  getCustomerAccessToken,
  readCustomerAccessToken,
} from "./session";
import type { CustomerSummary } from "./types";

export type ResolvedCustomerSession = {
  customer: CustomerSummary;
  accessToken: string;
};

export const ACCOUNT_SESSION_EXPIRED_MESSAGE =
  "Your session expired. Please sign in again.";

export function accountSessionUnauthorizedResponse() {
  return NextResponse.json({ error: ACCOUNT_SESSION_EXPIRED_MESSAGE }, { status: 401 });
}

/** Server Components — read session without modifying cookies. */
export async function getCustomerSession(): Promise<CustomerSummary | null> {
  const accessToken = readCustomerAccessToken();
  if (!accessToken) return null;

  try {
    return await fetchCustomerProfile(accessToken);
  } catch {
    return null;
  }
}

/** Route Handlers — resolve session with token refresh and cookie cleanup. */
export async function requireCustomerSession(): Promise<ResolvedCustomerSession | null> {
  let accessToken = await getCustomerAccessToken();
  if (!accessToken) return null;

  try {
    const customer = await fetchCustomerProfile(accessToken);
    if (customer) {
      return { customer, accessToken };
    }
  } catch (error) {
    if (!(error instanceof CustomerAuthError)) {
      return null;
    }
  }

  accessToken = await forceRefreshCustomerAccessToken();
  if (!accessToken) return null;

  try {
    const customer = await fetchCustomerProfile(accessToken);
    if (customer) {
      return { customer, accessToken };
    }
  } catch (error) {
    if (error instanceof CustomerAuthError) {
      clearCustomerSession();
    }
  }

  return null;
}
