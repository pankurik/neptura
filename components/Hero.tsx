"use client";

import Link from "next/link";
import { useState } from "react";
import HeroTagline from "@/components/HeroTagline";
import HeroScrollCue from "@/components/HeroScrollCue";

export default function Hero() {
  const [showCtas, setShowCtas] = useState(false);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-16 text-center">
      <video
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* Top vignette — subtle legibility only when nav is transparent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[22vh] max-h-52"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0, 0, 8, 0.35) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Bottom edge — hints at content below the fold */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[28vh] min-h-[10rem]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 8, 0.35) 45%, rgba(0, 0, 8, 0.92) 100%)",
        }}
        aria-hidden
      />

      {/* Bottom vignette — legibility for hero copy over video */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55vh]"
        style={{
          background:
            "linear-gradient(to top, rgba(0, 0, 8, 0.78) 0%, rgba(0, 0, 8, 0.42) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Copy */}
      <div className="relative z-[10] flex max-w-3xl flex-col items-center mt-12">
        <h1
          className="hero-title opacity-0 animate-neptura-fade-up font-display text-hero font-light text-neptura-diamond motion-reduce:animate-none motion-reduce:opacity-100"
          style={{ animationDelay: "1.8s" }}
        >
          Rarer than
          <br />
          <span className="italic text-neptura-ice">you know</span>
        </h1>

        <HeroTagline onComplete={() => setShowCtas(true)} />

        <div
          className={`mt-14 flex flex-col items-center gap-4 sm:flex-row motion-reduce:opacity-100 ${
            showCtas
              ? "animate-neptura-fade-up opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <Link href="/shop" className="btn-dark-primary">
            Explore the collection
          </Link>
          <Link href="/#origin" className="btn-dark-ghost">
            Our origin story
          </Link>
        </div>
      </div>

      <HeroScrollCue visible={showCtas} />
    </section>
  );
}
