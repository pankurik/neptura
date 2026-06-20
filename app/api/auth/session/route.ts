import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth/require-session";

export async function GET() {
  const customer = await getCustomerSession();

  if (!customer) {
    return NextResponse.json({ customer: null });
  }

  return NextResponse.json({ customer });
}
