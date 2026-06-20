import type { CustomerSummary } from "./types";

export function formatMemberSince(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function getCustomerInitials(customer: CustomerSummary): string {
  const first = customer.firstName?.trim().charAt(0) ?? "";
  const last = customer.lastName?.trim().charAt(0) ?? "";

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  const emailInitial = customer.email?.trim().charAt(0);
  return emailInitial ? emailInitial.toUpperCase() : "?";
}

export function getCustomerDisplayLabel(customer: CustomerSummary): string {
  if (customer.firstName) return customer.firstName;
  if (customer.displayName) return customer.displayName;
  if (customer.email) return customer.email.split("@")[0] ?? "Account";
  return "Account";
}

export function isProfileComplete(customer: CustomerSummary): boolean {
  return Boolean(customer.firstName?.trim());
}

export function getCustomerAvatarUrl(customer: {
  avatarUrl?: string | null;
  imageUrl?: string | null;
}): string | null {
  return customer.avatarUrl ?? customer.imageUrl ?? null;
}
