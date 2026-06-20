const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
const storefrontTokenOverride = process.env.SHOPIFY_STOREFRONT_TOKEN;

const apiVersion = "2026-04";

interface CachedAdminToken {
  token: string;
  expiresAt: number;
}

let cachedAdminToken: CachedAdminToken | null = null;
let cachedStorefrontToken: string | null = null;
let cachedMyshopifyDomain: string | null = null;

function requireEnv() {
  if (!domain) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN environment variable.");
  }

  if (!storefrontTokenOverride && (!clientId || !clientSecret)) {
    throw new Error(
      "Missing SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET. Add them from Dev Dashboard → Settings."
    );
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    if (response.status === 404) {
      throw new Error(
        `Shopify store not found at "${domain}". Use your .myshopify.com domain from Shopify Admin → Settings → Domains.`
      );
    }

    throw new Error(
      `Unexpected response from Shopify (${response.status}). Check SHOPIFY_STORE_DOMAIN.`
    );
  }

  return response.json() as Promise<T>;
}

async function getMyshopifyDomain(): Promise<string> {
  if (cachedMyshopifyDomain) {
    return cachedMyshopifyDomain;
  }

  if (domain!.endsWith(".myshopify.com")) {
    cachedMyshopifyDomain = domain!;
    return domain!;
  }

  const response = await fetch(`https://${domain}/meta.json`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Could not resolve myshopify domain for "${domain}". Set SHOPIFY_STORE_DOMAIN to your-store.myshopify.com.`
    );
  }

  const meta = await parseJsonResponse<{ myshopify_domain?: string }>(response);

  if (!meta.myshopify_domain) {
    throw new Error("Could not resolve myshopify domain from store meta.json.");
  }

  cachedMyshopifyDomain = meta.myshopify_domain;
  return meta.myshopify_domain;
}

async function getAdminAccessToken(): Promise<string> {
  requireEnv();

  if (cachedAdminToken && Date.now() < cachedAdminToken.expiresAt) {
    return cachedAdminToken.token;
  }

  const myshopifyDomain = await getMyshopifyDomain();

  const response = await fetch(
    `https://${myshopifyDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId!,
        client_secret: clientSecret!,
      }),
      cache: "no-store",
    }
  );

  const json = await parseJsonResponse<{
    access_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  }>(response);

  if (!response.ok || !json.access_token) {
    throw new Error(
      json.error_description ??
        json.error ??
        "Failed to obtain Shopify access token. Confirm the app is installed on this store."
    );
  }

  if (!json.scope?.trim()) {
    throw new Error(
      "Shopify returned an access token with no scopes. In Dev Dashboard → Versions, add Storefront scopes, click Release, then reinstall the app on your store."
    );
  }

  cachedAdminToken = {
    token: json.access_token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000,
  };

  return json.access_token;
}

async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const myshopifyDomain = await getMyshopifyDomain();
  const adminToken = await getAdminAccessToken();

  const response = await fetch(
    `https://${myshopifyDomain}/admin/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    }
  );

  const json = await parseJsonResponse<{ data?: T; errors?: { message: string }[] }>(
    response
  );

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "Shopify Admin API error");
  }

  return json.data as T;
}

async function getStorefrontAccessToken(): Promise<string> {
  if (storefrontTokenOverride) {
    if (storefrontTokenOverride.startsWith("shpat_")) {
      throw new Error(
        "SHOPIFY_STOREFRONT_TOKEN is an Admin API token (shpat_...). Remove it and use Client ID/Secret, or paste a Storefront token from the Headless sales channel."
      );
    }
    return storefrontTokenOverride;
  }

  if (cachedStorefrontToken) {
    return cachedStorefrontToken;
  }

  const data = await adminFetch<{
    storefrontAccessTokenCreate: {
      storefrontAccessToken: { accessToken: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation storefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
      storefrontAccessTokenCreate(input: $input) {
        storefrontAccessToken {
          accessToken
        }
        userErrors {
          message
        }
      }
    }`,
    { input: { title: "Neptura Frontend" } }
  );

  if (data.storefrontAccessTokenCreate.userErrors.length > 0) {
    throw new Error(data.storefrontAccessTokenCreate.userErrors[0].message);
  }

  const token =
    data.storefrontAccessTokenCreate.storefrontAccessToken?.accessToken;

  if (!token) {
    throw new Error(
      "Could not create a Storefront API token. In Dev Dashboard → Versions: add Storefront scopes, click Release, reinstall the app. Or install the Headless sales channel and set SHOPIFY_STOREFRONT_TOKEN."
    );
  }

  cachedStorefrontToken = token;
  return token;
}

export async function shopifyFetch<T>({
  query,
  variables = {},
  cache = "force-cache",
  tags,
  revalidate,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
  revalidate?: number;
}): Promise<T> {
  requireEnv();

  const storefrontAccessToken = await getStorefrontAccessToken();
  const storefrontDomain = domain!.endsWith(".myshopify.com")
    ? domain!
    : await getMyshopifyDomain();

  const nextOptions: { revalidate?: number; tags?: string[] } = {};
  if (revalidate !== undefined) nextOptions.revalidate = revalidate;
  if (tags) nextOptions.tags = tags;

  const response = await fetch(
    `https://${storefrontDomain}/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      ...(revalidate === undefined ? { cache } : {}),
      ...(Object.keys(nextOptions).length > 0 ? { next: nextOptions } : {}),
    }
  );

  const json = await parseJsonResponse<{ data?: T; errors?: { message: string; extensions?: { code?: string } }[] }>(
    response
  );

  if (json.errors?.length) {
    const error = json.errors[0];
    const code = error?.extensions?.code;

    if (response.status === 401 || code === "UNAUTHORIZED") {
      throw new Error(
        "Storefront API authentication failed. Release your app version with Storefront scopes and restart the dev server."
      );
    }

    if (code === "BAD_REQUEST" && error?.message?.includes("locked")) {
      throw new Error(
        "Your Online Store is password-protected. Disable it in Shopify Admin → Online Store → Preferences."
      );
    }

    throw new Error(error?.message || "Shopify API error");
  }

  return json.data as T;
}

export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}
