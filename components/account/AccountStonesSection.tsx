import AccountStonesPreview from "@/components/account/AccountStonesPreview";
import AccountSectionHeader from "@/components/account/AccountSectionHeader";
import type { OrderSummary } from "@/lib/customer-auth/types";

type AccountStonesSectionProps = {
  orders: OrderSummary[];
};

export default function AccountStonesSection({ orders }: AccountStonesSectionProps) {
  return (
    <section aria-labelledby="account-stones-title">
      <AccountSectionHeader
        id="stones"
        label="Your collection"
        title="My stones"
        subtitle="Every piece you've brought into your universe."
      />

      <div className="mt-8">
        <AccountStonesPreview orders={orders} />
      </div>
    </section>
  );
}
