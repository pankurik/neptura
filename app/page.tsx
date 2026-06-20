import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-neptura-ocean">
        Welcome to
      </p>
      <h1 className="mb-6 text-5xl font-light tracking-tight text-neptura-navy md:text-7xl">
        Neptura
      </h1>
      <p className="mb-10 max-w-md text-lg text-neptura-ocean/80">
        Curated essentials inspired by the sea. Explore our collection of
        thoughtfully crafted products.
      </p>
      <Link
        href="/shop"
        className="rounded-full bg-neptura-navy px-8 py-3 text-sm uppercase tracking-widest text-white transition hover:bg-neptura-ocean"
      >
        Shop Collection
      </Link>
    </div>
  );
}
