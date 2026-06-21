import type { ReactNode } from "react";
import Image from "next/image";
import AccountOrderBuyAgainButton from "@/components/account/AccountOrderBuyAgainButton";
import OrderGemPlaceholder from "@/components/account/OrderGemPlaceholder";
import {
  formatLineItemVariant,
  formatMoneyAmount,
  formatOrderAddressLines,
  formatOrderDateShort,
  formatOrderPaymentAmount,
  getOrderShipmentTrackingFallback,
} from "@/lib/customer-auth/orders";
import type { OrderDetailSummary, OrderLineItemSummary } from "@/lib/customer-auth/types";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "info@neptura.in";

type AccountOrderDetailPanelProps = {
  order: OrderDetailSummary;
};

const SECTION_LABEL_CLASS =
  "text-[0.82rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora sm:text-[0.88rem]";
const SECTION_CONTENT_CLASS = "mt-7 sm:mt-8";
const SECTION_INLINE_CLASS = "mt-2 sm:mt-2.5";

function DetailSectionLabel({ children }: { children: string }) {
  return <p className={SECTION_LABEL_CLASS}>{children}</p>;
}

function DetailCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("border border-neptura-light bg-neptura-light-bg px-5 py-5 sm:px-6", className)}>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="text-[0.78rem] font-light text-neptura-light-muted">{label}</span>
      <span
        className={cn(
          "text-right font-display tabular-nums text-neptura-light-text",
          emphasis ? "text-[1.35rem] font-light" : "text-[0.92rem] font-light",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function lineItemTitleParts(title: string): { primary: string; secondary: string[] } {
  const split = title.split(/\s*[—–]\s*/);

  if (split.length >= 2) {
    const primary = split[0]?.trim() ?? title;
    const rest = split.slice(1).join(" — ").trim();
    const secondary = rest
      .split(/,\s*(?=[A-Z])|\s+·\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    return { primary, secondary };
  }

  return { primary: title, secondary: [] };
}

const STONE_LIST_MAX_VISIBLE = 5;
const isStoneListScrollable = (count: number) => count >= STONE_LIST_MAX_VISIBLE;

function StoneLineItemCard({ item }: { item: OrderLineItemSummary }) {
  const lineTotal = formatMoneyAmount(item.lineTotal ?? item.unitPrice);
  const { primary } = lineItemTitleParts(item.title);
  const variant = formatLineItemVariant(item);

  return (
    <article className="flex gap-3.5 py-3.5">
      <div className="relative aspect-product w-[3.75rem] shrink-0 overflow-hidden bg-neptura-light-surface sm:w-16">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt ?? item.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-neptura-aurora/45">
            <OrderGemPlaceholder className="h-8 w-8" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 min-w-0 font-display text-[0.94rem] font-light leading-snug text-neptura-light-text">
            {primary}
          </h2>
          {lineTotal ? (
            <p className="shrink-0 text-[0.88rem] font-light tabular-nums text-neptura-light-text">
              {lineTotal}
            </p>
          ) : null}
        </div>
        {variant ? (
          <p className="mt-1 truncate text-[0.72rem] font-light text-neptura-light-muted">{variant}</p>
        ) : null}
        <p className="mt-1.5 text-[0.58rem] font-normal uppercase tracking-[0.14em] text-neptura-light-muted">
          Qty · {item.quantity}
        </p>
      </div>
    </article>
  );
}

export default function AccountOrderDetailPanel({ order }: AccountOrderDetailPanelProps) {
  const subtotal = formatMoneyAmount(order.subtotal ?? order.totalPrice);
  const shipping = formatMoneyAmount(
    order.totalShipping ?? { amount: "0", currencyCode: order.totalPrice.currencyCode },
  );
  const tax = formatMoneyAmount(order.totalTax);
  const total = formatMoneyAmount(order.totalPrice);
  const addressLines = formatOrderAddressLines(order.shippingAddress);
  const trackingUrl = order.tracking?.url ?? null;
  const hasTracking = Boolean(order.tracking?.number || order.tracking?.company);
  const trackingFallback = getOrderShipmentTrackingFallback(order);
  const paymentAmount = formatOrderPaymentAmount(order.payment?.amount);
  const stoneListScrollable = isStoneListScrollable(order.lineItems.length);

  return (
    <div
      className={cn(
        "account-order-detail-enter account-order-detail-panel grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20 xl:gap-24",
        stoneListScrollable ? "lg:items-stretch" : "lg:items-start",
      )}
    >
      <div
        className={cn(
          "account-order-detail-enter__col account-order-detail-enter__col--left account-order-detail-col account-order-detail-col--left",
          stoneListScrollable ? "flex min-h-0 flex-col lg:h-full" : "space-y-8",
        )}
      >
        <section className={cn(stoneListScrollable && "account-order-detail-col__stones min-h-0 flex-1")}>
          <DetailSectionLabel>Your Stones</DetailSectionLabel>
          <div
            className={cn(
              "account-order-stone-scroll-wrap",
              SECTION_CONTENT_CLASS,
              stoneListScrollable && "account-order-stone-scroll-wrap--scrollable",
            )}
          >
            <div
              className={cn(
                "account-order-stone-scroll",
                stoneListScrollable && "account-order-stone-scroll--bounded",
              )}
            >
              <ul className="divide-y divide-neptura-light py-1 pl-3 pr-4 sm:pl-4 sm:pr-5">
                {order.lineItems.map((item) => (
                  <li key={item.id}>
                    <StoneLineItemCard item={item} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={cn("account-order-detail-col__tracking shrink-0", stoneListScrollable && "mt-8")}>
          <DetailSectionLabel>Shipment tracking</DetailSectionLabel>
          <DetailCard className={cn(SECTION_INLINE_CLASS, "sm:flex sm:items-center sm:justify-between sm:gap-6")}>
            {hasTracking ? (
              <>
                <div>
                  {order.tracking?.company ? (
                    <p className="font-display text-base font-light text-neptura-light-text">
                      {order.tracking.company}
                    </p>
                  ) : null}
                  {order.tracking?.number ? (
                    <p className="mt-1 text-[0.78rem] font-light text-neptura-light-muted">
                      {order.tracking.number}
                    </p>
                  ) : null}
                </div>
                {(trackingUrl ?? order.statusPageUrl) ? (
                  <a
                    href={trackingUrl ?? order.statusPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-light-secondary account-action-btn mt-4 shrink-0 px-5 py-2.5 text-[0.62rem] sm:mt-0"
                  >
                    Track shipment
                  </a>
                ) : null}
              </>
            ) : (
              <div>
                <p className="font-display text-base font-light text-neptura-light-text">
                  {trackingFallback.headline}
                </p>
                {trackingFallback.detail ? (
                  <p className="mt-1 text-[0.78rem] font-light leading-relaxed text-neptura-light-muted">
                    {trackingFallback.detail}
                  </p>
                ) : null}
              </div>
            )}
          </DetailCard>
        </section>
      </div>

      <aside
        className={cn(
          "account-order-detail-enter__col account-order-detail-enter__col--right account-order-detail-col account-order-detail-col--right flex flex-col",
          stoneListScrollable && "min-h-0 lg:h-full",
        )}
      >
        <div className="account-order-detail-col__meta space-y-8">
        <section>
          <DetailSectionLabel>Order summary</DetailSectionLabel>
          <DetailCard className={cn(SECTION_CONTENT_CLASS, "py-2")}>
            {subtotal ? <SummaryRow label="Subtotal" value={subtotal} /> : null}
            {shipping ? <SummaryRow label="Shipping" value={shipping} /> : null}
            {tax ? <SummaryRow label="Taxes" value={tax} /> : null}
            {total ? (
              <div className="border-t border-neptura-light pt-1">
                <SummaryRow label="Total" value={total} emphasis />
              </div>
            ) : null}
          </DetailCard>
        </section>

        {addressLines.length > 0 ? (
          <section>
            <DetailSectionLabel>Shipment address</DetailSectionLabel>
            <address
              className={cn(
                SECTION_INLINE_CLASS,
                "not-italic text-[0.82rem] font-light leading-relaxed text-neptura-light-muted",
              )}
            >
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </section>
        ) : null}

        {order.payment ? (
          <section>
            <DetailSectionLabel>Payment</DetailSectionLabel>
            <div
              className={cn(
                SECTION_INLINE_CLASS,
                "space-y-0.5 text-[0.82rem] font-light leading-snug text-neptura-light-muted",
              )}
            >
              {order.payment.label !== "Payment" ? <p>{order.payment.label}</p> : null}
              {paymentAmount ? <p>{paymentAmount}</p> : null}
              {order.payment.processedAt ? (
                <p>{formatOrderDateShort(order.payment.processedAt)}</p>
              ) : null}
            </div>
          </section>
        ) : null}
        </div>

        <div
          className={cn(
            "account-order-detail-col__actions shrink-0 space-y-3",
            stoneListScrollable ? "mt-8 lg:mt-auto lg:pt-8" : "mt-8",
          )}
        >
          <AccountOrderBuyAgainButton lineItems={order.lineItems} />
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="btn-light-secondary account-action-btn block w-full text-center"
          >
            Contact support
          </a>
        </div>
      </aside>
    </div>
  );
}
