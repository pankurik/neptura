import Link from "next/link";
import AccountSectionHeader from "@/components/account/AccountSectionHeader";
import AccountWishlistGrid, {
  WISHLIST_PREVIEW_LIMIT,
} from "@/components/account/AccountWishlistGrid";
import type { Product } from "@/lib/types";

type AccountWishlistSectionProps = {
  products: Product[];
  handleCount: number;
};

export default function AccountWishlistSection({
  products,
  handleCount,
}: AccountWishlistSectionProps) {
  const previewProducts = products.slice(0, WISHLIST_PREVIEW_LIMIT);
  const hasMoreWishlist = handleCount > WISHLIST_PREVIEW_LIMIT;

  return (
    <section aria-labelledby="account-wishlist-title">
      <AccountSectionHeader
        id="wishlist"
        label="Saved pieces"
        title="Wishlist"
        subtitle="Pieces you're considering for your collection."
      />

      {handleCount === 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:gap-6">
          <div className="flex min-h-[200px] flex-col items-center justify-center border border-dashed border-neptura-light bg-neptura-light-surface/50 p-8 text-center sm:col-span-2">
            <p className="font-display text-xl font-light text-neptura-light-text">
              Nothing saved yet
            </p>
            <p className="mt-2 max-w-sm text-[0.8rem] font-light leading-relaxed text-neptura-light-muted">
              When you save pieces from the collection, they&apos;ll appear here for easy reference.
            </p>
            <Link
              href="/shop"
              className="mt-5 text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
            >
              Browse the collection →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <AccountWishlistGrid products={previewProducts} />

          {hasMoreWishlist && (
            <Link
              href="/account/wishlist"
              className="mt-4 block w-full border border-neptura-light bg-neptura-light-bg py-3 text-center text-[0.68rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:border-neptura-aurora/35 hover:text-neptura-light-text"
            >
              Show all wishlist
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
