import Link from "next/link";
import { redirect } from "next/navigation";
import AccountSetupForm from "@/components/AccountSetupForm";
import { isProfileComplete } from "@/lib/customer-auth/customer";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";
import { getCustomerSession } from "@/lib/customer-auth/require-session";

export const metadata = {
  title: "Complete your profile | Neptura",
  description: "Finish setting up your Neptura account.",
};

type AccountSetupPageProps = {
  searchParams: { returnTo?: string };
};

export default async function AccountSetupPage({ searchParams }: AccountSetupPageProps) {
  const customer = await getCustomerSession();
  const returnTo = sanitizeReturnTo(searchParams.returnTo);

  if (!customer) {
    redirect(`/login?returnTo=${encodeURIComponent("/account/setup")}`);
  }

  if (isProfileComplete(customer)) {
    redirect(returnTo === "/account/setup" ? "/account" : returnTo);
  }

  return (
    <div className="min-h-screen bg-neptura-light-bg pt-28 pb-24">
      <div className="mx-auto max-w-md px-6">
        <div className="space-y-4 text-center">
          <span className="section-label">Account</span>
          <h1 className="font-display text-4xl font-light text-neptura-light-text">
            Welcome to Neptura
          </h1>
          <p className="text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
            Tell us how to address you. You can update this anytime from your account.
          </p>
        </div>

        <div className="mt-10 border border-neptura-light bg-neptura-light-bg p-8">
          <AccountSetupForm customer={customer} returnTo={returnTo} />
        </div>

        <p className="mt-6 text-center">
          <Link
            href={returnTo}
            className="text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora"
          >
            Skip for now
          </Link>
        </p>
      </div>
    </div>
  );
}
