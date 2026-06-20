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
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-neptura-light-text/30 backdrop-blur-sm transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!cartOpen}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-neptura-light-bg border-l border-neptura-light transition-transform duration-300 ease-out ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!cartOpen}
        aria-label="Shopping bag"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neptura-light px-6 py-5">
          <h2 className="font-display text-xl font-light text-neptura-light-text">
            Your stones
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-xs uppercase tracking-[0.2em] text-neptura-light-muted transition hover:text-neptura-aurora"
          >
            Close
          </button>
        </div>

        {/* Line Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-neptura-light-muted">
              Your bag of stones is empty.
            </p>
          ) : (
            <ul className="space-y-6">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={closeCart}
                    className="relative h-24 w-20 flex-shrink-0 bg-neptura-light-surface border border-neptura-light"
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
                      <div className="flex h-full items-center justify-center text-xs text-neptura-light-muted">
                        —
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      onClick={closeCart}
                      className="truncate font-display text-sm text-neptura-light-text hover:text-neptura-aurora"
                    >
                      {line.merchandise.product.title}
                    </Link>
                    {line.merchandise.title !== "Default Title" && (
                      <p className="mt-0.5 text-xs text-neptura-light-muted">
                        {line.merchandise.title}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-light text-neptura-light-muted">
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
                        className="flex h-7 w-7 items-center justify-center border border-neptura-light text-neptura-light-text transition hover:border-neptura-aurora hover:text-neptura-aurora disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm text-neptura-light-text">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          updateLineQuantity(line.id, line.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center border border-neptura-light text-neptura-light-text transition hover:border-neptura-aurora hover:text-neptura-aurora disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => removeFromCart(line.id)}
                        className="ml-auto text-xs uppercase tracking-wider text-neptura-light-muted hover:text-neptura-aurora transition"
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

        {/* Footer section */}
        <div className="border-t border-neptura-light px-6 py-5 bg-neptura-light-surface">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-neptura-light-muted">
              Subtotal
            </span>
            <span className="font-display text-lg text-neptura-light-text">
              {subtotal
                ? formatPrice(subtotal.amount, subtotal.currencyCode)
                : formatPrice("0", "INR")}
            </span>
          </div>

          {checkoutUrl && lines.length > 0 ? (
            <a
              href={checkoutUrl}
              className="block w-full bg-neptura-light-text py-4 text-center text-xs uppercase tracking-[0.25em] text-neptura-light-bg transition hover:opacity-90"
            >
              Checkout
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="block w-full cursor-not-allowed bg-neptura-light-text/30 py-4 text-center text-xs uppercase tracking-[0.25em] text-neptura-light-bg/70"
            >
              Checkout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
