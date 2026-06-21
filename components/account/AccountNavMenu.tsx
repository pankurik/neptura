"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AccountSignOutLink from "@/components/account/AccountSignOutLink";
import CustomerAvatar from "@/components/CustomerAvatar";
import { getCustomerFullName } from "@/lib/customer-auth/display";
import type { CustomerSummary } from "@/lib/customer-auth/types";
import { cn } from "@/lib/utils";

const MENU_CLOSE_DELAY_MS = 140;

type AccountNavMenuProps = {
  customer: CustomerSummary;
  className?: string;
  avatarVariant?: "light" | "dark";
  isLightNav?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNavigate?: () => void;
  onMouseEnter?: () => void;
};

type AccountMenuItem = {
  label: string;
  href: string;
  count?: number;
};

function buildAccountMenuItems(customer: CustomerSummary): AccountMenuItem[] {
  return [
    { label: "All orders", href: "/account/orders" },
    { label: "Account", href: "/account#account" },
    {
      label: "Bespoke",
      href: "/account#bespoke",
      count: customer.bespokeCommissions.length || undefined,
    },
  ];
}

function menuItemClass(isLightNav: boolean) {
  return cn(
    "account-nav-menu-item block w-full border-l-2 py-2.5 pl-[calc(1rem-2px)] pr-4 text-left text-[0.62rem] font-normal uppercase tracking-[0.14em]",
    isLightNav
      ? "border-transparent text-neptura-light-muted"
      : "border-transparent text-neptura-silver",
  );
}

function menuPanelClass(isLightNav: boolean) {
  return cn(
    "border",
    isLightNav
      ? "border-neptura-light bg-neptura-light-bg"
      : "border-neptura-ice/15 bg-neptura-neptune",
  );
}

function AccountIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="0.75" />
      <path
        d="M3.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AccountNavMenuLinks({
  customer,
  isLightNav = true,
  className = "",
  onNavigate,
  showSignOut = true,
}: {
  customer: CustomerSummary;
  isLightNav?: boolean;
  className?: string;
  onNavigate?: () => void;
  showSignOut?: boolean;
}) {
  const items = buildAccountMenuItems(customer);

  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={menuItemClass(isLightNav)} onClick={onNavigate}>
            {item.label}
            {item.count !== undefined && item.count > 0 ? ` (${item.count})` : ""}
          </Link>
        </li>
      ))}
      {showSignOut ? (
        <li className={items.length > 0 ? "border-t border-neptura-light/40 pt-1" : undefined}>
          <AccountSignOutLink
            className={menuItemClass(isLightNav)}
            onNavigate={onNavigate}
          />
        </li>
      ) : null}
    </ul>
  );
}

export default function AccountNavMenu({
  customer,
  className = "",
  avatarVariant,
  isLightNav = true,
  open: controlledOpen,
  onOpenChange,
  onNavigate,
  onMouseEnter,
}: AccountNavMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const name = getCustomerFullName(customer);
  const items = buildAccountMenuItems(customer);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    setOpen(true);
    onMouseEnter?.();
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), MENU_CLOSE_DELAY_MS);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuPosition(null);
      return;
    }

    function updateMenuPosition() {
      if (!triggerRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  function handleNavigate() {
    setOpen(false);
    onNavigate?.();
  }

  function handleTriggerClick() {
    setOpen(false);
    onNavigate?.();
  }

  const menuPanel = open && menuPosition ? (
    <div
      ref={menuRef}
      className="fixed z-[60] min-w-[11.5rem] pt-2"
      style={{ top: menuPosition.top, right: menuPosition.right }}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <div
        id={menuId}
        role="menu"
        aria-label="Account"
        className={cn("py-1", menuPanelClass(isLightNav))}
      >
        {(name || customer.email) && (
          <div
            className={cn(
              "border-b px-4 py-3",
              isLightNav ? "border-neptura-light" : "border-neptura-ice/10",
            )}
          >
            {name ? (
              <p
                className={cn(
                  "font-display text-[0.95rem] font-light leading-snug",
                  isLightNav ? "text-neptura-light-text" : "text-neptura-crystal",
                )}
              >
                {name}
              </p>
            ) : null}
            {customer.email ? (
              <p
                className={cn(
                  "truncate text-[0.68rem] font-light",
                  isLightNav ? "text-neptura-light-muted" : "text-neptura-silver",
                  name && "mt-0.5",
                )}
              >
                {customer.email}
              </p>
            ) : null}
          </div>
        )}

        <ul>
          {items.map((item) => (
            <li key={item.href} role="none">
              <Link
                href={item.href}
                role="menuitem"
                className={menuItemClass(isLightNav)}
                onClick={handleNavigate}
              >
                {item.label}
                {item.count !== undefined && item.count > 0 ? ` (${item.count})` : ""}
              </Link>
            </li>
          ))}
        </ul>

        <div
          className={cn(
            "mt-1 border-t pt-1",
            isLightNav ? "border-neptura-light/30" : "border-neptura-ice/10",
          )}
        >
          <AccountSignOutLink
            className={menuItemClass(isLightNav)}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        ref={triggerRef}
        href="/account"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Your account"
        className={cn(
          className,
          "account-nav-menu-trigger inline-flex items-center gap-1.5 transition-opacity duration-200",
          open && "opacity-100",
        )}
        onClick={handleTriggerClick}
        onFocus={openMenu}
        onBlur={scheduleClose}
      >
        <CustomerAvatar
          customer={customer}
          size={avatarVariant ? "sm" : undefined}
          showName={!avatarVariant}
          shape="circle"
          variant={avatarVariant}
        />
      </Link>

      {typeof document !== "undefined" && menuPanel
        ? createPortal(menuPanel, document.body)
        : null}
    </div>
  );
}

export function AccountSignInLink({
  loginHref,
  className = "",
  onClick,
  onMouseEnter,
}: {
  loginHref: string;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}) {
  return (
    <Link
      href={loginHref}
      className={cn(className, "inline-flex items-center gap-1.5")}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <AccountIcon />
      Sign in
    </Link>
  );
}
