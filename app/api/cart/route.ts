import { NextRequest, NextResponse } from "next/server";
import { cartLinesAdd, createCart } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const cartId = request.nextUrl.searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json({ message: "Missing cartId" }, { status: 400 });
  }

  try {
    const { shopifyFetch } = await import("@/lib/shopify");

    const cartQuery = `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await shopifyFetch<{ cart: unknown }>({
      query: cartQuery,
      variables: { cartId },
      cache: "no-store",
    });

    if (!data.cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    return NextResponse.json(data.cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cartId, lines } = body;

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

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
