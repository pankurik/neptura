import { fetchCustomerAccountApiConfiguration } from "./discovery";
import type { OrderLineItemSummary, OrderSummary } from "./types";

const ORDERS_QUERY = `#graphql
  query CustomerOrders($first: Int!) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
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
          lineItems(first: 4) {
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
        }
      }
    }
  }
`;

type OrdersQueryResult = {
  data?: {
    customer?: {
      orders?: {
        nodes?: {
          id: string;
          name: string;
          processedAt: string;
          fulfillmentStatus: string;
          financialStatus?: string | null;
          statusPageUrl: string;
          totalPrice: { amount: string; currencyCode: string };
          lineItems?: {
            nodes?: {
              id: string;
              title: string;
              quantity: number;
              image?: { url?: string | null; altText?: string | null } | null;
            }[];
          };
        }[];
      };
    } | null;
  };
  errors?: { message: string }[];
};

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

export async function fetchCustomerOrders(
  accessToken: string,
  first = 10
): Promise<OrderSummary[]> {
  const { graphql_api } = await fetchCustomerAccountApiConfiguration();

  const response = await fetch(graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({
      query: ORDERS_QUERY,
      variables: { first },
    }),
    cache: "no-store",
  });

  const json = (await response.json()) as OrdersQueryResult;

  if (json.errors?.length) {
    console.error("Customer orders query failed:", json.errors);
    return [];
  }

  const nodes = json.data?.customer?.orders?.nodes ?? [];

  return nodes.map((order) => ({
    id: order.id,
    name: order.name,
    processedAt: order.processedAt,
    fulfillmentStatus: order.fulfillmentStatus,
    financialStatus: order.financialStatus ?? null,
    totalPrice: order.totalPrice,
    statusPageUrl: order.statusPageUrl,
    lineItems: (order.lineItems?.nodes ?? []).map(mapLineItem),
  }));
}

const FULFILLMENT_LABELS: Record<string, string> = {
  FULFILLED: "Fulfilled",
  UNFULFILLED: "Processing",
  PARTIALLY_FULFILLED: "Partially fulfilled",
  SCHEDULED: "Scheduled",
  ON_HOLD: "On hold",
};

export function formatFulfillmentStatus(status: string): string {
  return FULFILLMENT_LABELS[status] ?? status.replace(/_/g, " ").toLowerCase();
}

export function formatOrderDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}
