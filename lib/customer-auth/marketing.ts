import { customerAccountFetch } from "./graphql";

const MARKETING_SUBSCRIBE = `#graphql
  mutation CustomerEmailMarketingSubscribe {
    customerEmailMarketingSubscribe {
      emailAddress {
        emailAddress
        marketingState
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const MARKETING_UNSUBSCRIBE = `#graphql
  mutation CustomerEmailMarketingUnsubscribe {
    customerEmailMarketingUnsubscribe {
      emailAddress {
        emailAddress
        marketingState
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type MarketingMutationResult = {
  customerEmailMarketingSubscribe?: {
    emailAddress?: { emailAddress?: string | null; marketingState?: string | null } | null;
    userErrors?: { message: string }[];
  };
  customerEmailMarketingUnsubscribe?: {
    emailAddress?: { emailAddress?: string | null; marketingState?: string | null } | null;
    userErrors?: { message: string }[];
  };
};

export function isEmailMarketingSubscribed(state: string | null | undefined): boolean {
  return state === "SUBSCRIBED";
}

export function formatEmailMarketingState(state: string | null | undefined): string {
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

export async function setEmailMarketingSubscription(
  accessToken: string,
  subscribed: boolean
): Promise<{ marketingState: string | null; errors: string[] }> {
  const { data, errors } = await customerAccountFetch<MarketingMutationResult>(
    accessToken,
    subscribed ? MARKETING_SUBSCRIBE : MARKETING_UNSUBSCRIBE
  );

  if (errors.length) {
    return { marketingState: null, errors };
  }

  const payload = subscribed
    ? data?.customerEmailMarketingSubscribe
    : data?.customerEmailMarketingUnsubscribe;
  const userErrors = payload?.userErrors ?? [];

  if (userErrors.length) {
    return { marketingState: null, errors: userErrors.map((error) => error.message) };
  }

  return {
    marketingState: payload?.emailAddress?.marketingState ?? null,
    errors: [],
  };
}
