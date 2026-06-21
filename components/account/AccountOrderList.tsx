import Image from "next/image";
import Link from "next/link";
import OrderGemPlaceholder from "@/components/account/OrderGemPlaceholder";
import {
  formatOrderDateShort,
  formatOrderProductPreview,
  formatOrderStatusBadge,
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
    <div className="relative aspect-[3/4] w-11 shrink-0 overflow-hidden bg-neptura-light-surface sm:w-12">
      {preview?.item.imageUrl ? (
        <Image
          src={preview.item.imageUrl}
          alt={preview.item.imageAlt ?? preview.item.title}
          fill
          sizes="48px"
          className="object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-neptura-aurora/45">
          <OrderGemPlaceholder className="h-8 w-8" />
        </span>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: OrderSummary }) {
  const pieces = orderPieceCount(order);
  const price = formatOrderPrice(order);
  const itemLabel = `${pieces} ${pieces === 1 ? "item" : "items"}`;
  const productPreview = formatOrderProductPreview(order);

  return (
    <li>
      <Link
        href={orderDetailPath(order.id)}
        className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-neptura-light-surface/50 sm:flex-row sm:items-start sm:gap-6 sm:px-8 sm:py-6"
      >
        <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-6">
          <OrderThumb order={order} />

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-display text-xl font-light text-neptura-light-text">
                {order.name}
              </span>
              <span className="border border-neptura-aurora/20 px-2 py-0.5 text-[0.62rem] font-normal uppercase tracking-[0.14em] text-neptura-aurora">
                {formatOrderStatusBadge(order)}
              </span>
            </div>

            <p className="mt-2 text-[0.72rem] font-light text-neptura-light-muted">
              {formatOrderDateShort(order.processedAt)} · {itemLabel}
            </p>

            {productPreview ? (
              <p
                className="mt-1.5 line-clamp-2 font-display text-[0.85rem] font-light italic leading-snug text-neptura-light-muted"
                title={productPreview}
              >
                {productPreview}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-neptura-light pt-4 sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:border-0 sm:pt-0.5">
          {price ? (
            <p className="font-display text-[1.35rem] font-light tabular-nums text-neptura-light-text sm:text-[1.5rem]">
              {price}
            </p>
          ) : (
            <span />
          )}
          <span className="text-[0.62rem] uppercase tracking-[0.14em] text-neptura-aurora underline decoration-neptura-aurora/35 underline-offset-[3px] transition-colors group-hover:text-neptura-light-text">
            View order →
          </span>
        </div>
      </Link>
    </li>
  );
}

type AccountOrderListProps = {
  orders: OrderSummary[];
  showHeader?: boolean;
  embedded?: boolean;
  totalCount?: number;
  filteredCount?: number;
  visibleCount?: number;
  footer?: React.ReactNode;
};

function OrderListHeader({
  totalCount,
  filteredCount,
  visibleCount,
}: {
  totalCount: number;
  filteredCount: number;
  visibleCount: number;
}) {
  const isFiltered = filteredCount < totalCount;
  const isPaginated = visibleCount < filteredCount;

  let primaryLine = `${totalCount} ${totalCount === 1 ? "order" : "orders"} in your collection`;

  if (isFiltered) {
    primaryLine = `${filteredCount} of ${totalCount} orders match`;
  }

  let secondaryLine: string | null = null;

  if (isPaginated) {
    secondaryLine = `Showing ${visibleCount} of ${filteredCount}`;
  }

  return (
    <div className="border-b border-neptura-light bg-neptura-light-surface/35 px-5 py-4 sm:px-8 sm:py-5">
      <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
        Order history
      </p>
      <p className="mt-1 text-[0.72rem] font-light text-neptura-light-muted">{primaryLine}</p>
      {secondaryLine ? (
        <p className="mt-1 text-[0.68rem] font-light text-neptura-light-muted/80">{secondaryLine}</p>
      ) : null}
    </div>
  );
}

export default function AccountOrderList({
  orders,
  showHeader = false,
  embedded = false,
  totalCount,
  filteredCount,
  visibleCount,
  footer,
}: AccountOrderListProps) {
  if (orders.length === 0) {
    return null;
  }

  const resolvedTotal = totalCount ?? orders.length;
  const resolvedFiltered = filteredCount ?? orders.length;
  const resolvedVisible = visibleCount ?? orders.length;

  const list = (
    <>
      {showHeader ? (
        <OrderListHeader
          totalCount={resolvedTotal}
          filteredCount={resolvedFiltered}
          visibleCount={resolvedVisible}
        />
      ) : null}
      <ul className="divide-y divide-neptura-light">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </ul>
      {footer}
    </>
  );

  if (embedded) {
    return list;
  }

  return (
    <div className="border border-neptura-light bg-neptura-light-bg">
      {list}
    </div>
  );
}

export const ORDERS_LOAD_MORE_INITIAL = 6;
export const ORDERS_LOAD_MORE_STEP = 6;
