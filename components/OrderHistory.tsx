import Image from "next/image";
import Link from "next/link";
import { formatFulfillmentStatus, formatOrderDate } from "@/lib/customer-auth/orders";
import type { OrderSummary } from "@/lib/customer-auth/types";
import { formatPrice } from "@/lib/shopify";

type OrderHistoryProps = {
  orders: OrderSummary[];
};

export default function OrderHistory({ orders }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="border border-neptura-light bg-neptura-light-bg p-6 sm:p-8">
        <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
          Orders
        </p>
        <p className="mt-3 text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
          You haven&apos;t placed any orders yet. When you do, they&apos;ll appear here with
          tracking and details.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-block text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
        >
          Shop the collection →
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-neptura-light bg-neptura-light">
      <div className="border-b border-neptura-light bg-neptura-light-bg px-6 py-5 sm:px-8">
        <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
          Orders
        </p>
        <p className="mt-1 text-[0.72rem] font-light text-neptura-light-muted">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      <ul className="divide-y divide-neptura-light">
        {orders.map((order) => (
          <li key={order.id} className="bg-neptura-light-bg px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-display text-lg font-light text-neptura-light-text">
                  {order.name}
                </p>
                <p className="mt-1 text-[0.72rem] font-light text-neptura-light-muted">
                  {formatOrderDate(order.processedAt)} ·{" "}
                  {formatFulfillmentStatus(order.fulfillmentStatus)}
                </p>
              </div>
              <p className="font-display text-lg font-light text-neptura-light-text">
                {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
              </p>
            </div>

            {order.lineItems.length > 0 && (
              <ul className="mt-5 space-y-3">
                {order.lineItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <span className="relative block h-14 w-11 shrink-0 bg-neptura-light-surface">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt ?? item.title}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-[0.12em] text-neptura-light-muted">
                          —
                        </span>
                      )}
                    </span>
                    <span className="text-[0.78rem] font-light leading-snug text-neptura-light-muted">
                      {item.title}
                      {item.quantity > 1 ? ` · Qty ${item.quantity}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={order.statusPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
            >
              View order & tracking →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
