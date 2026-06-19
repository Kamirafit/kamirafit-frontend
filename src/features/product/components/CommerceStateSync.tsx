"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/features/product/hooks/redux";
import { useUpdateCart } from "@/services/cart";
import { useUpdateWishlist } from "@/services/wishlist";

/** Keeps the legacy Redux UI cache mirrored through the service/mock API seam. */
export default function CommerceStateSync() {
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistIds = useAppSelector((state) => state.wishlist.ids);
  const updateCart = useUpdateCart();
  const updateWishlist = useUpdateWishlist();

  useEffect(() => {
    updateCart.mutate(cartItems);
    // Mutation instances are stable; state changes are the synchronization trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  useEffect(() => {
    updateWishlist.mutate(wishlistIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistIds]);

  return null;
}
