import { cookies } from "next/headers";
import AuthShell from "@/components/AuthShell";
import { AUTH_COOKIE } from "@/lib/customer-auth/cookies";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";

export const metadata = {
  title: "Sign in | Neptura",
  description: "Sign in or create your Neptura account.",
};

type LoginPageProps = {
  searchParams: { returnTo?: string; error?: string; email?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const returnTo = sanitizeReturnTo(searchParams.returnTo);
  const flash = cookies().get(AUTH_COOKIE.authFlash)?.value;
  const pendingEmail = cookies().get(AUTH_COOKIE.pendingLoginEmail)?.value;
  const emailHint = searchParams.email?.trim().toLowerCase() ?? "";

  const error =
    flash === "wrong_account"
      ? "wrong_account"
      : flash === "logout_local"
        ? "logout_local"
        : searchParams.error;

  return (
    <AuthShell
      returnTo={returnTo}
      error={error}
      signedOut={flash === "signed_out"}
      defaultEmail={emailHint || pendingEmail || ""}
    />
  );
}
