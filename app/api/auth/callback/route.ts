import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAppRedirectUrl } from "@/lib/customer-auth/config";
import { AUTH_COOKIE, authFlashCookieOptions, lastLoginEmailCookieOptions } from "@/lib/customer-auth/cookies";
import { fetchCustomerProfile, isProfileComplete } from "@/lib/customer-auth/customer";
import { buildShopifyLogoutUrl } from "@/lib/customer-auth/logout";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";
import { saveCustomerSession } from "@/lib/customer-auth/session";
import { exchangeAuthorizationCode } from "@/lib/customer-auth/tokens";

async function buildPostAuthRedirect(returnTo: string, accessToken: string): Promise<string> {
  const setupPath = `/account/setup?returnTo=${encodeURIComponent(returnTo)}`;

  try {
    const customer = await fetchCustomerProfile(accessToken);
    if (customer && !isProfileComplete(customer)) {
      return setupPath;
    }
    return returnTo;
  } catch {
    return returnTo;
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  const storedState = cookieStore.get(AUTH_COOKIE.state)?.value;
  const verifier = cookieStore.get(AUTH_COOKIE.pkceVerifier)?.value;
  const returnTo = sanitizeReturnTo(cookieStore.get(AUTH_COOKIE.returnTo)?.value);
  const intendedEmail = cookieStore.get(AUTH_COOKIE.loginEmail)?.value?.toLowerCase() ?? null;

  cookieStore.delete(AUTH_COOKIE.state);
  cookieStore.delete(AUTH_COOKIE.pkceVerifier);
  cookieStore.delete(AUTH_COOKIE.returnTo);
  cookieStore.delete(AUTH_COOKIE.loginEmail);

  if (oauthError || !code || !state || !storedState || !verifier) {
    console.error("Customer auth callback rejected:", {
      oauthError,
      hasCode: Boolean(code),
      hasState: Boolean(state),
      hasStoredState: Boolean(storedState),
      hasVerifier: Boolean(verifier),
    });
    return NextResponse.redirect(getAppRedirectUrl("/login?error=auth_failed"));
  }

  if (state !== storedState) {
    return NextResponse.redirect(getAppRedirectUrl("/login?error=invalid_state"));
  }

  try {
    const tokens = await exchangeAuthorizationCode(code, verifier);
    const customer = await fetchCustomerProfile(tokens.access_token);
    const actualEmail = customer?.email?.toLowerCase() ?? null;

    if (intendedEmail && actualEmail && intendedEmail !== actualEmail) {
      const loginUrl = getAppRedirectUrl("/login");

      if (tokens.id_token) {
        const shopifyLogoutUrl = await buildShopifyLogoutUrl(tokens.id_token, loginUrl);
        const response = NextResponse.redirect(shopifyLogoutUrl);
        response.cookies.set(AUTH_COOKIE.authFlash, "wrong_account", authFlashCookieOptions);
        response.cookies.set(AUTH_COOKIE.pendingLoginEmail, intendedEmail, authFlashCookieOptions);
        return response;
      }

      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(AUTH_COOKIE.authFlash, "wrong_account", authFlashCookieOptions);
      response.cookies.set(AUTH_COOKIE.pendingLoginEmail, intendedEmail, authFlashCookieOptions);
      return response;
    }

    await saveCustomerSession(tokens);
    const destination = await buildPostAuthRedirect(returnTo, tokens.access_token);
    const response = NextResponse.redirect(getAppRedirectUrl(destination));

    if (actualEmail) {
      response.cookies.set(AUTH_COOKIE.lastLoginEmail, actualEmail, lastLoginEmailCookieOptions);
    }

    return response;
  } catch (error) {
    console.error("Customer auth callback failed:", error);
    return NextResponse.redirect(getAppRedirectUrl("/login?error=auth_failed"));
  }
}
