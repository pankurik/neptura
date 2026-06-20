import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProduct } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: { handle: string };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.handle);
  if (!product) return { title: "Product Not Found | Neptura" };
  return {
    title: `${product.title} | Neptura`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.handle);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
