"use client";

export type OrdersViewMode = "gallery" | "list";

export const ORDERS_VIEW_STORAGE_KEY = "neptura-orders-view";

type AccountOrdersViewToggleProps = {
  value: OrdersViewMode;
  onChange: (value: OrdersViewMode) => void;
};

const VIEW_OPTIONS: { id: OrdersViewMode; label: string }[] = [
  { id: "gallery", label: "Gallery" },
  { id: "list", label: "List" },
];

export function ordersToolbarControlClass(isActive: boolean) {
  return `inline-flex items-center border-b pb-1 text-[0.62rem] font-normal uppercase tracking-[0.14em] transition-colors ${
    isActive
      ? "border-neptura-aurora text-neptura-light-text"
      : "border-transparent text-neptura-light-muted hover:text-neptura-light-text"
  }`;
}

function toggleClass(isActive: boolean) {
  return ordersToolbarControlClass(isActive);
}

export default function AccountOrdersViewToggle({
  value,
  onChange,
}: AccountOrdersViewToggleProps) {
  return (
    <div className="flex shrink-0 items-center gap-x-4" role="group" aria-label="Order view">
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={toggleClass(value === option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function readStoredOrdersView(): OrdersViewMode {
  if (typeof window === "undefined") {
    return "gallery";
  }

  const stored = window.localStorage.getItem(ORDERS_VIEW_STORAGE_KEY);
  return stored === "list" ? "list" : "gallery";
}

export function writeStoredOrdersView(view: OrdersViewMode): void {
  window.localStorage.setItem(ORDERS_VIEW_STORAGE_KEY, view);
}
