import { shopifyAdminFetch } from "@/lib/shopify";

export const BESPOKE_METAFIELD_NAMESPACE = "custom";
export const BESPOKE_METAFIELD_KEY = "bespoke_commissions";

export type BespokeCommissionStatus = "in_review" | "in_progress" | "complete";

export type BespokeCommission = {
  id: string;
  submittedAt: string;
  status: BespokeCommissionStatus;
  title: string;
  name: string;
  email: string;
  cut: string;
  carats: string;
  metal: string;
  notes: string | null;
};

export type BespokeCommissionInput = {
  name: string;
  email: string;
  cut: string;
  carats: string;
  metal: string;
  notes?: string | null;
};

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

const CUSTOMER_BESPOKE_QUERY = `#graphql
  query CustomerBespoke($id: ID!) {
    customer(id: $id) {
      bespoke: metafield(namespace: "${BESPOKE_METAFIELD_NAMESPACE}", key: "${BESPOKE_METAFIELD_KEY}") {
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

type CustomerBespokeResult = {
  customer?: {
    bespoke?: { value?: string | null } | null;
  } | null;
};

function formatCutLabel(cut: string): string {
  const labels: Record<string, string> = {
    emerald: "Emerald cut",
    round: "Round brilliant",
    oval: "Oval cut",
    cushion: "Cushion cut",
  };

  return labels[cut] ?? cut;
}

function formatCaratsLabel(carats: string): string {
  const labels: Record<string, string> = {
    "1-2": "1.00 – 1.99 ct",
    "2-3": "2.00 – 2.99 ct",
    "3+": "3.00+ ct",
  };

  return labels[carats] ?? carats;
}

export function buildCommissionTitle(input: BespokeCommissionInput): string {
  return `${formatCutLabel(input.cut)} · ${formatCaratsLabel(input.carats)}`;
}

function parseCommissions(value: string | null | undefined): BespokeCommission[] {
  if (!value?.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is BespokeCommission => {
      if (!item || typeof item !== "object") return false;
      const commission = item as Partial<BespokeCommission>;
      return (
        typeof commission.id === "string" &&
        typeof commission.submittedAt === "string" &&
        typeof commission.title === "string"
      );
    });
  } catch {
    return [];
  }
}

async function saveCommissions(
  customerId: string,
  commissions: BespokeCommission[]
): Promise<string[]> {
  if (commissions.length === 0) {
    const data = await shopifyAdminFetch<{
      metafieldsDelete?: { userErrors?: { message: string }[] };
    }>(METAFIELDS_DELETE, {
      metafields: [
        {
          ownerId: customerId,
          namespace: BESPOKE_METAFIELD_NAMESPACE,
          key: BESPOKE_METAFIELD_KEY,
        },
      ],
    });

    return (data.metafieldsDelete?.userErrors ?? []).map((error) => error.message);
  }

  const data = await shopifyAdminFetch<MetafieldsSetResult>(METAFIELDS_SET, {
    metafields: [
      {
        ownerId: customerId,
        namespace: BESPOKE_METAFIELD_NAMESPACE,
        key: BESPOKE_METAFIELD_KEY,
        type: "json",
        value: JSON.stringify(commissions),
      },
    ],
  });

  return (data.metafieldsSet?.userErrors ?? []).map((error) => error.message);
}

export async function fetchCustomerBespokeCommissions(
  customerId: string
): Promise<BespokeCommission[]> {
  try {
    const data = await shopifyAdminFetch<CustomerBespokeResult>(CUSTOMER_BESPOKE_QUERY, {
      id: customerId,
    });

    return parseCommissions(data.customer?.bespoke?.value).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function addCustomerBespokeCommission(
  customerId: string,
  input: BespokeCommissionInput
): Promise<{ commissions: BespokeCommission[]; errors: string[] }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const cut = input.cut.trim();
  const carats = input.carats.trim();
  const metal = input.metal.trim();
  const notes = input.notes?.trim() || null;

  if (!name || !email || !cut || !carats || !metal) {
    return { commissions: [], errors: ["Complete all required fields."] };
  }

  const current = await fetchCustomerBespokeCommissions(customerId);
  const commission: BespokeCommission = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    status: "in_review",
    title: buildCommissionTitle({ name, email, cut, carats, metal, notes }),
    name,
    email,
    cut,
    carats,
    metal,
    notes,
  };

  const next = [commission, ...current];
  const errors = await saveCommissions(customerId, next);

  if (errors.length) {
    return { commissions: current, errors };
  }

  return { commissions: next, errors: [] };
}

export function formatCommissionStatus(status: BespokeCommissionStatus): string {
  const labels: Record<BespokeCommissionStatus, string> = {
    in_review: "IN REVIEW",
    in_progress: "IN PROGRESS",
    complete: "COMPLETE",
  };

  return labels[status];
}

export function formatCommissionDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}
