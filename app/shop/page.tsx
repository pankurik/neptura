import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import TransitionBand from "@/components/TransitionBand";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Collection | Neptura",
  description: "Browse our collection of cosmic lab-grown diamond jewellery.",
};

const CATEGORIES = [
  { label: "All Stones", value: "all" },
  { label: "Rings", value: "rings" },
  { label: "Necklaces", value: "necklaces" },
  { label: "Earrings", value: "earrings" },
];

interface ShopPageProps {
  searchParams: { type?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const allProducts = await getProducts();
  
  // 1. Filter out placeholder products
  let products = allProducts.filter(
    (product) =>
      !product.handle.startsWith("jewelry-example-product") &&
      !product.title.startsWith("Example product")
  );

  // 2. Filter by selected category
  const selectedType = searchParams.type || "all";
  if (selectedType !== "all") {
    products = products.filter((product) => {
      const title = product.title.toLowerCase();
      const handle = product.handle.toLowerCase();

      if (selectedType === "rings") {
        return title.includes("ring") || handle.includes("ring");
      }
      if (selectedType === "necklaces") {
        return title.includes("necklace") || title.includes("pendant") || handle.includes("necklace");
      }
      if (selectedType === "earrings") {
        return title.includes("earring") || title.includes("stud") || handle.includes("earring");
      }
      return false;
    });
  }

  return (
    <div className="bg-neptura-light-bg min-h-screen text-neptura-light-text flex flex-col pb-24">
      {/* Transition Band at the top (transitions from header/dark world to light world) */}
      <TransitionBand />

      <div className="mx-auto max-w-6xl w-full px-6 pt-12 flex-1 flex flex-col">
        {/* Title */}
        <div className="text-center space-y-3 mb-12">
          <span className="section-label">The collection</span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-neptura-light-text">
            Stones of the sky
          </h1>
          <p className="text-xs uppercase tracking-[0.14em] text-neptura-light-muted">
            {products.length} {products.length === 1 ? "piece" : "pieces"} available
          </p>
        </div>

        {/* Filters */}
        <nav 
          className="flex justify-center items-center gap-8 md:gap-12 border-b border-neptura-light pb-6 mb-12"
          aria-label="Collection categories"
        >
          {CATEGORIES.map((category) => {
            const isActive = selectedType === category.value;
            return (
              <Link
                key={category.value}
                href={category.value === "all" ? "/shop" : `/shop?type=${category.value}`}
                className={`text-[0.68rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 pb-2 relative ${
                  isActive
                    ? "text-neptura-aurora"
                    : "text-neptura-light-muted hover:text-neptura-light-text"
                }`}
              >
                {category.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-neptura-aurora" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
            <p className="text-sm text-neptura-light-muted font-light">
              No pieces currently in this category.
            </p>
            <Link href="/shop" className="text-xs uppercase tracking-wider text-neptura-aurora hover:underline">
              View all stones
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
