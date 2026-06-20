import { fetchOpenIdConfiguration } from "./discovery";

export async function buildShopifyLogoutUrl(
  idToken: string,
  postLogoutRedirectUri: string
): Promise<string> {
  const { end_session_endpoint } = await fetchOpenIdConfiguration();
  const url = new URL(end_session_endpoint);

  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

  return url.toString();
}
