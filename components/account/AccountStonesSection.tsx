import Image from "next/image";
import Link from "next/link";
import AccountSectionHeader from "@/components/account/AccountSectionHeader";
import { formatFulfillmentStatus } from "@/lib/customer-auth/orders";
import type { OrderSummary } from "@/lib/customer-auth/types";

type StoneCard = {
  id: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  processedAt: string;
  fulfillmentStatus: string;
  statusPageUrl: string;
  quantity: number;
};

function formatStoneDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

function formatStatusBadge(status: string): string {
  if (status === "FULFILLED") return "DELIVERED";
  return formatFulfillmentStatus(status).toUpperCase();
}

function flattenOrdersToStones(orders: OrderSummary[]): StoneCard[] {
  const stones: StoneCard[] = [];

  for (const order of orders) {
    if (order.lineItems.length === 0) {
      stones.push({
        id: order.id,
        title: order.name,
        imageUrl: null,
        imageAlt: null,
        processedAt: order.processedAt,
        fulfillmentStatus: order.fulfillmentStatus,
        statusPageUrl: order.statusPageUrl,
        quantity: 1,
      });
      continue;
    }

    for (const item of order.lineItems) {
      stones.push({
        id: `${order.id}-${item.id}`,
        title: item.title,
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
        processedAt: order.processedAt,
        fulfillmentStatus: order.fulfillmentStatus,
        statusPageUrl: order.statusPageUrl,
        quantity: item.quantity,
      });
    }
  }

  return stones;
}

function StoneCardContent({ stone }: { stone: StoneCard }) {
  return (
    <article className="flex h-full flex-col border border-neptura-light bg-neptura-light-bg">
      <div className="relative aspect-product w-full bg-neptura-light-surface">
        {stone.imageUrl ? (
          <Image
            src={stone.imageUrl}
            alt={stone.imageAlt ?? stone.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              viewBox="0 0 48 56"
              className="h-16 w-14 text-neptura-aurora/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              aria-hidden
            >
              <path d="M24 2 L44 18 L24 54 L4 18 Z" />
              <path d="M4 18 L24 18 L44 18" />
              <path d="M24 18 L24 54" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-product font-light text-neptura-light-text">{stone.title}</h3>
        {stone.quantity > 1 && (
          <p className="mt-1 text-[0.72rem] font-light text-neptura-light-muted">
            Qty {stone.quantity}
          </p>
        )}
        <p className="mt-2 text-[0.72rem] font-light text-neptura-light-muted">
          {formatStoneDate(stone.processedAt)}
        </p>
        <span className="mt-4 inline-block self-start border border-neptura-aurora/20 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-neptura-aurora">
          {formatStatusBadge(stone.fulfillmentStatus)}
        </span>
        <Link
          href={stone.statusPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-5 text-[0.68rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
        >
          View order →
        </Link>
      </div>
    </article>
  );
}

type AccountStonesSectionProps = {
  orders: OrderSummary[];
};

export default function AccountStonesSection({ orders }: AccountStonesSectionProps) {
  const stones = flattenOrdersToStones(orders);

  return (
    <section aria-labelledby="account-stones-title">
      <AccountSectionHeader
        id="stones"
        label="Your collection"
        title="My stones"
        subtitle="Every piece you've brought into your universe."
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:gap-6">
        {stones.map((stone) => (
          <StoneCardContent key={stone.id} stone={stone} />
        ))}

        <Link
          href="/shop"
          className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-neptura-light bg-neptura-light-surface/50 p-8 text-center transition-colors hover:border-neptura-aurora/40 hover:bg-neptura-light-surface/70"
        >
          <p className="font-display text-xl font-light text-neptura-light-text">
            Your next stone awaits
          </p>
          <span className="mt-4 text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora">
            Explore the collection →
          </span>
        </Link>
      </div>
    </section>
  );
}
