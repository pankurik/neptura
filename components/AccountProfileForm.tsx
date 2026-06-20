"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { CustomerSummary } from "@/lib/customer-auth/types";

type AccountProfileFormProps = {
  customer: CustomerSummary;
  submitLabel: string;
  redirectTo?: string;
  onSaved?: () => void;
  showEmail?: boolean;
};

export default function AccountProfileForm({
  customer,
  submitLabel,
  redirectTo,
  onSaved,
  showEmail = true,
}: AccountProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(customer.firstName ?? "");
  const [lastName, setLastName] = useState(customer.lastName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      setSuccess("Profile updated.");
      router.refresh();
      onSaved?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-center text-[0.75rem] leading-relaxed text-neptura-aurora">{error}</p>
      )}
      {success && (
        <p className="text-center text-[0.75rem] leading-relaxed text-neptura-light-muted">
          {success}
        </p>
      )}

      <div className="space-y-2">
        <label
          htmlFor="firstName"
          className="block text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-light-muted"
        >
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          className="w-full border border-neptura-light bg-neptura-light-bg px-4 py-3 text-[0.85rem] font-light text-neptura-light-text outline-none transition-colors focus:border-neptura-aurora/40"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="lastName"
          className="block text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-light-muted"
        >
          Last name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          className="w-full border border-neptura-light bg-neptura-light-bg px-4 py-3 text-[0.85rem] font-light text-neptura-light-text outline-none transition-colors focus:border-neptura-aurora/40"
        />
      </div>

      {showEmail && customer.email && (
        <p className="text-[0.72rem] font-light leading-relaxed text-neptura-light-muted">
          Email · {customer.email}
          <span className="mt-1 block text-[0.65rem] text-neptura-light-muted/70">
            Email is managed through your secure account settings.
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-light-primary w-full disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
