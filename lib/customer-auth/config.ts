function stripDomain(value: string | undefined): string | undefined {
  return value?.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getStoreDomain(): string {
  const domain = stripDomain(process.env.SHOPIFY_STORE_DOMAIN);
  if (!domain) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN.");
  }
  return domain;
}

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL.");
  }
  return url;
}

export function getCustomerAuthCallbackUrl(): string {
  return `${getAppUrl()}/api/auth/callback`;
}

/** Use public app URL for redirects — ngrok forwards as localhost and request.url breaks OAuth. */
export function getAppRedirectUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getAppUrl()}${normalizedPath}`;
}

export function getCustomerAccountShopId(): string {
  const shopId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID?.trim();
  if (!shopId) {
    throw new Error("Missing SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID.");
  }
  return shopId;
}

export function getCustomerAccountClientId(): string {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error(
      "Missing SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID. Configure Customer Account API in Shopify Admin → Sales channels → Headless."
    );
  }
  return clientId;
}

export function getCustomerAccountClientSecret(): string {
  const secret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "Missing SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET. Use a Confidential client in Headless → Customer Account API settings."
    );
  }
  return secret;
}

export function hasCustomerAccountCredentials(): boolean {
  return Boolean(
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim() &&
      process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim()
  );
}

export const CUSTOMER_AUTH_SCOPE = "openid email customer-account-api:full";
