"use client";

import Link from "next/link";
import { useState } from "react";
import { useOptionalNavigation } from "@/context/NavigationContext";
import { cn } from "@/lib/utils";

type AccountSignOutLinkProps = {
  className?: string;
  label?: string;
  onNavigate?: () => void;
};

export default function AccountSignOutLink({
  className = "",
  label = "Sign out",
  onNavigate,
}: AccountSignOutLinkProps) {
  const navigation = useOptionalNavigation();
  const [signingOut, setSigningOut] = useState(false);

  function handleClick() {
    setSigningOut(true);
    navigation?.startNavigation();
    onNavigate?.();
  }

  return (
    <Link
      href="/api/auth/logout?returnTo=/login"
      className={cn(className, signingOut && "account-action-btn--loading")}
      onClick={handleClick}
      aria-busy={signingOut || undefined}
    >
      {signingOut ? "Signing out…" : label}
    </Link>
  );
}
