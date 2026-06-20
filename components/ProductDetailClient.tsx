"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shopify";
import type { Product, ProductVariant, SelectedOptions } from "@/lib/types";

interface ProductDetailClientProps {
  product: Product;
}

function findVariant(
  variants: ProductVariant[],
  selectedOptions: SelectedOptions
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

  // Initialize selected options to the first value of each option
  const initialOptions = useMemo(() => {
    const options: SelectedOptions = {};
    product.options.forEach((option) => {
      options[option.name] = option.values[0];
    });
    return options;
  }, [product.options]);

  const [selectedOptions, setSelectedOptions] =
    useState<SelectedOptions>(initialOptions);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const selectedVariant = useMemo(
    () => findVariant(product.variants, selectedOptions),
    [product.variants, selectedOptions]
  );

  // Sync active image index when selected variant changes
  useEffect(() => {
    if (selectedVariant?.image) {
      const idx = product.images.findIndex((img) => img.url === selectedVariant.image?.url);
      if (idx !== -1) {
        setActiveImageIndex(idx);
      }
    }
  }, [selectedVariant, product.images]);

  // Fallback to featured image if images array is empty
  const displayImage = product.images[activeImageIndex] || product.featuredImage;

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

  // Specifications based on product properties
  const specs = useMemo(() => {
    const isRareSunlight = product.handle.includes("rare-sunlight");
    return [
      { key: "Carat", value: isRareSunlight ? "2.40 CT" : "1.00 CT" },
      { key: "Cut", value: isRareSunlight ? "Emerald Cut" : "Round Brilliant" },
      { key: "Colour", value: isRareSunlight ? "Fancy Vivid Yellow" : "D Colourless" },
      { key: "Origin", value: "Cosmic Lab (8M Atmospheres)" },
      { key: "Certified by", value: "IGI Certificate" },
    ];
  }, [product.handle]);

  return (
    <div className="bg-neptura-light-bg text-neptura-light-text min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Vertical Thumbnails + Main Image */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 items-start">
          {/* Vertical Thumbnail Strip (Scrolls horizontally on mobile, vertically on desktop) */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible w-full sm:w-[60px] flex-shrink-0 pt-2 sm:pt-0 scrollbar-none">
              {product.images.map((image, index) => {
                const isActive = activeImageIndex === index;
                return (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-[60px] w-[60px] flex-shrink-0 bg-neptura-light-surface border transition-colors duration-300 ${
                      isActive ? "border-neptura-aurora" : "border-neptura-light hover:border-neptura-aurora/40"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText ?? `${product.title} view ${index + 1}`}
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Active Image (3:4 Aspect Ratio) */}
          <div className="relative aspect-product w-full bg-neptura-light-surface border border-neptura-light overflow-hidden">
            {displayImage ? (
              <Image
                src={displayImage.url}
                alt={displayImage.altText ?? product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-all duration-500 ease-out-expo"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-neptura-light-muted">
                No image available
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Title, Price, Description, Variant Selector, Add to Bag, Specs */}
        <div className="flex flex-col justify-start space-y-8 lg:pl-4">
          <div className="space-y-4">
            <span className="section-label">The collection</span>
            <h1 className="font-display text-3xl font-light text-neptura-light-text leading-[1.2]">
              {product.title}
            </h1>
            
            {/* Price (1.6rem Cormorant Garamond) */}
            {selectedVariant && (
              <p className="font-display text-price text-neptura-light-text pt-2 border-t border-neptura-light/60">
                {formatPrice(
                  selectedVariant.price.amount,
                  selectedVariant.price.currencyCode
                )}
              </p>
            )}
          </div>

          {/* Poetic Description */}
          {product.description && (
            <p className="text-[0.82rem] font-light leading-[1.9] text-neptura-light-muted italic max-w-lg">
              {product.description}
            </p>
          )}

          {/* Options / Variant Selectors */}
          {product.options.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-neptura-light/50">
              {product.options.map((option) => (
                <div key={option.name} className="space-y-3">
                  <label className="block text-[0.68rem] uppercase tracking-[0.2em] text-neptura-light-muted font-medium">
                    {option.name === "Jewelry material" ? "Select Metal" : option.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`px-4 py-2 text-[0.72rem] tracking-wider transition-colors duration-300 border ${
                            isSelected
                              ? "border-neptura-aurora text-neptura-aurora bg-neptura-light-bg"
                              : "border-neptura-light text-neptura-light-text bg-neptura-light-bg hover:border-neptura-aurora/40"
                          }`}
                          style={{ borderWidth: "0.5px" }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Bag Button (Full Width, Primary Light style) */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={
                adding ||
                isLoading ||
                !selectedVariant ||
                !selectedVariant.availableForSale
              }
              className="w-full bg-neptura-light-text py-4 text-xs uppercase tracking-[0.25em] text-neptura-light-bg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 select-none"
            >
              {selectedVariant && !selectedVariant.availableForSale
                ? "Out of Stock"
                : adding
                  ? "Adding..."
                  : "Add to Bag"}
            </button>

            {message && (
              <p
                className={`mt-4 text-xs tracking-wider uppercase ${
                  message === "Added to bag!"
                    ? "text-neptura-aurora"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </div>

          {/* Specifications Table (0.5px border bottom, key in light-muted, value in light-text) */}
          <div className="border-t border-neptura-light pt-8 mt-12">
            <h3 className="text-[0.68rem] uppercase tracking-[0.2em] text-neptura-light-muted font-medium mb-4">
              Specifications
            </h3>
            <dl className="divide-y divide-neptura-light border-y border-neptura-light text-[0.74rem]">
              {specs.map((spec) => (
                <div key={spec.key} className="flex justify-between py-3.5">
                  <dt className="font-sans text-neptura-light-muted font-light">{spec.key}</dt>
                  <dd className="font-sans text-neptura-light-text font-light">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          
        </div>
      </div>
    </div>
  );
}
