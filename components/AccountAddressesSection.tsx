"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AccountAddressForm from "@/components/AccountAddressForm";
import {
  accountActionClassName,
  accountSectionClassName,
  accountSectionLabelClassName,
} from "@/lib/account-form-styles";
import { formatAddressLines } from "@/lib/customer-auth/addresses";
import type { CustomerAddressSummary, CustomerSummary } from "@/lib/customer-auth/types";

type AccountAddressesSectionProps = {
  customer: CustomerSummary;
};

export default function AccountAddressesSection({ customer }: AccountAddressesSectionProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingAddress, setEditingAddress] = useState<CustomerAddressSummary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSaved() {
    setMode("list");
    setEditingAddress(null);
    setError(null);
    router.refresh();
  }

  async function handleDelete(addressId: string) {
    setError(null);
    setDeletingId(addressId);

    try {
      const response = await fetch(`/api/account/addresses/${encodeURIComponent(addressId)}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Address could not be deleted.");
        return;
      }

      router.refresh();
    } catch {
      setError("Address could not be deleted.");
    } finally {
      setDeletingId(null);
    }
  }

  if (mode === "create") {
    return (
      <div className={`mt-10 ${accountSectionClassName}`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className={accountSectionLabelClassName}>Add address</p>
          <button type="button" onClick={() => setMode("list")} className={accountActionClassName}>
            Cancel
          </button>
        </div>
        <AccountAddressForm
          defaultFirstName={customer.firstName ?? undefined}
          defaultLastName={customer.lastName ?? undefined}
          isDefault={customer.addresses.length === 0}
          submitLabel="Save address"
          onCancel={() => setMode("list")}
          onSaved={handleSaved}
        />
      </div>
    );
  }

  if (mode === "edit" && editingAddress) {
    return (
      <div className={`mt-10 ${accountSectionClassName}`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className={accountSectionLabelClassName}>Edit address</p>
          <button
            type="button"
            onClick={() => {
              setMode("list");
              setEditingAddress(null);
            }}
            className={accountActionClassName}
          >
            Cancel
          </button>
        </div>
        <AccountAddressForm
          initial={editingAddress}
          isDefault={customer.defaultAddressId === editingAddress.id}
          submitLabel="Save changes"
          onCancel={() => {
            setMode("list");
            setEditingAddress(null);
          }}
          onSaved={handleSaved}
        />
      </div>
    );
  }

  return (
    <div className={`mt-10 ${accountSectionClassName}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={accountSectionLabelClassName}>Addresses</p>
          <p className="mt-2 text-[0.78rem] font-light leading-[1.8] text-neptura-light-muted">
            Saved for faster checkout and delivery updates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`${accountActionClassName} shrink-0`}
        >
          Add
        </button>
      </div>

      {error && (
        <p className="mt-4 text-[0.75rem] leading-relaxed text-neptura-aurora">{error}</p>
      )}

      {customer.addresses.length === 0 ? (
        <p className="mt-6 text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
          No saved addresses yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {customer.addresses.map((address) => {
            const lines = formatAddressLines(address);
            const isDefault = customer.defaultAddressId === address.id;

            return (
              <li
                key={address.id}
                className="border border-neptura-light bg-neptura-light-surface/30 px-5 py-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {isDefault && (
                      <p className="mb-2 text-[0.62rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
                        Default
                      </p>
                    )}
                    <div className="space-y-1 text-[0.8rem] font-light leading-[1.7] text-neptura-light-text">
                      {lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(address);
                        setMode("edit");
                      }}
                      className={accountActionClassName}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === address.id}
                      onClick={() => handleDelete(address.id)}
                      className="text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora disabled:opacity-60"
                    >
                      {deletingId === address.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
