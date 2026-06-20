import { NextRequest, NextResponse } from "next/server";
import { setEmailMarketingSubscription } from "@/lib/customer-auth/marketing";
import { getCustomerDisplayPhone } from "@/lib/customer-auth/phone";
import {
  accountSessionUnauthorizedResponse,
  requireCustomerSession,
} from "@/lib/customer-auth/require-session";
import { setSmsMarketingSubscription } from "@/lib/customer-auth/sms-marketing";

type MarketingBody = {
  channel?: "email" | "sms";
  subscribed?: boolean;
};

export async function POST(request: NextRequest) {
  const session = await requireCustomerSession();

  if (!session) {
    return accountSessionUnauthorizedResponse();
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
    if (!getCustomerDisplayPhone(session.customer)) {
      return NextResponse.json(
        { error: "Add a phone number before subscribing to SMS updates." },
        { status: 400 }
      );
    }

    const { marketingState, errors } = await setSmsMarketingSubscription(
      session.customer.id,
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
    session.accessToken,
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
