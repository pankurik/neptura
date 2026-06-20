import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/Navbar";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
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
        className={`${cormorant.variable} ${inter.variable} bg-neptura-pearl font-sans text-neptura-navy antialiased`}
      >
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="pt-16">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
