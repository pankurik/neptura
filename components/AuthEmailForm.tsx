"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useOptionalNavigation } from "@/context/NavigationContext";
import { isValidEmail } from "@/lib/customer-auth/email";
import { buildAuthLoginPath } from "@/lib/customer-auth/return-to";

type AuthEmailFormProps = {
  returnTo: string;
  oauthError?: string | null;
  defaultEmail?: string;
};

export default function AuthEmailForm({ returnTo, oauthError, defaultEmail = "" }: AuthEmailFormProps) {
  const navigation = useOptionalNavigation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const emailIsValid = isValidEmail(email);

  function syncEmailFromInput() {
    const value = inputRef.current?.value ?? "";
    setEmail((current) => (current === value ? current : value));
  }

  useEffect(() => {
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.addEventListener("change", syncEmailFromInput);

    const autofillTimer = window.setInterval(syncEmailFromInput, 200);
    const stopAutofillTimer = window.setTimeout(() => {
      window.clearInterval(autofillTimer);
    }, 2500);

    return () => {
      input.removeEventListener("change", syncEmailFromInput);
      window.clearInterval(autofillTimer);
      window.clearTimeout(stopAutofillTimer);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    const submittedEmail = (inputRef.current?.value ?? email).trim().toLowerCase();

    if (!isValidEmail(submittedEmail)) {
      setEmail(submittedEmail);
      setFieldError("Enter email address");
      return;
    }

    setEmail(submittedEmail);
    setIsSubmitting(true);
    navigation?.startNavigation();

    window.setTimeout(() => {
      setIsSubmitting(false);
    }, 8000);

    window.location.assign(buildAuthLoginPath(returnTo, submittedEmail));
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
          ref={inputRef}
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
          onInput={syncEmailFromInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            syncEmailFromInput();
          }}
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
        disabled={isSubmitting}
        aria-disabled={!emailIsValid || isSubmitting}
        className={`btn-light-primary w-full transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
          isSubmitting ? "account-action-btn--loading" : ""
        } ${!emailIsValid && !isSubmitting ? "opacity-50" : "opacity-100"}`}
      >
        {isSubmitting ? "Opening…" : "Continue"}
      </button>

      <p className="text-[0.68rem] font-light leading-relaxed text-neptura-light-muted/80">
        Next you&apos;ll enter a verification code — your email won&apos;t be asked again.
      </p>
    </form>
  );
}
