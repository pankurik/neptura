"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shopify";
import type { Product } from "@/lib/types";
import BrandLogo from "@/components/BrandLogo";
import CustomerAvatar from "@/components/CustomerAvatar";
import type { CustomerSummary } from "@/lib/customer-auth/types";

const SCROLL_RANGE = 128;
const EXPANDED_BLOCK_HEIGHT = 120;
const WISHLIST_PATH = "/account/wishlist";

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function rangeMap(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

const MAIN_NAV_LINKS = [
  { label: "Collections", href: "/shop", hasMenu: true },
  { label: "Origin", href: "/#origin", hasMenu: false },
  { label: "Science", href: "/#science", hasMenu: false },
  { label: "Bespoke", href: "/bespoke", hasMenu: false },
];

const COLLECTION_LINKS = [
  { label: "All Collection", href: "/shop" },
  { label: "Rings", href: "/shop?type=rings" },
  { label: "Necklaces", href: "/shop?type=necklaces" },
  { label: "Earrings", href: "/shop?type=earrings" },
];

const STORY_LINKS = [
  { label: "Our Origin Story", href: "/#origin" },
  { label: "Plasma Process", href: "/#science" },
  { label: "Bespoke Enquiry", href: "/bespoke" },
];

const MOBILE_NAV_LINKS = [
  { label: "Origin", href: "/#origin" },
  { label: "Science", href: "/#science" },
  { label: "Bespoke", href: "/bespoke" },
  { label: "The Collection", href: "/shop" },
  { label: "Sign in", href: "/login" },
];

const megamenuLinkClassName = (isLight: boolean) =>
  isLight
    ? "text-neptura-light-muted transition-colors duration-300 hover:text-neptura-aurora"
    : "text-neptura-silver transition-colors duration-300 hover:text-neptura-crystal";

function navClasses(isLight: boolean, adaptive = false) {
  const linkBase =
    "inline-block text-nav font-normal uppercase tracking-nav px-4 py-2.5 transition-colors duration-200";
  const utilityBase =
    "text-meta font-normal uppercase tracking-[0.14em] px-3 py-1.5 transition-colors duration-200";
  const iconBase = "p-2 transition-colors duration-200";

  if (adaptive) {
    return {
      utility: `${utilityBase} nav-utility-adaptive hover:text-neptura-light-text`,
      navItem: `${linkBase} nav-link-adaptive`,
      navItemActive: `${linkBase} text-neptura-aurora bg-[rgba(74,144,164,0.08)]`,
      icon: `${iconBase} nav-icon-adaptive`,
      iconDivider: "0.5px solid rgba(168, 197, 218, 0.12)",
      tierDivider: "0.5px solid rgba(168, 197, 218, 0.08)",
    };
  }

  return {
    utility: isLight
      ? "text-meta font-normal uppercase tracking-[0.14em] text-neptura-light-muted transition-all duration-[400ms] hover:text-neptura-light-text px-3 py-1.5"
      : "nav-legible text-meta font-normal uppercase tracking-[0.14em] text-neptura-crystal transition-all duration-[400ms] hover:text-neptura-diamond px-3 py-1.5",
    navItem: isLight
      ? "inline-block text-nav font-normal uppercase tracking-nav text-neptura-light-text transition-all duration-[400ms] hover:bg-[rgba(10,22,40,0.05)] px-4 py-2.5"
      : "nav-legible inline-block text-nav font-normal uppercase tracking-nav text-neptura-crystal transition-all duration-[400ms] hover:text-neptura-diamond px-4 py-2.5",
    navItemActive: isLight
      ? "inline-block text-nav font-normal uppercase tracking-nav text-neptura-aurora bg-[rgba(74,144,164,0.08)] px-4 py-2.5 transition-all duration-[400ms]"
      : "nav-legible inline-block text-nav font-normal uppercase tracking-nav text-neptura-diamond px-4 py-2.5 transition-all duration-[400ms]",
    icon: isLight
      ? "p-2 text-neptura-light-text transition-all duration-[400ms] hover:bg-[rgba(10,22,40,0.05)]"
      : "nav-legible p-2 text-neptura-crystal transition-all duration-[400ms] hover:text-neptura-diamond",
    iconDivider: isLight
      ? "0.5px solid rgba(74, 144, 164, 0.15)"
      : "0.5px solid rgba(168, 197, 218, 0.12)",
    tierDivider: isLight
      ? "0.5px solid rgba(74, 144, 164, 0.12)"
      : "0.5px solid rgba(168, 197, 218, 0.08)",
  };
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="0.75" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path
        d="M8 13.5C8 13.5 2.5 9.25 2.5 6C2.5 4 4 2.75 5.75 2.75C7 2.75 8 3.75 8 3.75C8 3.75 9 2.75 10.25 2.75C12 2.75 13.5 4 13.5 6C13.5 9.25 8 13.5 8 13.5Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="0.75" />
      <path d="M3.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M4 6V5C4 2.8 5.8 1 8 1C10.2 1 12 2.8 12 5V6" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
      <path d="M2.5 6H13.5L12.5 14.5H3.5L2.5 6Z" stroke="currentColor" strokeWidth="0.75" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden className="shrink-0">
      <path d="M0 1H18M0 7H18M0 13H18" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

function NavLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function WishlistNavLink({
  customer,
  loginHref,
  className,
  showLabel = true,
  onClick,
  onMouseEnter,
}: {
  customer: CustomerSummary | null;
  loginHref: string;
  className: string;
  showLabel?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
}) {
  const wishlistCount = customer?.wishlistHandles.length ?? 0;
  const wishlistHref = customer
    ? WISHLIST_PATH
    : `/login?returnTo=${encodeURIComponent(WISHLIST_PATH)}`;

  return (
    <Link
      href={wishlistHref}
      className={`relative ${className}${showLabel ? " inline-flex items-center gap-1.5" : ""}`}
      aria-label={wishlistCount > 0 ? `Wishlist (${wishlistCount} items)` : "Wishlist"}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <WishlistIcon />
      {showLabel && (
        <>
          Wishlist
          {wishlistCount > 0 && <span>({wishlistCount})</span>}
        </>
      )}
      {!showLabel && wishlistCount > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center bg-neptura-aurora px-0.5 text-[0.5rem] font-medium leading-none text-neptura-diamond"
          aria-hidden
        >
          {wishlistCount > 9 ? "9+" : wishlistCount}
        </span>
      )}
    </Link>
  );
}

function AccountNavLink({
  customer,
  loginHref,
  className,
  avatarVariant,
  onClick,
  onMouseEnter,
}: {
  customer: CustomerSummary | null;
  loginHref: string;
  className: string;
  avatarVariant?: "light" | "dark";
  onClick?: () => void;
  onMouseEnter?: () => void;
}) {
  if (customer) {
    return (
      <Link
        href="/account"
        className={`${className} inline-flex items-center gap-1.5`}
        aria-label="Your account"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        <CustomerAvatar
          customer={customer}
          size={avatarVariant ? "sm" : undefined}
          showName={!avatarVariant}
          shape="circle"
          variant={avatarVariant}
        />
      </Link>
    );
  }

  return (
    <Link
      href={loginHref}
      className={`${className} inline-flex items-center gap-1.5`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <AccountIcon />
      Sign in
    </Link>
  );
}

function UtilityAccountWishlistLinks({
  customer,
  loginHref,
  utilityClassName,
  onClick,
  onMouseEnter,
}: {
  customer: CustomerSummary | null;
  loginHref: string;
  utilityClassName: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}) {
  return (
    <>
      <WishlistNavLink
        customer={customer}
        loginHref={loginHref}
        className={utilityClassName}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      />
      <AccountNavLink
        customer={customer}
        loginHref={loginHref}
        className={utilityClassName}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      />
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;

  const [navPhase, setNavPhase] = useState(0);
  const [headerHovered, setHeaderHovered] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"collections" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);

  const loginHref = `/login?returnTo=${encodeURIComponent(pathname)}`;

  const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const overlayOpen = Boolean(activeMenu) || mobileOpen;
  const layoutPhase = !isHome ? 1 : navPhase;
  const surfacePhase = !isHome ? 1 : overlayOpen || headerHovered ? 1 : navPhase;
  const hoverSurfaceVisible = isHome && headerHovered && navPhase < 0.92;
  const expandedOpacity = 1 - rangeMap(layoutPhase, 0, 0.55, 0, 1);
  const compactLogoOpacity = rangeMap(layoutPhase, 0.35, 0.85, 0, 1);
  const isLightNav = surfacePhase > 0.45 || overlayOpen || !isHome;
  const useAdaptiveNav = isHome && surfacePhase < 1 && !overlayOpen;
  const onHero = isHome && layoutPhase < 0.55;
  const showCompactUtilityLinks = !onHero;

  useEffect(() => {
    if (!isHome) {
      setNavPhase(1);
      return;
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      const t = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));
      setNavPhase(smoothstep(t));
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isHome]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { customer: CustomerSummary | null };
        if (!cancelled) setCustomer(data.customer);
      } catch {
        if (!cancelled) setCustomer(null);
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(
          "/api/products?handle=rare-sunlight-fancy-yellow-emerald-cut-diamond-halo-ring"
        );
        if (res.ok) setFeaturedProduct(await res.json());
      } catch (err) {
        console.error("Failed to fetch featured product for navbar:", err);
      }
    }
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  const handleMouseEnterMenu = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    enterTimerRef.current = setTimeout(() => setActiveMenu("collections"), 120);
  };

  const handleMouseLeaveMenu = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    leaveTimerRef.current = setTimeout(() => setActiveMenu(null), 250);
  };

  const closeMenuImmediately = () => {
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setActiveMenu(null);
  };

  const closeMobile = () => setMobileOpen(false);
  const closeAll = () => {
    closeMenuImmediately();
    closeMobile();
  };

  const shortTitle = featuredProduct
    ? featuredProduct.title.split("—")[0].trim()
    : "";

  const nav = navClasses(isLightNav, useAdaptiveNav);
  const avatarVariant = isLightNav && !useAdaptiveNav ? "light" : "dark";
  const headerStyle = {
    "--nav-phase": surfacePhase,
  } as React.CSSProperties;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[rgba(0,0,8,0.85)] backdrop-blur-[4px] transition-opacity duration-[450ms] ${
          overlayOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        onClick={closeAll}
        aria-hidden={!overlayOpen}
      />

      <header
        className="fixed inset-x-0 top-0 z-50"
        style={headerStyle}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => {
          setHeaderHovered(false);
          handleMouseLeaveMenu();
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 border-b"
          style={{
            backgroundColor: "var(--neptura-light-bg)",
            opacity: !isHome ? 1 : navPhase,
            borderBottomColor: `rgba(74, 144, 164, ${0.12 * (!isHome ? 1 : navPhase)})`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 border-b border-neptura-light transition-opacity duration-[400ms] ease-out-expo"
          style={{
            backgroundColor: "var(--neptura-light-bg)",
            opacity: hoverSurfaceVisible ? 1 : 0,
          }}
        />
        {/* ── Mobile ── */}
        <div className="flex items-center justify-between px-5 py-4 lg:hidden">
          <button
            type="button"
            className={nav.icon}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => {
              closeMenuImmediately();
              setMobileOpen((open) => !open);
            }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link
            href="/"
            onClick={closeAll}
            className="absolute left-1/2 -translate-x-1/2 transition-opacity duration-[400ms] hover:opacity-80"
          >
            <BrandLogo variant="mobile" adaptive={useAdaptiveNav} light={isLightNav && !useAdaptiveNav} />
          </Link>

          <div className="flex items-center gap-1">
            {showCompactUtilityLinks && (
              <WishlistNavLink
                customer={customer}
                loginHref={loginHref}
                className={nav.icon}
                showLabel={false}
                onClick={closeAll}
              />
            )}
            <button type="button" className={nav.icon} aria-label="Search">
              <SearchIcon />
            </button>
            {showCompactUtilityLinks && (
              <AccountNavLink
                customer={customer}
                loginHref={loginHref}
                className={nav.icon}
                avatarVariant={avatarVariant}
                onClick={closeAll}
              />
            )}
            <button
              type="button"
              onClick={() => {
                closeAll();
                openCart();
              }}
              className={`relative ${nav.icon}`}
              aria-label="Open bag"
            >
              {itemCount > 0 && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-neptura-aurora" aria-hidden />
              )}
              <BagIcon />
            </button>
          </div>
        </div>

        {/* ── Desktop: expanded chrome above a stable compact bar ── */}
        <div className="mx-auto hidden max-w-[96rem] px-8 lg:block">
          <div
            aria-hidden={expandedOpacity < 0.05}
            className="overflow-hidden"
            style={{
              height: `${expandedOpacity * EXPANDED_BLOCK_HEIGHT}px`,
              opacity: expandedOpacity,
              pointerEvents: layoutPhase > 0.82 ? "none" : "auto",
            }}
          >
            {onHero && (
              <div
                className="relative flex items-center justify-end py-1.5"
                style={{ borderBottom: nav.tierDivider }}
              >
                <p
                  className={`pointer-events-none absolute inset-x-0 text-center font-display text-[0.85rem] font-light tracking-[0.18em] whitespace-nowrap ${
                    useAdaptiveNav
                      ? "nav-utility-adaptive"
                      : isLightNav
                        ? "text-neptura-light-muted"
                        : "text-neptura-crystal/85"
                  }`}
                >
                  No mine. No conflict. No compromise.
                </p>
                <div className="relative z-10 flex shrink-0 items-center gap-1">
                  <UtilityAccountWishlistLinks
                    customer={customer}
                    loginHref={loginHref}
                    utilityClassName={nav.utility}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center pb-2 pt-2 md:pb-2.5 md:pt-2.5">
              <Link href="/" onClick={closeAll} className="hover:opacity-80">
                <BrandLogo variant="expanded" adaptive={useAdaptiveNav} light={isLightNav && !useAdaptiveNav} />
              </Link>
            </div>
          </div>

          <div
            className="relative flex items-center"
            style={{
              paddingTop: `${4 + layoutPhase * 10}px`,
              paddingBottom: `${4 + layoutPhase * 10}px`,
            }}
          >
            <Link
              href="/"
              onClick={closeAll}
              className="shrink-0 hover:opacity-80"
              style={{
                opacity: compactLogoOpacity,
                visibility: compactLogoOpacity < 0.03 ? "hidden" : "visible",
                pointerEvents: compactLogoOpacity < 0.03 ? "none" : "auto",
              }}
              aria-hidden={compactLogoOpacity < 0.03}
              tabIndex={compactLogoOpacity < 0.03 ? -1 : undefined}
            >
              <BrandLogo variant="compact" adaptive={useAdaptiveNav} light={isLightNav && !useAdaptiveNav} />
            </Link>

            <nav
              className="absolute left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-x-10 gap-y-1"
              aria-label="Primary"
            >
              {MAIN_NAV_LINKS.map((item) => (
                <div
                  key={item.label}
                  onMouseEnter={() =>
                    item.hasMenu ? handleMouseEnterMenu() : closeMenuImmediately()
                  }
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={
                      activeMenu === "collections" && item.hasMenu
                        ? nav.navItemActive
                        : nav.navItem
                    }
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>

            <div
              className="ml-auto flex shrink-0 items-center gap-1 pl-8"
              style={{
                borderLeft:
                  (onHero && layoutPhase < 0.2 && expandedOpacity > 0.05) || showCompactUtilityLinks
                    ? nav.iconDivider
                    : "none",
              }}
            >
              {showCompactUtilityLinks && (
                <WishlistNavLink
                  customer={customer}
                  loginHref={loginHref}
                  className={nav.utility}
                  onClick={closeAll}
                  onMouseEnter={closeMenuImmediately}
                />
              )}
              <button
                type="button"
                className={nav.icon}
                aria-label="Search"
                onMouseEnter={closeMenuImmediately}
              >
                <SearchIcon />
              </button>
              {showCompactUtilityLinks && (
                <AccountNavLink
                  customer={customer}
                  loginHref={loginHref}
                  className={nav.utility}
                  avatarVariant={avatarVariant}
                  onClick={closeAll}
                  onMouseEnter={closeMenuImmediately}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  closeAll();
                  openCart();
                }}
                className={`relative ${nav.icon}`}
                aria-label="Open bag"
                onMouseEnter={closeMenuImmediately}
              >
                {itemCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 bg-neptura-aurora" aria-hidden />
                )}
                <BagIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop megamenu */}
        <div
          className={`absolute left-0 right-0 top-full hidden border-t transition-all duration-[400ms] ease-out-expo lg:block ${
            isLightNav
              ? "border-neptura-light bg-neptura-light-bg"
              : "border-neptura-ice/5 bg-neptura-void/95"
          } ${
            activeMenu === "collections"
              ? "visible translate-y-0 opacity-100"
              : "invisible pointer-events-none -translate-y-2 opacity-0"
          }`}
          onMouseEnter={() => {
            if (leaveTimerRef.current) {
              clearTimeout(leaveTimerRef.current);
              leaveTimerRef.current = null;
            }
          }}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-3 gap-12 px-8 py-14 text-left">
            <div className="space-y-5">
              <h3 className={`section-label ${isLightNav ? "text-neptura-aurora" : "text-neptura-aurora"}`}>
                The stones
              </h3>
              <ul
                className={`space-y-3.5 text-[0.72rem] font-light uppercase tracking-wider ${
                  isLightNav ? "text-neptura-light-muted" : "text-neptura-silver"
                }`}
              >
                {COLLECTION_LINKS.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      className={megamenuLinkClassName(isLightNav)}
                      onClick={closeMenuImmediately}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h3 className="section-label text-neptura-aurora">The story</h3>
              <ul
                className={`space-y-3.5 text-[0.72rem] font-light uppercase tracking-wider ${
                  isLightNav ? "text-neptura-light-muted" : "text-neptura-silver"
                }`}
              >
                {STORY_LINKS.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      className={megamenuLinkClassName(isLightNav)}
                      onClick={closeMenuImmediately}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`space-y-5 pl-10 ${
                isLightNav ? "border-l border-neptura-light" : "border-l border-neptura-ice/10"
              }`}
            >
              <h3 className="section-label text-neptura-aurora">Featured piece</h3>
              {featuredProduct ? (
                <Link
                  href={`/products/${featuredProduct.handle}`}
                  onClick={closeMenuImmediately}
                  className="group block max-w-[180px] space-y-4"
                >
                  <div
                    className={`relative aspect-product w-full overflow-hidden border bg-neptura-deep ${
                      isLightNav ? "border-neptura-light" : "border-neptura-ice/15"
                    }`}
                  >
                    {featuredProduct.featuredImage ? (
                      <Image
                        src={featuredProduct.featuredImage.url}
                        alt={featuredProduct.featuredImage.altText ?? featuredProduct.title}
                        fill
                        sizes="180px"
                        className="object-cover transition duration-500 ease-out-expo group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[0.6rem] text-neptura-ice/30">—</div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <h4
                      className={`font-serif text-[0.95rem] font-light italic leading-tight transition-colors duration-300 group-hover:text-neptura-aurora ${
                        isLightNav ? "text-neptura-light-text" : "text-neptura-crystal"
                      }`}
                    >
                      {shortTitle}
                    </h4>
                    <p className="font-sans text-[0.72rem] font-medium text-neptura-aurora">
                      {formatPrice(
                        featuredProduct.priceRange.minVariantPrice.amount,
                        featuredProduct.priceRange.minVariantPrice.currencyCode
                      )}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex h-44 items-center justify-center text-[0.68rem] font-light text-neptura-silver/30">
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-x-0 top-0 z-[45] flex max-h-[100dvh] flex-col overflow-y-auto bg-neptura-void transition-transform duration-[400ms] ease-out-expo lg:hidden ${
          mobileOpen ? "translate-y-0" : "-translate-y-full pointer-events-none"
        }`}
        style={{ paddingTop: "4.5rem", paddingBottom: "2rem" }}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col px-6" aria-label="Mobile">
          <div className="border-b border-neptura-ice/10">
            <button
              type="button"
              className="flex w-full items-center justify-between py-5 text-left"
              aria-expanded={mobileCollectionsOpen}
              onClick={() => setMobileCollectionsOpen((open) => !open)}
            >
              <span className="text-nav uppercase tracking-nav text-neptura-crystal">Collections</span>
              <span className="text-neptura-ice/60">{mobileCollectionsOpen ? "−" : "+"}</span>
            </button>
            {mobileCollectionsOpen && (
              <ul className="space-y-4 pb-5 pl-4">
                {COLLECTION_LINKS.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      className="text-meta uppercase tracking-[0.14em] text-neptura-silver transition-colors hover:text-neptura-crystal"
                      onClick={closeMobile}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {MOBILE_NAV_LINKS.filter((item) => item.label !== "Sign in").map((item) => (
            <NavLink
              key={item.href + item.label}
              href={item.href}
              className="border-b border-neptura-ice/10 py-5 text-nav uppercase tracking-nav text-neptura-silver transition-colors hover:text-neptura-crystal"
              onClick={closeMobile}
            >
              {item.label}
            </NavLink>
          ))}

          {customer ? (
            <Link
              href="/account"
              onClick={closeMobile}
              className="flex items-center gap-3 border-b border-neptura-ice/10 py-5 text-nav uppercase tracking-nav text-neptura-silver transition-colors hover:text-neptura-crystal"
            >
              <CustomerAvatar customer={customer} showName shape="circle" />
            </Link>
          ) : (
            <NavLink
              href={loginHref}
              className="border-b border-neptura-ice/10 py-5 text-nav uppercase tracking-nav text-neptura-silver transition-colors hover:text-neptura-crystal"
              onClick={closeMobile}
            >
              Sign in
            </NavLink>
          )}

          {featuredProduct && (
            <Link
              href={`/products/${featuredProduct.handle}`}
              onClick={closeMobile}
              className="mt-8 flex items-center gap-4 border border-neptura-ice/10 p-4"
            >
              <div className="relative h-20 w-[3.75rem] shrink-0 overflow-hidden border border-neptura-ice/15 bg-neptura-deep">
                {featuredProduct.featuredImage && (
                  <Image
                    src={featuredProduct.featuredImage.url}
                    alt={featuredProduct.featuredImage.altText ?? featuredProduct.title}
                    fill
                    sizes="60px"
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                <p className="section-label text-neptura-aurora">Featured piece</p>
                <p className="mt-1 font-serif text-sm font-light italic text-neptura-crystal">{shortTitle}</p>
              </div>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
