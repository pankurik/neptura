"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shopify";

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    closeCart,
    isLoading,
    checkoutUrl,
    updateLineQuantity,
    removeFromCart,
  } = useCart();

  const lines = cart?.lines ?? [];
  const subtotal = cart?.cost?.subtotalAmount;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-neptura-navy/40 transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!cartOpen}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-neptura-pearl shadow-2xl transition-transform duration-300 ease-out ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!cartOpen}
        aria-label="Shopping bag"
      >
        <div className="flex items-center justify-between border-b border-neptura-navy/10 px-6 py-5">
          <h2 className="font-serif text-xl font-light text-neptura-navy">
            Your Bag
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-xs uppercase tracking-[0.2em] text-neptura-navy/60 transition hover:text-neptura-rose"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-neptura-navy/50">
              Your bag is empty.
            </p>
          ) : (
            <ul className="space-y-6">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={closeCart}
                    className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-white"
                  >
                    {line.merchandise.image ? (
                      <Image
                        src={line.merchandise.image.url}
                        alt={
                          line.merchandise.image.altText ??
                          line.merchandise.product.title
                        }
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neptura-navy/30">
                        —
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      onClick={closeCart}
                      className="truncate font-serif text-sm text-neptura-navy hover:text-neptura-rose"
                    >
                      {line.merchandise.product.title}
                    </Link>
                    {line.merchandise.title !== "Default Title" && (
                      <p className="mt-0.5 text-xs text-neptura-navy/50">
                        {line.merchandise.title}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-neptura-navy/70">
                      {formatPrice(
                        line.merchandise.price.amount,
                        line.merchandise.price.currencyCode
                      )}
                    </p>

                    <div className="mt-auto flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          updateLineQuantity(line.id, line.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center border border-neptura-navy/20 text-neptura-navy transition hover:border-neptura-rose hover:text-neptura-rose disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm text-neptura-navy">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          updateLineQuantity(line.id, line.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center border border-neptura-navy/20 text-neptura-navy transition hover:border-neptura-rose hover:text-neptura-rose disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => removeFromCart(line.id)}
                        className="ml-auto text-xs uppercase tracking-wider text-neptura-navy/40 transition hover:text-neptura-rose"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-neptura-navy/10 px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-neptura-navy/60">
              Subtotal
            </span>
            <span className="font-serif text-lg text-neptura-navy">
              {subtotal
                ? formatPrice(subtotal.amount, subtotal.currencyCode)
                : formatPrice("0", "INR")}
            </span>
          </div>

          {checkoutUrl && lines.length > 0 ? (
            <a
              href={checkoutUrl}
              className="block w-full bg-neptura-navy py-4 text-center text-xs uppercase tracking-[0.25em] text-neptura-pearl transition hover:bg-neptura-rose"
            >
              Checkout
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="block w-full cursor-not-allowed bg-neptura-navy/30 py-4 text-center text-xs uppercase tracking-[0.25em] text-neptura-pearl/70"
            >
              Checkout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
