import { customerAccountFetch } from "./graphql";
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
        marketingState
      }
      phoneNumber {
        phoneNumber
        marketingState
      }
      defaultAddress {
        id
      }
      addresses(first: 20) {
        nodes {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          zip
          territoryCode
          zoneCode
          phoneNumber
          formatted(withName: true, withCompany: true)
        }
      }
    }
  }
`;

type CustomerQueryResult = {
  customer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    imageUrl?: string | null;
    emailAddress?: {
      emailAddress?: string | null;
      marketingState?: string | null;
    } | null;
    phoneNumber?: {
      phoneNumber?: string | null;
      marketingState?: string | null;
    } | null;
    defaultAddress?: { id: string } | null;
    addresses?: {
      nodes?: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        company?: string | null;
        address1?: string | null;
        address2?: string | null;
        city?: string | null;
        province?: string | null;
        zip?: string | null;
        territoryCode?: string | null;
        zoneCode?: string | null;
        phoneNumber?: string | null;
        formatted?: string[];
      }[];
    };
  } | null;
};

function mapCustomer(customer: NonNullable<CustomerQueryResult["customer"]>): CustomerSummary {
  return {
    id: customer.id,
    firstName: customer.firstName ?? null,
    lastName: customer.lastName ?? null,
    displayName: customer.displayName ?? null,
    email: customer.emailAddress?.emailAddress ?? null,
    imageUrl: customer.imageUrl ?? null,
    phone: customer.phoneNumber?.phoneNumber ?? null,
    emailMarketingState: customer.emailAddress?.marketingState ?? null,
    smsMarketingState: customer.phoneNumber?.marketingState ?? null,
    defaultAddressId: customer.defaultAddress?.id ?? null,
    addresses: (customer.addresses?.nodes ?? []).map((node) => ({
      id: node.id,
      firstName: node.firstName ?? null,
      lastName: node.lastName ?? null,
      company: node.company ?? null,
      address1: node.address1 ?? null,
      address2: node.address2 ?? null,
      city: node.city ?? null,
      province: node.province ?? null,
      zip: node.zip ?? null,
      territoryCode: node.territoryCode ?? null,
      zoneCode: node.zoneCode ?? null,
      phoneNumber: node.phoneNumber ?? null,
      formatted: node.formatted ?? [],
    })),
  };
}

export async function fetchCustomerProfile(
  accessToken: string
): Promise<CustomerSummary | null> {
  const { data, errors } = await customerAccountFetch<CustomerQueryResult>(
    accessToken,
    CUSTOMER_QUERY
  );

  if (errors.length || !data?.customer) {
    return null;
  }

  return mapCustomer(data.customer);
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

export function isProfileComplete(customer: CustomerSummary): boolean {
  return Boolean(customer.firstName?.trim());
}

const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation CustomerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        displayName
        imageUrl
        emailAddress {
          emailAddress
          marketingState
        }
        phoneNumber {
          phoneNumber
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type CustomerUpdateResult = {
  customerUpdate?: {
    customer?: CustomerQueryResult["customer"];
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

export type CustomerProfileInput = {
  firstName: string;
  lastName?: string;
};

export async function updateCustomerProfile(
  accessToken: string,
  input: CustomerProfileInput
): Promise<{ customer: CustomerSummary | null; errors: string[] }> {
  const { data, errors } = await customerAccountFetch<CustomerUpdateResult>(
    accessToken,
    CUSTOMER_UPDATE_MUTATION,
    {
      input: {
        firstName: input.firstName.trim(),
        ...(input.lastName?.trim() ? { lastName: input.lastName.trim() } : {}),
      },
    }
  );

  if (errors.length) {
    return { customer: null, errors };
  }

  const payload = data?.customerUpdate;
  const userErrors = payload?.userErrors ?? [];

  if (userErrors.length) {
    return { customer: null, errors: userErrors.map((error) => error.message) };
  }

  const customer = payload?.customer;
  if (!customer) {
    return { customer: null, errors: ["Profile could not be updated."] };
  }

  return {
    customer: mapCustomer(customer),
    errors: [],
  };
}
