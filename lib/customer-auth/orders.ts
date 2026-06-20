import { formatPrice } from "@/lib/shopify";
import { customerAccountFetch } from "./graphql";
import type { OrderLineItemSummary, OrderSummary } from "./types";

const ORDER_FIELDS = `
  id
  name
  processedAt
  fulfillmentStatus
  financialStatus
  statusPageUrl
  totalPrice {
    amount
    currencyCode
  }
  fulfillments(first: 10) {
    nodes {
      latestShipmentStatus
      isPickedUp
    }
  }
  lineItems(first: 50) {
    nodes {
      id
      title
      quantity
      image {
        url
        altText
      }
    }
  }
`;

const ORDERS_PAGE_QUERY = `#graphql
  query CustomerOrdersPage($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
        nodes {
          ${ORDER_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const ORDER_BY_ID_QUERY = `#graphql
  query CustomerOrderById($id: ID!) {
    order(id: $id) {
      ${ORDER_FIELDS}
    }
  }
`;

type OrderNode = {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus?: string | null;
  statusPageUrl: string;
  totalPrice: { amount: string; currencyCode: string };
  fulfillments?: {
    nodes?: {
      latestShipmentStatus?: string | null;
      isPickedUp?: boolean;
    }[];
  };
  lineItems?: {
    nodes?: {
      id: string;
      title: string;
      quantity: number;
      image?: { url?: string | null; altText?: string | null } | null;
    }[];
  };
};

type OrdersPageResult = {
  customer?: {
    orders?: {
      nodes?: OrderNode[];
      pageInfo?: {
        hasNextPage: boolean;
        endCursor?: string | null;
      };
    };
  } | null;
};

type OrderByIdResult = {
  order?: OrderNode | null;
};

const ORDERS_PAGE_SIZE = 50;
const MAX_ORDER_PAGES = 20;

function mapLineItem(node: {
  id: string;
  title: string;
  quantity: number;
  image?: { url?: string | null; altText?: string | null } | null;
}): OrderLineItemSummary {
  return {
    id: node.id,
    title: node.title,
    quantity: node.quantity,
    imageUrl: node.image?.url ?? null,
    imageAlt: node.image?.altText ?? null,
  };
}

/** Shipment events that should override order fulfillment status in the UI. */
const CUSTOMER_FACING_SHIPMENT_STATUSES = new Set([
  "DELIVERED",
  "PICKED_UP",
  "PARTIALLY_DELIVERED",
  "OUT_FOR_DELIVERY",
  "IN_TRANSIT",
  "ATTEMPTED_DELIVERY",
  "READY_FOR_PICKUP",
  "DELAYED",
  "FAILURE",
]);

function deriveLatestShipmentStatus(order: OrderNode): string | null {
  const nodes = order.fulfillments?.nodes ?? [];

  if (nodes.length === 0) {
    return null;
  }

  const statuses = nodes.map((fulfillment) => {
    if (fulfillment.isPickedUp) {
      return "PICKED_UP";
    }

    return fulfillment.latestShipmentStatus ?? null;
  }).filter(Boolean) as string[];

  if (statuses.length === 0) {
    return null;
  }

  if (statuses.every((status) => status === "DELIVERED" || status === "PICKED_UP")) {
    return statuses.includes("PICKED_UP") && !statuses.includes("DELIVERED")
      ? "PICKED_UP"
      : "DELIVERED";
  }

  if (statuses.some((status) => status === "DELIVERED" || status === "PICKED_UP")) {
    return "PARTIALLY_DELIVERED";
  }

  const priority = [
    "OUT_FOR_DELIVERY",
    "IN_TRANSIT",
    "ATTEMPTED_DELIVERY",
    "READY_FOR_PICKUP",
    "DELAYED",
    "FAILURE",
  ] as const;

  for (const status of priority) {
    if (statuses.includes(status)) {
      return status;
    }
  }

  // Ignore CONFIRMED / label events — fall back to fulfillmentStatus (e.g. Shipped).
  return null;
}

function mapOrder(order: OrderNode): OrderSummary {
  const lineItems = (order.lineItems?.nodes ?? []).map(mapLineItem);

  return {
    id: order.id,
    name: order.name,
    processedAt: order.processedAt,
    fulfillmentStatus: order.fulfillmentStatus,
    latestShipmentStatus: deriveLatestShipmentStatus(order),
    financialStatus: order.financialStatus ?? null,
    totalPrice: order.totalPrice,
    statusPageUrl: order.statusPageUrl,
    totalItemCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    lineItems,
  };
}

export async function fetchCustomerOrders(accessToken: string): Promise<OrderSummary[]> {
  const orders: OrderSummary[] = [];
  let cursor: string | null = null;
  let page = 0;

  while (page < MAX_ORDER_PAGES) {
    page += 1;

    const { data, errors } = await customerAccountFetch<OrdersPageResult>(
      accessToken,
      ORDERS_PAGE_QUERY,
      {
        first: ORDERS_PAGE_SIZE,
        after: cursor,
      }
    );

    if (errors.length) {
      console.error("Customer orders query failed:", errors);
      if (!data?.customer?.orders?.nodes?.length) {
        break;
      }
    }

    const connection = data?.customer?.orders;
    const nodes = connection?.nodes ?? [];

    orders.push(...nodes.map(mapOrder));

    if (!connection?.pageInfo?.hasNextPage) {
      break;
    }

    cursor = connection.pageInfo.endCursor ?? null;
    if (!cursor) {
      break;
    }
  }

  return orders;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  FULFILLED: "Shipped",
  UNFULFILLED: "Confirmed",
  PARTIALLY_FULFILLED: "Partially shipped",
  SCHEDULED: "Scheduled",
  ON_HOLD: "On hold",
};

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  DELIVERED: "Delivered",
  PICKED_UP: "Picked up",
  PARTIALLY_DELIVERED: "Partially delivered",
  OUT_FOR_DELIVERY: "Out for delivery",
  IN_TRANSIT: "In transit",
  ATTEMPTED_DELIVERY: "Delivery attempted",
  READY_FOR_PICKUP: "Ready for pickup",
  DELAYED: "Delayed",
  FAILURE: "Delivery failed",
};

export type OrderStatusInput = Pick<OrderSummary, "fulfillmentStatus" | "latestShipmentStatus">;

export function formatFulfillmentStatus(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status.replace(/_/g, " ").toLowerCase();
}

export function formatOrderDateShort(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(isoDate));
}

export function formatOrderStatusLabel(order: OrderStatusInput): string {
  if (
    order.latestShipmentStatus &&
    CUSTOMER_FACING_SHIPMENT_STATUSES.has(order.latestShipmentStatus)
  ) {
    const shipmentLabel = SHIPMENT_STATUS_LABELS[order.latestShipmentStatus];

    if (shipmentLabel) {
      return shipmentLabel;
    }
  }

  return formatFulfillmentStatus(order.fulfillmentStatus);
}

export function formatOrderStatusBadge(order: OrderStatusInput): string {
  return formatOrderStatusLabel(order).toUpperCase();
}

export function formatOrderDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function orderIdFromGid(gid: string): string {
  const match = gid.match(/(\d+)$/);
  return match?.[1] ?? gid;
}

export function orderGidFromId(orderId: string): string {
  if (orderId.startsWith("gid://")) {
    return orderId;
  }

  return `gid://shopify/Order/${orderIdFromGid(orderId)}`;
}

export function orderDetailPath(orderGid: string): string {
  return `/account/orders/${orderIdFromGid(orderGid)}`;
}

export function orderPieceCount(order: OrderSummary): number {
  return order.totalItemCount;
}

export type OrderCollectionSummary = {
  orderCount: number;
  totalPieces: number;
  totalSpent: { amount: string; currencyCode: string } | null;
  lastOrderDate: string | null;
};

export function summarizeOrderCollection(orders: OrderSummary[]): OrderCollectionSummary {
  if (orders.length === 0) {
    return {
      orderCount: 0,
      totalPieces: 0,
      totalSpent: null,
      lastOrderDate: null,
    };
  }

  const totalPieces = orders.reduce((sum, order) => sum + orderPieceCount(order), 0);
  const currencyCode = orders[0]?.totalPrice.currencyCode ?? "INR";
  let totalAmount = 0;

  for (const order of orders) {
    const amount = parseFloat(order.totalPrice.amount);

    if (Number.isFinite(amount) && order.totalPrice.currencyCode === currencyCode) {
      totalAmount += amount;
    }
  }

  return {
    orderCount: orders.length,
    totalPieces,
    totalSpent:
      totalAmount > 0
        ? { amount: totalAmount.toFixed(2), currencyCode }
        : null,
    lastOrderDate: orders[0]?.processedAt ?? null,
  };
}

export function formatOrderCollectionHeroSubtitle(summary: OrderCollectionSummary): string {
  const { primary, secondary } = formatOrderCollectionHeroMeta(summary);
  return secondary ? `${primary} · ${secondary}` : primary;
}

export function formatOrderCollectionHeroMeta(summary: OrderCollectionSummary): {
  primary: string;
  secondary?: string;
} {
  const primaryParts = [
    `${summary.orderCount} ${summary.orderCount === 1 ? "order" : "orders"}`,
    `${summary.totalPieces} ${summary.totalPieces === 1 ? "piece" : "pieces"}`,
  ];

  if (summary.totalSpent) {
    primaryParts.push(formatPrice(summary.totalSpent.amount, summary.totalSpent.currencyCode));
  }

  return {
    primary: primaryParts.join(" · "),
    secondary: summary.lastOrderDate
      ? `Last order ${formatOrderDateShort(summary.lastOrderDate)}`
      : undefined,
  };
}

export type OrderStatusFilter = "all" | "delivered" | "in_transit" | "confirmed";

export type OrderSortKey = "newest" | "oldest" | "amount_high" | "amount_low";

const DELIVERED_STATUS_LABELS = new Set(["Delivered", "Picked up", "Partially delivered"]);
const IN_TRANSIT_STATUS_LABELS = new Set([
  "In transit",
  "Out for delivery",
  "Delivery attempted",
  "Ready for pickup",
  "Delayed",
  "Shipped",
  "Partially shipped",
  "Delivery failed",
]);

export function orderStatusFilterBucket(order: OrderSummary): OrderStatusFilter {
  const label = formatOrderStatusLabel(order);

  if (DELIVERED_STATUS_LABELS.has(label)) {
    return "delivered";
  }

  if (IN_TRANSIT_STATUS_LABELS.has(label)) {
    return "in_transit";
  }

  return "confirmed";
}

export function filterOrdersByStatus(
  orders: OrderSummary[],
  status: OrderStatusFilter
): OrderSummary[] {
  if (status === "all") {
    return orders;
  }

  return orders.filter((order) => orderStatusFilterBucket(order) === status);
}

export function filterOrdersByQuery(orders: OrderSummary[], query: string): OrderSummary[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return orders;
  }

  return orders.filter((order) => {
    if (order.name.toLowerCase().includes(normalized)) {
      return true;
    }

    return order.lineItems.some((item) => item.title.toLowerCase().includes(normalized));
  });
}

function orderAmount(order: OrderSummary): number {
  const amount = parseFloat(order.totalPrice.amount);
  return Number.isFinite(amount) ? amount : 0;
}

export function sortOrders(orders: OrderSummary[], sort: OrderSortKey): OrderSummary[] {
  const sorted = [...orders];

  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime()
      );
    case "amount_high":
      return sorted.sort((a, b) => orderAmount(b) - orderAmount(a));
    case "amount_low":
      return sorted.sort((a, b) => orderAmount(a) - orderAmount(b));
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
      );
  }
}

export function formatOrderProductPreview(order: OrderSummary): string | null {
  const lineItems = order.lineItems;

  if (lineItems.length === 0) {
    return null;
  }

  const firstTitle = lineItems[0]?.title;
  const pieces = orderPieceCount(order);

  if (!firstTitle) {
    return null;
  }

  if (pieces <= 1) {
    return firstTitle;
  }

  return `${firstTitle} · and ${pieces - 1} more`;
}

export async function fetchCustomerOrder(
  accessToken: string,
  orderId: string
): Promise<OrderSummary | null> {
  const { data, errors } = await customerAccountFetch<OrderByIdResult>(
    accessToken,
    ORDER_BY_ID_QUERY,
    { id: orderGidFromId(orderId) }
  );

  if (errors.length) {
    console.error("Customer order query failed:", errors);
    return null;
  }

  if (!data?.order) {
    return null;
  }

  return mapOrder(data.order);
}
