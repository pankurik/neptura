import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/shopify";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { amount, currencyCode } = product.priceRange.minVariantPrice;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden border border-neptura-light bg-neptura-light-bg transition-[border-color,opacity] duration-300 hover:border-neptura-aurora/30"
    >
      {/* Aspect Ratio 3:4 Image Container */}
      <div className="relative aspect-product overflow-hidden bg-neptura-light-surface select-none">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-700 ease-out-expo group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neptura-light-muted">
            No image
          </div>
        )}

        {/* Hover overlay with Quick view label in crystal text */}
        <div className="absolute inset-0 bg-neptura-neptune/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="font-sans text-button font-medium uppercase tracking-[0.16em] text-neptura-crystal px-4 py-2 border border-neptura-crystal/20 bg-neptura-neptune/60 backdrop-blur-sm">
            Quick view
          </span>
        </div>
      </div>

      {/* Details (Light World) */}
      <div className="flex flex-1 flex-col p-5 border-t border-neptura-light bg-neptura-light-bg">
        <h3 className="font-display text-product font-light text-neptura-light-text line-clamp-1">
          {product.title}
        </h3>
        
        {/* Meta Row: Muted product type and Aurora price */}
        <div className="mt-4 pt-2 border-t border-neptura-light/50 flex items-baseline justify-between">
          <span className="font-sans text-meta text-neptura-light-muted">
            {product.description ? "Cosmic Cut" : "Lab-Grown"}
          </span>
          <span className="font-display text-base font-light text-neptura-aurora">
            {formatPrice(amount, currencyCode)}
          </span>
        </div>
      </div>
    </Link>
  );
}
