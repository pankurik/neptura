import AccountAvatarSection from "@/components/AccountAvatarSection";
import AccountMarketingSection from "@/components/AccountMarketingSection";
import AccountPhoneSection from "@/components/AccountPhoneSection";
import AccountPreferencesSection from "@/components/AccountPreferencesSection";
import AccountProfileSection from "@/components/AccountProfileSection";
import AccountSectionHeader from "@/components/account/AccountSectionHeader";
import type { CustomerSummary } from "@/lib/customer-auth/types";

type AccountSettingsSectionProps = {
  customer: CustomerSummary;
  openProfileEditor?: boolean;
  profileRedirectTo?: string;
};

export default function AccountSettingsSection({
  customer,
  openProfileEditor = false,
  profileRedirectTo,
}: AccountSettingsSectionProps) {
  return (
    <section aria-labelledby="account-settings-title">
      <AccountSectionHeader
        id="account"
        label="Your details"
        title="Account"
        subtitle="Profile, contact, and how we reach you."
      />

      <div className="mt-8 space-y-5">
        <AccountAvatarSection customer={customer} embedded />
        <AccountProfileSection
          customer={customer}
          embedded
          defaultEditing={openProfileEditor}
          profileRedirectTo={profileRedirectTo}
        />
        <AccountPhoneSection customer={customer} embedded />
        <AccountPreferencesSection customer={customer} embedded />
        <AccountMarketingSection customer={customer} embedded />
      </div>

      <p className="mt-8 max-w-2xl text-[0.72rem] font-light leading-relaxed text-neptura-light-muted">
        Your details are used for orders, sizing, and communications you&apos;ve opted into.
      </p>
    </section>
  );
}
