import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/shopify";
import type { ProductSummary } from "@/lib/queries";

interface ProductCardProps {
  product: ProductSummary;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { amount, currencyCode } = product.priceRange.minVariantPrice;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-neptura-sand">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neptura-ocean/30">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neptura-navy">
          {product.title}
        </h2>
        <p className="mt-auto pt-2 text-sm text-neptura-ocean">
          {formatPrice(amount, currencyCode)}
        </p>
      </div>
    </Link>
  );
}
