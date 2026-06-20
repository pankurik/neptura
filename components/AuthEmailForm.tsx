"use client";

import { FormEvent, useState } from "react";
import { isValidEmail } from "@/lib/customer-auth/email";
import { buildAuthLoginPath } from "@/lib/customer-auth/return-to";

type AuthEmailFormProps = {
  returnTo: string;
  oauthError?: string | null;
  defaultEmail?: string;
};

export default function AuthEmailForm({ returnTo, oauthError, defaultEmail = "" }: AuthEmailFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const emailIsValid = isValidEmail(email);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    if (!emailIsValid) {
      setFieldError("Enter email address");
      return;
    }

    setIsSubmitting(true);
    window.location.href = buildAuthLoginPath(returnTo, email.trim().toLowerCase());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-5 border bg-neptura-light-bg px-6 py-7 transition-colors sm:px-8 sm:py-8 ${
        isSubmitting ? "auth-form-opening border-neptura-aurora/40" : "border-neptura-light"
      }`}
      noValidate
    >
      {oauthError && (
        <p className="text-[0.75rem] leading-relaxed text-neptura-aurora">{oauthError}</p>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-light-muted"
        >
          Email address <span className="text-neptura-aurora">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldError) setFieldError(null);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? "email-error" : undefined}
          className={`w-full border bg-neptura-light-bg px-4 py-3 text-[0.85rem] font-light text-neptura-light-text outline-none transition-colors duration-300 ${
            fieldError || isFocused ? "border-neptura-aurora" : "border-neptura-light"
          }`}
        />
        {fieldError && (
          <p id="email-error" className="text-[0.72rem] font-light text-neptura-aurora">
            {fieldError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!emailIsValid || isSubmitting}
        className="btn-light-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "Opening…" : "Continue"}
      </button>

      <p className="text-[0.68rem] font-light leading-relaxed text-neptura-light-muted/80">
        Next you&apos;ll enter a verification code — your email won&apos;t be asked again.
      </p>
    </form>
  );
}
