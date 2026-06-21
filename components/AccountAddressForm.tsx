"use client";

import { FormEvent, useState } from "react";
import PhoneCountryInput from "@/components/PhoneCountryInput";
import {
  accountFieldClassName,
  accountLabelClassName,
} from "@/lib/account-form-styles";
import { INDIA_STATES } from "@/lib/customer-auth/india-states";
import { formatPhoneE164, parseE164Phone } from "@/lib/customer-auth/phone";
import type { CustomerAddressInput, CustomerAddressSummary } from "@/lib/customer-auth/types";

type AccountAddressFormProps = {
  initial?: CustomerAddressSummary | null;
  defaultFirstName?: string;
  defaultLastName?: string;
  isDefault?: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSaved: () => void;
};

type FormState = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  zoneCode: string;
  zip: string;
  phoneCountryCode: string;
  phoneNumber: string;
  defaultAddress: boolean;
};

function buildInitialState(
  initial: CustomerAddressSummary | null | undefined,
  defaultFirstName?: string,
  defaultLastName?: string,
  isDefault?: boolean
): FormState {
  const parsedPhone = parseE164Phone(initial?.phoneNumber ?? null);

  return {
    firstName: initial?.firstName ?? defaultFirstName ?? "",
    lastName: initial?.lastName ?? defaultLastName ?? "",
    company: initial?.company ?? "",
    address1: initial?.address1 ?? "",
    address2: initial?.address2 ?? "",
    city: initial?.city ?? "",
    zoneCode: initial?.zoneCode ?? "",
    zip: initial?.zip ?? "",
    phoneCountryCode: parsedPhone.countryCode,
    phoneNumber: parsedPhone.nationalNumber,
    defaultAddress: isDefault ?? false,
  };
}

export default function AccountAddressForm({
  initial,
  defaultFirstName,
  defaultLastName,
  isDefault,
  submitLabel,
  onCancel,
  onSaved,
}: AccountAddressFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(initial, defaultFirstName, defaultLastName, isDefault)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CustomerAddressInput = {
      firstName: form.firstName,
      lastName: form.lastName,
      company: form.company,
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      zoneCode: form.zoneCode,
      zip: form.zip,
      territoryCode: "IN",
      defaultAddress: form.defaultAddress,
      ...(form.phoneNumber.trim()
        ? {
            phoneNumber: formatPhoneE164(
              form.phoneCountryCode,
              form.phoneNumber.replace(/\D/g, "")
            ),
          }
        : {}),
    };

    const url = initial
      ? `/api/account/addresses/${encodeURIComponent(initial.id)}`
      : "/api/account/addresses";

    try {
      const response = await fetch(url, {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      onSaved();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-center text-[0.75rem] leading-relaxed text-neptura-aurora">{error}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="addressFirstName" className={accountLabelClassName}>
            First name
          </label>
          <input
            id="addressFirstName"
            required
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            autoComplete="given-name"
            className={accountFieldClassName}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="addressLastName" className={accountLabelClassName}>
            Last name
          </label>
          <input
            id="addressLastName"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            autoComplete="family-name"
            className={accountFieldClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="addressCompany" className={accountLabelClassName}>
          Company
        </label>
        <input
          id="addressCompany"
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          autoComplete="organization"
          className={accountFieldClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="address1" className={accountLabelClassName}>
          Address
        </label>
        <input
          id="address1"
          required
          value={form.address1}
          onChange={(event) => updateField("address1", event.target.value)}
          autoComplete="address-line1"
          className={accountFieldClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="address2" className={accountLabelClassName}>
          Apartment, suite, etc.
        </label>
        <input
          id="address2"
          value={form.address2}
          onChange={(event) => updateField("address2", event.target.value)}
          autoComplete="address-line2"
          className={accountFieldClassName}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="addressCity" className={accountLabelClassName}>
            City
          </label>
          <input
            id="addressCity"
            required
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            autoComplete="address-level2"
            className={accountFieldClassName}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="addressState" className={accountLabelClassName}>
            State
          </label>
          <select
            id="addressState"
            required
            value={form.zoneCode}
            onChange={(event) => updateField("zoneCode", event.target.value)}
            autoComplete="address-level1"
            className={accountFieldClassName}
          >
            <option value="">Select a state</option>
            {INDIA_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="addressZip" className={accountLabelClassName}>
            PIN code
          </label>
          <input
            id="addressZip"
            required
            value={form.zip}
            onChange={(event) => updateField("zip", event.target.value)}
            autoComplete="postal-code"
            inputMode="numeric"
            className={accountFieldClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="addressPhone" className={accountLabelClassName}>
          Phone
        </label>
        <PhoneCountryInput
          id="addressPhone"
          countryCode={form.phoneCountryCode}
          nationalNumber={form.phoneNumber}
          onCountryCodeChange={(value) => updateField("phoneCountryCode", value)}
          onNationalNumberChange={(value) => updateField("phoneNumber", value)}
          placeholder="Phone number"
        />
      </div>

      <label className="flex items-start gap-3 text-[0.78rem] font-light leading-relaxed text-neptura-light-muted">
        <input
          type="checkbox"
          checked={form.defaultAddress}
          onChange={(event) => updateField("defaultAddress", event.target.checked)}
          className="mt-1 accent-neptura-aurora"
        />
        Set as default address
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button type="submit" disabled={isSubmitting} className={`btn-light-primary flex-1 disabled:opacity-60 ${isSubmitting ? "account-action-btn--loading" : ""}`}>
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-light-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
