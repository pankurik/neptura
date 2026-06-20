import { fetchCustomerAvatarUrl } from "./avatar";
import { CustomerAuthError } from "./auth-errors";
import { updateCustomerEmailAdmin } from "./email";
import { fetchCustomerBespokeCommissions } from "./bespoke-commissions";
import { fetchCustomerPreferences } from "./preferences";
import { forceRefreshCustomerAccessToken } from "./session";
import { fetchCustomerWishlist } from "./wishlist";
import { customerAccountFetch } from "./graphql";
import type { CustomerSummary } from "./types";

const CUSTOMER_QUERY = `#graphql
  query CustomerProfile {
    customer {
      id
      firstName
      lastName
      displayName
      creationDate
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
    creationDate?: string | null;
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
    avatarUrl: null,
    phone: customer.phoneNumber?.phoneNumber ?? null,
    memberSince: customer.creationDate ?? null,
    birthday: null,
    anniversary: null,
    ringSize: null,
    jewelryPreferences: [],
    wishlistHandles: [],
    bespokeCommissions: [],
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

  const customer = mapCustomer(data.customer);
  const [avatarUrl, preferences, wishlistHandles, bespokeCommissions] = await Promise.all([
    fetchCustomerAvatarUrl(customer.id),
    fetchCustomerPreferences(customer.id),
    fetchCustomerWishlist(customer.id),
    fetchCustomerBespokeCommissions(customer.id),
  ]);

  return {
    ...customer,
    avatarUrl,
    ...preferences,
    wishlistHandles,
    bespokeCommissions,
  };
}

export { formatMemberSince, getCustomerDisplayLabel, getCustomerFullName, getCustomerInitials, getCustomerAvatarUrl, isProfileComplete } from "./display";

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
  email?: string;
};

export type CustomerProfileUpdateResult = {
  customer: CustomerSummary | null;
  errors: string[];
  suggestReauth?: boolean;
};

function applyProfileInput(
  current: CustomerSummary,
  input: CustomerProfileInput,
  email: string | null
): CustomerSummary {
  return {
    ...current,
    email,
    firstName: input.firstName.trim(),
    lastName: input.lastName?.trim() ?? current.lastName,
  };
}

export async function updateCustomerProfile(
  accessToken: string,
  input: CustomerProfileInput
): Promise<CustomerProfileUpdateResult> {
  try {
    return await updateCustomerProfileWithToken(accessToken, input);
  } catch (error) {
    if (!(error instanceof CustomerAuthError)) {
      throw error;
    }
  }

  const refreshedToken = await forceRefreshCustomerAccessToken();

  if (!refreshedToken) {
    return { customer: null, errors: ["Your session expired. Please sign in again."] };
  }

  try {
    return await updateCustomerProfileWithToken(refreshedToken, input);
  } catch (error) {
    if (error instanceof CustomerAuthError) {
      return { customer: null, errors: ["Your session expired. Please sign in again."] };
    }

    throw error;
  }
}

async function updateCustomerProfileWithToken(
  accessToken: string,
  input: CustomerProfileInput
): Promise<CustomerProfileUpdateResult> {
  let token = accessToken;

  let current: CustomerSummary | null;
  try {
    current = await fetchCustomerProfile(token);
  } catch (error) {
    if (error instanceof CustomerAuthError) {
      throw error;
    }
    return { customer: null, errors: ["Not signed in."] };
  }

  if (!current) {
    return { customer: null, errors: ["Not signed in."] };
  }

  const trimmedEmail = input.email?.trim().toLowerCase() ?? "";
  const currentEmail = current.email?.trim().toLowerCase() ?? "";
  const emailWillChange = Boolean(trimmedEmail && trimmedEmail !== currentEmail);

  // Update name first while the Customer Account token is still valid.
  try {
    const { data, errors } = await customerAccountFetch<CustomerUpdateResult>(
      token,
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

    const userErrors = data?.customerUpdate?.userErrors ?? [];
    if (userErrors.length) {
      return { customer: null, errors: userErrors.map((error) => error.message) };
    }
  } catch (error) {
    if (error instanceof CustomerAuthError) {
      throw error;
    }
    return { customer: null, errors: ["Profile could not be updated."] };
  }

  let updatedEmail = current.email;

  if (emailWillChange) {
    const emailResult = await updateCustomerEmailAdmin(current.id, trimmedEmail);

    if (emailResult.errors.length) {
      return { customer: null, errors: emailResult.errors };
    }

    updatedEmail = emailResult.email ?? trimmedEmail;

    const refreshed = await forceRefreshCustomerAccessToken();
    if (refreshed) {
      token = refreshed;
    }
  }

  try {
    const updated = await fetchCustomerProfile(token);

    if (updated) {
      return { customer: updated, errors: [] };
    }
  } catch (error) {
    if (emailWillChange && error instanceof CustomerAuthError) {
      return {
        customer: applyProfileInput(current, input, updatedEmail),
        errors: [],
        suggestReauth: true,
      };
    }

    throw error;
  }

  if (emailWillChange) {
    return {
      customer: applyProfileInput(current, input, updatedEmail),
      errors: [],
      suggestReauth: true,
    };
  }

  return { customer: null, errors: ["Profile could not be updated."] };
}
