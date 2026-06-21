import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { NavigationProvider } from "@/context/NavigationContext";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/Navbar";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Neptura",
  description: "Fine jewellery from the deep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${inter.variable} bg-neptura-light-bg font-sans text-neptura-light-text antialiased`}
      >
        <CartProvider>
          <Suspense fallback={null}>
            <NavigationProvider>
              <Navbar />
              <CartDrawer />
              <main aria-live="polite">{children}</main>
            </NavigationProvider>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
