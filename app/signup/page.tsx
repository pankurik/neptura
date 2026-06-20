import Link from "next/link";
import { redirect } from "next/navigation";
import CustomerAvatar from "@/components/CustomerAvatar";
import { getCustomerSession } from "@/lib/customer-auth/require-session";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";

export const metadata = {
  title: "Create account | Neptura",
  description: "Create your Neptura account.",
};

type SignupPageProps = {
  searchParams: { returnTo?: string };
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const returnTo = sanitizeReturnTo(searchParams.returnTo);
  const customer = await getCustomerSession();

  if (customer) {
    return (
      <div className="min-h-screen bg-neptura-light-bg pt-28 pb-24">
        <div className="mx-auto max-w-md px-6 text-center">
          <span className="section-label">Account</span>
          <h1 className="mt-4 font-display text-4xl font-light text-neptura-light-text">
            You&apos;re already signed in
          </h1>
          <div className="mt-8 flex justify-center">
            <CustomerAvatar customer={customer} size="md" showName />
          </div>
          <p className="mt-6 text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
            Sign out first if you want to create a different account, or continue with this one.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/account" className="btn-light-primary">
              Go to account
            </Link>
            <Link
              href="/api/auth/logout?returnTo=/login"
              className="text-[0.72rem] uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora"
            >
              Sign out and use another email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const loginPath =
    returnTo !== "/"
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : "/login";

  redirect(loginPath);
}
