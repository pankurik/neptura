import { NextRequest, NextResponse } from "next/server";
import { friendlyAuthError } from "@/lib/customer-auth/auth-errors";
import { updateCustomerProfile } from "@/lib/customer-auth/customer";
import { requireCustomerSession } from "@/lib/customer-auth/require-session";
import { clearCustomerSession } from "@/lib/customer-auth/session";

type ProfileBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export async function POST(request: NextRequest) {
  const session = await requireCustomerSession();

  if (!session) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  let body: ProfileBody;

  try {
    body = (await request.json()) as ProfileBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const firstName = body.firstName?.trim() ?? "";

  if (!firstName) {
    return NextResponse.json({ error: "First name is required." }, { status: 400 });
  }

  const { customer, errors, suggestReauth } = await updateCustomerProfile(session.accessToken, {
    firstName,
    lastName: body.lastName,
    email: body.email,
  });

  if (errors.length || !customer) {
    return NextResponse.json(
      { error: friendlyAuthError(errors[0] ?? "Profile could not be updated.") },
      { status: 422 }
    );
  }

  if (suggestReauth) {
    clearCustomerSession();
  }

  return NextResponse.json({
    customer,
    suggestReauth: suggestReauth ?? false,
    message: suggestReauth
      ? "Your email was updated. Sign in with your new address to continue."
      : undefined,
  });
}
