import Link from "next/link";
import { redirect } from "next/navigation";
import AccountAddressesSection from "@/components/AccountAddressesSection";
import AccountMarketingSection from "@/components/AccountMarketingSection";
import AccountPhoneSection from "@/components/AccountPhoneSection";
import AccountProfileSection from "@/components/AccountProfileSection";
import CustomerAvatar from "@/components/CustomerAvatar";
import OrderHistory from "@/components/OrderHistory";
import { fetchCustomerProfile, isProfileComplete } from "@/lib/customer-auth/customer";
import { fetchCustomerOrders } from "@/lib/customer-auth/orders";
import { getCustomerAccessToken } from "@/lib/customer-auth/session";

export const metadata = {
  title: "Your account | Neptura",
  description: "Manage your Neptura account.",
};

export default async function AccountPage() {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    redirect("/login?returnTo=/account");
  }

  const [customer, orders] = await Promise.all([
    fetchCustomerProfile(accessToken),
    fetchCustomerOrders(accessToken),
  ]);

  if (!customer) {
    redirect("/login?returnTo=/account");
  }

  const profileComplete = isProfileComplete(customer);

  return (
    <div className="min-h-screen bg-neptura-light-bg pt-28 pb-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="space-y-4 border-b border-neptura-light pb-8">
          <span className="section-label">Account</span>
          <div className="flex items-center gap-4">
            <CustomerAvatar customer={customer} size="md" />
            <div>
              <h1 className="font-display text-3xl font-light text-neptura-light-text">
                {customer.firstName ?? customer.displayName ?? "Your account"}
              </h1>
              {customer.email && (
                <p className="mt-1 text-[0.8rem] font-light text-neptura-light-muted">
                  {customer.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {!profileComplete && (
          <div className="mt-8 border border-neptura-light bg-neptura-light-surface/40 px-6 py-5">
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

        <AccountProfileSection customer={customer} />

        <AccountPhoneSection customer={customer} />

        <AccountAddressesSection customer={customer} />

        <AccountMarketingSection customer={customer} />

        <div className="mt-10">
          <OrderHistory orders={orders} />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/shop" className="btn-light-secondary inline-block text-center">
            Continue shopping
          </Link>
          <Link
            href="/api/auth/logout?returnTo=/login"
            className="text-center text-[0.72rem] uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora sm:text-right"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}
