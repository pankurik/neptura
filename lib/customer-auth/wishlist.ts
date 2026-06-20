import { shopifyAdminFetch } from "@/lib/shopify";

export const WISHLIST_METAFIELD_NAMESPACE = "custom";
export const WISHLIST_METAFIELD_KEY = "wishlist";

const METAFIELDS_SET = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const METAFIELDS_DELETE = `#graphql
  mutation MetafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      deletedMetafields {
        key
        namespace
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CUSTOMER_WISHLIST_QUERY = `#graphql
  query CustomerWishlist($id: ID!) {
    customer(id: $id) {
      wishlist: metafield(namespace: "${WISHLIST_METAFIELD_NAMESPACE}", key: "${WISHLIST_METAFIELD_KEY}") {
        value
      }
    }
  }
`;

type MetafieldsSetResult = {
  metafieldsSet?: {
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

type MetafieldsDeleteResult = {
  metafieldsDelete?: {
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

type CustomerWishlistResult = {
  customer?: {
    wishlist?: { value?: string | null } | null;
  } | null;
};

function parseWishlistHandles(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim())))
    );
  } catch {
    return [];
  }
}

async function saveWishlistHandles(
  customerId: string,
  handles: string[]
): Promise<string[]> {
  if (handles.length === 0) {
    const data = await shopifyAdminFetch<MetafieldsDeleteResult>(METAFIELDS_DELETE, {
      metafields: [
        {
          ownerId: customerId,
          namespace: WISHLIST_METAFIELD_NAMESPACE,
          key: WISHLIST_METAFIELD_KEY,
        },
      ],
    });

    return (data.metafieldsDelete?.userErrors ?? []).map((error) => error.message);
  }

  const data = await shopifyAdminFetch<MetafieldsSetResult>(METAFIELDS_SET, {
    metafields: [
      {
        ownerId: customerId,
        namespace: WISHLIST_METAFIELD_NAMESPACE,
        key: WISHLIST_METAFIELD_KEY,
        type: "list.single_line_text_field",
        value: JSON.stringify(handles),
      },
    ],
  });

  return (data.metafieldsSet?.userErrors ?? []).map((error) => error.message);
}

export async function fetchCustomerWishlist(customerId: string): Promise<string[]> {
  try {
    const data = await shopifyAdminFetch<CustomerWishlistResult>(CUSTOMER_WISHLIST_QUERY, {
      id: customerId,
    });

    return parseWishlistHandles(data.customer?.wishlist?.value);
  } catch {
    return [];
  }
}

export async function addToCustomerWishlist(
  customerId: string,
  handle: string
): Promise<{ handles: string[]; errors: string[] }> {
  const normalized = handle.trim();
  if (!normalized) {
    return { handles: [], errors: ["Product could not be saved."] };
  }

  const current = await fetchCustomerWishlist(customerId);
  if (current.includes(normalized)) {
    return { handles: current, errors: [] };
  }

  const next = [normalized, ...current];
  const errors = await saveWishlistHandles(customerId, next);

  if (errors.length) {
    return { handles: current, errors };
  }

  return { handles: next, errors: [] };
}

export async function removeFromCustomerWishlist(
  customerId: string,
  handle: string
): Promise<{ handles: string[]; errors: string[] }> {
  const current = await fetchCustomerWishlist(customerId);
  const next = current.filter((item) => item !== handle.trim());
  const errors = await saveWishlistHandles(customerId, next);

  if (errors.length) {
    return { handles: current, errors };
  }

  return { handles: next, errors: [] };
}
