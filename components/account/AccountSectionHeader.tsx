type AccountSectionHeaderProps = {
  label: string;
  title: string;
  subtitle?: string;
  id?: string;
};

export default function AccountSectionHeader({
  label,
  title,
  subtitle,
  id,
}: AccountSectionHeaderProps) {
  return (
    <header id={id} className="scroll-mt-32">
      <p className="section-label">{label}</p>
      <h2 className="mt-3 font-display text-section font-light text-neptura-light-text">{title}</h2>
      {subtitle && (
        <p className="mt-2 max-w-xl text-[0.8rem] font-light leading-relaxed text-neptura-light-muted">
          {subtitle}
        </p>
      )}
    </header>
  );
}
