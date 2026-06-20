import { DEFAULT_PHONE_COUNTRY_CODE, PHONE_COUNTRIES } from "@/lib/phone/country-codes";
import { shopifyAdminFetch } from "@/lib/shopify";
import { updateCustomerAddress } from "./addresses";
import type { CustomerAddressInput, CustomerAddressSummary, CustomerSummary } from "./types";

const CUSTOMER_PHONE_UPDATE = `#graphql
  mutation CustomerPhoneUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type PhoneUpdateResult = {
  customerUpdate?: {
    customer?: { id: string; phone?: string | null } | null;
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

function getDefaultAddress(customer: CustomerSummary): CustomerAddressSummary | null {
  return (
    customer.addresses.find((address) => address.id === customer.defaultAddressId) ??
    customer.addresses[0] ??
    null
  );
}

function toAddressInput(
  address: CustomerAddressSummary,
  customer: CustomerSummary,
  phone: string | null
): CustomerAddressInput {
  const input: CustomerAddressInput = {
    firstName: address.firstName ?? customer.firstName ?? "",
    lastName: address.lastName ?? customer.lastName ?? "",
    company: address.company ?? undefined,
    address1: address.address1 ?? "",
    address2: address.address2 ?? undefined,
    city: address.city ?? "",
    zoneCode: address.zoneCode ?? "",
    zip: address.zip ?? "",
    territoryCode: address.territoryCode ?? "IN",
    defaultAddress: customer.defaultAddressId === address.id,
  };

  if (phone) {
    input.phoneNumber = phone;
  }

  return input;
}

export function formatPhoneE164(countryCode: string, nationalNumber: string): string {
  const cc = countryCode.replace(/\D/g, "");
  const digits = nationalNumber.replace(/\D/g, "");
  return `+${cc}${digits}`;
}

export function parseE164Phone(
  e164: string | null | undefined,
  defaultCountryCode = DEFAULT_PHONE_COUNTRY_CODE
): { countryCode: string; nationalNumber: string } {
  if (!e164?.trim()) {
    return { countryCode: defaultCountryCode, nationalNumber: "" };
  }

  const digits = e164.replace(/\D/g, "");
  if (!digits) {
    return { countryCode: defaultCountryCode, nationalNumber: "" };
  }

  const dialCodes = Array.from(new Set(PHONE_COUNTRIES.map((country) => country.dialCode))).sort(
    (a, b) => b.length - a.length
  );

  for (const code of dialCodes) {
    if (digits.startsWith(code) && digits.length > code.length) {
      return { countryCode: code, nationalNumber: digits.slice(code.length) };
    }
  }

  return { countryCode: defaultCountryCode, nationalNumber: digits };
}

export function validatePhoneInput(countryCode: string, nationalNumber: string): string | null {
  const cc = countryCode.replace(/\D/g, "");
  const digits = nationalNumber.replace(/\D/g, "");

  if (!digits) {
    return "Phone number is required.";
  }

  if (cc === "91" && digits.length !== 10) {
    return "Enter a valid 10-digit mobile number.";
  }

  if (cc === "1" && digits.length !== 10) {
    return "Enter a valid 10-digit phone number.";
  }

  const totalLength = cc.length + digits.length;
  if (totalLength < 8 || totalLength > 15) {
    return "Enter a valid phone number.";
  }

  return null;
}

export function formatPhoneDisplay(e164: string | null | undefined): string | null {
  if (!e164) return null;

  const { countryCode, nationalNumber } = parseE164Phone(e164);

  if (countryCode === "91" && nationalNumber.length === 10) {
    return `+91 ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`;
  }

  return `+${countryCode} ${nationalNumber}`;
}

export function getCustomerDisplayPhone(customer: CustomerSummary): string | null {
  if (customer.phone) return customer.phone;

  const defaultAddress = getDefaultAddress(customer);
  return defaultAddress?.phoneNumber ?? null;
}

export function isAdminScopeError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("write_customers") ||
    lower.includes("read_customers") ||
    lower.includes("access denied") ||
    lower.includes("scope")
  );
}

export async function updateCustomerPhoneAdmin(
  customerId: string,
  phone: string | null
): Promise<{ phone: string | null; errors: string[] }> {
  try {
    const data = await shopifyAdminFetch<PhoneUpdateResult>(CUSTOMER_PHONE_UPDATE, {
      input: {
        id: customerId,
        phone,
      },
    });

    const payload = data.customerUpdate;
    const userErrors = payload?.userErrors ?? [];

    if (userErrors.length) {
      return { phone: null, errors: userErrors.map((error) => error.message) };
    }

    return {
      phone: payload?.customer?.phone ?? phone,
      errors: [],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Phone could not be updated.";

    return { phone: null, errors: [message] };
  }
}

export async function updateCustomerPhoneOnDefaultAddress(
  accessToken: string,
  customer: CustomerSummary,
  phone: string | null
): Promise<{ phone: string | null; errors: string[] }> {
  const defaultAddress = getDefaultAddress(customer);

  if (!defaultAddress) {
    return {
      phone: null,
      errors: [
        "Add a saved address first — your phone will be stored on that address. For a standalone contact phone, enable write_customers on your Shopify app (Dev Dashboard → Versions → Access scopes).",
      ],
    };
  }

  if (
    !defaultAddress.address1?.trim() ||
    !defaultAddress.city?.trim() ||
    !defaultAddress.zoneCode?.trim() ||
    !defaultAddress.zip?.trim()
  ) {
    return {
      phone: null,
      errors: ["Complete your default address before saving a phone number."],
    };
  }

  const { address, errors } = await updateCustomerAddress(
    accessToken,
    defaultAddress.id,
    toAddressInput(defaultAddress, customer, phone)
  );

  if (errors.length || !address) {
    return { phone: null, errors: errors.length ? errors : ["Phone could not be saved."] };
  }

  return { phone: address.phoneNumber ?? phone, errors: [] };
}

export async function updateCustomerPhone(
  accessToken: string,
  customer: CustomerSummary,
  phone: string | null
): Promise<{ phone: string | null; errors: string[] }> {
  const adminResult = await updateCustomerPhoneAdmin(customer.id, phone);

  if (adminResult.errors.length === 0) {
    return adminResult;
  }

  const adminScopeBlocked = adminResult.errors.some(isAdminScopeError);
  const addressResult = await updateCustomerPhoneOnDefaultAddress(accessToken, customer, phone);

  if (addressResult.errors.length === 0) {
    return addressResult;
  }

  if (adminScopeBlocked) {
    return {
      phone: null,
      errors: [addressResult.errors[0] ?? adminResult.errors[0] ?? "Phone could not be saved."],
    };
  }

  return adminResult;
}
