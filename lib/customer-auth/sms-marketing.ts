import { shopifyAdminFetch } from "@/lib/shopify";

const SMS_MARKETING_UPDATE = `#graphql
  mutation CustomerSmsMarketingConsentUpdate($input: CustomerSmsMarketingConsentUpdateInput!) {
    customerSmsMarketingConsentUpdate(input: $input) {
      customer {
        id
        smsMarketingConsent {
          marketingState
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type SmsMarketingUpdateResult = {
  customerSmsMarketingConsentUpdate?: {
    customer?: {
      smsMarketingConsent?: { marketingState?: string | null } | null;
    } | null;
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

export function isSmsMarketingSubscribed(state: string | null | undefined): boolean {
  return state === "SUBSCRIBED";
}

export function formatSmsMarketingState(state: string | null | undefined): string {
  switch (state) {
    case "SUBSCRIBED":
      return "Subscribed";
    case "PENDING":
      return "Confirmation pending";
    case "UNSUBSCRIBED":
      return "Unsubscribed";
    case "NOT_SUBSCRIBED":
      return "Not subscribed";
    default:
      return "Not subscribed";
  }
}

export async function setSmsMarketingSubscription(
  customerId: string,
  subscribed: boolean
): Promise<{ marketingState: string | null; errors: string[] }> {
  try {
    const data = await shopifyAdminFetch<SmsMarketingUpdateResult>(SMS_MARKETING_UPDATE, {
      input: {
        customerId,
        smsMarketingConsent: subscribed
          ? {
              marketingState: "SUBSCRIBED",
              marketingOptInLevel: "SINGLE_OPT_IN",
            }
          : {
              marketingState: "UNSUBSCRIBED",
            },
      },
    });

    const payload = data.customerSmsMarketingConsentUpdate;
    const userErrors = payload?.userErrors ?? [];

    if (userErrors.length) {
      return { marketingState: null, errors: userErrors.map((error) => error.message) };
    }

    return {
      marketingState: payload?.customer?.smsMarketingConsent?.marketingState ?? null,
      errors: [],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "SMS preference could not be saved.";

    return { marketingState: null, errors: [message] };
  }
}
