"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import { replaceCart } from "@/features/product/store/cartSlice";
import { replaceWishlist } from "@/features/product/store/wishlistSlice";
import { useCart, useUpdateCart } from "@/services/cart";
import { useWishlist, useUpdateWishlist } from "@/services/wishlist";

export default function CommerceStateSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistIds = useAppSelector((state) => state.wishlist.ids);

  const cartQuery = useCart(isAuthenticated);
  const wishlistQuery = useWishlist(isAuthenticated);
  const updateCart = useUpdateCart();
  const updateWishlist = useUpdateWishlist();

  // Track hydration and last synchronized payload to avoid infinite sync loops
  const hasHydratedCartRef = useRef(false);
  const hasHydratedWishlistRef = useRef(false);
  const lastSyncedCartJsonRef = useRef<string>("");
  const lastSyncedWishlistJsonRef = useRef<string>("");

  // Reset hydration refs on logout/login state change
  useEffect(() => {
    if (!isAuthenticated) {
      hasHydratedCartRef.current = false;
      hasHydratedWishlistRef.current = false;
      lastSyncedCartJsonRef.current = "";
      lastSyncedWishlistJsonRef.current = "";
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
      lastSyncedWishlistJsonRef.current = JSON.stringify(wishlistQuery.data);
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

  // 4. Sync Wishlist Changes to Server (Only when user explicitly modifies wishlist in UI)
  useEffect(() => {
    if (!isAuthenticated || !hasHydratedWishlistRef.current) return;

    const currentJson = JSON.stringify(wishlistIds);
    if (currentJson !== lastSyncedWishlistJsonRef.current) {
      lastSyncedWishlistJsonRef.current = currentJson;
      updateWishlist.mutate(wishlistIds);
    }
  }, [wishlistIds, isAuthenticated, updateWishlist]);

  return null;
}
