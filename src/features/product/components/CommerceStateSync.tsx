"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import { replaceCart } from "@/features/product/store/cartSlice";
import { replaceWishlist } from "@/features/product/store/wishlistSlice";
import { useCart, useUpdateCart } from "@/services/cart";
import { useWishlist } from "@/services/wishlist";

export default function CommerceStateSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cartItems = useAppSelector((state) => state.cart.items);

  const cartQuery = useCart(isAuthenticated);
  const wishlistQuery = useWishlist(isAuthenticated);
  const updateCart = useUpdateCart();

  // Track hydration and last synchronized payload to avoid infinite sync loops
  const hasHydratedCartRef = useRef(false);
  const hasHydratedWishlistRef = useRef(false);
  const lastSyncedCartJsonRef = useRef<string>("");

  // Reset hydration refs on logout/login state change
  useEffect(() => {
    if (!isAuthenticated) {
      hasHydratedCartRef.current = false;
      hasHydratedWishlistRef.current = false;
      lastSyncedCartJsonRef.current = "";
    }
  }, [isAuthenticated]);

  // 1. Hydrate Cart from Server (Only once per session / auth change)
  useEffect(() => {
    if (isAuthenticated && cartQuery.data?.items && !hasHydratedCartRef.current) {
      hasHydratedCartRef.current = true;
      lastSyncedCartJsonRef.current = JSON.stringify(cartQuery.data.items);
      dispatch(replaceCart(cartQuery.data.items));
    }
  }, [isAuthenticated, cartQuery.data, dispatch]);

  // 2. Hydrate Wishlist from Server (Only once per session / auth change)
  useEffect(() => {
    if (isAuthenticated && wishlistQuery.data && !hasHydratedWishlistRef.current) {
      hasHydratedWishlistRef.current = true;
      dispatch(replaceWishlist(wishlistQuery.data));
    }
  }, [isAuthenticated, wishlistQuery.data, dispatch]);

  // 3. Sync Cart Changes to Server (Only when user explicitly modifies cart in UI)
  useEffect(() => {
    if (!isAuthenticated || !hasHydratedCartRef.current) return;

    const currentJson = JSON.stringify(cartItems);
    if (currentJson !== lastSyncedCartJsonRef.current) {
      lastSyncedCartJsonRef.current = currentJson;
      updateCart.mutate(cartItems);
    }
  }, [cartItems, isAuthenticated, updateCart]);

  return null;
}
