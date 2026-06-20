import Link from "next/link";
import { redirect } from "next/navigation";
import CustomerAvatar from "@/components/CustomerAvatar";
import { getCustomerSession } from "@/lib/customer-auth/session";

export const metadata = {
  title: "Your account | Neptura",
  description: "Manage your Neptura account.",
};

export default async function AccountPage() {
  const customer = await getCustomerSession();

  if (!customer) {
    redirect("/login?returnTo=/account");
  }

  return (
    <div className="min-h-screen bg-neptura-light-bg pt-28 pb-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="space-y-4 border-b border-neptura-light pb-8">
          <span className="section-label">Account</span>
          <div className="flex items-center gap-4">
            <CustomerAvatar customer={customer} size="md" />
            <div>
              <h1 className="font-display text-3xl font-light text-neptura-light-text">
                {customer.firstName ?? customer.displayName ?? "Your account"}
              </h1>
              {customer.email && (
                <p className="mt-1 text-[0.8rem] font-light text-neptura-light-muted">
                  {customer.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <p className="text-[0.8rem] font-light leading-[1.8] text-neptura-light-muted">
            Your profile and order history are managed through your Neptura account. More account
            features will appear here as we expand the experience.
          </p>

          <Link href="/shop" className="btn-light-secondary inline-block">
            Continue shopping
          </Link>

          <div className="pt-4">
            <Link
              href="/api/auth/logout?returnTo=/"
              className="text-[0.72rem] uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora"
            >
              Sign out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
