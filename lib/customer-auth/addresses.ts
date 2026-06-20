import { customerAccountFetch } from "./graphql";
import type { CustomerAddressInput, CustomerAddressSummary } from "./types";

const ADDRESSES_QUERY = `#graphql
  query CustomerAddresses {
    customer {
      defaultAddress {
        id
      }
      addresses(first: 20) {
        nodes {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          zip
          territoryCode
          zoneCode
          phoneNumber
          formatted(withName: true, withCompany: true)
        }
      }
    }
  }
`;

type AddressesQueryResult = {
  customer?: {
    defaultAddress?: { id: string } | null;
    addresses?: {
      nodes?: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        company?: string | null;
        address1?: string | null;
        address2?: string | null;
        city?: string | null;
        province?: string | null;
        zip?: string | null;
        territoryCode?: string | null;
        zoneCode?: string | null;
        phoneNumber?: string | null;
        formatted?: string[];
      }[];
    };
  } | null;
};

type AddressNode = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  territoryCode?: string | null;
  zoneCode?: string | null;
  phoneNumber?: string | null;
  formatted?: string[];
};

function mapAddress(node: AddressNode): CustomerAddressSummary {
  return {
    id: node.id,
    firstName: node.firstName ?? null,
    lastName: node.lastName ?? null,
    company: node.company ?? null,
    address1: node.address1 ?? null,
    address2: node.address2 ?? null,
    city: node.city ?? null,
    province: node.province ?? null,
    zip: node.zip ?? null,
    territoryCode: node.territoryCode ?? null,
    zoneCode: node.zoneCode ?? null,
    phoneNumber: node.phoneNumber ?? null,
    formatted: node.formatted ?? [],
  };
}

export async function fetchCustomerAddresses(
  accessToken: string
): Promise<{ addresses: CustomerAddressSummary[]; defaultAddressId: string | null }> {
  const { data, errors } = await customerAccountFetch<AddressesQueryResult>(
    accessToken,
    ADDRESSES_QUERY
  );

  if (errors.length || !data?.customer) {
    return { addresses: [], defaultAddressId: null };
  }

  const nodes = data.customer.addresses?.nodes ?? [];

  return {
    addresses: nodes.map(mapAddress),
    defaultAddressId: data.customer.defaultAddress?.id ?? null,
  };
}

function toAddressVariables(input: CustomerAddressInput) {
  return {
    firstName: input.firstName.trim(),
    ...(input.lastName?.trim() ? { lastName: input.lastName.trim() } : {}),
    ...(input.company?.trim() ? { company: input.company.trim() } : {}),
    address1: input.address1.trim(),
    ...(input.address2?.trim() ? { address2: input.address2.trim() } : {}),
    city: input.city.trim(),
    zoneCode: input.zoneCode.trim(),
    zip: input.zip.trim(),
    territoryCode: input.territoryCode?.trim() || "IN",
    ...(input.phoneNumber?.trim() ? { phoneNumber: input.phoneNumber.trim() } : {}),
  };
}

const ADDRESS_CREATE = `#graphql
  mutation CustomerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        territoryCode
        zoneCode
        phoneNumber
        formatted(withName: true, withCompany: true)
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADDRESS_UPDATE = `#graphql
  mutation CustomerAddressUpdate(
    $addressId: ID!
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        territoryCode
        zoneCode
        phoneNumber
        formatted(withName: true, withCompany: true)
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADDRESS_DELETE = `#graphql
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

type AddressMutationResult = {
  customerAddressCreate?: {
    customerAddress?: CustomerAddressSummary | null;
    userErrors?: { message: string }[];
  };
  customerAddressUpdate?: {
    customerAddress?: CustomerAddressSummary | null;
    userErrors?: { message: string }[];
  };
  customerAddressDelete?: {
    deletedAddressId?: string | null;
    userErrors?: { message: string }[];
  };
};

export async function createCustomerAddress(
  accessToken: string,
  input: CustomerAddressInput
): Promise<{ address: CustomerAddressSummary | null; errors: string[] }> {
  const { data, errors } = await customerAccountFetch<AddressMutationResult>(
    accessToken,
    ADDRESS_CREATE,
    {
      address: toAddressVariables(input),
      defaultAddress: input.defaultAddress ?? false,
    }
  );

  if (errors.length) {
    return { address: null, errors };
  }

  const payload = data?.customerAddressCreate;
  const userErrors = payload?.userErrors ?? [];

  if (userErrors.length) {
    return { address: null, errors: userErrors.map((error) => error.message) };
  }

  const address = payload?.customerAddress;
  if (!address) {
    return { address: null, errors: ["Address could not be saved."] };
  }

  return { address: mapAddress(address), errors: [] };
}

export async function updateCustomerAddress(
  accessToken: string,
  addressId: string,
  input: CustomerAddressInput
): Promise<{ address: CustomerAddressSummary | null; errors: string[] }> {
  const { data, errors } = await customerAccountFetch<AddressMutationResult>(
    accessToken,
    ADDRESS_UPDATE,
    {
      addressId,
      address: toAddressVariables(input),
      defaultAddress: input.defaultAddress ?? null,
    }
  );

  if (errors.length) {
    return { address: null, errors };
  }

  const payload = data?.customerAddressUpdate;
  const userErrors = payload?.userErrors ?? [];

  if (userErrors.length) {
    return { address: null, errors: userErrors.map((error) => error.message) };
  }

  const address = payload?.customerAddress;
  if (!address) {
    return { address: null, errors: ["Address could not be updated."] };
  }

  return { address: mapAddress(address), errors: [] };
}

export async function deleteCustomerAddress(
  accessToken: string,
  addressId: string
): Promise<{ deletedAddressId: string | null; errors: string[] }> {
  const { data, errors } = await customerAccountFetch<AddressMutationResult>(
    accessToken,
    ADDRESS_DELETE,
    { addressId }
  );

  if (errors.length) {
    return { deletedAddressId: null, errors };
  }

  const payload = data?.customerAddressDelete;
  const userErrors = payload?.userErrors ?? [];

  if (userErrors.length) {
    return { deletedAddressId: null, errors: userErrors.map((error) => error.message) };
  }

  return {
    deletedAddressId: payload?.deletedAddressId ?? null,
    errors: [],
  };
}

export function formatAddressLines(address: CustomerAddressSummary): string[] {
  if (address.formatted.length > 0) {
    return address.formatted;
  }

  const lines = [
    [address.firstName, address.lastName].filter(Boolean).join(" "),
    address.company,
    address.address1,
    address.address2,
    [address.city, address.province, address.zip].filter(Boolean).join(", "),
    address.territoryCode === "IN" ? "India" : address.territoryCode,
    address.phoneNumber,
  ].filter(Boolean) as string[];

  return lines;
}
