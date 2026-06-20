"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cart, checkoutUrl } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-neptura-ocean/10 bg-neptura-sand/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-light tracking-[0.2em] text-neptura-navy"
        >
          NEPTURA
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/shop"
            className="text-sm uppercase tracking-widest text-neptura-ocean transition hover:text-neptura-navy"
          >
            Shop
          </Link>

          {checkoutUrl && itemCount > 0 ? (
            <a
              href={checkoutUrl}
              className="relative text-sm uppercase tracking-widest text-neptura-ocean transition hover:text-neptura-navy"
            >
              Bag
              <span className="absolute -right-4 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-neptura-seafoam text-[10px] font-medium text-neptura-navy">
                {itemCount}
              </span>
            </a>
          ) : (
            <span className="text-sm uppercase tracking-widest text-neptura-ocean/40">
              Bag
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
