"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AccountAddressForm from "@/components/AccountAddressForm";
import AccountSectionHeader from "@/components/account/AccountSectionHeader";
import { formatAddressLines } from "@/lib/customer-auth/addresses";
import type { CustomerAddressSummary, CustomerSummary } from "@/lib/customer-auth/types";

type AccountDeliverySectionProps = {
  customer: CustomerSummary;
};

export default function AccountDeliverySection({ customer }: AccountDeliverySectionProps) {
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
      <section>
        <AccountSectionHeader
          id="addresses"
          label="Delivery"
          title="Add address"
          subtitle="Saved for faster checkout and delivery updates."
        />
        <div className="mt-8 border border-neptura-light bg-neptura-light-bg p-6 sm:p-8">
          <button
            type="button"
            onClick={() => setMode("list")}
            className="mb-6 text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora"
          >
            ← Back to addresses
          </button>
          <AccountAddressForm
            defaultFirstName={customer.firstName ?? undefined}
            defaultLastName={customer.lastName ?? undefined}
            isDefault={customer.addresses.length === 0}
            submitLabel="Save address"
            onCancel={() => setMode("list")}
            onSaved={handleSaved}
          />
        </div>
      </section>
    );
  }

  if (mode === "edit" && editingAddress) {
    return (
      <section>
        <AccountSectionHeader
          id="addresses"
          label="Delivery"
          title="Edit address"
          subtitle="Saved for faster checkout and delivery updates."
        />
        <div className="mt-8 border border-neptura-light bg-neptura-light-bg p-6 sm:p-8">
          <button
            type="button"
            onClick={() => {
              setMode("list");
              setEditingAddress(null);
            }}
            className="mb-6 text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora"
          >
            ← Back to addresses
          </button>
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
      </section>
    );
  }

  const sortedAddresses = [...customer.addresses].sort((a, b) => {
    if (customer.defaultAddressId === a.id) return -1;
    if (customer.defaultAddressId === b.id) return 1;
    return 0;
  });

  return (
    <section aria-labelledby="account-addresses-title">
      <AccountSectionHeader
        id="addresses"
        label="Delivery"
        title="Saved addresses"
        subtitle="Saved for faster checkout and delivery updates."
      />

      {error && (
        <p className="mt-4 text-[0.75rem] leading-relaxed text-neptura-aurora">{error}</p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:gap-6">
        {sortedAddresses.map((address) => {
          const lines = formatAddressLines(address);
          const isPrimary = customer.defaultAddressId === address.id;

          return (
            <article
              key={address.id}
              className="flex flex-col border border-neptura-light bg-neptura-light-bg p-6 sm:p-7"
            >
              {isPrimary && (
                <span className="mb-4 inline-block self-start border border-neptura-aurora/20 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-neptura-aurora">
                  Primary
                </span>
              )}
              <div className="space-y-1 text-[0.8rem] font-light leading-[1.7] text-neptura-light-text">
                {lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(address);
                    setMode("edit");
                  }}
                  className="text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
                >
                  Edit address
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
            </article>
          );
        })}

        <button
          type="button"
          onClick={() => setMode("create")}
          className="flex min-h-[200px] flex-col items-center justify-center border border-dashed border-neptura-light bg-neptura-light-surface/50 p-8 text-center transition-colors hover:border-neptura-aurora/40 hover:bg-neptura-light-surface/70"
        >
          <span className="font-display text-2xl font-light text-neptura-light-muted">+</span>
          <span className="mt-2 text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora">
            Add address
          </span>
        </button>
      </div>
    </section>
  );
}
