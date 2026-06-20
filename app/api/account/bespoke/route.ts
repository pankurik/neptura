import { NextRequest, NextResponse } from "next/server";
import { addCustomerBespokeCommission } from "@/lib/customer-auth/bespoke-commissions";
import {
  accountSessionUnauthorizedResponse,
  requireCustomerSession,
} from "@/lib/customer-auth/require-session";

type BespokeBody = {
  name?: string;
  email?: string;
  cut?: string;
  carats?: string;
  metal?: string;
  notes?: string | null;
};

export async function POST(request: NextRequest) {
  const session = await requireCustomerSession();

  if (!session) {
    return accountSessionUnauthorizedResponse();
  }

  let body: BespokeBody;

  try {
    body = (await request.json()) as BespokeBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { commissions, errors } = await addCustomerBespokeCommission(session.customer.id, {
    name: body.name ?? "",
    email: body.email ?? "",
    cut: body.cut ?? "",
    carats: body.carats ?? "",
    metal: body.metal ?? "",
    notes: body.notes ?? null,
  });

  if (errors.length) {
    return NextResponse.json({ error: errors[0] }, { status: 422 });
  }

  return NextResponse.json({ commissions });
}
