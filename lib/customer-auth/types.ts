import type { BespokeCommission } from "./bespoke-commissions";

export type CustomerSummary = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  imageUrl: string | null;
  avatarUrl: string | null;
  phone: string | null;
  memberSince: string | null;
  birthday: string | null;
  anniversary: string | null;
  ringSize: string | null;
  jewelryPreferences: string[];
  wishlistHandles: string[];
  bespokeCommissions: BespokeCommission[];
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
  variantId: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  variantTitle: string | null;
  unitPrice: { amount: string; currencyCode: string } | null;
  lineTotal: { amount: string; currencyCode: string } | null;
  variantOptions: { name: string; value: string }[];
};

export type OrderTrackingSummary = {
  company: string | null;
  number: string | null;
  url: string | null;
};

export type OrderAddressSummary = {
  formatted: string[];
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  territoryCode: string | null;
  phoneNumber: string | null;
};

export type OrderPaymentSummary = {
  label: string;
  amount: { amount: string; currencyCode: string } | null;
  processedAt: string | null;
};

export type OrderProgressStep = {
  id: "confirmed" | "crafting" | "shipped" | "delivered";
  label: string;
  date: string | null;
  complete: boolean;
  current: boolean;
};

export type OrderSummary = {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  /** Latest carrier/shipment status from fulfillments, when available */
  latestShipmentStatus: string | null;
  financialStatus: string | null;
  totalPrice: { amount: string; currencyCode: string };
  statusPageUrl: string;
  /** Sum of line item quantities across the full order */
  totalItemCount: number;
  lineItems: OrderLineItemSummary[];
};

export type OrderDetailSummary = OrderSummary & {
  subtotal: { amount: string; currencyCode: string } | null;
  totalShipping: { amount: string; currencyCode: string } | null;
  totalTax: { amount: string; currencyCode: string } | null;
  email: string | null;
  phone: string | null;
  shippingAddress: OrderAddressSummary | null;
  billingAddress: OrderAddressSummary | null;
  tracking: OrderTrackingSummary | null;
  payment: OrderPaymentSummary | null;
  progressSteps: OrderProgressStep[];
};

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  token_type?: string;
};

export type { BespokeCommission };
