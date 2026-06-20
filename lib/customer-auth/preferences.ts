import { sanitizeJewelryPreferences, type JewelryPreferenceId } from "./jewelry-preferences";
import { shopifyAdminFetch } from "@/lib/shopify";

export const PREFERENCES_NAMESPACE = "custom";
export const BIRTHDAY_METAFIELD_KEY = "birthday";
export const ANNIVERSARY_METAFIELD_KEY = "anniversary";
export const JEWELRY_PREFERENCES_METAFIELD_KEY = "jewelry_preferences";
export const RING_SIZE_METAFIELD_KEY = "ring_size";

export type CustomerPreferences = {
  birthday: string | null;
  anniversary: string | null;
  ringSize: string | null;
  jewelryPreferences: JewelryPreferenceId[];
};

const CUSTOMER_PREFERENCES_QUERY = `#graphql
  query CustomerPreferences($id: ID!) {
    customer(id: $id) {
      birthday: metafield(namespace: "${PREFERENCES_NAMESPACE}", key: "${BIRTHDAY_METAFIELD_KEY}") {
        value
      }
      anniversary: metafield(namespace: "${PREFERENCES_NAMESPACE}", key: "${ANNIVERSARY_METAFIELD_KEY}") {
        value
      }
      jewelryPreferences: metafield(namespace: "${PREFERENCES_NAMESPACE}", key: "${JEWELRY_PREFERENCES_METAFIELD_KEY}") {
        value
      }
      ringSize: metafield(namespace: "${PREFERENCES_NAMESPACE}", key: "${RING_SIZE_METAFIELD_KEY}") {
        value
      }
    }
  }
`;

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

type CustomerPreferencesResult = {
  customer?: {
    birthday?: { value?: string | null } | null;
    anniversary?: { value?: string | null } | null;
    jewelryPreferences?: { value?: string | null } | null;
    ringSize?: { value?: string | null } | null;
  } | null;
};

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

function parseJewelryPreferences(value: string | null | undefined): JewelryPreferenceId[] {
  if (!value?.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return sanitizeJewelryPreferences(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return [];
  }
}

export function isValidPreferenceDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function normalizeRingSize(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length > 20) return null;
  if (!/^[\d.A-Za-z\s\-/]+$/.test(trimmed)) return null;
  return trimmed;
}

export function isValidRingSize(value: string): boolean {
  return normalizeRingSize(value) !== null;
}

export async function fetchCustomerPreferences(customerId: string): Promise<CustomerPreferences> {
  try {
    const data = await shopifyAdminFetch<CustomerPreferencesResult>(CUSTOMER_PREFERENCES_QUERY, {
      id: customerId,
    });

    return {
      birthday: data.customer?.birthday?.value?.trim() || null,
      anniversary: data.customer?.anniversary?.value?.trim() || null,
      ringSize: data.customer?.ringSize?.value?.trim() || null,
      jewelryPreferences: parseJewelryPreferences(data.customer?.jewelryPreferences?.value),
    };
  } catch {
    return {
      birthday: null,
      anniversary: null,
      ringSize: null,
      jewelryPreferences: [],
    };
  }
}

async function setDateMetafield(
  customerId: string,
  key: string,
  value: string | null
): Promise<string[]> {
  if (value) {
    const data = await shopifyAdminFetch<MetafieldsSetResult>(METAFIELDS_SET, {
      metafields: [
        {
          ownerId: customerId,
          namespace: PREFERENCES_NAMESPACE,
          key,
          type: "date",
          value,
        },
      ],
    });

    const userErrors = data.metafieldsSet?.userErrors ?? [];
    return userErrors.map((error) => error.message);
  }

  const data = await shopifyAdminFetch<MetafieldsDeleteResult>(METAFIELDS_DELETE, {
    metafields: [
      {
        ownerId: customerId,
        namespace: PREFERENCES_NAMESPACE,
        key,
      },
    ],
  });

  const userErrors = data.metafieldsDelete?.userErrors ?? [];
  return userErrors.map((error) => error.message);
}

async function setTextMetafield(
  customerId: string,
  key: string,
  value: string | null
): Promise<string[]> {
  if (value) {
    const data = await shopifyAdminFetch<MetafieldsSetResult>(METAFIELDS_SET, {
      metafields: [
        {
          ownerId: customerId,
          namespace: PREFERENCES_NAMESPACE,
          key,
          type: "single_line_text_field",
          value,
        },
      ],
    });

    const userErrors = data.metafieldsSet?.userErrors ?? [];
    return userErrors.map((error) => error.message);
  }

  const data = await shopifyAdminFetch<MetafieldsDeleteResult>(METAFIELDS_DELETE, {
    metafields: [
      {
        ownerId: customerId,
        namespace: PREFERENCES_NAMESPACE,
        key,
      },
    ],
  });

  const userErrors = data.metafieldsDelete?.userErrors ?? [];
  return userErrors.map((error) => error.message);
}

async function setJewelryPreferencesMetafield(
  customerId: string,
  preferences: JewelryPreferenceId[]
): Promise<string[]> {
  if (preferences.length === 0) {
    const data = await shopifyAdminFetch<MetafieldsDeleteResult>(METAFIELDS_DELETE, {
      metafields: [
        {
          ownerId: customerId,
          namespace: PREFERENCES_NAMESPACE,
          key: JEWELRY_PREFERENCES_METAFIELD_KEY,
        },
      ],
    });

    const userErrors = data.metafieldsDelete?.userErrors ?? [];
    return userErrors.map((error) => error.message);
  }

  const data = await shopifyAdminFetch<MetafieldsSetResult>(METAFIELDS_SET, {
    metafields: [
      {
        ownerId: customerId,
        namespace: PREFERENCES_NAMESPACE,
        key: JEWELRY_PREFERENCES_METAFIELD_KEY,
        type: "list.single_line_text_field",
        value: JSON.stringify(preferences),
      },
    ],
  });

  const userErrors = data.metafieldsSet?.userErrors ?? [];
  return userErrors.map((error) => error.message);
}

export async function updateCustomerPreferences(
  customerId: string,
  input: CustomerPreferences
): Promise<{ preferences: CustomerPreferences | null; errors: string[] }> {
  try {
    const birthday = input.birthday?.trim() || null;
    const anniversary = input.anniversary?.trim() || null;
    const ringSize = normalizeRingSize(input.ringSize);
    const jewelryPreferences = sanitizeJewelryPreferences(input.jewelryPreferences);

    if (birthday && !isValidPreferenceDate(birthday)) {
      return { preferences: null, errors: ["Enter a valid birthday."] };
    }

    if (anniversary && !isValidPreferenceDate(anniversary)) {
      return { preferences: null, errors: ["Enter a valid anniversary date."] };
    }

    if (input.ringSize?.trim() && !ringSize) {
      return { preferences: null, errors: ["Enter a valid ring size (e.g. 5.5)."] };
    }

    const errors: string[] = [];

    errors.push(...(await setDateMetafield(customerId, BIRTHDAY_METAFIELD_KEY, birthday)));
    errors.push(...(await setDateMetafield(customerId, ANNIVERSARY_METAFIELD_KEY, anniversary)));
    errors.push(...(await setTextMetafield(customerId, RING_SIZE_METAFIELD_KEY, ringSize)));
    errors.push(...(await setJewelryPreferencesMetafield(customerId, jewelryPreferences)));

    if (errors.length) {
      return { preferences: null, errors };
    }

    return {
      preferences: {
        birthday,
        anniversary,
        ringSize,
        jewelryPreferences,
      },
      errors: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Preferences could not be saved.";
    return { preferences: null, errors: [message] };
  }
}
