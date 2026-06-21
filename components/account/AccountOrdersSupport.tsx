const SUPPORT_EMAIL = "info@neptura.in";

type AccountOrdersSupportProps = {
  className?: string;
};

export default function AccountOrdersSupport({ className = "" }: AccountOrdersSupportProps) {
  return (
    <aside
      className={`flex flex-col gap-4 py-1 pl-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 [border-left:2px_solid_var(--neptura-aurora)] ${className}`}
    >
      <div>
        <h2 className="font-display text-base font-light text-neptura-light-text sm:text-lg">
          Need help with an order?
        </h2>
        <p className="mt-1.5 max-w-md text-[0.78rem] font-light leading-relaxed text-neptura-light-muted">
          Our team is available to assist you with any questions about your stones.
        </p>
      </div>

      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="account-link-action shrink-0 text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora underline decoration-neptura-aurora/40 underline-offset-4 transition-colors hover:text-neptura-light-text"
      >
        Contact us →
      </a>
    </aside>
  );
}
