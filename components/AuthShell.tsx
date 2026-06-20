import Link from "next/link";
import { buildAuthLoginPath } from "@/lib/customer-auth/return-to";

type AuthShellProps = {
  label: string;
  title: string;
  description: string;
  primaryLabel: string;
  returnTo: string;
  alternateHref: string;
  alternatePrompt: string;
  alternateLabel: string;
  error?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  not_configured:
    "Sign-in is not configured yet. Add Customer Account API credentials to your environment.",
  auth_failed: "We could not complete sign-in. Please try again.",
  invalid_state: "Your sign-in session expired. Please try again.",
};

export default function AuthShell({
  label,
  title,
  description,
  primaryLabel,
  returnTo,
  alternateHref,
  alternatePrompt,
  alternateLabel,
  error,
}: AuthShellProps) {
  const authHref = buildAuthLoginPath(returnTo);
  const alternateUrl =
    alternateHref +
    (returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : "");
  const errorMessage = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.auth_failed : null;

  return (
    <div className="min-h-screen bg-neptura-light-bg pt-28 pb-24">
      <div className="mx-auto max-w-md px-6">
        <div className="space-y-4 text-center">
          <span className="section-label">{label}</span>
          <h1 className="font-display text-4xl font-light text-neptura-light-text">{title}</h1>
          <p className="text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
            {description}
          </p>
        </div>

        <div className="mt-10 space-y-6 border border-neptura-light bg-neptura-light-bg p-8">
          {errorMessage && (
            <p className="text-center text-[0.75rem] leading-relaxed text-neptura-aurora">
              {errorMessage}
            </p>
          )}

          <Link href={authHref} className="btn-light-primary block text-center">
            {primaryLabel}
          </Link>

          <p className="text-center text-[0.72rem] font-light leading-relaxed text-neptura-light-muted">
            {alternatePrompt}{" "}
            <Link
              href={alternateUrl}
              className="text-neptura-aurora transition-colors hover:text-neptura-light-text"
            >
              {alternateLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
