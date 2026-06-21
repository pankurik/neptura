import Link from "next/link";

type AccountSubpageNavProps = {
  backHref?: string;
  backLabel?: string;
  forwardHref?: string;
  forwardLabel?: string;
  className?: string;
};

export default function AccountSubpageNav({
  backHref = "/account",
  backLabel = "Back to account",
  forwardHref = "/shop",
  forwardLabel = "Continue shopping",
  className = "",
}: AccountSubpageNavProps) {
  return (
    <nav
      aria-label="Account sub-page navigation"
      className={`flex flex-col gap-4 border-t border-neptura-light pt-6 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <Link
        href={backHref}
        className="account-link-action text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
      >
        ← {backLabel}
      </Link>
      <Link
        href={forwardHref}
        className="account-link-action text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
      >
        {forwardLabel} →
      </Link>
    </nav>
  );
}
