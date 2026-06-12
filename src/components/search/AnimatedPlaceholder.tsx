"use client";

import { useEffect, useState } from "react";

type Props = {
  prefix?: string;
  words: string[];
  className?: string;
};

/**
 * Animated placeholder. One word at a time — enters from below, holds,
 * exits up. Cycles infinitely. Uses a keyframe defined in globals.css
 * (`spotlight-word`) with duration 2.5s = 500ms in + 1500ms hold + 500ms out.
 */
export default function AnimatedPlaceholder({
  prefix = "Search for ",
  words,
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length === 0) return;
    const id = setInterval(() => {
      setIndex((v) => (v + 1) % words.length);
    }, 2500);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span
      className={`pointer-events-none flex select-none items-baseline whitespace-pre text-paper-muted ${className}`}
      aria-hidden
    >
      <span>{prefix}</span>
      <span className="relative inline-block h-[1.2em] overflow-hidden align-baseline">
        <span
          key={index}
          className="block text-paper [animation:spotlight-word_2500ms_ease-in-out_both]"
        >
          {words[index]}
        </span>
      </span>
    </span>
  );
}
