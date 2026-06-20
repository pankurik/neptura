export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neptura-rose">
        Welcome to
      </p>
      <h1 className="mb-6 font-serif text-5xl font-light text-neptura-navy md:text-7xl">
        Neptura
      </h1>
      <p className="mb-10 max-w-md text-neptura-navy/70">
        Fine jewellery inspired by the sea. Explore our collection of
        thoughtfully crafted pieces.
      </p>
      <a
        href="/shop"
        className="bg-neptura-navy px-8 py-3 text-xs uppercase tracking-[0.25em] text-neptura-pearl transition hover:bg-neptura-rose"
      >
        Shop Collection
      </a>
    </div>
  );
}
