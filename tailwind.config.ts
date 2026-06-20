import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neptura: {
          void: "var(--neptura-void)",
          deep: "var(--neptura-deep)",
          neptune: "var(--neptura-neptune)",
          aurora: "var(--neptura-aurora)",
          ice: "var(--neptura-ice)",
          silver: "var(--neptura-silver)",
          crystal: "var(--neptura-crystal)",
          diamond: "var(--neptura-diamond)",
          violet: "var(--neptura-violet)",
          "light-bg": "var(--neptura-light-bg)",
          "light-surface": "var(--neptura-light-surface)",
          "light-text": "var(--neptura-light-text)",
          "light-muted": "var(--neptura-light-muted)",
          "nav-bg": "var(--neptura-nav-bg)",
          /* @deprecated — migrate to new tokens */
          navy: "var(--neptura-light-text)",
          pearl: "var(--neptura-light-bg)",
          rose: "var(--neptura-aurora)",
        },
      },
      borderColor: {
        "neptura-light": "var(--neptura-light-border)",
        "neptura-nav": "var(--neptura-nav-border)",
        "neptura-ghost": "var(--neptura-btn-ghost-border)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      fontSize: {
        hero: ["var(--neptura-text-hero)", { lineHeight: "1.1" }],
        section: ["var(--neptura-text-section)", { lineHeight: "1.2" }],
        "pdp-title": ["var(--neptura-text-pdp-title)", { lineHeight: "1.2" }],
        price: ["var(--neptura-text-price)", { lineHeight: "1.2" }],
        product: ["var(--neptura-text-product)", { lineHeight: "1.3" }],
        nav: ["var(--neptura-text-nav)", { lineHeight: "1.4" }],
        button: ["var(--neptura-text-button)", { lineHeight: "1.4" }],
        meta: ["var(--neptura-text-meta)", { lineHeight: "1.4" }],
        label: ["var(--neptura-text-label)", { lineHeight: "1.4" }],
        detail: ["var(--neptura-text-detail)", { lineHeight: "1.5" }],
      },
      letterSpacing: {
        logo: "0.25em",
        brand: "0.1em",
        "brand-tight": "0.06em",
        nav: "0.14em",
        button: "0.16em",
        label: "0.24em",
      },
      aspectRatio: {
        product: "3 / 4",
      },
      transitionTimingFunction: {
        "out-expo": "var(--neptura-ease-out-expo)",
      },
      backdropBlur: {
        nav: "20px",
      },
      animation: {
        "neptura-twinkle": "neptura-twinkle 3s ease-in-out infinite",
        "neptura-diamond-enter":
          "neptura-diamond-enter var(--neptura-hero-duration) var(--neptura-ease-out-expo) forwards",
        "neptura-pulse-ring": "neptura-pulse-ring 4s ease-in-out infinite",
        "neptura-particle-drift":
          "neptura-particle-drift 4s ease-out infinite",
        "neptura-fade-up": "neptura-fade-up 1s ease-out both",
        "neptura-scroll-pulse": "neptura-scroll-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
