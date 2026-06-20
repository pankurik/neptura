import Link from "next/link";
import { redirect } from "next/navigation";
import AccountWishlistGrid from "@/components/account/AccountWishlistGrid";
import { getCustomerSession } from "@/lib/customer-auth/require-session";
import { getProductsByHandles } from "@/lib/queries";

export const metadata = {
  title: "Wishlist | Neptura",
  description: "Your saved Neptura pieces.",
};

export default async function AccountWishlistPage() {
  const customer = await getCustomerSession();

  if (!customer) {
    redirect("/login?returnTo=/account/wishlist");
  }

  const products = customer.wishlistHandles.length
    ? await getProductsByHandles(customer.wishlistHandles)
    : [];

  return (
    <div className="min-h-screen bg-neptura-light-bg px-6 pb-14 pt-28 md:px-10 lg:px-14">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-neptura-light pb-8">
          <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
            Saved pieces
          </p>
          <h1 className="mt-2 font-display text-3xl font-light text-neptura-light-text">
            My Wishlist
          </h1>
          <p className="mt-2 text-[0.8rem] font-light text-neptura-light-muted">
            {products.length} {products.length === 1 ? "piece" : "pieces"} saved
          </p>
        </header>

        <div className="mt-8">
          {products.length > 0 ? (
            <AccountWishlistGrid products={products} />
          ) : (
            <div className="border border-dashed border-neptura-light bg-neptura-light-surface/50 px-6 py-10 text-center">
              <p className="font-display text-lg font-light text-neptura-light-text">
                Nothing saved yet
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-block text-[0.72rem] uppercase tracking-[0.14em] text-neptura-aurora transition-colors hover:text-neptura-light-text"
              >
                Browse the collection →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
