"use client";

import { useCallback, useEffect, useState } from "react";
import AccountSignOutLink from "@/components/account/AccountSignOutLink";
import AccountCosmicBackdrop from "@/components/account/AccountCosmicBackdrop";
import CustomerAvatar from "@/components/CustomerAvatar";
import { formatMemberSince, getCustomerFullName } from "@/lib/customer-auth/display";
import type { CustomerSummary, OrderSummary } from "@/lib/customer-auth/types";

type NavItem = {
  id: string;
  label: string;
  hash: string;
  count?: number;
};

type AccountSidebarProps = {
  customer: CustomerSummary;
  orders: OrderSummary[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
};

function buildNavItems(customer: CustomerSummary, orders: OrderSummary[]): NavItem[] {
  return [
    { id: "account", label: "Account", hash: "#account" },
    {
      id: "addresses",
      label: "Addresses",
      hash: "#addresses",
      count: customer.addresses.length || undefined,
    },
    { id: "stones", label: "My stones", hash: "#stones", count: orders.length || undefined },
    {
      id: "wishlist",
      label: "Wishlist",
      hash: "#wishlist",
      count: customer.wishlistHandles.length || undefined,
    },
    {
      id: "bespoke",
      label: "Bespoke",
      hash: "#bespoke",
      count: customer.bespokeCommissions.length || undefined,
    },
  ];
}

const signOutLinkClassName =
  "account-action-btn block w-full border border-neptura-ice/20 py-2.5 text-center text-[0.62rem] font-light uppercase tracking-[0.14em] text-neptura-ice transition-colors hover:border-neptura-ice/35 hover:text-neptura-diamond";

function NavLinks({
  items,
  activeSection,
  onNavigate,
  className = "",
}: {
  items: NavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  className?: string;
}) {
  return (
    <nav className={className} aria-label="Account sections">
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = activeSection === item.id;

          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onNavigate(item.id)}
                className={`account-sidebar-nav flex w-full items-baseline gap-1 border-l-2 py-2.5 pl-4 pr-2 text-left text-[0.68rem] font-normal uppercase tracking-nav ${
                  isActive
                    ? "border-neptura-aurora text-neptura-diamond"
                    : "border-transparent text-neptura-ice hover:text-neptura-silver"
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-neptura-ice/70">({item.count})</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function AccountSidebar({
  customer,
  orders,
  activeSection,
  onNavigate,
}: AccountSidebarProps) {
  const navItems = buildNavItems(customer, orders);
  const name = getCustomerFullName(customer);
  const memberSince = formatMemberSince(customer.memberSince);

  return (
    <>
      {/* Desktop sidebar — self-start so sticky pins while main content scrolls */}
      <aside className="account-sidebar-cosmic relative hidden w-60 shrink-0 flex-col self-start overflow-hidden md:sticky md:top-0 md:flex md:h-screen md:px-6 md:pb-10 md:pt-28">
        <AccountCosmicBackdrop variant="sidebar" />
        <div className="relative z-[1] flex flex-1 flex-col">
          <div className="flex flex-col items-start gap-4">
            <CustomerAvatar customer={customer} size="xl" variant="dark" shape="circle" />
            <div className="min-w-0">
              {name && (
                <p className="font-display text-[1.35rem] font-light leading-snug text-neptura-diamond">
                  {name}
                </p>
              )}
              {customer.email && (
                <p className={`truncate text-[0.78rem] font-light text-neptura-ice ${name ? "mt-0.5" : ""}`}>
                  {customer.email}
                </p>
              )}
              {memberSince && (
                <p className="mt-1 text-[0.68rem] font-light text-neptura-ice/70">
                  Member since {memberSince}
                </p>
              )}
            </div>
          </div>

          <NavLinks
            items={navItems}
            activeSection={activeSection}
            onNavigate={onNavigate}
            className="mt-10"
          />

          <div className="mt-auto pt-6">
            <AccountSignOutLink className={signOutLinkClassName} />
          </div>
        </div>
      </aside>

      {/* Mobile: identity + horizontal nav — sticks below site header */}
      <div className="account-sidebar-cosmic relative sticky top-28 z-20 flex flex-col overflow-hidden px-6 py-6 md:hidden">
        <AccountCosmicBackdrop variant="sidebar" />
        <div className="relative z-[1] flex flex-col">
        <div className="flex items-center gap-4">
          <CustomerAvatar customer={customer} size="xl" variant="dark" shape="circle" />
          <div className="min-w-0 flex-1">
            {name && (
              <p className="font-display text-[1.25rem] font-light text-neptura-diamond">{name}</p>
            )}
            {customer.email && (
              <p className={`truncate text-[0.75rem] font-light text-neptura-ice ${name ? "mt-0.5" : ""}`}>
                {customer.email}
              </p>
            )}
            {memberSince && (
              <p className="mt-1 text-[0.65rem] font-light text-neptura-ice/70">
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>

        <div className="-mx-6 mt-5 overflow-x-auto px-6 pb-1">
          <ul className="flex gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`whitespace-nowrap border px-3 py-2 text-[0.62rem] uppercase tracking-[0.12em] transition-colors ${
                      isActive
                        ? "border-neptura-aurora text-neptura-diamond"
                        : "border-neptura-ice/25 text-neptura-ice hover:border-neptura-ice/50"
                    }`}
                  >
                    {item.label}
                    {item.count !== undefined && item.count > 0 ? ` (${item.count})` : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-5">
          <AccountSignOutLink className={signOutLinkClassName} />
        </div>
        </div>
      </div>
    </>
  );
}

export function useAccountSectionNav(defaultSection = "account") {
  const [activeSection, setActiveSection] = useState(defaultSection);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveSection(sectionId);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(hash);
    });
  }, []);

  useEffect(() => {
    const sectionIds = ["account", "addresses", "stones", "wishlist", "bespoke"];
    const scrollOffset = 140;

    function resolveActiveSection(): string {
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        if (element.getBoundingClientRect().top <= scrollOffset) {
          current = id;
        }
      }

      return current;
    }

    function handleScroll() {
      setActiveSection((previous) => {
        const next = resolveActiveSection();
        return previous === next ? previous : next;
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return { activeSection, scrollToSection };
}
