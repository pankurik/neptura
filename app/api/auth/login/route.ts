import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_AUTH_SCOPE,
  getAppRedirectUrl,
  getCustomerAccountClientId,
  getCustomerAuthCallbackUrl,
  hasCustomerAccountCredentials,
} from "@/lib/customer-auth/config";
import { AUTH_COOKIE, oauthFlowCookieOptions } from "@/lib/customer-auth/cookies";
import { sanitizeEmail } from "@/lib/customer-auth/email";
import { fetchOpenIdConfiguration } from "@/lib/customer-auth/discovery";
import { generateCodeChallenge, generateCodeVerifier, generateState } from "@/lib/customer-auth/pkce";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";

function shouldAutoSubmitLogin(email: string, cookieStore: ReturnType<typeof cookies>): boolean {
  const lastEmail = cookieStore.get(AUTH_COOKIE.lastLoginEmail)?.value?.toLowerCase();
  const pendingEmail = cookieStore.get(AUTH_COOKIE.pendingLoginEmail)?.value?.toLowerCase();
  const flash = cookieStore.get(AUTH_COOKIE.authFlash)?.value;

  if (flash === "wrong_account" || pendingEmail === email) {
    return false;
  }

  if (lastEmail && lastEmail !== email) {
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  if (!hasCustomerAccountCredentials()) {
    return NextResponse.redirect(getAppRedirectUrl("/login?error=not_configured"));
  }

  const email = sanitizeEmail(request.nextUrl.searchParams.get("email"));
  if (!email) {
    const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));
    const params = new URLSearchParams();
    if (returnTo !== "/") params.set("returnTo", returnTo);
    params.set("error", "invalid_email");
    return NextResponse.redirect(getAppRedirectUrl(`/login?${params.toString()}`));
  }

  try {
    const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = generateState();
    const clientId = getCustomerAccountClientId();
    const redirectUri = getCustomerAuthCallbackUrl();
    const { authorization_endpoint } = await fetchOpenIdConfiguration();

    const cookieStore = cookies();
    const autoSubmit = shouldAutoSubmitLogin(email, cookieStore);

    cookieStore.delete(AUTH_COOKIE.authFlash);
    cookieStore.delete(AUTH_COOKIE.pendingLoginEmail);

    cookieStore.set(AUTH_COOKIE.pkceVerifier, verifier, oauthFlowCookieOptions);
    cookieStore.set(AUTH_COOKIE.state, state, oauthFlowCookieOptions);
    cookieStore.set(AUTH_COOKIE.returnTo, returnTo, oauthFlowCookieOptions);
    cookieStore.set(AUTH_COOKIE.loginEmail, email, oauthFlowCookieOptions);

    const authorizeUrl = new URL(authorization_endpoint);
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("scope", CUSTOMER_AUTH_SCOPE);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("code_challenge", challenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
    authorizeUrl.searchParams.set("login_hint", email);

    if (autoSubmit) {
      authorizeUrl.searchParams.set("login_hint_mode", "submit");
    } else {
      authorizeUrl.searchParams.set("max_age", "0");
    }

    return NextResponse.redirect(authorizeUrl.toString());
  } catch (error) {
    console.error("Customer auth login failed:", error);
    return NextResponse.redirect(getAppRedirectUrl("/login?error=auth_failed"));
  }
}
