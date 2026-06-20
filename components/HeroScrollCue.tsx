function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      aria-hidden
      className="text-neptura-crystal"
    >
      <path
        d="M1 1L7 7L13 1"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HeroScrollCueProps = {
  visible: boolean;
};

export default function HeroScrollCue({ visible }: HeroScrollCueProps) {
  return (
    <a
      href="#origin"
      className={`hero-scroll-cue motion-reduce:opacity-100 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-label="Scroll to discover more"
    >
      <span className="hero-scroll-cue-line" aria-hidden />
      <ChevronDownIcon />
    </a>
  );
}
