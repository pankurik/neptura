"use client";

import { useEffect, useState } from "react";

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  minOpacity: number;
  maxOpacity: number;
}

export default function StarField() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate star field properties only client-side to prevent hydration mismatch
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 50 : 100;
    
    const generatedStars = Array.from({ length: starCount }, (_, i) => {
      const size = 0.3 + Math.random() * 1.4; // 0.3px to 1.7px
      const minOpacity = 0.05 + Math.random() * 0.15; // lower bounds
      const maxOpacity = 0.4 + Math.random() * 0.4; // upper bounds (up to 0.8)
      const duration = 2 + Math.random() * 3; // 2s to 5s
      const delay = Math.random() * 5; // 0s to 5s
      
      return {
        id: i,
        top: Math.random() * 100, // percentage
        left: Math.random() * 100, // percentage
        size,
        duration,
        delay,
        minOpacity,
        maxOpacity,
      };
    });

    setStars(generatedStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-neptura-diamond animate-neptura-twinkle"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            ["--star-min" as string]: star.minOpacity,
            ["--star-max" as string]: star.maxOpacity,
          }}
        />
      ))}
    </div>
  );
}
