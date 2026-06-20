import { shopifyAdminFetch } from "@/lib/shopify";

const CUSTOMER_EMAIL_UPDATE = `#graphql
  mutation CustomerEmailUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        email
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type CustomerEmailUpdateResult = {
  customerUpdate?: {
    customer?: { id: string; email?: string | null } | null;
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function sanitizeEmail(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toLowerCase() ?? "";
  return isValidEmail(trimmed) ? trimmed : null;
}

export async function updateCustomerEmailAdmin(
  customerId: string,
  email: string
): Promise<{ email: string | null; errors: string[] }> {
  const trimmed = email.trim().toLowerCase();

  if (!isValidEmail(trimmed)) {
    return { email: null, errors: ["Enter a valid email address."] };
  }

  try {
    const data = await shopifyAdminFetch<CustomerEmailUpdateResult>(CUSTOMER_EMAIL_UPDATE, {
      input: {
        id: customerId,
        email: trimmed,
      },
    });

    const userErrors = data.customerUpdate?.userErrors ?? [];

    if (userErrors.length) {
      return { email: null, errors: userErrors.map((error) => error.message) };
    }

    return {
      email: data.customerUpdate?.customer?.email ?? trimmed,
      errors: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email could not be updated.";
    return { email: null, errors: [message] };
  }
}
