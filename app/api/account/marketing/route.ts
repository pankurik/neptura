import { NextRequest, NextResponse } from "next/server";
import { fetchCustomerProfile } from "@/lib/customer-auth/customer";
import { setEmailMarketingSubscription } from "@/lib/customer-auth/marketing";
import { getCustomerDisplayPhone } from "@/lib/customer-auth/phone";
import { setSmsMarketingSubscription } from "@/lib/customer-auth/sms-marketing";
import { getCustomerAccessToken } from "@/lib/customer-auth/session";

type MarketingBody = {
  channel?: "email" | "sms";
  subscribed?: boolean;
};

export async function POST(request: NextRequest) {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: MarketingBody;

  try {
    body = (await request.json()) as MarketingBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.subscribed !== "boolean") {
    return NextResponse.json({ error: "Invalid preference." }, { status: 400 });
  }

  const channel = body.channel === "sms" ? "sms" : "email";

  if (channel === "sms") {
    const customer = await fetchCustomerProfile(accessToken);

    if (!customer) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    if (!getCustomerDisplayPhone(customer)) {
      return NextResponse.json(
        { error: "Add a phone number before subscribing to SMS updates." },
        { status: 400 }
      );
    }

    const { marketingState, errors } = await setSmsMarketingSubscription(
      customer.id,
      body.subscribed
    );

    if (errors.length) {
      return NextResponse.json(
        { error: errors[0] ?? "SMS preference could not be saved." },
        { status: 422 }
      );
    }

    return NextResponse.json({ marketingState });
  }

  const { marketingState, errors } = await setEmailMarketingSubscription(
    accessToken,
    body.subscribed
  );

  if (errors.length) {
    return NextResponse.json(
      { error: errors[0] ?? "Preference could not be saved." },
      { status: 422 }
    );
  }

  return NextResponse.json({ marketingState });
}
