"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Cart } from "@/lib/queries";

const CART_ID_KEY = "neptura-cart-id";

interface CartContextValue {
  cart: Cart | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

async function fetchCart(cartId: string): Promise<Cart | null> {
  const response = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`);
  if (!response.ok) return null;
  return response.json();
}

async function createCartRequest(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart | null> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", lines }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to create cart");
  }
  return response.json();
}

async function addLinesRequest(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart | null> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", cartId, lines }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to add to cart");
  }
  return response.json();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedCartId = localStorage.getItem(CART_ID_KEY);
    if (!storedCartId) {
      setIsLoading(false);
      return;
    }

    fetchCart(storedCartId)
      .then((existingCart) => {
        if (existingCart) {
          setCart(existingCart);
        } else {
          localStorage.removeItem(CART_ID_KEY);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setIsLoading(true);
      try {
        const lines = [{ merchandiseId: variantId, quantity }];
        let updatedCart: Cart | null;

        if (cart?.id) {
          updatedCart = await addLinesRequest(cart.id, lines);
        } else {
          updatedCart = await createCartRequest(lines);
        }

        if (updatedCart) {
          setCart(updatedCart);
          localStorage.setItem(CART_ID_KEY, updatedCart.id);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart?.id]
  );

  const value = useMemo(
    () => ({
      cart,
      checkoutUrl: cart?.checkoutUrl ?? null,
      isLoading,
      addToCart,
    }),
    [cart, isLoading, addToCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
