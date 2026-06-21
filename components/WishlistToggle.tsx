"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOptionalNavigation } from "@/context/NavigationContext";

type WishlistToggleProps = {
  handle: string;
  initialSaved: boolean;
  className?: string;
};

export default function WishlistToggle({
  handle,
  initialSaved,
  className = "",
}: WishlistToggleProps) {
  const router = useRouter();
  const navigation = useOptionalNavigation();
  const [saved, setSaved] = useState(initialSaved);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setError(null);
    setIsUpdating(true);

    try {
      const response = await fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          action: saved ? "remove" : "add",
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (response.status === 401) {
        navigation?.startNavigation();
        router.push(`/login?returnTo=${encodeURIComponent(`/products/${handle}`)}`);
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "Could not update wishlist.");
        return;
      }

      setSaved(!saved);
      router.refresh();
    } catch {
      setError("Could not update wishlist.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isUpdating}
        className={`w-full border border-neptura-light py-4 text-xs uppercase tracking-[0.25em] text-neptura-light-text transition hover:border-neptura-aurora/40 hover:text-neptura-aurora disabled:cursor-not-allowed disabled:opacity-50 ${
          isUpdating ? "account-action-btn--loading" : ""
        }`}
      >
        {isUpdating ? "Saving…" : saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>

      {saved && (
        <Link
          href="/account/wishlist"
          className="mt-3 block text-center text-[0.68rem] uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora"
        >
          View wishlist
        </Link>
      )}

      {error && (
        <p className="mt-3 text-center text-xs uppercase tracking-wider text-red-500">{error}</p>
      )}
    </div>
  );
}
