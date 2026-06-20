"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Cart, CartContextValue } from "@/lib/types";

const CART_ID_KEY = "neptura-cart-id";

const CartContext = createContext<CartContextValue | null>(null);

async function cartRequest(
  body: Record<string, unknown>
): Promise<Cart | null> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Cart request failed");
  }

  return response.json();
}

async function fetchCart(cartId: string): Promise<Cart | null> {
  const response = await fetch(
    `/api/cart?cartId=${encodeURIComponent(cartId)}`
  );
  if (!response.ok) return null;
  return response.json();
}

function persistCart(cart: Cart | null) {
  if (cart?.id) {
    localStorage.setItem(CART_ID_KEY, cart.id);
  } else {
    localStorage.removeItem(CART_ID_KEY);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initCart() {
      try {
        const storedCartId = localStorage.getItem(CART_ID_KEY);

        if (storedCartId) {
          const existingCart = await fetchCart(storedCartId);
          if (existingCart) {
            setCart(existingCart);
            return;
          }
          localStorage.removeItem(CART_ID_KEY);
        }

        const newCart = await cartRequest({ action: "create", lines: [] });
        if (newCart) {
          setCart(newCart);
          persistCart(newCart);
        }
      } finally {
        setIsLoading(false);
      }
    }

    initCart();
  }, []);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setIsLoading(true);
      try {
        const lines = [{ merchandiseId: variantId, quantity }];
        let updatedCart: Cart | null;

        if (cart?.id) {
          updatedCart = await cartRequest({ action: "add", cartId: cart.id, lines });
        } else {
          updatedCart = await cartRequest({ action: "create", lines });
        }

        if (updatedCart) {
          setCart(updatedCart);
          persistCart(updatedCart);
          openCart();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart?.id, openCart]
  );

  const updateLineQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;

      setIsLoading(true);
      try {
        if (quantity <= 0) {
          const updatedCart = await cartRequest({
            action: "remove",
            cartId: cart.id,
            lineIds: [lineId],
          });
          if (updatedCart) {
            setCart(updatedCart);
            persistCart(updatedCart);
          }
          return;
        }

        const updatedCart = await cartRequest({
          action: "update",
          cartId: cart.id,
          lines: [{ id: lineId, quantity }],
        });

        if (updatedCart) {
          setCart(updatedCart);
          persistCart(updatedCart);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart?.id]
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;

      setIsLoading(true);
      try {
        const updatedCart = await cartRequest({
          action: "remove",
          cartId: cart.id,
          lineIds: [lineId],
        });

        if (updatedCart) {
          setCart(updatedCart);
          persistCart(updatedCart);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart?.id]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      cartOpen,
      isLoading,
      checkoutUrl: cart?.checkoutUrl ?? null,
      addToCart,
      updateLineQuantity,
      removeFromCart,
      openCart,
      closeCart,
    }),
    [
      cart,
      cartOpen,
      isLoading,
      addToCart,
      updateLineQuantity,
      removeFromCart,
      openCart,
      closeCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
