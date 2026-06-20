"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shopify";
import type { ProductDetail, ProductVariant } from "@/lib/queries";

interface ProductDetailClientProps {
  product: ProductDetail;
}

function findVariant(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>
): ProductVariant | undefined {
  return variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => selectedOptions[option.name] === option.value
    )
  );
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const { addToCart, isLoading } = useCart();
  const variants = product.variants.edges.map((edge) => edge.node);

  const initialOptions = useMemo(() => {
    const options: Record<string, string> = {};
    product.options.forEach((option) => {
      options[option.name] = option.values[0];
    });
    return options;
  }, [product.options]);

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string>>(initialOptions);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => findVariant(variants, selectedOptions),
    [variants, selectedOptions]
  );

  const displayImage =
    selectedVariant?.image ??
    product.featuredImage ??
    product.images.edges[0]?.node;

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleAddToBag = async () => {
    if (!selectedVariant) return;

    if (!selectedVariant.availableForSale) {
      setMessage("This variant is currently sold out.");
      return;
    }

    setAdding(true);
    setMessage(null);

    try {
      await addToCart(selectedVariant.id, 1);
      setMessage("Added to bag!");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to add to bag."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm">
        {displayImage ? (
          <Image
            src={displayImage.url}
            alt={displayImage.altText ?? product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neptura-ocean/30">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center">
        <h1 className="text-3xl font-light tracking-tight text-neptura-navy md:text-4xl">
          {product.title}
        </h1>

        {selectedVariant && (
          <p className="mt-4 text-xl text-neptura-ocean">
            {formatPrice(
              selectedVariant.price.amount,
              selectedVariant.price.currencyCode
            )}
          </p>
        )}

        {product.description && (
          <p className="mt-6 leading-relaxed text-neptura-ocean/80">
            {product.description}
          </p>
        )}

        <div className="mt-8 space-y-6">
          {product.options.map((option) => (
            <div key={option.name}>
              <label className="mb-2 block text-xs uppercase tracking-widest text-neptura-ocean">
                {option.name}
              </label>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleOptionChange(option.name, value)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        isSelected
                          ? "border-neptura-navy bg-neptura-navy text-white"
                          : "border-neptura-ocean/20 bg-white text-neptura-navy hover:border-neptura-ocean/40"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddToBag}
          disabled={
            adding ||
            isLoading ||
            !selectedVariant ||
            !selectedVariant.availableForSale
          }
          className="mt-10 w-full rounded-full bg-neptura-navy px-8 py-4 text-sm uppercase tracking-widest text-white transition hover:bg-neptura-ocean disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selectedVariant && !selectedVariant.availableForSale
            ? "Sold Out"
            : adding
              ? "Adding..."
              : "Add to Bag"}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message === "Added to bag!"
                ? "text-neptura-seafoam"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
