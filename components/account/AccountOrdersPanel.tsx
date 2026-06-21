"use client";

import { useMemo, useState } from "react";
import AccountOrderList, {
  ORDERS_LOAD_MORE_INITIAL,
  ORDERS_LOAD_MORE_STEP,
} from "@/components/account/AccountOrderList";
import AccountOrdersSortMenu from "@/components/account/AccountOrdersSortMenu";
import {
  filterOrdersByQuery,
  filterOrdersByStatus,
  sortOrders,
  type OrderCollectionSummary,
  type OrderSortKey,
  type OrderStatusFilter,
} from "@/lib/customer-auth/orders";
import type { OrderSummary } from "@/lib/customer-auth/types";

const STATUS_FILTERS: { id: OrderStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "delivered", label: "Delivered" },
  { id: "in_transit", label: "In transit" },
  { id: "confirmed", label: "Confirmed" },
];

const SORT_OPTIONS: { id: Exclude<OrderSortKey, "newest">; label: string }[] = [
  { id: "oldest", label: "Oldest" },
  { id: "amount_high", label: "Highest" },
  { id: "amount_low", label: "Lowest" },
];

type OrderSortSelection = "" | OrderSortKey;

function toolbarPillClass(isActive: boolean) {
  return `border-b pb-1 text-[0.62rem] font-normal uppercase tracking-[0.14em] transition-colors ${
    isActive
      ? "border-neptura-aurora text-neptura-light-text"
      : "border-transparent text-neptura-light-muted hover:text-neptura-light-text"
  }`;
}

type AccountOrdersPanelProps = {
  orders: OrderSummary[];
  summary: OrderCollectionSummary;
};

export default function AccountOrdersPanel({ orders, summary }: AccountOrdersPanelProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatusFilter>("all");
  const [sort, setSort] = useState<OrderSortSelection>("");
  const [visibleCount, setVisibleCount] = useState(ORDERS_LOAD_MORE_INITIAL);

  const filteredOrders = useMemo(() => {
    const byStatus = filterOrdersByStatus(orders, status);
    const byQuery = filterOrdersByQuery(byStatus, query);
    return sortOrders(byQuery, sort || "newest");
  }, [orders, query, sort, status]);

  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const remaining = filteredOrders.length - visibleCount;
  const hasMore = remaining > 0;
  const isFiltered = query.trim().length > 0 || status !== "all";
  const isPaginated = visibleOrders.length < filteredOrders.length;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setVisibleCount(ORDERS_LOAD_MORE_INITIAL);
  };

  const handleStatusChange = (nextStatus: OrderStatusFilter) => {
    setStatus(nextStatus);
    setVisibleCount(ORDERS_LOAD_MORE_INITIAL);
  };

  const handleSortChange = (value: string) => {
    setSort(value as OrderSortSelection);
    setVisibleCount(ORDERS_LOAD_MORE_INITIAL);
  };

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setSort("");
    setVisibleCount(ORDERS_LOAD_MORE_INITIAL);
  };

  const filterMeta =
    isFiltered || isPaginated
      ? isFiltered
        ? `${filteredOrders.length} of ${summary.orderCount} orders match${
            isPaginated ? ` · Showing ${visibleOrders.length} of ${filteredOrders.length}` : ""
          }`
        : `Showing ${visibleOrders.length} of ${filteredOrders.length}`
      : null;

  return (
    <div className="border border-neptura-light bg-neptura-light-bg">
      <div className="space-y-4 px-5 py-4 sm:px-8 sm:py-5">
        {filterMeta ? (
          <p className="text-[0.68rem] font-light text-neptura-light-muted">{filterMeta}</p>
        ) : null}

        <label className="block">
          <span className="sr-only">Search orders</span>
          <input
            type="search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search by order number or product"
            className="neptura-input-underline w-full px-0 py-2.5 text-[0.8rem] font-light text-neptura-light-text placeholder:text-neptura-light-muted/70"
          />
        </label>

        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b-[0.5px] border-[rgba(74,144,164,0.08)] pb-4">
          <div
            className="flex flex-wrap gap-x-6 gap-y-2"
            role="group"
            aria-label="Filter orders by status"
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleStatusChange(filter.id)}
                className={toolbarPillClass(status === filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <AccountOrdersSortMenu
            value={sort}
            defaultLabel="Sort"
            options={SORT_OPTIONS}
            onChange={handleSortChange}
          />
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <>
          <AccountOrderList
            orders={visibleOrders}
            embedded
            footer={
              hasMore ? (
                <div className="border-t border-neptura-light px-5 py-4 sm:px-8">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) =>
                        Math.min(count + ORDERS_LOAD_MORE_STEP, filteredOrders.length)
                      )
                    }
                    className="w-full py-2 text-[0.68rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
                  >
                    Load more
                    {remaining > ORDERS_LOAD_MORE_STEP
                      ? ` · ${ORDERS_LOAD_MORE_STEP} more`
                      : ` · ${remaining} remaining`}
                  </button>
                </div>
              ) : null
            }
          />
        </>
      ) : (
        <div className="px-6 py-12 text-center">
            <p className="font-display text-lg font-light text-neptura-light-text">
              No matching orders
            </p>
            <p className="mt-2 text-[0.8rem] font-light text-neptura-light-muted">
              {isFiltered
                ? "Try a different search or filter."
                : "When you place an order, it will appear here."}
            </p>
            {isFiltered ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
              >
                Clear search and filters
              </button>
            ) : null}
        </div>
      )}
    </div>
  );
}
