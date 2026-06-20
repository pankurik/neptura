import { getStoreDomain } from "./config";

export type OpenIdConfiguration = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  scopes_supported: string[];
  code_challenge_methods_supported: string[];
};

export type CustomerAccountApiConfiguration = {
  graphql_api: string;
  mcp_api: string;
};

export async function fetchOpenIdConfiguration(
  storeDomain = getStoreDomain()
): Promise<OpenIdConfiguration> {
  const response = await fetch(
    `https://${storeDomain}/.well-known/openid-configuration`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(
      `OpenID discovery failed (${response.status}). Enable customer accounts in Shopify Admin → Settings → Customer accounts.`
    );
  }

  return response.json() as Promise<OpenIdConfiguration>;
}

export async function fetchCustomerAccountApiConfiguration(
  storeDomain = getStoreDomain()
): Promise<CustomerAccountApiConfiguration> {
  const response = await fetch(
    `https://${storeDomain}/.well-known/customer-account-api`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Customer Account API discovery failed (${response.status}).`);
  }

  return response.json() as Promise<CustomerAccountApiConfiguration>;
}

/** Extract numeric shop ID from discovery GraphQL URL, e.g. shopify.com/99253125410/account/... */
export function extractShopIdFromGraphqlUrl(graphqlApi: string): string | null {
  const match = graphqlApi.match(/shopify\.com\/(\d+)\/account\//);
  return match?.[1] ?? null;
}
