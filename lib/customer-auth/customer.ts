import { fetchCustomerAccountApiConfiguration } from "./discovery";
import type { CustomerSummary } from "./types";

const CUSTOMER_QUERY = `#graphql
  query CustomerProfile {
    customer {
      id
      firstName
      lastName
      displayName
      imageUrl
      emailAddress {
        emailAddress
      }
    }
  }
`;

type CustomerQueryResult = {
  data?: {
    customer?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      displayName?: string | null;
      imageUrl?: string | null;
      emailAddress?: { emailAddress?: string | null } | null;
    } | null;
  };
  errors?: { message: string }[];
};

export async function fetchCustomerProfile(
  accessToken: string
): Promise<CustomerSummary | null> {
  const { graphql_api } = await fetchCustomerAccountApiConfiguration();

  const response = await fetch(graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query: CUSTOMER_QUERY }),
    cache: "no-store",
  });

  const json = (await response.json()) as CustomerQueryResult;

  if (json.errors?.length || !json.data?.customer) {
    return null;
  }

  const customer = json.data.customer;

  return {
    id: customer.id,
    firstName: customer.firstName ?? null,
    lastName: customer.lastName ?? null,
    displayName: customer.displayName ?? null,
    email: customer.emailAddress?.emailAddress ?? null,
    imageUrl: customer.imageUrl ?? null,
  };
}

export function getCustomerInitials(customer: CustomerSummary): string {
  const first = customer.firstName?.trim().charAt(0) ?? "";
  const last = customer.lastName?.trim().charAt(0) ?? "";

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  const emailInitial = customer.email?.trim().charAt(0);
  return emailInitial ? emailInitial.toUpperCase() : "?";
}

export function getCustomerDisplayLabel(customer: CustomerSummary): string {
  if (customer.firstName) return customer.firstName;
  if (customer.displayName) return customer.displayName;
  if (customer.email) return customer.email.split("@")[0] ?? "Account";
  return "Account";
}
