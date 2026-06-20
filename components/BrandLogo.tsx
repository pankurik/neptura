type BrandLogoProps = {
  variant?: "expanded" | "compact" | "mobile";
  light?: boolean;
  adaptive?: boolean;
  className?: string;
};

export default function BrandLogo({
  variant = "expanded",
  light = false,
  adaptive = false,
  className = "",
}: BrandLogoProps) {
  const sizeClass =
    variant === "expanded"
      ? "brand-wordmark--expanded"
      : variant === "mobile"
        ? "brand-wordmark--mobile"
        : "brand-wordmark--compact";

  const toneClass = adaptive
    ? "brand-wordmark--adaptive"
    : light
      ? "text-neptura-light-text"
      : "nav-legible text-neptura-diamond";

  return (
    <span className={`brand-wordmark font-display ${sizeClass} ${toneClass} ${className}`}>
      Neptura
    </span>
  );
}
