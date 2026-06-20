import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop | Neptura",
  description: "Browse our collection of fine jewellery.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-3xl font-light text-neptura-navy md:text-4xl">
          Shop
        </h1>
        <p className="mt-3 text-neptura-navy/50">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-neptura-navy/50">
          No products found. Check your Shopify store configuration.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
