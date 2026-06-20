type OrderGemPlaceholderProps = {
  className?: string;
};

export default function OrderGemPlaceholder({ className = "" }: OrderGemPlaceholderProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M16 4L26 12L16 28L6 12L16 4Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M6 12H26" stroke="currentColor" strokeWidth="1" />
      <path d="M16 4V28" stroke="currentColor" strokeWidth="1" />
      <path d="M11 12L16 4L21 12" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}
