"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { NavItem } from "@/lib/types";

const NAV_ITEMS: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/shop" },
];

export default function Navbar() {
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neptura-navy/10 bg-neptura-pearl/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-serif text-2xl font-light tracking-[0.15em] text-neptura-navy"
        >
          Neptura
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-[0.2em] text-neptura-navy/70 transition hover:text-neptura-rose"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={openCart}
          className="relative text-xs uppercase tracking-[0.2em] text-neptura-navy/70 transition hover:text-neptura-rose"
          aria-label="Open bag"
        >
          Bag
          {itemCount > 0 && (
            <span className="absolute -right-4 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-neptura-rose px-1 text-[10px] font-medium text-neptura-pearl">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
