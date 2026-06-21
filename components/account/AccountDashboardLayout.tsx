"use client";

import { useEffect } from "react";
import AccountSidebar, { useAccountSectionNav } from "@/components/account/AccountSidebar";
import AccountBespokeSection from "@/components/account/AccountBespokeSection";
import AccountDeliverySection from "@/components/account/AccountDeliverySection";
import AccountSettingsSection from "@/components/account/AccountSettingsSection";
import AccountStonesSection from "@/components/account/AccountStonesSection";
import AccountWishlistSection from "@/components/account/AccountWishlistSection";
import type { CustomerSummary, OrderSummary } from "@/lib/customer-auth/types";
import type { Product } from "@/lib/types";

type AccountDashboardLayoutProps = {
  customer: CustomerSummary;
  orders: OrderSummary[];
  profileComplete: boolean;
  profileRedirectTo?: string;
  wishlistProducts: Product[];
};

export default function AccountDashboardLayout({
  customer,
  orders,
  profileComplete,
  profileRedirectTo,
  wishlistProducts,
}: AccountDashboardLayoutProps) {
  const { activeSection, scrollToSection } = useAccountSectionNav("account");

  useEffect(() => {
    if (profileComplete) return;
    scrollToSection("account");
  }, [profileComplete, scrollToSection]);

  return (
    <div className="min-h-screen bg-neptura-light-bg">
      <div className="flex flex-col md:flex-row">
        <AccountSidebar
          customer={customer}
          orders={orders}
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />

        <main className="min-w-0 flex-1 bg-neptura-light-bg px-6 pb-10 pt-28 md:px-10 md:pb-12 md:pt-28 lg:px-14 lg:pb-14 lg:pt-28">
          {!profileComplete && (
            <div className="account-page-enter account-page-enter--0 mb-12 border border-neptura-light bg-neptura-light-surface/40 px-6 py-5">
              <p className="font-display text-xl font-light text-neptura-light-text">
                Welcome to Neptura
              </p>
              <p className="mt-2 text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
                Add your name below so we can address you across orders and communications.
              </p>
            </div>
          )}

          <div className="space-y-16 lg:space-y-20">
            <div className="account-page-enter account-page-enter--1">
              <AccountSettingsSection
                customer={customer}
                openProfileEditor={!profileComplete}
                profileRedirectTo={profileRedirectTo}
              />
            </div>
            <div className="account-page-enter account-page-enter--2">
              <AccountDeliverySection customer={customer} />
            </div>
            <div className="account-page-enter account-page-enter--3">
              <AccountStonesSection orders={orders} />
            </div>
            <div className="account-page-enter account-page-enter--4">
              <AccountWishlistSection
                products={wishlistProducts}
                handleCount={customer.wishlistHandles.length}
              />
            </div>
            <div className="account-page-enter account-page-enter--5">
              <AccountBespokeSection commissions={customer.bespokeCommissions} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
