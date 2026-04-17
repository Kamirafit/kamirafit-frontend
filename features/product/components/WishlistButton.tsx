"use client";

import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { toggleWishlist } from "../store/wishlistSlice";
import { HeartIcon } from "./icons";

type Props = {
  productId: string;
  className?: string;
};

export default function WishlistButton({ productId, className = "" }: Props) {
  const dispatch = useAppDispatch();
  const isSaved = useAppSelector((s) => s.wishlist.ids.includes(productId));

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleWishlist(productId));
      }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all duration-200 hover:-translate-y-0.5 ${
        isSaved
          ? "border-gold bg-gold/15 text-gold shadow-[0_8px_20px_-10px_rgba(139,30,45,0.6)]"
          : "border-line bg-ink/75 text-paper-muted hover:border-gold hover:text-gold"
      } ${className}`}
    >
      <HeartIcon filled={isSaved} width={16} height={16} />
    </button>
  );
}
