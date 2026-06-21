import Image from "next/image";
import Link from "next/link";
import OrderGemPlaceholder from "@/components/account/OrderGemPlaceholder";
import {
  formatOrderDateShort,
  formatOrderStatusBadge,
  orderDetailPath,
  orderPieceCount,
} from "@/lib/customer-auth/orders";
import { formatPrice } from "@/lib/shopify";
import type { OrderLineItemSummary, OrderSummary } from "@/lib/customer-auth/types";

function getPrimaryPreviewItem(order: OrderSummary): OrderLineItemSummary | null {
  return order.lineItems[0] ?? null;
}

function formatOrderPrice(order: OrderSummary): string | null {
  const amount = parseFloat(order.totalPrice.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode);
}

function OrderCard({ order }: { order: OrderSummary }) {
  const preview = getPrimaryPreviewItem(order);
  const pieces = orderPieceCount(order);
  const price = formatOrderPrice(order);
  const itemLabel = `${pieces} ${pieces === 1 ? "item" : "items"}`;

  return (
    <article className="w-full border border-neptura-light bg-neptura-light-bg">
      <Link
        href={orderDetailPath(order.id)}
        className="group flex items-start gap-3 p-3 transition-colors hover:bg-neptura-light-surface/50"
      >
        <div className="relative aspect-[3/4] w-11 shrink-0 overflow-hidden bg-neptura-light-surface sm:w-12">
          {preview?.imageUrl ? (
            <Image
              src={preview.imageUrl}
              alt={preview.imageAlt ?? preview.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-neptura-aurora/45">
              <OrderGemPlaceholder className="h-7 w-7" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-display text-[0.95rem] font-light leading-none text-neptura-light-text">
              {order.name}
            </span>
            <span className="shrink-0 border border-neptura-aurora/20 px-1.5 py-px text-[0.54rem] font-normal uppercase tracking-[0.12em] text-neptura-aurora">
              {formatOrderStatusBadge(order)}
            </span>
          </div>

          <p className="mt-1.5 text-[0.62rem] font-light leading-snug text-neptura-light-muted">
            {formatOrderDateShort(order.processedAt)} · {itemLabel}
          </p>

          {price ? (
            <p className="mt-1.5 font-display text-[0.85rem] font-light tabular-nums leading-none text-neptura-light-text">
              {price}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

type AccountOrderGridProps = {
  orders: OrderSummary[];
  columns?: number;
};

export const STONES_PREVIEW_COLUMNS = 3;
export const STONES_PREVIEW_ROWS = 2;
export const STONES_PREVIEW_LIMIT = STONES_PREVIEW_COLUMNS * STONES_PREVIEW_ROWS;

export default function AccountOrderGrid({
  orders,
  columns = STONES_PREVIEW_COLUMNS,
}: AccountOrderGridProps) {
  if (orders.length === 0) {
    return null;
  }

  const gridClass =
    columns === 3 ? "grid grid-cols-2 gap-3.5 md:grid-cols-3" : "grid grid-cols-2 gap-3.5";

  return (
    <div className={gridClass}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
