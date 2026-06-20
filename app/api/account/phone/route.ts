import { NextRequest, NextResponse } from "next/server";
import { fetchCustomerProfile } from "@/lib/customer-auth/customer";
import { formatPhoneE164, updateCustomerPhone, validatePhoneInput } from "@/lib/customer-auth/phone";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/country-codes";
import { getCustomerAccessToken } from "@/lib/customer-auth/session";

type PhoneBody = {
  countryCode?: string;
  nationalNumber?: string;
  clear?: boolean;
};

export async function POST(request: NextRequest) {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: PhoneBody;

  try {
    body = (await request.json()) as PhoneBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const customer = await fetchCustomerProfile(accessToken);

  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (body.clear) {
    const { phone, errors } = await updateCustomerPhone(accessToken, customer, null);

    if (errors.length) {
      return NextResponse.json({ error: errors[0] ?? "Phone could not be removed." }, { status: 422 });
    }

    return NextResponse.json({ phone });
  }

  const countryCode = body.countryCode?.trim() || DEFAULT_PHONE_COUNTRY_CODE;
  const nationalNumber = body.nationalNumber?.trim() ?? "";

  const validationError = validatePhoneInput(countryCode, nationalNumber);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const digits = nationalNumber.replace(/\D/g, "");
  const phone = formatPhoneE164(countryCode, digits);
  const { phone: updatedPhone, errors } = await updateCustomerPhone(accessToken, customer, phone);

  if (errors.length) {
    return NextResponse.json({ error: errors[0] ?? "Phone could not be updated." }, { status: 422 });
  }

  return NextResponse.json({ phone: updatedPhone });
}
