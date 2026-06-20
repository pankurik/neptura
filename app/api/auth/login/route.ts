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
import { fetchOpenIdConfiguration } from "@/lib/customer-auth/discovery";
import { generateCodeChallenge, generateCodeVerifier, generateState } from "@/lib/customer-auth/pkce";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";

export async function GET(request: NextRequest) {
  if (!hasCustomerAccountCredentials()) {
    return NextResponse.redirect(getAppRedirectUrl("/login?error=not_configured"));
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
    cookieStore.set(AUTH_COOKIE.pkceVerifier, verifier, oauthFlowCookieOptions);
    cookieStore.set(AUTH_COOKIE.state, state, oauthFlowCookieOptions);
    cookieStore.set(AUTH_COOKIE.returnTo, returnTo, oauthFlowCookieOptions);

    const authorizeUrl = new URL(authorization_endpoint);
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("scope", CUSTOMER_AUTH_SCOPE);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("code_challenge", challenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");

    return NextResponse.redirect(authorizeUrl.toString());
  } catch (error) {
    console.error("Customer auth login failed:", error);
    return NextResponse.redirect(getAppRedirectUrl("/login?error=auth_failed"));
  }
}
