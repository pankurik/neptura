import { redirect } from "next/navigation";
import AccountOrderList from "@/components/account/AccountOrderList";
import { fetchCustomerOrders } from "@/lib/customer-auth/orders";
import { readCustomerAccessToken } from "@/lib/customer-auth/session";

export const metadata = {
  title: "All orders | Neptura",
  description: "Your full Neptura order history.",
};

export default async function AccountOrdersPage() {
  const accessToken = readCustomerAccessToken();

  if (!accessToken) {
    redirect("/login?returnTo=/account/orders");
  }

  const orders = await fetchCustomerOrders(accessToken);

  return (
    <div className="min-h-screen bg-neptura-light-bg px-6 pb-14 pt-28 md:px-10 lg:px-14">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-neptura-light pb-8">
          <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
            Your collection
          </p>
          <h1 className="mt-2 font-display text-3xl font-light text-neptura-light-text">
            All orders
          </h1>
          <p className="mt-2 text-[0.8rem] font-light text-neptura-light-muted">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </header>

        <div className="mt-8">
          {orders.length > 0 ? (
            <AccountOrderList orders={orders} />
          ) : (
            <div className="border border-dashed border-neptura-light bg-neptura-light-surface/50 px-6 py-10 text-center">
              <p className="font-display text-lg font-light text-neptura-light-text">
                No orders yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
