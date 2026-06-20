import Link from "next/link";

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
};

export default function AccountSubpageHero({
  label,
  title,
  subtitle,
  breadcrumb,
  compact = false,
  gradient = false,
}: AccountSubpageHeroProps) {
  const contentPadding = compact
    ? gradient
      ? "pb-14"
      : "pb-4"
    : gradient
      ? "pb-20"
      : "pb-8 md:pb-10";

  return (
    <div
      className={`pt-28 ${contentPadding} ${
        gradient
          ? `account-subpage-hero${compact ? " account-subpage-hero--compact" : ""}`
          : "bg-neptura-neptune"
      }`}
    >
      <div className="mx-auto max-w-4xl px-6 md:px-10 lg:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <header className="min-w-0">
            {label ? (
              <p className="section-label leading-none text-neptura-ice">{label}</p>
            ) : null}
            <h1
              className={`font-display text-neptura-diamond ${
                label ? (compact ? "mt-0" : "mt-1") : ""
              } ${
                compact
                  ? "text-[clamp(1.85rem,3.2vw,2.5rem)] font-medium"
                  : "text-[clamp(2rem,4vw,2.75rem)] font-light"
              }`}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className={`text-[0.8rem] font-normal leading-normal text-neptura-silver ${
                  compact ? "mt-2" : "mt-3"
                }`}
              >
                {subtitle}
              </p>
            ) : null}
          </header>

          {breadcrumb && breadcrumb.length > 0 ? (
            <nav
              aria-label="Breadcrumb"
              className="shrink-0 text-[0.62rem] font-normal uppercase tracking-[0.14em] text-neptura-ice"
            >
              <ol className="flex flex-wrap items-center gap-x-2">
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
      </div>
    </div>
  );
}
