"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  accountSectionClassName,
  accountSectionLabelClassName,
} from "@/lib/account-form-styles";
import {
  formatEmailMarketingState,
  isEmailMarketingSubscribed,
} from "@/lib/customer-auth/marketing";
import { formatPhoneDisplay, getCustomerDisplayPhone } from "@/lib/customer-auth/phone";
import {
  formatSmsMarketingState,
  isSmsMarketingSubscribed,
} from "@/lib/customer-auth/sms-marketing";
import type { CustomerSummary } from "@/lib/customer-auth/types";

type AccountMarketingSectionProps = {
  customer: CustomerSummary;
  embedded?: boolean;
};

type MarketingToggleProps = {
  title: string;
  description: string;
  detail: string | null;
  status: string;
  checked: boolean;
  disabled: boolean;
  onChange: (subscribed: boolean) => void;
};

function MarketingToggle({
  title,
  description,
  detail,
  status,
  checked,
  disabled,
  onChange,
}: MarketingToggleProps) {
  return (
    <div className="border border-neptura-light bg-neptura-light-surface/30 px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.82rem] font-light text-neptura-light-text">{title}</p>
          <p className="mt-1 text-[0.75rem] font-light leading-relaxed text-neptura-light-muted">
            {description}
          </p>
          {detail && (
            <p className="mt-2 text-[0.72rem] font-light text-neptura-light-muted">{detail}</p>
          )}
          <p className="mt-2 text-[0.72rem] font-light text-neptura-light-muted">{status}</p>
        </div>
        <label
          className={`relative inline-flex shrink-0 items-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
            className="peer sr-only"
          />
          <span className="block h-6 w-11 border border-neptura-light bg-neptura-light-bg transition-colors peer-checked:bg-neptura-aurora/20 peer-disabled:opacity-60" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 bg-neptura-light-muted transition-transform peer-checked:translate-x-5 peer-checked:bg-neptura-aurora" />
        </label>
      </div>
    </div>
  );
}

export default function AccountMarketingSection({
  customer,
  embedded = false,
}: AccountMarketingSectionProps) {
  const router = useRouter();
  const displayPhone = getCustomerDisplayPhone(customer);
  const [emailSubscribed, setEmailSubscribed] = useState(() =>
    isEmailMarketingSubscribed(customer.emailMarketingState)
  );
  const [smsSubscribed, setSmsSubscribed] = useState(() =>
    isSmsMarketingSubscribed(customer.smsMarketingState)
  );
  const [error, setError] = useState<string | null>(null);
  const [submittingChannel, setSubmittingChannel] = useState<"email" | "sms" | null>(null);

  async function handleToggle(channel: "email" | "sms", nextValue: boolean) {
    setError(null);
    setSubmittingChannel(channel);

    const setSubscribed = channel === "email" ? setEmailSubscribed : setSmsSubscribed;
    const previous = channel === "email" ? emailSubscribed : smsSubscribed;
    setSubscribed(nextValue);

    try {
      const response = await fetch("/api/account/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, subscribed: nextValue }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setSubscribed(previous);
        setError(payload.error ?? "Preference could not be saved.");
        return;
      }

      router.refresh();
    } catch {
      setSubscribed(previous);
      setError("Preference could not be saved.");
    } finally {
      setSubmittingChannel(null);
    }
  }

  const wrapperClass = embedded
    ? "border border-neptura-light bg-neptura-light-bg p-6 sm:p-8"
    : `mt-10 ${accountSectionClassName}`;

  const formattedPhone = displayPhone ? formatPhoneDisplay(displayPhone) : null;

  return (
    <div className={wrapperClass}>
      <p className={accountSectionLabelClassName}>Communications</p>
      <p className="mt-2 text-[0.78rem] font-light leading-[1.8] text-neptura-light-muted">
        Choose how Neptura reaches you.
      </p>

      {(customer.email || formattedPhone) && (
        <p className="mt-3 text-[0.72rem] font-light leading-relaxed text-neptura-light-muted">
          We&apos;ll reach you at{" "}
          {customer.email && <span>{customer.email}</span>}
          {customer.email && formattedPhone && <span> · </span>}
          {formattedPhone ? (
            <span>{formattedPhone}</span>
          ) : (
            !customer.email && <span>your saved contact details</span>
          )}
          {!formattedPhone && customer.email && (
            <span className="text-neptura-light-muted/80"> · add a phone above for SMS</span>
          )}
        </p>
      )}

      <div className="mt-6 space-y-4">
        <MarketingToggle
          title="Collection launches"
          description="New pieces, stories, and arrivals in your universe."
          detail={customer.email}
          status={formatEmailMarketingState(customer.emailMarketingState)}
          checked={emailSubscribed}
          disabled={submittingChannel === "email"}
          onChange={(value) => handleToggle("email", value)}
        />

        <MarketingToggle
          title="Bespoke follow-ups"
          description="Personal notes from our atelier when a commission is in progress."
          detail={
            formattedPhone
              ? formattedPhone
              : "Add a phone number above to enable SMS follow-ups."
          }
          status={
            formattedPhone
              ? formatSmsMarketingState(customer.smsMarketingState)
              : "Phone number required"
          }
          checked={smsSubscribed}
          disabled={!displayPhone || submittingChannel === "sms"}
          onChange={(value) => handleToggle("sms", value)}
        />

        <div className="border border-neptura-light bg-neptura-light-bg px-5 py-4">
          <p className="text-[0.82rem] font-light text-neptura-light-text">Order & delivery</p>
          <p className="mt-1 text-[0.75rem] font-light leading-relaxed text-neptura-light-muted">
            Order confirmations and delivery updates are always sent to your email.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-[0.75rem] leading-relaxed text-neptura-aurora">{error}</p>
      )}
    </div>
  );
}
