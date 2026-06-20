"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import {
  accountFieldClassName,
  accountSectionClassName,
  accountSectionLabelClassName,
} from "@/lib/account-form-styles";
import {
  JEWELRY_METAL_OPTIONS,
  JEWELRY_STONE_OPTIONS,
  type JewelryPreferenceId,
} from "@/lib/customer-auth/jewelry-preferences";
import type { CustomerSummary } from "@/lib/customer-auth/types";

const LEGACY_RING_SIZE_STORAGE_KEY = "neptura-ring-size";

type AccountPreferencesSectionProps = {
  customer: CustomerSummary;
  embedded?: boolean;
};

function formatDisplayDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${isoDate}T00:00:00.000Z`));
}

function PreferenceGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-neptura-light bg-neptura-light-surface/25 px-5 py-6 sm:px-6 sm:py-7">
      <h3 className="font-display text-[1.15rem] font-light text-neptura-light-text">{title}</h3>
      <p className="mt-2 max-w-lg text-[0.75rem] font-light leading-relaxed text-neptura-light-muted">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[0.75rem] font-light text-neptura-light-muted"
    >
      {children}
    </label>
  );
}

function PreferenceSubheading({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.62rem] font-normal uppercase tracking-[0.14em] text-neptura-aurora">
      {children}
    </p>
  );
}

function PreferenceToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center border px-3 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
        checked
          ? "border-neptura-aurora bg-neptura-aurora/10 text-neptura-light-text"
          : "border-neptura-light bg-neptura-light-bg text-neptura-light-muted hover:border-neptura-aurora/40"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );
}

export default function AccountPreferencesSection({
  customer,
  embedded = false,
}: AccountPreferencesSectionProps) {
  const router = useRouter();
  const [birthday, setBirthday] = useState(customer.birthday ?? "");
  const [anniversary, setAnniversary] = useState(customer.anniversary ?? "");
  const [ringSize, setRingSize] = useState(customer.ringSize ?? "");
  const [preferences, setPreferences] = useState<JewelryPreferenceId[]>(
    customer.jewelryPreferences as JewelryPreferenceId[]
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wrapperClass = embedded ? accountSectionClassName : `mt-10 ${accountSectionClassName}`;

  useEffect(() => {
    if (customer.ringSize) return;

    const legacy = window.localStorage.getItem(LEGACY_RING_SIZE_STORAGE_KEY)?.trim();
    if (legacy) {
      setRingSize(legacy);
    }
  }, [customer.ringSize]);

  function togglePreference(id: JewelryPreferenceId, checked: boolean) {
    setPreferences((current) =>
      checked ? Array.from(new Set([...current, id])) : current.filter((value) => value !== id)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthday: birthday.trim() || null,
          anniversary: anniversary.trim() || null,
          ringSize: ringSize.trim() || null,
          jewelryPreferences: preferences,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Preferences could not be saved.");
        return;
      }

      setSuccess("Preferences saved.");
      window.localStorage.removeItem(LEGACY_RING_SIZE_STORAGE_KEY);
      router.refresh();
    } catch {
      setError("Preferences could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={wrapperClass}>
      <div className="border-b border-neptura-light pb-6">
        <p className={accountSectionLabelClassName}>Preferences</p>
        <p className="mt-3 font-display text-xl font-light text-neptura-light-text">
          Tailored to you
        </p>
        <p className="mt-2 max-w-xl text-[0.8rem] font-light leading-relaxed text-neptura-light-muted">
          Optional details for recommendations, sizing, and gentle gifting reminders.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <PreferenceGroup
          title="Special dates"
          description="We'll only use these for thoughtful reminders — never shared."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="birthday">Birthday</FieldLabel>
              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(event) => setBirthday(event.target.value)}
                className={accountFieldClassName}
              />
              {birthday && (
                <p className="text-[0.72rem] font-light text-neptura-light-muted/80">
                  {formatDisplayDate(birthday)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="anniversary">Anniversary</FieldLabel>
              <input
                id="anniversary"
                type="date"
                value={anniversary}
                onChange={(event) => setAnniversary(event.target.value)}
                className={accountFieldClassName}
              />
              {anniversary && (
                <p className="text-[0.72rem] font-light text-neptura-light-muted/80">
                  {formatDisplayDate(anniversary)}
                </p>
              )}
            </div>
          </div>
        </PreferenceGroup>

        <PreferenceGroup
          title="Ring size"
          description="Saved for faster sizing guidance and bespoke enquiries."
        >
          <div className="max-w-xs space-y-2">
            <input
              id="ringSize"
              type="text"
              inputMode="decimal"
              value={ringSize}
              onChange={(event) => setRingSize(event.target.value)}
              placeholder="e.g. 5.5"
              aria-label="Ring size"
              className={accountFieldClassName}
            />
            {!ringSize && (
              <p className="text-[0.72rem] font-light text-neptura-light-muted/80">
                No ring size saved yet.
              </p>
            )}
          </div>
        </PreferenceGroup>

        <PreferenceGroup
          title="Your taste"
          description="Help us tailor recommendations to what you're drawn to."
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <PreferenceSubheading>Metals</PreferenceSubheading>
              <div className="flex flex-wrap gap-2">
                {JEWELRY_METAL_OPTIONS.map((option) => (
                  <PreferenceToggle
                    key={option.id}
                    label={option.label}
                    checked={preferences.includes(option.id)}
                    onChange={(checked) => togglePreference(option.id, checked)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-neptura-light pt-6">
              <PreferenceSubheading>Stones</PreferenceSubheading>
              <div className="flex flex-wrap gap-2">
                {JEWELRY_STONE_OPTIONS.map((option) => (
                  <PreferenceToggle
                    key={option.id}
                    label={option.label}
                    checked={preferences.includes(option.id)}
                    onChange={(checked) => togglePreference(option.id, checked)}
                  />
                ))}
              </div>
            </div>

            {preferences.length === 0 && (
              <p className="text-[0.72rem] font-light text-neptura-light-muted/80">
                Select any that speak to you — or leave blank for now.
              </p>
            )}
          </div>
        </PreferenceGroup>

        {error && (
          <p className="text-[0.75rem] leading-relaxed text-neptura-aurora">{error}</p>
        )}
        {success && (
          <p className="text-[0.75rem] leading-relaxed text-neptura-light-muted">{success}</p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-light-primary disabled:opacity-60">
          {isSubmitting ? "Saving…" : "Save preferences"}
        </button>
      </form>
    </div>
  );
}
