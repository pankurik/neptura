import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAppRedirectUrl } from "@/lib/customer-auth/config";
import { AUTH_COOKIE } from "@/lib/customer-auth/cookies";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";
import { saveCustomerSession } from "@/lib/customer-auth/session";
import { exchangeAuthorizationCode } from "@/lib/customer-auth/tokens";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  const storedState = cookieStore.get(AUTH_COOKIE.state)?.value;
  const verifier = cookieStore.get(AUTH_COOKIE.pkceVerifier)?.value;
  const returnTo = sanitizeReturnTo(cookieStore.get(AUTH_COOKIE.returnTo)?.value);

  cookieStore.delete(AUTH_COOKIE.state);
  cookieStore.delete(AUTH_COOKIE.pkceVerifier);
  cookieStore.delete(AUTH_COOKIE.returnTo);

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
    await saveCustomerSession(tokens);
    return NextResponse.redirect(getAppRedirectUrl(returnTo));
  } catch (error) {
    console.error("Customer auth callback failed:", error);
    return NextResponse.redirect(getAppRedirectUrl("/login?error=auth_failed"));
  }
}
