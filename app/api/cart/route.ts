import { NextRequest, NextResponse } from "next/server";
import {
  cartLinesAdd,
  cartLinesRemove,
  cartLinesUpdate,
  createCart,
  getCart,
} from "@/lib/queries";

export async function GET(request: NextRequest) {
  const cartId = request.nextUrl.searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json({ message: "Missing cartId" }, { status: 400 });
  }

  try {
    const cart = await getCart(cartId);
    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }
    return NextResponse.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cartId, lines, lineIds } = body;

    if (action === "create") {
      const cart = await createCart(lines ?? []);
      return NextResponse.json(cart);
    }

    if (action === "add") {
      if (!cartId || !lines) {
        return NextResponse.json(
          { message: "Missing cartId or lines" },
          { status: 400 }
        );
      }
      const cart = await cartLinesAdd(cartId, lines);
      return NextResponse.json(cart);
    }

    if (action === "update") {
      if (!cartId || !lines) {
        return NextResponse.json(
          { message: "Missing cartId or lines" },
          { status: 400 }
        );
      }
      const cart = await cartLinesUpdate(cartId, lines);
      return NextResponse.json(cart);
    }

    if (action === "remove") {
      if (!cartId || !lineIds) {
        return NextResponse.json(
          { message: "Missing cartId or lineIds" },
          { status: 400 }
        );
      }
      const cart = await cartLinesRemove(cartId, lineIds);
      return NextResponse.json(cart);
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
