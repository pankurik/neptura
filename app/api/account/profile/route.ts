import { NextRequest, NextResponse } from "next/server";
import { updateCustomerProfile } from "@/lib/customer-auth/customer";
import { getCustomerAccessToken } from "@/lib/customer-auth/session";

type ProfileBody = {
  firstName?: string;
  lastName?: string;
};

export async function POST(request: NextRequest) {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
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

  const { customer, errors } = await updateCustomerProfile(accessToken, {
    firstName,
    lastName: body.lastName,
  });

  if (errors.length || !customer) {
    return NextResponse.json(
      { error: errors[0] ?? "Profile could not be updated." },
      { status: 422 }
    );
  }

  return NextResponse.json({ customer });
}
