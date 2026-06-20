import { NextRequest, NextResponse } from "next/server";
import { deleteCustomerAddress, updateCustomerAddress } from "@/lib/customer-auth/addresses";
import { getCustomerAccessToken } from "@/lib/customer-auth/session";
import type { CustomerAddressInput } from "@/lib/customer-auth/types";

type RouteContext = {
  params: Promise<{ addressId: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { addressId } = await context.params;
  const decodedId = decodeURIComponent(addressId);

  let body: CustomerAddressInput;

  try {
    body = (await request.json()) as CustomerAddressInput;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.firstName?.trim() || !body.address1?.trim() || !body.city?.trim() || !body.zoneCode?.trim() || !body.zip?.trim()) {
    return NextResponse.json({ error: "Please fill in all required address fields." }, { status: 400 });
  }

  const { address, errors } = await updateCustomerAddress(accessToken, decodedId, body);

  if (errors.length || !address) {
    return NextResponse.json(
      { error: errors[0] ?? "Address could not be updated." },
      { status: 422 }
    );
  }

  return NextResponse.json({ address });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { addressId } = await context.params;
  const decodedId = decodeURIComponent(addressId);

  const { deletedAddressId, errors } = await deleteCustomerAddress(accessToken, decodedId);

  if (errors.length || !deletedAddressId) {
    return NextResponse.json(
      { error: errors[0] ?? "Address could not be deleted." },
      { status: 422 }
    );
  }

  return NextResponse.json({ deletedAddressId });
}
