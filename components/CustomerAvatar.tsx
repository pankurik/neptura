import Image from "next/image";
import type { CustomerSummary } from "@/lib/customer-auth/types";
import { getCustomerDisplayLabel, getCustomerInitials } from "@/lib/customer-auth/customer";

type CustomerAvatarProps = {
  customer: CustomerSummary;
  size?: "sm" | "md";
  showName?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-7 w-7 text-[0.62rem]",
  md: "h-8 w-8 text-[0.68rem]",
};

export default function CustomerAvatar({
  customer,
  size = "sm",
  showName = false,
  className = "",
}: CustomerAvatarProps) {
  const initials = getCustomerInitials(customer);
  const label = getCustomerDisplayLabel(customer);
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {customer.imageUrl ? (
        <span
          className={`relative inline-block shrink-0 overflow-hidden border border-neptura-light ${sizeClass}`}
        >
          <Image
            src={customer.imageUrl}
            alt=""
            fill
            sizes={size === "sm" ? "28px" : "32px"}
            className="object-cover"
          />
        </span>
      ) : (
        <span
          className={`inline-flex shrink-0 items-center justify-center border border-neptura-light bg-neptura-light-surface font-sans font-medium uppercase tracking-[0.08em] text-neptura-light-text ${sizeClass}`}
          aria-hidden
        >
          {initials}
        </span>
      )}
      {showName && (
        <span className="max-w-[8rem] truncate text-meta font-normal uppercase tracking-[0.14em]">
          {label}
        </span>
      )}
    </span>
  );
}
