import Link from "next/link";
import AccountSectionHeader from "@/components/account/AccountSectionHeader";
import {
  formatCommissionDate,
  formatCommissionStatus,
} from "@/lib/customer-auth/bespoke-commissions";
import type { BespokeCommission } from "@/lib/customer-auth/types";

type AccountBespokeSectionProps = {
  commissions: BespokeCommission[];
};

export default function AccountBespokeSection({ commissions }: AccountBespokeSectionProps) {
  return (
    <section aria-labelledby="account-bespoke-title">
      <AccountSectionHeader
        id="bespoke"
        label="Commissions"
        title="Bespoke"
        subtitle="Custom pieces crafted for your universe."
      />

      {commissions.length === 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:gap-6">
          <div className="flex min-h-[220px] flex-col justify-between border border-dashed border-neptura-light bg-neptura-light-surface/50 p-6 sm:col-span-2 sm:p-8">
            <div>
              <p className="font-display text-xl font-light text-neptura-light-text">
                No active commissions
              </p>
              <p className="mt-3 max-w-lg text-[0.8rem] font-light leading-relaxed text-neptura-light-muted">
                When you submit a bespoke enquiry, your commission will appear here with status
                updates from our team.
              </p>
            </div>
            <Link
              href="/bespoke"
              className="mt-6 inline-block text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
            >
              Start a bespoke enquiry →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {commissions.map((commission) => (
            <article
              key={commission.id}
              className="flex flex-col justify-between border border-neptura-light bg-neptura-light-bg p-6 sm:p-7"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl font-light text-neptura-light-text">
                    {commission.title}
                  </h3>
                  <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.14em] text-neptura-aurora">
                    {formatCommissionStatus(commission.status)}
                  </span>
                </div>
                <p className="mt-3 text-[0.75rem] font-light capitalize text-neptura-light-muted">
                  {commission.metal.replace(/\b\w/g, (char) => char.toUpperCase())}
                </p>
                {commission.notes && (
                  <p className="mt-4 text-[0.78rem] font-light leading-relaxed text-neptura-light-muted">
                    {commission.notes}
                  </p>
                )}
              </div>
              <p className="mt-6 text-[0.68rem] font-light uppercase tracking-[0.12em] text-neptura-light-muted/80">
                Submitted {formatCommissionDate(commission.submittedAt)}
              </p>
            </article>
          ))}

          <div className="flex items-center border border-dashed border-neptura-light bg-neptura-light-surface/40 p-6 sm:col-span-2">
            <Link
              href="/bespoke"
              className="text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
            >
              Submit another enquiry →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
