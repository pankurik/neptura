"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shopify";
import type { Product } from "@/lib/types";

const LEFT_LINKS = [
  { label: "Collections", href: "/shop", hasMenu: true },
  { label: "Origin", href: "/#origin", hasMenu: false },
];

const RIGHT_LINKS = [
  { label: "Science", href: "/#science", hasMenu: false },
  { label: "Bespoke", href: "/bespoke", hasMenu: false },
];

const linkClassName =
  "text-[0.62rem] font-light uppercase tracking-[0.16em] text-[rgba(168,197,218,0.55)] transition-colors duration-300 hover:text-[rgba(232,244,248,0.9)]";

const activeLinkClassName =
  "text-[0.62rem] font-light uppercase tracking-[0.16em] text-neptura-aurora transition-colors duration-300";

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
  const [activeMenu, setActiveMenu] = useState<"collections" | null>(null);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);

  const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch featured product from local API
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(
          "/api/products?handle=rare-sunlight-fancy-yellow-emerald-cut-diamond-halo-ring"
        );
        if (res.ok) {
          const data = await res.json();
          setFeaturedProduct(data);
        }
      } catch (err) {
        console.error("Failed to fetch featured product for navbar:", err);
      }
    }
    fetchFeatured();
  }, []);

  // Hover delay timings: 120ms enter, 250ms leave
  const handleMouseEnterMenu = (menu: "collections") => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    enterTimerRef.current = setTimeout(() => {
      setActiveMenu(menu);
    }, 120);
  };

  const handleMouseLeaveMenu = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    leaveTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250);
  };

  const closeMenuImmediately = () => {
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setActiveMenu(null);
  };

  const shortTitle = featuredProduct
    ? featuredProduct.title.split("—")[0].trim()
    : "";

  return (
    <>
      {/* Theatre Curtain Backdrop Overlay (Deep Space Darkness) */}
      <div
        className={`fixed inset-0 z-40 bg-[rgba(0,0,8,0.85)] backdrop-blur-[4px] transition-opacity duration-[450ms] cubic-bezier(0.16, 1, 0.3, 1) ${
          activeMenu ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenuImmediately}
        aria-hidden={!activeMenu}
      />

      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-[400ms] ease-in-out"
        style={{
          padding: scrolled ? "1.2rem 3.5rem" : "1.8rem 3.5rem",
          backgroundColor: scrolled || activeMenu ? "rgba(0, 0, 8, 0.9)" : "transparent",
          backdropFilter: scrolled || activeMenu ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled || activeMenu ? "blur(20px)" : "none",
          borderBottom: scrolled || activeMenu
            ? "0.5px solid rgba(168, 197, 218, 0.08)"
            : "0.5px solid transparent",
        }}
        onMouseLeave={handleMouseLeaveMenu}
      >
        <div className="relative flex items-center justify-between">
          <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary left">
            {LEFT_LINKS.map((item) => (
              <div
                key={item.label}
                onMouseEnter={() => item.hasMenu ? handleMouseEnterMenu("collections") : closeMenuImmediately()}
                className="py-1"
              >
                <Link
                  href={item.href}
                  className={activeMenu === "collections" && item.hasMenu ? activeLinkClassName : linkClassName}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          <Link
            href="/"
            onClick={closeMenuImmediately}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[0.9rem] font-light uppercase tracking-[0.45em] text-neptura-diamond"
          >
            Neptura
          </Link>

          <div className="ml-auto flex items-center gap-10">
            <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary right">
              {RIGHT_LINKS.map((item) => (
                <div
                  key={item.label}
                  onMouseEnter={closeMenuImmediately}
                  className="py-1"
                >
                  <Link href={item.href} className={linkClassName}>
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-6">
              <button
                type="button"
                className={iconClassName}
                aria-label="Search"
                onMouseEnter={closeMenuImmediately}
              >
                <SearchIcon />
              </button>

              <button
                type="button"
                className={iconClassName}
                aria-label="Wishlist"
                onMouseEnter={closeMenuImmediately}
              >
                <WishlistIcon />
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMenuImmediately();
                  openCart();
                }}
                className={`relative ${iconClassName}`}
                aria-label="Open bag"
                onMouseEnter={closeMenuImmediately}
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

        {/* Swarovski-Style Collections Megamenu (Dark World Theme) */}
        <div
          className={`absolute left-0 right-0 top-full bg-neptura-void/95 border-t border-neptura-ice/5 transition-all duration-[400ms] ease-out-expo ${
            activeMenu === "collections"
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-2 pointer-events-none invisible"
          }`}
          onMouseEnter={() => {
            if (leaveTimerRef.current) {
              clearTimeout(leaveTimerRef.current);
              leaveTimerRef.current = null;
            }
          }}
        >
          <div className="mx-auto max-w-6xl px-8 py-14 grid grid-cols-4 gap-12 text-left">
            {/* Column 1: By Category */}
            <div className="space-y-5">
              <h3 className="section-label text-neptura-aurora">The stones</h3>
              <ul className="space-y-3.5 text-[0.72rem] tracking-wider uppercase font-light text-neptura-silver">
                <li>
                  <Link
                    href="/shop"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    All Collection
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?type=rings"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    Rings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?type=necklaces"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    Necklaces
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?type=earrings"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    Earrings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: By Setting */}
            <div className="space-y-5">
              <h3 className="section-label text-neptura-aurora">The settings</h3>
              <ul className="space-y-3.5 text-[0.72rem] tracking-wider uppercase font-light text-neptura-silver">
                <li>
                  <Link
                    href="/shop?material=white-gold"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    White Gold
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?material=gold"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    Yellow Gold
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?material=rose-gold"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    Rose Gold
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: The Science */}
            <div className="space-y-5">
              <h3 className="section-label text-neptura-aurora">The science</h3>
              <ul className="space-y-3.5 text-[0.72rem] tracking-wider uppercase font-light text-neptura-silver">
                <li>
                  <Link
                    href="/#origin"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    Our Origin Story
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#science"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    Plasma Process
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bespoke"
                    onClick={closeMenuImmediately}
                    className="hover:text-neptura-crystal transition-colors duration-300"
                  >
                    Bespoke Enquiry
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Featured Product (Shoppable Row) */}
            <div className="space-y-5 border-l border-neptura-ice/10 pl-10">
              <h3 className="section-label text-neptura-aurora">Featured piece</h3>
              {featuredProduct ? (
                <Link
                  href={`/products/${featuredProduct.handle}`}
                  onClick={closeMenuImmediately}
                  className="group block space-y-4 max-w-[180px]"
                >
                  {/* 3:4 Aspect Ratio Image */}
                  <div className="relative aspect-product w-full bg-neptura-deep border border-neptura-ice/15 overflow-hidden">
                    {featuredProduct.featuredImage ? (
                      <Image
                        src={featuredProduct.featuredImage.url}
                        alt={featuredProduct.featuredImage.altText ?? featuredProduct.title}
                        fill
                        sizes="180px"
                        className="object-cover transition duration-500 ease-out-expo group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[0.6rem] text-neptura-ice/30">
                        —
                      </div>
                    )}
                  </div>
                  
                  {/* Metadata */}
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-[0.95rem] font-light italic text-neptura-crystal leading-tight group-hover:text-neptura-aurora transition-colors duration-300">
                      {shortTitle}
                    </h4>
                    <p className="text-[0.72rem] font-medium text-neptura-aurora font-sans">
                      {formatPrice(
                        featuredProduct.priceRange.minVariantPrice.amount,
                        featuredProduct.priceRange.minVariantPrice.currencyCode
                      )}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="h-44 flex items-center justify-center text-[0.68rem] text-neptura-silver/30 font-light">
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
