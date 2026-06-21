"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AccountOrderGrid, {
  STONES_PREVIEW_COLUMNS,
  STONES_PREVIEW_LIMIT,
  STONES_PREVIEW_ROWS,
} from "@/components/account/AccountOrderGrid";
import type { OrderSummary } from "@/lib/customer-auth/types";

const STONES_PREVIEW_LIMIT_MOBILE = STONES_PREVIEW_ROWS * 2;

type AccountStonesPreviewProps = {
  orders: OrderSummary[];
};

export default function AccountStonesPreview({ orders }: AccountStonesPreviewProps) {
  const [previewLimit, setPreviewLimit] = useState(STONES_PREVIEW_LIMIT);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: 768px)`);

    const updateLimit = () => {
      setPreviewLimit(
        mediaQuery.matches ? STONES_PREVIEW_LIMIT : STONES_PREVIEW_LIMIT_MOBILE
      );
    };

    updateLimit();
    mediaQuery.addEventListener("change", updateLimit);

    return () => mediaQuery.removeEventListener("change", updateLimit);
  }, []);

  const previewOrders = orders.slice(0, previewLimit);
  const hasMoreOrders = orders.length > previewLimit;

  if (previewOrders.length === 0) {
    return (
      <div className="border border-dashed border-neptura-light bg-neptura-light-surface/50 px-6 py-10 text-center">
        <p className="font-display text-lg font-light text-neptura-light-text">No orders yet</p>
        <p className="mt-2 text-[0.8rem] font-light leading-relaxed text-neptura-light-muted">
          When you place an order, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <AccountOrderGrid orders={previewOrders} columns={STONES_PREVIEW_COLUMNS} />

      {hasMoreOrders ? (
        <Link
          href="/account/orders"
          className="account-action-btn mt-4 block w-full border border-neptura-light bg-neptura-light-bg py-3 text-center text-[0.68rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
        >
          Show all orders
        </Link>
      ) : null}
    </>
  );
}
