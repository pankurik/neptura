import AuthShell from "@/components/AuthShell";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";

export const metadata = {
  title: "Create account | Neptura",
  description: "Create your Neptura account.",
};

type SignupPageProps = {
  searchParams: { returnTo?: string; error?: string };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  const returnTo = sanitizeReturnTo(searchParams.returnTo);

  return (
    <AuthShell
      label="Account"
      title="Create your account"
      description="Join Neptura to track orders, manage your profile, and return to the collection seamlessly."
      primaryLabel="Create account"
      returnTo={returnTo}
      alternateHref="/login"
      alternatePrompt="Already have an account?"
      alternateLabel="Sign in"
      error={searchParams.error}
    />
  );
}
