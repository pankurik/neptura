import AuthEmailForm from "@/components/AuthEmailForm";

type AuthShellProps = {
  returnTo: string;
  error?: string;
  signedOut?: boolean;
  defaultEmail?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  not_configured:
    "Sign-in is not configured yet. Add Customer Account API credentials to your environment.",
  auth_failed: "We could not complete sign-in. Please try again.",
  invalid_state: "Your sign-in session expired. Please try again.",
  invalid_email: "Enter a valid email address.",
  wrong_account:
    "A previous session conflicted with that email. Click Continue again — you'll go straight to your verification code.",
  signed_out: "You've been signed out. Enter the email for the account you want to use.",
  logout_local:
    "You're signed out on Neptura. If the next sign-in uses the wrong account, sign out again or use a private window.",
  session_expired: "Your session expired. Please sign in again to continue.",
  email_updated:
    "Your email was updated successfully. Sign in with your new address to continue.",
};

const AUTH_BENEFITS = [
  {
    title: "Track orders",
    description: "View history and delivery updates in one place",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
          d="M6 4h12v16H6V4Z"
          stroke="currentColor"
          strokeWidth="0.75"
        />
        <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="0.75" />
      </svg>
    ),
  },
  {
    title: "Collection access",
    description: "Return to the pieces you were browsing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
          d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7L12 3Z"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Faster checkout",
    description: "Saved details for a seamless purchase",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
          d="M7 7h14l-1.5 9H8.5L7 7ZM7 7L6 4H3"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="19" r="1" fill="currentColor" />
        <circle cx="17" cy="19" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

export default function AuthShell({ returnTo, error, signedOut, defaultEmail }: AuthShellProps) {
  const oauthError = signedOut
    ? ERROR_MESSAGES.signed_out
    : error
      ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.auth_failed
      : null;

  return (
    <div className="min-h-screen bg-neptura-light-bg pt-28 pb-24">
      <div className="mx-auto max-w-lg px-6">
        <div className="space-y-3 text-center">
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-light text-neptura-light-text">
            Sign in or create account
          </h1>
          <p className="text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
            We&apos;ll recognize if you already have an account
          </p>
        </div>

        <div className="mt-10 border border-neptura-light bg-neptura-light-bg px-6 py-8 sm:px-10 sm:py-10">
          <AuthEmailForm returnTo={returnTo} oauthError={oauthError} defaultEmail={defaultEmail} />
        </div>

        <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {AUTH_BENEFITS.map((benefit) => (
            <li key={benefit.title} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center text-neptura-aurora">
                {benefit.icon}
              </div>
              <p className="mt-3 text-[0.68rem] font-normal uppercase tracking-[0.14em] text-neptura-light-text">
                {benefit.title}
              </p>
              <p className="mt-2 text-[0.72rem] font-light leading-[1.7] text-neptura-light-muted">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
