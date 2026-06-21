import Link from "next/link";
import type { ReactNode } from "react";
import AccountCosmicBackdrop from "@/components/account/AccountCosmicBackdrop";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type AccountSubpageHeroProps = {
  label?: string;
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  compact?: boolean;
  gradient?: boolean;
  statusBadge?: string;
  footer?: ReactNode;
  contentClassName?: string;
};

export default function AccountSubpageHero({
  label,
  title,
  subtitle,
  breadcrumb,
  compact = false,
  gradient = false,
  statusBadge,
  footer,
  contentClassName,
}: AccountSubpageHeroProps) {
  const contentPadding = compact
    ? gradient
      ? footer
        ? "pb-16"
        : "pb-14"
      : "pb-4"
    : gradient
      ? footer
        ? "pb-24"
        : "pb-20"
      : "pb-8 md:pb-10";

  const titleClassName = cn(
    "font-display text-neptura-diamond",
    compact
      ? "text-[clamp(1.85rem,3.2vw,2.5rem)] font-medium"
      : "text-[clamp(2rem,4vw,2.75rem)] font-light",
  );

  const subtitleClassName = cn(
    "text-[0.8rem] font-normal leading-normal text-neptura-silver",
    footer ? "mt-1" : compact ? "mt-2" : "mt-3",
  );

  const statusBadgeEl = statusBadge ? (
    <span className="shrink-0 border border-neptura-aurora px-2.5 py-1 text-[0.58rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
      {statusBadge}
    </span>
  ) : null;

  return (
    <div
      className={cn(
        "relative pt-28",
        contentPadding,
        gradient
          ? cn("account-subpage-hero", compact && "account-subpage-hero--compact")
          : "bg-neptura-neptune",
      )}
    >
      {gradient ? <AccountCosmicBackdrop variant="hero" /> : null}

      <div
        className={cn(
          "relative",
          contentClassName ?? "mx-auto max-w-4xl px-6 md:px-10 lg:px-12",
        )}
      >
        {footer ? (
          <div className="relative z-[1]">
            {label ? (
              <p className="section-label leading-none text-neptura-aurora">{label}</p>
            ) : null}

            <h1 className={cn(titleClassName, "mt-2 leading-tight")}>{title}</h1>

            {subtitle || statusBadge ? (
              <div className="mt-0.5 flex items-center justify-between gap-4 sm:gap-6">
                {subtitle ? (
                  <p className="min-w-0 text-[0.8rem] font-normal leading-normal text-neptura-silver">
                    {subtitle}
                  </p>
                ) : (
                  <span aria-hidden />
                )}
                {statusBadgeEl}
              </div>
            ) : null}

            {footer}
          </div>
        ) : (
          <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <header className="min-w-0">
              {label ? (
                <p className="section-label leading-none text-neptura-aurora">{label}</p>
              ) : null}
              <h1
                className={cn(
                  titleClassName,
                  label && (compact ? "mt-0" : "mt-1"),
                )}
              >
                {title}
              </h1>
              {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
            </header>

            {statusBadgeEl || (breadcrumb && breadcrumb.length > 0) ? (
              <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                {statusBadgeEl}
                {breadcrumb && breadcrumb.length > 0 ? (
                  <nav
                    aria-label="Breadcrumb"
                    className="text-[0.62rem] font-normal uppercase tracking-[0.14em] text-neptura-ice"
                  >
                    <ol className="flex flex-wrap items-center gap-x-2 sm:justify-end">
                      {breadcrumb.map((item, index) => (
                        <li key={item.label} className="flex items-center gap-x-2">
                          {index > 0 && <span aria-hidden>·</span>}
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="text-neptura-ice transition-colors hover:text-neptura-diamond"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <span className="text-neptura-ice">{item.label}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
