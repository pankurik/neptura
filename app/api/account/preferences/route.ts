import { NextRequest, NextResponse } from "next/server";
import { fetchCustomerPreferences, updateCustomerPreferences } from "@/lib/customer-auth/preferences";
import { sanitizeJewelryPreferences } from "@/lib/customer-auth/jewelry-preferences";
import { requireCustomerSession } from "@/lib/customer-auth/require-session";

type PreferencesBody = {
  birthday?: string | null;
  anniversary?: string | null;
  ringSize?: string | null;
  jewelryPreferences?: string[];
};

export async function POST(request: NextRequest) {
  const session = await requireCustomerSession();

  if (!session) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  let body: PreferencesBody;

  try {
    body = (await request.json()) as PreferencesBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { preferences, errors } = await updateCustomerPreferences(session.customer.id, {
    birthday: body.birthday ?? null,
    anniversary: body.anniversary ?? null,
    ringSize: body.ringSize ?? null,
    jewelryPreferences: sanitizeJewelryPreferences(body.jewelryPreferences ?? []),
  });

  if (errors.length || !preferences) {
    return NextResponse.json(
      { error: errors[0] ?? "Preferences could not be saved." },
      { status: 422 }
    );
  }

  return NextResponse.json({ preferences });
}

export async function GET() {
  const session = await requireCustomerSession();

  if (!session) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const preferences = await fetchCustomerPreferences(session.customer.id);
  return NextResponse.json({ preferences });
}
