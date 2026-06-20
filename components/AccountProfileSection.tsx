"use client";

import { useState } from "react";
import type { CustomerSummary } from "@/lib/customer-auth/types";
import AccountProfileForm from "./AccountProfileForm";

type AccountProfileSectionProps = {
  customer: CustomerSummary;
};

export default function AccountProfileSection({ customer }: AccountProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="mt-10 border border-neptura-light bg-neptura-light-bg p-6 sm:p-8">
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
    <div className="mt-10 border border-neptura-light bg-neptura-light-bg p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
            Profile
          </p>
          <p className="mt-3 font-display text-xl font-light text-neptura-light-text">
            {[customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
              customer.displayName ||
              "Your profile"}
          </p>
          {customer.email && (
            <p className="mt-1 text-[0.8rem] font-light text-neptura-light-muted">
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
