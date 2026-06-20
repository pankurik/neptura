"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

const LEFT_LINKS = [
  { label: "Collections", href: "/shop" },
  { label: "Origin", href: "/#origin" },
];

const RIGHT_LINKS = [
  { label: "Science", href: "/#science" },
  { label: "Bespoke", href: "/bespoke" },
];

const linkClassName =
  "text-[0.58rem] font-light uppercase tracking-[0.18em] text-[rgba(168,197,218,0.55)] transition-colors duration-300 hover:text-[rgba(232,244,248,0.9)]";

const iconClassName =
  "text-[rgba(168,197,218,0.55)] transition-colors duration-300 hover:text-[rgba(232,244,248,0.9)]";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="0.75" />
      <path
        d="M10.5 10.5L14 14"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M8 13.5L3.5 9C2 7.5 2 5.2 3.6 3.6C5.2 2 7.5 2 9 3.5L8 4.5L7 3.5C5.5 2 3.2 2 1.6 3.6C0 5.2 0 7.5 1.5 9L8 13.5Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M4 6V5C4 2.8 5.8 1 8 1C10.2 1 12 2.8 12 5V6"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d="M2.5 6H13.5L12.5 14.5H3.5L2.5 6Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-[400ms] ease-in-out"
      style={{
        padding: "1.8rem 3.5rem",
        backgroundColor: scrolled ? "rgba(0, 0, 8, 0.7)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "0.5px solid rgba(168, 197, 218, 0.08)"
          : "0.5px solid transparent",
      }}
    >
      <div className="relative flex items-center justify-between">
        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary left">
          {LEFT_LINKS.map((item) => (
            <Link key={item.label} href={item.href} className={linkClassName}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[0.9rem] font-light uppercase tracking-[0.45em] text-neptura-diamond"
        >
          Neptura
        </Link>

        <div className="ml-auto flex items-center gap-10">
          <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary right">
            {RIGHT_LINKS.map((item) => (
              <Link key={item.label} href={item.href} className={linkClassName}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className={iconClassName}
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              className={iconClassName}
              aria-label="Wishlist"
            >
              <WishlistIcon />
            </button>

            <button
              type="button"
              onClick={openCart}
              className={`relative ${iconClassName}`}
              aria-label="Open bag"
            >
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 bg-neptura-aurora"
                  aria-hidden
                />
              )}
              <BagIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
