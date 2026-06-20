import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAppRedirectUrl } from "@/lib/customer-auth/config";
import { AUTH_COOKIE, authFlashCookieOptions } from "@/lib/customer-auth/cookies";
import { isIdTokenValidForLogout } from "@/lib/customer-auth/id-token";
import { buildShopifyLogoutUrl } from "@/lib/customer-auth/logout";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";
import { clearCustomerSession } from "@/lib/customer-auth/session";

function redirectToLogin(
  flash: "signed_out" | "logout_local",
  returnTo = "/login",
  error?: string | null
): NextResponse {
  const params = new URLSearchParams();
  if (returnTo !== "/login") {
    params.set("returnTo", returnTo);
  }
  if (error) {
    params.set("error", error);
  }

  const query = params.toString();
  const loginPath = query ? `/login?${query}` : "/login";
  const response = NextResponse.redirect(getAppRedirectUrl(loginPath));
  response.cookies.set(AUTH_COOKIE.authFlash, flash, authFlashCookieOptions);
  return response;
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const idToken = cookieStore.get(AUTH_COOKIE.idToken)?.value;

  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const error = request.nextUrl.searchParams.get("error");
  const postLogoutRedirect = getAppRedirectUrl("/login");

  clearCustomerSession();

  if (idToken && isIdTokenValidForLogout(idToken)) {
    try {
      const shopifyLogoutUrl = await buildShopifyLogoutUrl(idToken, postLogoutRedirect);
      const response = NextResponse.redirect(shopifyLogoutUrl);
      response.cookies.set(AUTH_COOKIE.authFlash, "signed_out", authFlashCookieOptions);
      return response;
    } catch (error) {
      console.error("Shopify logout redirect failed:", error);
    }
  }

  if (returnTo !== "/login") {
    return NextResponse.redirect(getAppRedirectUrl(returnTo));
  }

  return redirectToLogin(idToken ? "logout_local" : "signed_out", returnTo, error);
}
