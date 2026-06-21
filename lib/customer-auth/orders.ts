import { formatPrice } from "@/lib/shopify";
import { customerAccountFetch } from "./graphql";
import type {
  OrderAddressSummary,
  OrderDetailSummary,
  OrderLineItemSummary,
  OrderProgressStep,
  OrderSummary,
  OrderTrackingSummary,
} from "./types";

const ORDER_LIST_FIELDS = `
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
      variantId
      giftCard
      image {
        url
        altText
      }
    }
  }
`;

const ORDER_DETAIL_FIELDS = `
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
  subtotal {
    amount
    currencyCode
  }
  totalShipping {
    amount
    currencyCode
  }
  totalTax {
    amount
    currencyCode
  }
  email
  phone
  shippingAddress {
    formatted(withName: true, withCompany: true)
    firstName
    lastName
    address1
    address2
    city
    province
    zip
    territoryCode
    phoneNumber
  }
  billingAddress {
    formatted(withName: true, withCompany: true)
    firstName
    lastName
    address1
    address2
    city
    province
    zip
    territoryCode
    phoneNumber
  }
  fulfillments(first: 10) {
    nodes {
      createdAt
      updatedAt
      latestShipmentStatus
      isPickedUp
      status
      trackingInformation {
        company
        number
        url
      }
      events(first: 20, sortKey: HAPPENED_AT) {
        nodes {
          status
          happenedAt
        }
      }
    }
  }
  transactions {
    status
    kind
    type
    processedAt
    paymentIcon {
      altText
    }
    typeDetails {
      name
      message
    }
    paymentDetails {
      ... on CardPaymentDetails {
        last4
        cardBrand
      }
    }
    transactionAmount {
      presentmentMoney {
        amount
        currencyCode
      }
    }
  }
  lineItems(first: 50) {
    nodes {
      id
      title
      name
      quantity
      variantTitle
      presentmentTitle
      price {
        amount
        currencyCode
      }
      currentTotalPrice {
        amount
        currencyCode
      }
      variantId
      variantOptions {
        name
        value
      }
      giftCard
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
          ${ORDER_LIST_FIELDS}
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
      ${ORDER_DETAIL_FIELDS}
    }
  }
`;

const ORDER_BY_ID_FALLBACK_QUERY = `#graphql
  query CustomerOrderByIdFallback($id: ID!) {
    order(id: $id) {
      ${ORDER_LIST_FIELDS}
    }
  }
`;

type LineItemNode = {
  id: string;
  title: string;
  name?: string | null;
  quantity: number;
  variantTitle?: string | null;
  presentmentTitle?: string | null;
  price?: { amount: string; currencyCode: string } | null;
  currentTotalPrice?: { amount: string; currencyCode: string } | null;
  variantId?: string | null;
  variantOptions?: { name: string; value: string }[] | null;
  giftCard?: boolean | null;
  image?: { url?: string | null; altText?: string | null } | null;
};

type OrderAddressNode = {
  formatted?: string[] | null;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  territoryCode?: string | null;
  phoneNumber?: string | null;
};

type OrderTransactionNode = {
  status?: string | null;
  kind?: string | null;
  type?: string | null;
  processedAt?: string | null;
  paymentIcon?: { altText?: string | null } | null;
  typeDetails?: {
    name?: string | null;
    message?: string | null;
  } | null;
  paymentDetails?: {
    last4?: string | null;
    cardBrand?: string | null;
  } | null;
  transactionAmount?: {
    presentmentMoney?: { amount: string; currencyCode: string } | null;
  } | null;
};

type OrderNode = {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus?: string | null;
  statusPageUrl: string;
  totalPrice: { amount: string; currencyCode: string };
  subtotal?: { amount: string; currencyCode: string } | null;
  totalShipping?: { amount: string; currencyCode: string } | null;
  totalTax?: { amount: string; currencyCode: string } | null;
  email?: string | null;
  phone?: string | null;
  shippingAddress?: OrderAddressNode | null;
  billingAddress?: OrderAddressNode | null;
  fulfillments?: {
    nodes?: {
      createdAt?: string | null;
      updatedAt?: string | null;
      latestShipmentStatus?: string | null;
      isPickedUp?: boolean;
      status?: string | null;
      trackingInformation?: {
        company?: string | null;
        number?: string | null;
        url?: string | null;
      }[];
      events?: {
        nodes?: {
          status?: string | null;
          happenedAt?: string | null;
        }[];
      } | null;
    }[];
  };
  transactions?: OrderTransactionNode[];
  lineItems?: {
    nodes?: LineItemNode[];
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

type CustomerOrdersConnection = NonNullable<
  NonNullable<OrdersPageResult["customer"]>["orders"]
>;

type OrderByIdResult = {
  order?: OrderNode | null;
};

const ORDERS_PAGE_SIZE = 50;
const MAX_ORDER_PAGES = 20;

function pickLineItemTitle(node: LineItemNode): string {
  const name = node.name?.trim();
  const title = node.title?.trim();
  const presentment = node.presentmentTitle?.trim();

  if (name && title && name.length >= title.length) {
    return name;
  }

  if (title && name && title.length > name.length) {
    return title;
  }

  return name || title || presentment || "Item";
}

function mapLineItem(node: LineItemNode, detailed = false): OrderLineItemSummary {
  return {
    id: node.id,
    title: pickLineItemTitle(node),
    quantity: node.quantity,
    variantId: node.variantId && !node.giftCard ? node.variantId : null,
    imageUrl: node.image?.url ?? null,
    imageAlt: node.image?.altText ?? null,
    variantTitle: detailed ? node.variantTitle ?? node.presentmentTitle ?? null : null,
    unitPrice:
      detailed && node.price
        ? { amount: node.price.amount, currencyCode: node.price.currencyCode }
        : null,
    lineTotal:
      detailed && node.currentTotalPrice
        ? {
            amount: node.currentTotalPrice.amount,
            currencyCode: node.currentTotalPrice.currencyCode,
          }
        : null,
    variantOptions:
      detailed && node.variantOptions
        ? node.variantOptions.map((option) => ({
            name: option.name,
            value: option.value,
          }))
        : [],
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

function mapOrder(order: OrderNode, detailed = false): OrderSummary {
  const lineItems = (order.lineItems?.nodes ?? []).map((node) => mapLineItem(node, detailed));

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

function mapMoney(
  money: { amount: string; currencyCode: string } | null | undefined
): { amount: string; currencyCode: string } | null {
  if (!money) return null;
  return { amount: money.amount, currencyCode: money.currencyCode };
}

function extractTracking(order: OrderNode): OrderTrackingSummary | null {
  for (const fulfillment of order.fulfillments?.nodes ?? []) {
    for (const tracking of fulfillment.trackingInformation ?? []) {
      if (tracking.number || tracking.url) {
        return {
          company: tracking.company ?? null,
          number: tracking.number ?? null,
          url: tracking.url ?? null,
        };
      }
    }
  }

  return null;
}

function mapOrderAddress(node: OrderAddressNode | null | undefined): OrderAddressSummary | null {
  if (!node) return null;

  return {
    formatted: node.formatted ?? [],
    firstName: node.firstName ?? null,
    lastName: node.lastName ?? null,
    address1: node.address1 ?? null,
    address2: node.address2 ?? null,
    city: node.city ?? null,
    province: node.province ?? null,
    zip: node.zip ?? null,
    territoryCode: node.territoryCode ?? null,
    phoneNumber: node.phoneNumber ?? null,
  };
}

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  BANK_DEPOSIT: "Bank deposit",
  CARD: "Card",
  CASH_ON_DELIVERY: "Cash on delivery",
  CUSTOM: "Custom",
  GIFT_CARD: "Gift card",
  MANUAL: "Manual",
  MONEY_ORDER: "Money order",
  SHOPIFY_INSTALLMENTS: "Shopify installments",
  STORE_CREDIT: "Store credit",
};

function formatCardBrand(brand: string): string {
  const normalized = brand.trim();

  if (!normalized) {
    return "Card";
  }

  if (normalized.length <= 4) {
    return normalized.toUpperCase();
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function formatTransactionTypeLabel(type: string | null | undefined): string | null {
  if (!type) {
    return null;
  }

  return TRANSACTION_TYPE_LABELS[type] ?? type.replace(/_/g, " ").toLowerCase();
}

function paymentMethodLabel(transaction: OrderTransactionNode): string | null {
  const card = transaction.paymentDetails;

  if (card?.last4) {
    const brand = formatCardBrand(card.cardBrand ?? transaction.paymentIcon?.altText ?? "Card");
    return `${brand} ending in ${card.last4}`;
  }

  const iconLabel = transaction.paymentIcon?.altText?.trim();
  if (iconLabel) {
    return iconLabel;
  }

  const typeName = transaction.typeDetails?.name?.trim();
  if (typeName) {
    return typeName;
  }

  return formatTransactionTypeLabel(transaction.type);
}

function extractPayment(order: OrderNode): OrderDetailSummary["payment"] {
  const transactions = order.transactions ?? [];
  const sale =
    transactions.find(
      (transaction) => transaction.kind === "SALE" || transaction.kind === "CAPTURE"
    ) ?? transactions[0];

  if (!sale) {
    return null;
  }

  const amount = sale.transactionAmount?.presentmentMoney ?? null;
  const processedAt = sale.processedAt ?? order.processedAt ?? null;
  const amountSummary = amount
    ? { amount: amount.amount, currencyCode: amount.currencyCode }
    : null;
  const label = paymentMethodLabel(sale);

  if (!label && !amountSummary) {
    return null;
  }

  return {
    label: label ?? "Payment",
    amount: amountSummary,
    processedAt,
  };
}

export function formatOrderPaymentAmount(
  money: { amount: string; currencyCode: string } | null | undefined
): string | null {
  if (!money) return null;

  const amount = parseFloat(money.amount);
  if (!Number.isFinite(amount)) return null;

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${money.currencyCode}`;
}

function fulfillmentCreatedAt(order: OrderNode): string | null {
  const dates = (order.fulfillments?.nodes ?? [])
    .map((node) => node.createdAt)
    .filter(Boolean) as string[];

  if (dates.length === 0) return null;
  return dates.sort()[0] ?? null;
}

function deliveredAt(order: OrderNode): string | null {
  for (const fulfillment of order.fulfillments?.nodes ?? []) {
    const deliveredEvent = fulfillment.events?.nodes?.find(
      (event) => event.status === "DELIVERED" || event.status === "PICKED_UP"
    );

    if (deliveredEvent?.happenedAt) {
      return deliveredEvent.happenedAt;
    }
  }

  if (
    order.fulfillments?.nodes?.some(
      (node) =>
        node.latestShipmentStatus === "DELIVERED" ||
        node.latestShipmentStatus === "PICKED_UP" ||
        node.isPickedUp
    )
  ) {
    const updated = order.fulfillments?.nodes
      ?.map((node) => node.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    return updated ?? null;
  }

  return null;
}

function estimateCraftingDate(processedAt: string, shippedAt: string | null): string {
  if (!shippedAt) {
    return processedAt;
  }

  const processed = new Date(processedAt).getTime();
  const shipped = new Date(shippedAt).getTime();

  if (!Number.isFinite(processed) || !Number.isFinite(shipped) || shipped <= processed) {
    return processedAt;
  }

  const estimate = processed + 86_400_000;
  return estimate < shipped ? new Date(estimate).toISOString() : processedAt;
}

export function buildOrderProgressSteps(order: OrderSummary): OrderProgressStep[] {
  const shippedAt = fulfillmentCreatedAt(order as OrderNode);
  const deliveredDate = deliveredAt(order as OrderNode);
  const isDelivered =
    order.latestShipmentStatus === "DELIVERED" ||
    order.latestShipmentStatus === "PICKED_UP" ||
    Boolean(deliveredDate);
  const isShipped =
    isDelivered ||
    Boolean(shippedAt) ||
    order.fulfillmentStatus === "FULFILLED" ||
    order.fulfillmentStatus === "PARTIALLY_FULFILLED";

  const steps: OrderProgressStep[] = [
    {
      id: "confirmed",
      label: "Confirmed",
      date: order.processedAt,
      complete: true,
      current: false,
    },
    {
      id: "crafting",
      label: "Crafting",
      date: estimateCraftingDate(order.processedAt, isShipped ? shippedAt : null),
      complete: isShipped,
      current: false,
    },
    {
      id: "shipped",
      label: "Shipped",
      date: shippedAt,
      complete: isShipped,
      current: false,
    },
    {
      id: "delivered",
      label: "Delivered",
      date: deliveredDate,
      complete: isDelivered,
      current: false,
    },
  ];

  const activeId: OrderProgressStep["id"] = isDelivered
    ? "delivered"
    : isShipped
      ? "shipped"
      : "crafting";

  return steps.map((step) => ({
    ...step,
    current: step.id === activeId,
  }));
}

function mapOrderDetail(order: OrderNode, detailed = true): OrderDetailSummary {
  const base = mapOrder(order, detailed);

  return {
    ...base,
    subtotal: detailed ? mapMoney(order.subtotal) : null,
    totalShipping: detailed ? mapMoney(order.totalShipping) : null,
    totalTax: detailed ? mapMoney(order.totalTax) : null,
    email: detailed ? order.email ?? null : null,
    phone: detailed ? order.phone ?? null : null,
    shippingAddress: detailed ? mapOrderAddress(order.shippingAddress) : null,
    billingAddress: detailed ? mapOrderAddress(order.billingAddress) : null,
    tracking: detailed ? extractTracking(order) : null,
    payment: detailed ? extractPayment(order) : null,
    progressSteps: buildOrderProgressSteps(base),
  };
}

export function formatOrderHeroSubtitle(order: Pick<OrderSummary, "processedAt" | "totalItemCount">): string {
  const items = order.totalItemCount;
  const itemLabel = `${items} ${items === 1 ? "item" : "items"}`;
  const placed = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(order.processedAt));

  return `Placed ${placed} · ${itemLabel}`;
}

export function formatOrderPlacedLabel(isoDate: string): string {
  return `Placed ${formatOrderDate(isoDate)}`;
}

export function formatMoneyAmount(
  money: { amount: string; currencyCode: string } | null | undefined
): string | null {
  if (!money) return null;

  const amount = parseFloat(money.amount);
  if (!Number.isFinite(amount)) return null;

  if (amount === 0 && money.currencyCode) {
    return "Complimentary";
  }

  return formatPrice(money.amount, money.currencyCode);
}

export function formatOrderTotalDisplay(
  money: { amount: string; currencyCode: string } | null | undefined
): string | null {
  if (!money) return null;

  const amount = parseFloat(money.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${money.currencyCode}`;
}

export function formatOrderShippingAmount(
  money: { amount: string; currencyCode: string } | null | undefined
): string | null {
  if (!money) return null;

  const amount = parseFloat(money.amount);
  if (!Number.isFinite(amount)) return null;

  if (amount === 0) {
    return "Free";
  }

  return formatPrice(money.amount, money.currencyCode);
}

export function formatOrderAddressLines(address: OrderAddressSummary | null): string[] {
  if (!address) return [];

  if (address.formatted.length > 0) {
    return address.formatted;
  }

  return [
    [address.firstName, address.lastName].filter(Boolean).join(" "),
    address.address1,
    address.address2,
    [address.city, address.province, address.zip].filter(Boolean).join(", "),
    address.territoryCode,
    address.phoneNumber,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

export function formatOrderContactName(order: OrderDetailSummary): string | null {
  const shipping = order.shippingAddress;
  const name = [shipping?.firstName, shipping?.lastName].filter(Boolean).join(" ").trim();

  if (name) {
    return name;
  }

  const billing = order.billingAddress;
  return [billing?.firstName, billing?.lastName].filter(Boolean).join(" ").trim() || null;
}

export function getLineItemOption(
  item: OrderLineItemSummary,
  optionName: string
): string | null {
  const normalized = optionName.toLowerCase();

  const exact = item.variantOptions.find(
    (option) => option.name.toLowerCase() === normalized
  );
  if (exact?.value) {
    return exact.value;
  }

  const fuzzy = item.variantOptions.find((option) => {
    const name = option.name.toLowerCase();
    return name.includes(normalized) || normalized.includes(name);
  });

  return fuzzy?.value ?? null;
}

export function formatLineItemVariant(item: OrderLineItemSummary): string | null {
  const size = getLineItemOption(item, "size");
  const metal = getLineItemOption(item, "metal");
  const parts = [size, metal].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" / ");
  }

  if (item.variantTitle && item.variantTitle !== item.title) {
    const firstLine = item.variantTitle.split(/\n/)[0]?.trim();
    if (firstLine && !firstLine.toLowerCase().startsWith(item.title.toLowerCase())) {
      return firstLine;
    }
  }

  return null;
}

export type OrderBuyAgainLine = {
  merchandiseId: string;
  quantity: number;
};

export function getOrderBuyAgainLines(lineItems: OrderLineItemSummary[]): OrderBuyAgainLine[] {
  return lineItems
    .filter((item) => item.variantId && item.quantity > 0)
    .map((item) => ({
      merchandiseId: item.variantId!,
      quantity: item.quantity,
    }));
}

export async function fetchCustomerOrders(accessToken: string): Promise<OrderSummary[]> {
  const orders: OrderSummary[] = [];
  let cursor: string | null = null;
  let page = 0;

  while (page < MAX_ORDER_PAGES) {
    page += 1;

    const result: { data: OrdersPageResult | null; errors: string[] } =
      await customerAccountFetch<OrdersPageResult>(
      accessToken,
      ORDERS_PAGE_QUERY,
      {
        first: ORDERS_PAGE_SIZE,
        after: cursor,
      }
    );
    const data: OrdersPageResult | null = result.data;
    const errors = result.errors;

    if (errors.length) {
      console.error("Customer orders query failed:", errors);
      if (!data?.customer?.orders?.nodes?.length) {
        break;
      }
    }

    const connection: CustomerOrdersConnection | undefined = data?.customer?.orders;
    const nodes = connection?.nodes ?? [];

    orders.push(...nodes.map((node) => mapOrder(node)));

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

export type OrderShipmentTrackingFallback = {
  headline: string;
  detail?: string;
};

export function getOrderShipmentTrackingFallback(
  order: OrderStatusInput & {
    progressSteps?: OrderProgressStep[];
  }
): OrderShipmentTrackingFallback {
  const shipmentStatus = order.latestShipmentStatus;
  const fulfillment = order.fulfillmentStatus;
  const deliveredComplete = order.progressSteps?.find((step) => step.id === "delivered")?.complete;
  const shippedComplete = order.progressSteps?.find((step) => step.id === "shipped")?.complete;

  if (shipmentStatus === "DELIVERED" || (deliveredComplete && !shipmentStatus)) {
    return {
      headline: "Your order has been delivered.",
      detail: "Carrier tracking is not available for this shipment.",
    };
  }

  if (shipmentStatus === "PICKED_UP") {
    return {
      headline: "Your order was picked up.",
    };
  }

  if (shipmentStatus === "PARTIALLY_DELIVERED") {
    return {
      headline: "Part of your order has been delivered.",
      detail: "Carrier tracking is not available for this shipment.",
    };
  }

  if (shipmentStatus === "FAILURE") {
    return {
      headline: "There was an issue with delivery.",
      detail: "Contact us and we will help resolve this.",
    };
  }

  if (
    shipmentStatus &&
    CUSTOMER_FACING_SHIPMENT_STATUSES.has(shipmentStatus) &&
    shipmentStatus !== "DELIVERED" &&
    shipmentStatus !== "PICKED_UP"
  ) {
    const statusLabel = SHIPMENT_STATUS_LABELS[shipmentStatus] ?? "On its way";
    return {
      headline: `Your order is ${statusLabel.toLowerCase()}.`,
      detail: "Live carrier tracking is not available for this shipment.",
    };
  }

  if (fulfillment === "FULFILLED" || fulfillment === "PARTIALLY_FULFILLED" || shippedComplete) {
    return {
      headline: "Your order has shipped.",
      detail: "Carrier tracking is not available for this shipment.",
    };
  }

  if (fulfillment === "ON_HOLD") {
    return {
      headline: "Your order is on hold.",
      detail: "We will update you when it moves forward.",
    };
  }

  if (fulfillment === "SCHEDULED") {
    return {
      headline: "Your order is scheduled.",
      detail: "We will begin preparing it closer to the ship date.",
    };
  }

  return {
    headline: "We're preparing these items for shipping.",
  };
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
): Promise<OrderDetailSummary | null> {
  const gid = orderGidFromId(orderId);

  const { data, errors } = await customerAccountFetch<OrderByIdResult>(
    accessToken,
    ORDER_BY_ID_QUERY,
    { id: gid }
  );

  if (!errors.length && data?.order) {
    return mapOrderDetail(data.order);
  }

  if (errors.length) {
    console.error("Customer order detail query failed:", errors);
  }

  const fallback = await customerAccountFetch<OrderByIdResult>(
    accessToken,
    ORDER_BY_ID_FALLBACK_QUERY,
    { id: gid }
  );

  if (fallback.errors.length) {
    console.error("Customer order fallback query failed:", fallback.errors);
    return null;
  }

  if (!fallback.data?.order) {
    return null;
  }

  return mapOrderDetail(fallback.data.order, false);
}
