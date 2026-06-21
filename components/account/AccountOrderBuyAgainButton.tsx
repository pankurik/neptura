"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { getOrderBuyAgainLines } from "@/lib/customer-auth/orders";
import type { OrderLineItemSummary } from "@/lib/customer-auth/types";
import { cn } from "@/lib/utils";

type AccountOrderBuyAgainButtonProps = {
  lineItems: OrderLineItemSummary[];
  compact?: boolean;
};

export default function AccountOrderBuyAgainButton({
  lineItems,
  compact = false,
}: AccountOrderBuyAgainButtonProps) {
  const { addLinesToCart, isLoading } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const buyAgainLines = getOrderBuyAgainLines(lineItems);
  const busy = isLoading || isAdding;
  const disabled = buyAgainLines.length === 0 || busy;

  async function handleBuyAgain() {
    if (disabled) {
      return;
    }

    setError(null);
    setSucceeded(false);
    setIsAdding(true);

    try {
      await addLinesToCart(buyAgainLines);
      setSucceeded(true);
      window.setTimeout(() => setSucceeded(false), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add these items to your cart.");
    } finally {
      setIsAdding(false);
    }
  }

  const label = succeeded ? "Added to cart" : busy ? "Adding to cart…" : "Buy again";

  return (
    <div>
      <button
        type="button"
        onClick={handleBuyAgain}
        disabled={disabled}
        className={cn(
          "btn-light-secondary account-action-btn w-full text-center",
          compact ? "px-3 py-2 text-[0.62rem]" : "block",
          busy && "account-action-btn--loading",
          succeeded && "account-action-btn--success",
          disabled && !busy && "cursor-not-allowed opacity-50",
        )}
      >
        {label}
      </button>
      {!compact && error ? (
        <p className="mt-2 text-center text-[0.72rem] font-light text-neptura-light-muted">
          {error}
        </p>
      ) : null}
    </div>
  );
}
