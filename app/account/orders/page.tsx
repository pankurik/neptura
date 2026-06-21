import Link from "next/link";
import { redirect } from "next/navigation";
import AccountOrdersPanel from "@/components/account/AccountOrdersPanel";
import AccountOrdersSupport from "@/components/account/AccountOrdersSupport";
import AccountSubpageHero from "@/components/account/AccountSubpageHero";
import AccountSubpageNav from "@/components/account/AccountSubpageNav";
import SiteFooter from "@/components/SiteFooter";
import { fetchCustomerOrders, summarizeOrderCollection } from "@/lib/customer-auth/orders";
import { readCustomerAccessToken } from "@/lib/customer-auth/session";

export const metadata = {
  title: "All Orders | Neptura",
  description: "Your full Neptura order history.",
};

export default async function AccountOrdersPage() {
  const accessToken = readCustomerAccessToken();

  if (!accessToken) {
    redirect("/login?returnTo=/account/orders");
  }

  const orders = await fetchCustomerOrders(accessToken);
  const summary = summarizeOrderCollection(orders);

  return (
    <div className="flex min-h-screen flex-col bg-neptura-light-bg">
      <AccountSubpageHero label="Your collection" title="All Orders" compact gradient />

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 pb-16 pt-6 md:px-10 md:pt-8 lg:px-12">
        {orders.length > 0 ? (
          <>
            <AccountOrdersPanel orders={orders} summary={summary} />
            <AccountOrdersSupport className="mt-8" />
            <AccountSubpageNav backHref="/account#stones" className="mt-8" />
          </>
        ) : (
          <>
            <div className="border border-neptura-light bg-neptura-light-bg">
              <div className="border-b border-neptura-light px-5 py-5 sm:px-8">
                <p className="font-display text-xl font-light text-neptura-light-text">
                  Your collection is waiting
                </p>
                <p className="mt-2 text-[0.8rem] font-light leading-relaxed text-neptura-light-muted">
                  When you place an order, it will appear here with tracking and details.
                </p>
              </div>
              <div className="px-6 py-10 text-center">
                <Link
                  href="/shop"
                  className="inline-block text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
                >
                  Shop the collection →
                </Link>
              </div>
            </div>
            <AccountOrdersSupport className="mt-8" />
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
