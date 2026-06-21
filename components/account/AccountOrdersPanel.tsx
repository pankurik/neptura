"use client";

import { useEffect, useMemo, useState } from "react";
import AccountOrderGallery from "@/components/account/AccountOrderGallery";
import AccountOrderList, {
  ORDERS_LOAD_MORE_INITIAL,
  ORDERS_LOAD_MORE_STEP,
} from "@/components/account/AccountOrderList";
import AccountOrdersSortMenu from "@/components/account/AccountOrdersSortMenu";
import AccountOrdersViewToggle, {
  type OrdersViewMode,
  readStoredOrdersView,
  writeStoredOrdersView,
} from "@/components/account/AccountOrdersViewToggle";
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

const PANEL_INSET = "px-5 sm:px-8";

type OrderSortSelection = "" | OrderSortKey;

function toolbarPillClass(isActive: boolean) {
  return `inline-flex items-center border-b pb-1 text-[0.62rem] font-normal uppercase tracking-[0.14em] transition-colors ${
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
  const [view, setView] = useState<OrdersViewMode>("gallery");
  const [visibleCount, setVisibleCount] = useState(ORDERS_LOAD_MORE_INITIAL);

  useEffect(() => {
    setView(readStoredOrdersView());
  }, []);

  useEffect(() => {
    writeStoredOrdersView(view);
  }, [view]);

  const filteredOrders = useMemo(() => {
    const byStatus = filterOrdersByStatus(orders, status);
    const byQuery = filterOrdersByQuery(byStatus, query);
    return sortOrders(byQuery, sort || "newest");
  }, [orders, query, sort, status]);

  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const remaining = filteredOrders.length - visibleCount;
  const hasMore = remaining > 0;
  const isFiltered = query.trim().length > 0 || status !== "all";

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

  const filterMeta = isFiltered
    ? `${filteredOrders.length} of ${summary.orderCount} orders match`
    : null;

  const loadMoreFooter = hasMore ? (
    <div className={`border-t border-neptura-light py-4 ${PANEL_INSET}`}>
      <button
        type="button"
        onClick={() =>
          setVisibleCount((count) => Math.min(count + ORDERS_LOAD_MORE_STEP, filteredOrders.length))
        }
        className="w-full py-2 text-[0.68rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
      >
        Load more
        {remaining > ORDERS_LOAD_MORE_STEP
          ? ` · ${ORDERS_LOAD_MORE_STEP} more`
          : ` · ${remaining} remaining`}
      </button>
    </div>
  ) : null;

  return (
    <div className="border border-neptura-light bg-neptura-light-bg">
      <div className={`space-y-4 py-4 sm:py-5 ${PANEL_INSET}`}>
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

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-[0.5px] border-[rgba(74,144,164,0.08)] pb-4">
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <AccountOrdersViewToggle value={view} onChange={setView} />
            <AccountOrdersSortMenu
              value={sort}
              defaultLabel="Sort"
              options={SORT_OPTIONS}
              onChange={handleSortChange}
            />
          </div>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        view === "gallery" ? (
          <AccountOrderGallery
            orders={visibleOrders}
            embedded
            insetClassName={PANEL_INSET}
            footer={loadMoreFooter}
          />
        ) : (
          <AccountOrderList orders={visibleOrders} embedded footer={loadMoreFooter} />
        )
      ) : (
        <div className={`py-12 text-center ${PANEL_INSET}`}>
          <p className="font-display text-lg font-light text-neptura-light-text">No matching orders</p>
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
