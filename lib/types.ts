export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  url: string;
  altText: string | null;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface SelectedOptions {
  [optionName: string]: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  image: Image | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: Image | null;
  images: Image[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: Image | null;
}

export interface CartLineMerchandise {
  id: string;
  title: string;
  product: { title: string; handle: string };
  price: Money;
  image: Image | null;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
}

export interface CartCost {
  subtotalAmount: Money;
  totalAmount: Money;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: CartCost | null;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface CartContextValue {
  cart: Cart | null;
  cartOpen: boolean;
  isLoading: boolean;
  checkoutUrl: string | null;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  addLinesToCart: (lines: { merchandiseId: string; quantity: number }[]) => Promise<void>;
  updateLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
}
