"use client";

import { useState } from "react";
import type { CustomerSummary } from "@/lib/customer-auth/types";
import { getCustomerFullName } from "@/lib/customer-auth/display";
import AccountProfileForm from "./AccountProfileForm";

type AccountProfileSectionProps = {
  customer: CustomerSummary;
  embedded?: boolean;
};

export default function AccountProfileSection({
  customer,
  embedded = false,
}: AccountProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const wrapperClass = embedded
    ? "border border-neptura-light bg-neptura-light-bg p-6 sm:p-8"
    : "mt-10 border border-neptura-light bg-neptura-light-bg p-6 sm:p-8";

  const fullName = getCustomerFullName(customer);

  if (isEditing) {
    return (
      <div className={wrapperClass}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
            Edit profile
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora"
          >
            Cancel
          </button>
        </div>
        <AccountProfileForm
          customer={customer}
          submitLabel="Save changes"
          onSaved={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
            Profile
          </p>
          {fullName && (
            <p className="mt-3 font-display text-xl font-light text-neptura-light-text">{fullName}</p>
          )}
          {customer.email && (
            <p className={`text-[0.8rem] font-light text-neptura-light-muted ${fullName ? "mt-1" : "mt-3"}`}>
              {customer.email}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="shrink-0 text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
