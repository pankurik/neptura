import AccountProfileForm from "@/components/AccountProfileForm";
import type { CustomerSummary } from "@/lib/customer-auth/types";

type AccountSetupFormProps = {
  customer: CustomerSummary;
  returnTo: string;
};

export default function AccountSetupForm({ customer, returnTo }: AccountSetupFormProps) {
  return (
    <AccountProfileForm
      customer={customer}
      submitLabel="Save and continue"
      redirectTo={returnTo}
    />
  );
}
