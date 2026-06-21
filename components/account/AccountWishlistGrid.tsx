"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/shopify";
import type { Product } from "@/lib/types";

type AccountWishlistGridProps = {
  products: Product[];
};

export const WISHLIST_PREVIEW_LIMIT = 5;

export default function AccountWishlistGrid({ products }: AccountWishlistGridProps) {
  const router = useRouter();
  const [removingHandle, setRemovingHandle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(handle: string) {
    setError(null);
    setRemovingHandle(handle);

    try {
      const response = await fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, action: "remove" }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Could not remove this piece.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not remove this piece.");
    } finally {
      setRemovingHandle(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-4 text-[0.75rem] font-light text-neptura-aurora">{error}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
        {products.map((product) => {
          const { amount, currencyCode } = product.priceRange.minVariantPrice;

          return (
            <article
              key={product.handle}
              className="account-order-gallery-card group flex flex-col border border-neptura-light bg-neptura-light-bg"
            >
              <Link href={`/products/${product.handle}`} className="group relative aspect-product overflow-hidden bg-neptura-light-surface">
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText ?? product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="account-order-gallery-card__image object-cover transition duration-700 ease-out-expo group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neptura-light-muted">
                    No image
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col border-t border-neptura-light p-5">
                <Link
                  href={`/products/${product.handle}`}
                  className="font-display text-lg font-light text-neptura-light-text transition-colors hover:text-neptura-aurora"
                >
                  {product.title}
                </Link>
                <p className="mt-2 font-display text-base font-light text-neptura-aurora">
                  {formatPrice(amount, currencyCode)}
                </p>

                <button
                  type="button"
                  onClick={() => handleRemove(product.handle)}
                  disabled={removingHandle === product.handle}
                  className="mt-5 self-start text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora disabled:opacity-50"
                >
                  {removingHandle === product.handle ? "Removing…" : "Remove"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
