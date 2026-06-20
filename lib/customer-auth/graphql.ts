import { fetchCustomerAccountApiConfiguration } from "./discovery";

import { CustomerAuthError, isCustomerAuthError } from "./auth-errors";

type GraphqlResult<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function customerAccountFetch<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<{ data: T | null; errors: string[] }> {
  const { graphql_api } = await fetchCustomerAccountApiConfiguration();

  const response = await fetch(graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await response.json()) as GraphqlResult<T>;

  if (response.status === 401) {
    throw new CustomerAuthError();
  }

  if (json.errors?.length) {
    const message = json.errors[0]?.message ?? "Customer Account API error";

    if (json.errors.some((error) => isCustomerAuthError(error.message))) {
      throw new CustomerAuthError(message);
    }

    return { data: null, errors: json.errors.map((error) => error.message) };
  }

  return { data: json.data ?? null, errors: [] };
}
