import {
  getCustomerAccountClientId,
  getCustomerAccountClientSecret,
  getCustomerAuthCallbackUrl,
} from "./config";
import { fetchOpenIdConfiguration } from "./discovery";
import type { TokenResponse } from "./types";

function basicAuthHeader(): string {
  const clientId = getCustomerAccountClientId();
  const clientSecret = getCustomerAccountClientSecret();
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const { token_endpoint } = await fetchOpenIdConfiguration();

  const response = await fetch(token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body,
    cache: "no-store",
  });

  const json = (await response.json()) as TokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !json.access_token) {
    throw new Error(
      json.error_description ?? json.error ?? "Failed to obtain customer access token."
    );
  }

  return json;
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const clientId = getCustomerAccountClientId();
  const redirectUri = getCustomerAuthCallbackUrl();

  return postToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
      code_verifier: codeVerifier,
    })
  );
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = getCustomerAccountClientId();

  return postToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    })
  );
}
