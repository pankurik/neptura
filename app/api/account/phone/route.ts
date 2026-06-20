import { NextRequest, NextResponse } from "next/server";
import { formatPhoneE164, updateCustomerPhone, validatePhoneInput } from "@/lib/customer-auth/phone";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/country-codes";
import {
  accountSessionUnauthorizedResponse,
  requireCustomerSession,
} from "@/lib/customer-auth/require-session";

type PhoneBody = {
  countryCode?: string;
  nationalNumber?: string;
  clear?: boolean;
};

export async function POST(request: NextRequest) {
  const session = await requireCustomerSession();

  if (!session) {
    return accountSessionUnauthorizedResponse();
  }

  let body: PhoneBody;

  try {
    body = (await request.json()) as PhoneBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.clear) {
    const { phone, errors } = await updateCustomerPhone(session.accessToken, session.customer, null);

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
  const { phone: updatedPhone, errors } = await updateCustomerPhone(
    session.accessToken,
    session.customer,
    phone
  );

  if (errors.length) {
    return NextResponse.json({ error: errors[0] ?? "Phone could not be updated." }, { status: 422 });
  }

  return NextResponse.json({ phone: updatedPhone });
}
