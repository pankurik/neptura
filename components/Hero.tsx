"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-16 text-center">
      <video
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Copy */}
      <div className="relative z-[10] flex max-w-3xl flex-col items-center mt-12">
        <p
          className="opacity-0 animate-neptura-fade-up text-label font-normal uppercase tracking-[0.28em] text-neptura-aurora motion-reduce:animate-none motion-reduce:opacity-100"
          style={{ animationDelay: "1.8s" }}
        >
          Neptune · Uranus · Earth
        </p>

        <h1
          className="opacity-0 animate-neptura-fade-up mt-6 font-display text-hero font-light text-neptura-diamond motion-reduce:animate-none motion-reduce:opacity-100"
          style={{ animationDelay: "2s" }}
        >
          Rarer than
          <br />
          <span className="font-normal italic text-neptura-ice">you know</span>
        </h1>

        <p
          className="opacity-0 animate-neptura-fade-up mx-auto mt-6 max-w-md text-[0.82rem] font-light leading-[1.9] text-neptura-silver/65 motion-reduce:animate-none motion-reduce:opacity-100"
          style={{ animationDelay: "2.2s" }}
        >
          Where diamonds fall like rain under eight million atmospheres — we
          recreate that cosmic pressure here on Earth.
        </p>

        <div
          className="opacity-0 animate-neptura-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row motion-reduce:animate-none motion-reduce:opacity-100"
          style={{ animationDelay: "2.4s" }}
        >
          <Link href="/shop" className="btn-dark-primary">
            Explore the collection
          </Link>
          <Link href="/#origin" className="btn-dark-ghost">
            Our origin story
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 z-[10] -translate-x-1/2 motion-reduce:hidden"
        aria-hidden
      >
        <span
          className="block h-14 w-px animate-neptura-scroll-pulse"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--neptura-ice))",
          }}
        />
      </div>
    </section>
  );
}
