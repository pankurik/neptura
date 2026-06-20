import Image from "next/image";
import type { CustomerSummary } from "@/lib/customer-auth/types";
import { getCustomerAvatarUrl, getCustomerInitials } from "@/lib/customer-auth/display";

type CustomerAvatarProps = {
  customer: CustomerSummary;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  variant?: "light" | "dark";
  shape?: "square" | "circle";
  className?: string;
};

const sizeClasses = {
  sm: "h-7 w-7 text-[0.62rem]",
  md: "h-8 w-8 text-[0.68rem]",
  lg: "h-14 w-14 text-[0.85rem]",
  xl: "h-[4.5rem] w-[4.5rem] text-[1rem]",
};

const variantClasses = {
  light: "border-neptura-light bg-neptura-light-surface text-neptura-light-text",
  dark: "border-neptura-ice/20 bg-neptura-deep/60 text-neptura-diamond",
};

export default function CustomerAvatar({
  customer,
  size = "sm",
  showName = false,
  variant = "light",
  shape = "square",
  className = "",
}: CustomerAvatarProps) {
  const initials = getCustomerInitials(customer);
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const shapeClass = shape === "circle" ? "rounded-full" : "";
  const imageSizes =
    size === "sm" ? "28px" : size === "md" ? "32px" : size === "lg" ? "56px" : "72px";
  const imageUrl = getCustomerAvatarUrl(customer);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {imageUrl ? (
        <span
          className={`relative inline-block shrink-0 overflow-hidden border ${variantClass} ${sizeClass} ${shapeClass}`}
        >
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes={imageSizes}
            className="object-cover"
          />
        </span>
      ) : (
        <span
          className={`inline-flex shrink-0 items-center justify-center border font-sans font-medium uppercase tracking-[0.08em] ${variantClass} ${sizeClass} ${shapeClass}`}
          aria-hidden
        >
          {initials}
        </span>
      )}
      {showName && imageUrl && (
        <span className="max-w-[8rem] truncate text-meta font-normal uppercase tracking-[0.14em]">
          {initials}
        </span>
      )}
    </span>
  );
}
