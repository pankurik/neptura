import { NextRequest, NextResponse } from "next/server";
import {
  addToCustomerWishlist,
  fetchCustomerWishlist,
  removeFromCustomerWishlist,
} from "@/lib/customer-auth/wishlist";
import {
  accountSessionUnauthorizedResponse,
  requireCustomerSession,
} from "@/lib/customer-auth/require-session";

type WishlistBody = {
  handle?: string;
  action?: "add" | "remove";
};

export async function GET() {
  const session = await requireCustomerSession();

  if (!session) {
    return accountSessionUnauthorizedResponse();
  }

  const handles = await fetchCustomerWishlist(session.customer.id);
  return NextResponse.json({ handles });
}

export async function POST(request: NextRequest) {
  const session = await requireCustomerSession();

  if (!session) {
    return accountSessionUnauthorizedResponse();
  }

  let body: WishlistBody;

  try {
    body = (await request.json()) as WishlistBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const handle = body.handle?.trim() ?? "";
  const action = body.action ?? "add";

  if (!handle) {
    return NextResponse.json({ error: "Product could not be saved." }, { status: 400 });
  }

  const result =
    action === "remove"
      ? await removeFromCustomerWishlist(session.customer.id, handle)
      : await addToCustomerWishlist(session.customer.id, handle);

  if (result.errors.length) {
    return NextResponse.json({ error: result.errors[0] }, { status: 422 });
  }

  return NextResponse.json({ handles: result.handles });
}
