import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  fetchCustomerOrder,
  formatOrderDate,
  formatOrderStatusBadge,
} from "@/lib/customer-auth/orders";
import { readCustomerAccessToken } from "@/lib/customer-auth/session";
import { formatPrice } from "@/lib/shopify";

type OrderPageProps = {
  params: { orderId: string };
};

export async function generateMetadata({ params }: OrderPageProps) {
  return {
    title: `Order ${params.orderId} | Neptura`,
  };
}


export default async function AccountOrderPage({ params }: OrderPageProps) {
  const accessToken = readCustomerAccessToken();

  if (!accessToken) {
    redirect(`/login?returnTo=/account/orders/${params.orderId}`);
  }

  const order = await fetchCustomerOrder(accessToken, params.orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neptura-light-bg px-6 pb-14 pt-28 md:px-10 lg:px-14">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-neptura-light pb-8">
          <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
            Order
          </p>
          <h1 className="mt-2 font-display text-3xl font-light text-neptura-light-text">
            {order.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.78rem] font-light text-neptura-light-muted">
            <span>{formatOrderDate(order.processedAt)}</span>
            <span>
              {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
            </span>
            <span className="border border-neptura-aurora/20 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-neptura-aurora">
              {formatOrderStatusBadge(order)}
            </span>
          </div>
        </header>

        <div className="mt-8 space-y-4">
          {order.lineItems.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 border border-neptura-light bg-neptura-light-bg p-4 sm:gap-5 sm:p-5"
            >
              <div className="relative aspect-product w-20 shrink-0 bg-neptura-light-surface sm:w-24">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt ?? item.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[0.65rem] text-neptura-light-muted">
                    No image
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h2 className="font-display text-lg font-light text-neptura-light-text sm:text-xl">
                  {item.title}
                </h2>
                {item.quantity > 1 && (
                  <p className="mt-2 text-[0.72rem] font-light text-neptura-light-muted">
                    Qty {item.quantity}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 border-t border-neptura-light pt-8">
          <a
            href={order.statusPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
          >
            Track on Shopify →
          </a>
        </div>
      </div>
    </div>
  );
}
