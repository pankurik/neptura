import { NextRequest, NextResponse } from "next/server";
import { createCustomerAddress } from "@/lib/customer-auth/addresses";
import { getCustomerAccessToken } from "@/lib/customer-auth/session";
import type { CustomerAddressInput } from "@/lib/customer-auth/types";

export async function POST(request: NextRequest) {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: CustomerAddressInput;

  try {
    body = (await request.json()) as CustomerAddressInput;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.firstName?.trim() || !body.address1?.trim() || !body.city?.trim() || !body.zoneCode?.trim() || !body.zip?.trim()) {
    return NextResponse.json({ error: "Please fill in all required address fields." }, { status: 400 });
  }

  const { address, errors } = await createCustomerAddress(accessToken, body);

  if (errors.length || !address) {
    return NextResponse.json(
      { error: errors[0] ?? "Address could not be saved." },
      { status: 422 }
    );
  }

  return NextResponse.json({ address });
}
