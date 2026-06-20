"use client";

import Link from "next/link";
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
  wishlistProducts: Product[];
};

export default function AccountDashboardLayout({
  customer,
  orders,
  profileComplete,
  wishlistProducts,
}: AccountDashboardLayoutProps) {
  const { activeSection, scrollToSection } = useAccountSectionNav("account");

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
            <div className="mb-12 border border-neptura-light bg-neptura-light-surface/40 px-6 py-5">
              <p className="text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
                Complete your profile so we can address you by name across Neptura.
              </p>
              <Link
                href="/account/setup?returnTo=/account"
                className="btn-light-primary mt-5 inline-block"
              >
                Complete profile
              </Link>
            </div>
          )}

          <div className="space-y-16 lg:space-y-20">
            <AccountSettingsSection customer={customer} />
            <AccountDeliverySection customer={customer} />
            <AccountStonesSection orders={orders} />
            <AccountWishlistSection
              products={wishlistProducts}
              handleCount={customer.wishlistHandles.length}
            />
            <AccountBespokeSection commissions={customer.bespokeCommissions} />
          </div>
        </main>
      </div>
    </div>
  );
}
