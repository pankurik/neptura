export type CustomerSummary = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  imageUrl: string | null;
  phone: string | null;
  emailMarketingState: string | null;
  smsMarketingState: string | null;
  addresses: CustomerAddressSummary[];
  defaultAddressId: string | null;
};

export type CustomerAddressSummary = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  territoryCode: string | null;
  zoneCode: string | null;
  phoneNumber: string | null;
  formatted: string[];
};

export type CustomerAddressInput = {
  firstName: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  zoneCode: string;
  zip: string;
  territoryCode?: string;
  phoneNumber?: string;
  defaultAddress?: boolean;
};

export type OrderLineItemSummary = {
  id: string;
  title: string;
  quantity: number;
  imageUrl: string | null;
  imageAlt: string | null;
};

export type OrderSummary = {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string | null;
  totalPrice: { amount: string; currencyCode: string };
  statusPageUrl: string;
  lineItems: OrderLineItemSummary[];
};

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  token_type?: string;
};
