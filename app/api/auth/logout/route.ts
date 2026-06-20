import { NextRequest, NextResponse } from "next/server";
import { getAppRedirectUrl } from "@/lib/customer-auth/config";
import { clearCustomerSession } from "@/lib/customer-auth/session";

export async function GET(request: NextRequest) {
  clearCustomerSession();

  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const destination = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

  return NextResponse.redirect(getAppRedirectUrl(destination));
}
