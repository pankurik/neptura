import Link from "next/link";
import AccountOrderList, { STONES_PREVIEW_LIMIT } from "@/components/account/AccountOrderList";
import AccountSectionHeader from "@/components/account/AccountSectionHeader";
import type { OrderSummary } from "@/lib/customer-auth/types";

type AccountStonesSectionProps = {
  orders: OrderSummary[];
};

export default function AccountStonesSection({ orders }: AccountStonesSectionProps) {
  const previewOrders = orders.slice(0, STONES_PREVIEW_LIMIT);

  return (
    <section aria-labelledby="account-stones-title">
      <AccountSectionHeader
        id="stones"
        label="Your collection"
        title="My stones"
        subtitle="Every piece you've brought into your universe."
      />

      <div className="mt-8">
        {previewOrders.length > 0 ? (
          <AccountOrderList orders={previewOrders} />
        ) : (
          <div className="border border-dashed border-neptura-light bg-neptura-light-surface/50 px-6 py-10 text-center">
            <p className="font-display text-lg font-light text-neptura-light-text">
              No orders yet
            </p>
            <p className="mt-2 text-[0.8rem] font-light leading-relaxed text-neptura-light-muted">
              When you place an order, it will appear here.
            </p>
          </div>
        )}

        <Link
          href="/account/orders"
          className="mt-4 block w-full border border-neptura-light bg-neptura-light-bg py-3 text-center text-[0.68rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:border-neptura-aurora/35 hover:text-neptura-light-text"
        >
          Show all orders
        </Link>
      </div>
    </section>
  );
}
