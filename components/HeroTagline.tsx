"use client";

import { useEffect, useRef, useState } from "react";

const SETUP_COPY = (
  <>
    On Neptune & Uranus, it rains diamonds.
    <br />
    We asked why.
    <br />
    Then we asked how.
  </>
);

const LAST_LINE_PREFIX = "Now we ask — ";
const TYPED_PHRASE = "would you like one?";

const START_DELAY_MS = 2800;
const TYPE_MS = 72;
const DELETE_MS = 38;
const HOLD_FULL_MS = 2200;
const HOLD_EMPTY_MS = 650;

type HeroTaglineProps = {
  onComplete?: () => void;
};

type LoopPhase = "typing" | "deleting";

export default function HeroTagline({ onComplete }: HeroTaglineProps) {
  const onCompleteRef = useRef(onComplete);
  const hasNotifiedRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [phase, setPhase] = useState<LoopPhase>("typing");
  const [looping, setLooping] = useState(false);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const startTimer = window.setTimeout(() => {
      setVisible(true);

      if (reducedMotion) {
        setTypedChars(TYPED_PHRASE.length);
        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          onCompleteRef.current?.();
        }
        return;
      }

      setLooping(true);
      setPhase("typing");
    }, START_DELAY_MS);

    return () => window.clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!looping) return;

    let timer: number;

    switch (phase) {
      case "typing":
        if (typedChars < TYPED_PHRASE.length) {
          timer = window.setTimeout(
            () => setTypedChars((value) => value + 1),
            TYPE_MS
          );
        } else {
          if (!hasNotifiedRef.current) {
            hasNotifiedRef.current = true;
            onCompleteRef.current?.();
          }
          timer = window.setTimeout(() => setPhase("deleting"), HOLD_FULL_MS);
        }
        break;

      case "deleting":
        if (typedChars > 0) {
          timer = window.setTimeout(
            () => setTypedChars((value) => value - 1),
            DELETE_MS
          );
        } else {
          timer = window.setTimeout(() => setPhase("typing"), HOLD_EMPTY_MS);
        }
        break;
    }

    return () => window.clearTimeout(timer);
  }, [looping, phase, typedChars]);

  const isFullPhrase = typedChars === TYPED_PHRASE.length;

  return (
    <div
      className={`hero-tagline mx-auto mt-8 max-w-xl transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-live="off"
    >
      <p className="hero-tagline-setup">{SETUP_COPY}</p>

      <p className="hero-tagline-punchline">
        {LAST_LINE_PREFIX}
        <span
          className={`hero-tagline-emphasis ${
            isFullPhrase ? "hero-tagline-emphasis--lit" : ""
          }`}
        >
          {TYPED_PHRASE.slice(0, typedChars)}
        </span>
        {looping ? (
          <span className="hero-tagline-cursor" aria-hidden>
            |
          </span>
        ) : null}
      </p>
    </div>
  );
}
