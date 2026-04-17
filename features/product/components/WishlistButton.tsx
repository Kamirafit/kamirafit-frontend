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
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 backdrop-blur transition-colors hover:border-neutral-400 hover:text-neutral-900 ${
        isSaved ? "text-red-500 hover:text-red-500" : ""
      } ${className}`}
    >
      <HeartIcon filled={isSaved} width={16} height={16} />
    </button>
  );
}
