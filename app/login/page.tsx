import AuthShell from "@/components/AuthShell";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";

export const metadata = {
  title: "Sign in | Neptura",
  description: "Sign in to your Neptura account.",
};

type LoginPageProps = {
  searchParams: { returnTo?: string; error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const returnTo = sanitizeReturnTo(searchParams.returnTo);

  return (
    <AuthShell
      label="Account"
      title="Welcome back"
      description="Sign in to view orders, save wishlist pieces, and continue where you left off."
      primaryLabel="Sign in"
      returnTo={returnTo}
      alternateHref="/signup"
      alternatePrompt="New to Neptura?"
      alternateLabel="Create an account"
      error={searchParams.error}
    />
  );
}
