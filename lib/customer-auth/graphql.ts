import { fetchCustomerAccountApiConfiguration } from "./discovery";

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

  if (json.errors?.length) {
    return { data: null, errors: json.errors.map((error) => error.message) };
  }

  return { data: json.data ?? null, errors: [] };
}
