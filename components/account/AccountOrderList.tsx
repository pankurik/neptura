import Image from "next/image";
import Link from "next/link";
import {
  formatOrderDateShort,
  formatOrderStatusLabel,
  orderDetailPath,
  orderPieceCount,
} from "@/lib/customer-auth/orders";
import { formatPrice } from "@/lib/shopify";
import type { OrderLineItemSummary, OrderSummary } from "@/lib/customer-auth/types";

type UniquePreviewItem = {
  item: OrderLineItemSummary;
  quantity: number;
};

function groupLineItemsForPreview(items: OrderLineItemSummary[]): UniquePreviewItem[] {
  const groups = new Map<string, UniquePreviewItem>();

  for (const item of items) {
    const key = item.imageUrl ?? item.title ?? item.id;
    const existing = groups.get(key);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      groups.set(key, { item, quantity: item.quantity });
    }
  }

  return Array.from(groups.values());
}

function getPrimaryPreviewItem(order: OrderSummary): UniquePreviewItem | null {
  return groupLineItemsForPreview(order.lineItems)[0] ?? null;
}

function formatOrderPrice(order: OrderSummary): string | null {
  const amount = parseFloat(order.totalPrice.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode);
}

function OrderThumb({ order }: { order: OrderSummary }) {
  const preview = getPrimaryPreviewItem(order);

  return (
    <div className="relative h-14 w-11 shrink-0 bg-neptura-light-surface">
      {preview?.item.imageUrl ? (
        <Image
          src={preview.item.imageUrl}
          alt={preview.item.imageAlt ?? preview.item.title}
          fill
          sizes="44px"
          className="object-contain p-1"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-[0.12em] text-neptura-light-muted">
          —
        </span>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: OrderSummary }) {
  const pieces = orderPieceCount(order);
  const price = formatOrderPrice(order);
  const itemLabel = `${pieces} ${pieces === 1 ? "item" : "items"}`;

  return (
    <li>
      <Link
        href={orderDetailPath(order.id)}
        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neptura-light-surface/60 sm:gap-5 sm:px-6 sm:py-5"
      >
        <OrderThumb order={order} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-display text-lg font-light text-neptura-light-text">
              {order.name}
            </span>
            <span className="text-[0.62rem] font-normal uppercase tracking-[0.14em] text-neptura-aurora">
              {formatOrderStatusLabel(order)}
            </span>
          </div>
          <p className="mt-1 text-[0.72rem] font-light text-neptura-light-muted">
            {formatOrderDateShort(order.processedAt)} · {itemLabel}
          </p>
        </div>

        <div className="shrink-0 text-right">
          {price ? (
            <p className="font-display text-base font-light tabular-nums text-neptura-light-text">
              {price}
            </p>
          ) : null}
          <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors group-hover:text-neptura-light-text">
            View →
          </span>
        </div>
      </Link>
    </li>
  );
}

type AccountOrderListProps = {
  orders: OrderSummary[];
};

export default function AccountOrderList({ orders }: AccountOrderListProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="border border-neptura-light bg-neptura-light-bg">
      <ul className="divide-y divide-neptura-light">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </ul>
    </div>
  );
}

export const STONES_PREVIEW_LIMIT = 5;
