type BrandLogoProps = {
  variant?: "expanded" | "compact" | "mobile";
  light?: boolean;
  className?: string;
};

export default function BrandLogo({
  variant = "expanded",
  light = false,
  className = "",
}: BrandLogoProps) {
  const sizeClass =
    variant === "expanded"
      ? "brand-wordmark--expanded"
      : variant === "mobile"
        ? "brand-wordmark--mobile"
        : "brand-wordmark--compact";

  return (
    <span
      className={`brand-wordmark font-display ${sizeClass} ${
        light ? "text-neptura-light-text" : "nav-legible text-neptura-diamond"
      } ${className}`}
    >
      Neptura
    </span>
  );
}
