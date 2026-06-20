"use client";

import Link from "next/link";
import { useMemo } from "react";

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  duration: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: seededRandom(i * 7.3) * 360,
    distance: 48 + seededRandom(i * 8.1) * 96,
    size: 1 + seededRandom(i * 9.2) * 1.5,
    delay: seededRandom(i * 10.5) * 3,
    duration: 3.5 + seededRandom(i * 11.7) * 3.5,
  }));
}

function DiamondWireframe() {
  return (
    <svg
      viewBox="0 0 120 140"
      className="relative h-36 w-[7.5rem] animate-neptura-diamond-enter md:h-44 md:w-[9.25rem]"
      fill="none"
      aria-hidden
    >
      <polygon
        points="60,8 108,52 60,132 12,52"
        stroke="var(--neptura-ice)"
        strokeWidth="0.6"
        fill="rgba(168,197,218,0.05)"
      />
      <polygon
        points="60,8 84,30 108,52 60,52 12,52 36,30"
        stroke="var(--neptura-silver)"
        strokeWidth="0.4"
        fill="rgba(200,216,232,0.04)"
      />
      <line
        x1="60"
        y1="8"
        x2="60"
        y2="132"
        stroke="var(--neptura-silver)"
        strokeWidth="0.5"
        opacity="0.45"
      />
      <line
        x1="12"
        y1="52"
        x2="108"
        y2="52"
        stroke="var(--neptura-silver)"
        strokeWidth="0.5"
        opacity="0.45"
      />
      <line
        x1="36"
        y1="30"
        x2="84"
        y2="30"
        stroke="var(--neptura-ice)"
        strokeWidth="0.4"
        opacity="0.35"
      />
      <line
        x1="24"
        y1="52"
        x2="48"
        y2="92"
        stroke="var(--neptura-ice)"
        strokeWidth="0.4"
        opacity="0.35"
      />
      <line
        x1="96"
        y1="52"
        x2="72"
        y2="92"
        stroke="var(--neptura-ice)"
        strokeWidth="0.4"
        opacity="0.35"
      />
      <line
        x1="36"
        y1="30"
        x2="12"
        y2="52"
        stroke="var(--neptura-ice)"
        strokeWidth="0.4"
        opacity="0.3"
      />
      <line
        x1="84"
        y1="30"
        x2="108"
        y2="52"
        stroke="var(--neptura-ice)"
        strokeWidth="0.4"
        opacity="0.3"
      />
      <line
        x1="48"
        y1="92"
        x2="72"
        y2="92"
        stroke="var(--neptura-ice)"
        strokeWidth="0.4"
        opacity="0.3"
      />
      <circle
        cx="60"
        cy="70"
        r="2.5"
        stroke="var(--neptura-crystal)"
        strokeWidth="0.5"
        fill="rgba(232,244,248,0.12)"
      />
    </svg>
  );
}

export default function Hero() {
  const particles = useMemo(() => createParticles(16), []);

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

      {/* Diamond stage */}
      <div
        className="relative z-[10] mb-12 flex h-52 w-52 items-center justify-center md:mb-14 md:h-60 md:w-60"
        aria-hidden
      >
        {[0, 1, 2].map((ring) => (
          <span
            key={ring}
            className="absolute rounded-full border border-neptura-ice/25 animate-neptura-pulse-ring motion-reduce:animate-none"
            style={{
              width: `${9 + ring * 3.5}rem`,
              height: `${9 + ring * 3.5}rem`,
              borderWidth: "0.5px",
              animationDelay: `${ring * 0.7}s`,
            }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute rounded-full bg-neptura-silver/60 animate-neptura-particle-drift motion-reduce:animate-none"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                ["--particle-x" as string]: `${Math.cos((particle.angle * Math.PI) / 180) * particle.distance}px`,
                ["--particle-y" as string]: `${Math.sin((particle.angle * Math.PI) / 180) * particle.distance}px`,
              }}
            />
          ))}
        </div>

        <DiamondWireframe />
      </div>

      {/* Copy */}
      <div className="relative z-[10] flex max-w-3xl flex-col items-center">
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
