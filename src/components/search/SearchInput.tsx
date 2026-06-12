"use client";

import { forwardRef, type ChangeEvent, type KeyboardEvent } from "react";
import { SearchIcon } from "@/components/home/icons";
import AnimatedPlaceholder from "./AnimatedPlaceholder";

const PLACEHOLDER_WORDS = [
  "t-shirts",
  "oversized tees",
  "hoodies",
  "black t-shirt",
  "graphic prints",
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

const SearchInput = forwardRef<HTMLInputElement, Props>(function SearchInput(
  { value, onChange, onKeyDown },
  ref,
) {
  const showPlaceholder = value.length === 0;

  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-line bg-ink px-4 py-3.5 shadow-[0_24px_60px_-24px_rgba(74,14,26,0.25)] ring-1 ring-line/60 focus-within:border-gold/40 focus-within:ring-2 focus-within:ring-gold/20">
      <SearchIcon
        width={20}
        height={20}
        className="shrink-0 text-paper-muted"
      />

      <div className="relative flex-1">
        {showPlaceholder ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-base font-medium text-paper-muted sm:text-lg">
            <AnimatedPlaceholder words={PLACEHOLDER_WORDS} />
          </div>
        ) : null}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Search products"
          className="w-full bg-transparent text-base font-medium text-paper caret-gold outline-none sm:text-lg"
        />
      </div>

      <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-line bg-ink-2 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-paper-muted sm:inline-flex">
        Esc
      </kbd>
    </div>
  );
});

export default SearchInput;
