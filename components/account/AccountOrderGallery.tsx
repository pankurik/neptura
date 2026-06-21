"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import AccountOrderBuyAgainButton from "@/components/account/AccountOrderBuyAgainButton";
import OrderGemPlaceholder from "@/components/account/OrderGemPlaceholder";
import {
  formatOrderDateShort,
  formatOrderStatusLabel,
  formatOrderTotalDisplay,
  orderDetailPath,
  orderPieceCount,
} from "@/lib/customer-auth/orders";
import type { OrderLineItemSummary, OrderSummary } from "@/lib/customer-auth/types";

type GalleryImageCell =
  | { kind: "image"; item: OrderLineItemSummary }
  | { kind: "overflow"; count: number };

function buildGalleryImageCells(order: OrderSummary): GalleryImageCell[] | "single" {
  const pieces = orderPieceCount(order);
  const lineItems = order.lineItems;

  if (pieces <= 1) {
    return "single";
  }

  if (pieces > 4) {
    const thumbs = lineItems.slice(0, 3);
    return [
      ...thumbs.map((item) => ({ kind: "image" as const, item })),
      { kind: "overflow" as const, count: pieces - 3 },
    ];
  }

  return lineItems.slice(0, 4).map((item) => ({ kind: "image" as const, item }));
}

function StatusPinIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 14"
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neptura-light-muted"
      fill="currentColor"
    >
      <path d="M6 0C3.24 0 1 2.24 1 5c0 3.53 4.24 8.36 4.51 8.65a.75.75 0 0 0 1.08 0C6.86 13.36 11 8.53 11 5c0-2.76-2.24-5-5-5Zm0 7.25A2.25 2.25 0 1 1 6 2.75a2.25 2.25 0 0 1 0 4.5Z" />
    </svg>
  );
}

function GalleryThumb({ item }: { item: OrderLineItemSummary }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-neptura-light-surface">
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.imageAlt ?? item.title}
          fill
          sizes="120px"
          className="account-order-gallery-card__image object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-neptura-aurora/45">
          <OrderGemPlaceholder className="h-8 w-8" />
        </span>
      )}
    </div>
  );
}

function GalleryImageArea({ order }: { order: OrderSummary }) {
  const layout = buildGalleryImageCells(order);
  const primary = order.lineItems[0] ?? null;

  if (layout === "single") {
    return (
      <div className="relative aspect-square w-full overflow-hidden bg-neptura-light-surface">
        {primary?.imageUrl ? (
          <Image
            src={primary.imageUrl}
            alt={primary.imageAlt ?? primary.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 280px"
            className="account-order-gallery-card__image object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-neptura-aurora/45">
            <OrderGemPlaceholder className="h-14 w-14" />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {layout.map((cell, index) =>
        cell.kind === "overflow" ? (
          <div
            key={`overflow-${index}`}
            className="flex aspect-square items-center justify-center bg-neptura-light-surface text-[0.95rem] font-light tabular-nums text-neptura-light-muted"
          >
            +{cell.count}
          </div>
        ) : (
          <GalleryThumb key={`${cell.item.id}-${index}`} item={cell.item} />
        ),
      )}
    </div>
  );
}

function GalleryCard({ order }: { order: OrderSummary }) {
  const pieces = orderPieceCount(order);
  const itemLabel = `${pieces} ${pieces === 1 ? "item" : "items"}`;
  const total = formatOrderTotalDisplay(order.totalPrice);
  const statusLabel = formatOrderStatusLabel(order);
  const orderLabel = order.name.startsWith("#") ? `Order ${order.name}` : `Order #${order.name}`;

  return (
    <article className="account-order-gallery-card group flex h-full flex-col border border-neptura-light bg-neptura-light-bg">
      <Link
        href={orderDetailPath(order.id)}
        className="block flex-1"
      >
        <div className="border-b border-neptura-light bg-neptura-light-surface/80 px-3 py-2.5 transition-colors duration-300 group-hover:bg-neptura-light-surface">
          <div className="flex items-start gap-2">
            <StatusPinIcon />
            <div>
              <p className="text-[0.82rem] font-normal leading-snug text-neptura-light-text transition-colors duration-300 group-hover:text-neptura-aurora">
                {statusLabel}
              </p>
              <p className="mt-0.5 text-[0.72rem] font-light text-neptura-light-muted">
                {formatOrderDateShort(order.processedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-2.5 sm:p-3">
          <GalleryImageArea order={order} />
        </div>

        <div className="space-y-1 px-3.5 pb-3.5 pt-0.5 sm:px-4 sm:pb-4">
          <p className="text-[0.88rem] font-normal text-neptura-light-text">{itemLabel}</p>
          <p className="text-[0.72rem] font-light text-neptura-light-muted">{orderLabel}</p>
          {total ? (
            <p className="pt-0.5 text-[0.88rem] font-normal tabular-nums text-neptura-light-text">
              {total}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="border-t border-neptura-light px-3.5 py-3 sm:px-4">
        <AccountOrderBuyAgainButton lineItems={order.lineItems} compact />
      </div>
    </article>
  );
}

type AccountOrderGalleryProps = {
  orders: OrderSummary[];
  embedded?: boolean;
  insetClassName?: string;
  footer?: ReactNode;
};

export default function AccountOrderGallery({
  orders,
  embedded = false,
  insetClassName = "px-5 sm:px-8",
  footer,
}: AccountOrderGalleryProps) {
  if (orders.length === 0) {
    return null;
  }

  const grid = (
    <>
      <div
        className={`grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2 sm:pb-6 md:grid-cols-3 xl:grid-cols-4 ${insetClassName}`}
      >
        {orders.map((order) => (
          <GalleryCard key={order.id} order={order} />
        ))}
      </div>
      {footer}
    </>
  );

  if (embedded) {
    return grid;
  }

  return <div className="border border-neptura-light bg-neptura-light-bg">{grid}</div>;
}
