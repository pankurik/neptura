import StarField from "@/components/StarField";
import { cn } from "@/lib/utils";

type AccountCosmicBackdropProps = {
  variant?: "hero" | "sidebar";
  auroraClassName?: string;
};

export default function AccountCosmicBackdrop({
  variant = "hero",
  auroraClassName,
}: AccountCosmicBackdropProps) {
  const resolvedAuroraClass =
    auroraClassName ?? (variant === "hero" ? "hidden md:block" : "block");

  return (
    <>
      <StarField density="subtle" />
      <div className={cn("account-subpage-hero-aurora-field", resolvedAuroraClass)} aria-hidden>
        <div className="account-subpage-hero-system account-subpage-hero-system--left">
          <div className="account-subpage-hero-aurora__ring account-subpage-hero-aurora__ring--125" />
          <div className="account-subpage-hero-aurora__ring account-subpage-hero-aurora__ring--110" />
          <div className="account-subpage-hero-aurora__halo account-subpage-hero-aurora__halo--violet" />
          <div className="account-subpage-hero-aurora__core account-subpage-hero-aurora__core--planet account-subpage-hero-aurora__core--sm" />
          <div className="account-subpage-hero-aurora__moon account-subpage-hero-aurora__moon--ne" />
          <div className="account-subpage-hero-aurora__moon account-subpage-hero-aurora__moon--sw account-subpage-hero-aurora__moon--xs" />
        </div>

        <div className="account-subpage-hero-system account-subpage-hero-system--right">
          <div className="account-subpage-hero-aurora__ring account-subpage-hero-aurora__ring--125" />
          <div className="account-subpage-hero-aurora__ring account-subpage-hero-aurora__ring--110" />
          <div className="account-subpage-hero-aurora__halo" />
          <div className="account-subpage-hero-aurora__core account-subpage-hero-aurora__core--planet account-subpage-hero-aurora__core--lg" />
          <div className="account-subpage-hero-aurora__moon account-subpage-hero-aurora__moon--e" />
          <div className="account-subpage-hero-aurora__moon account-subpage-hero-aurora__moon--se" />
          <div className="account-subpage-hero-aurora__moon account-subpage-hero-aurora__moon--n account-subpage-hero-aurora__moon--xs" />
        </div>

        <div className="account-subpage-hero-system account-subpage-hero-system--far">
          <div className="account-subpage-hero-aurora__ring account-subpage-hero-aurora__ring--110" />
          <div className="account-subpage-hero-aurora__halo account-subpage-hero-aurora__halo--wide" />
          <div className="account-subpage-hero-aurora__core account-subpage-hero-aurora__core--planet account-subpage-hero-aurora__core--xl" />
        </div>
      </div>
    </>
  );
}
