"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import PhoneCountryInput from "@/components/PhoneCountryInput";
import {
  accountActionClassName,
  accountLabelClassName,
  accountSectionClassName,
  accountSectionLabelClassName,
} from "@/lib/account-form-styles";
import {
  formatPhoneDisplay,
  getCustomerDisplayPhone,
  parseE164Phone,
} from "@/lib/customer-auth/phone";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/country-codes";
import type { CustomerSummary } from "@/lib/customer-auth/types";

type AccountPhoneSectionProps = {
  customer: CustomerSummary;
};

export default function AccountPhoneSection({ customer }: AccountPhoneSectionProps) {
  const router = useRouter();
  const displayPhone = getCustomerDisplayPhone(customer);
  const initialPhone = parseE164Phone(displayPhone);
  const [isEditing, setIsEditing] = useState(false);
  const [countryCode, setCountryCode] = useState(initialPhone.countryCode);
  const [nationalNumber, setNationalNumber] = useState(initialPhone.nationalNumber);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm(phone: string | null) {
    const parsed = parseE164Phone(phone);
    setCountryCode(parsed.countryCode);
    setNationalNumber(parsed.nationalNumber);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/account/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          nationalNumber,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Phone could not be saved.");
        return;
      }

      setSuccess("Phone updated.");
      setIsEditing(false);
      router.refresh();
    } catch {
      setError("Phone could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/account/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Phone could not be removed.");
        return;
      }

      resetForm(null);
      setIsEditing(false);
      setSuccess("Phone removed.");
      router.refresh();
    } catch {
      setError("Phone could not be removed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`mt-10 ${accountSectionClassName}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={accountSectionLabelClassName}>Phone</p>
          <p className="mt-3 text-[0.8rem] font-light text-neptura-light-muted">
            {displayPhone ? formatPhoneDisplay(displayPhone) : "No phone number on file"}
          </p>
          {!displayPhone && customer.addresses.length === 0 && (
            <p className="mt-2 text-[0.72rem] font-light leading-relaxed text-neptura-light-muted/80">
              Add a saved address below, or enable{" "}
              <span className="text-neptura-light-muted">write_customers</span> on your Shopify app
              for a standalone contact number.
            </p>
          )}
        </div>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className={accountActionClassName}>
            {displayPhone ? "Edit" : "Add"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <p className="text-[0.75rem] leading-relaxed text-neptura-aurora">{error}</p>
          )}
          {success && (
            <p className="text-[0.75rem] leading-relaxed text-neptura-light-muted">{success}</p>
          )}

          <div className="space-y-2">
            <label htmlFor="accountPhone" className={accountLabelClassName}>
              Mobile number
            </label>
            <PhoneCountryInput
              id="accountPhone"
              countryCode={countryCode}
              nationalNumber={nationalNumber}
              onCountryCodeChange={setCountryCode}
              onNationalNumberChange={setNationalNumber}
              required
              placeholder={countryCode === DEFAULT_PHONE_COUNTRY_CODE ? "98765 43210" : "Phone number"}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={isSubmitting} className="btn-light-primary flex-1 disabled:opacity-60">
              {isSubmitting ? "Saving…" : "Save phone"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                resetForm(displayPhone);
                setError(null);
              }}
              className="btn-light-secondary flex-1"
            >
              Cancel
            </button>
          </div>

          {displayPhone && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleRemove}
              className="text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora"
            >
              Remove phone number
            </button>
          )}
        </form>
      )}
    </div>
  );
}
