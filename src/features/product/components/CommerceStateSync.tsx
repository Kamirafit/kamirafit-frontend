"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import { replaceCart, type CartItem } from "@/features/product/store/cartSlice";
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

  // Track hydration lifecycle explicitly to prevent race conditions
  const hasHydratedCartRef = useRef(false);
  const hasHydratedWishlistRef = useRef(false);
  const isHydratingCartRef = useRef(false);
  const lastSyncedCartJsonRef = useRef<string>("");
  const localCartBeforeAuthRef = useRef<CartItem[]>([]);

  // Keep a ref to the current cartItems so effects can read it without adding to dependencies
  const cartItemsRef = useRef(cartItems);
  cartItemsRef.current = cartItems;

  // Capture guest cart state when unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localCartBeforeAuthRef.current = cartItems;
      hasHydratedCartRef.current = false;
      hasHydratedWishlistRef.current = false;
      isHydratingCartRef.current = false;
      lastSyncedCartJsonRef.current = "";
    }
  }, [isAuthenticated, cartItems]);

  // 1. Explicit Cart Hydration & Deterministic Merge
  // Lifecycle: AUTH_CHANGED -> FETCH_SERVER_CART -> MERGE / RESOLVE -> SET CART -> MARK HYDRATED -> ENABLE SYNC
  useEffect(() => {
    if (!isAuthenticated || hasHydratedCartRef.current || isHydratingCartRef.current) {
      return;
    }

    if (!cartQuery.isSuccess) {
      return;
    }

    isHydratingCartRef.current = true;
    const serverItems: Array<Partial<CartItem> & { title?: string; images?: string[] }> = cartQuery.data?.items || [];
    const localItems = localCartBeforeAuthRef.current.length > 0
      ? localCartBeforeAuthRef.current
      : cartItemsRef.current;

    // Deterministic Cart Merge Strategy:
    // 1. Initialize map with server items
    // 2. Merge local guest items: matching variant items sum quantities (clamped to max 20)
    // 3. New items from guest or server are preserved
    const mergedMap = new Map<string, CartItem>();

    for (const sItem of serverItems) {
      if (!sItem.id) continue;
      const key = `${sItem.id}::${sItem.size || ""}::${sItem.color || ""}`;
      mergedMap.set(key, {
        id: sItem.id,
        size: sItem.size,
        color: sItem.color,
        quantity: Math.max(1, Math.min(20, Number(sItem.quantity) || 1)),
      });
    }

    let hasLocalMergeAdditions = false;
    for (const lItem of localItems) {
      if (!lItem.id) continue;
      const key = `${lItem.id}::${lItem.size || ""}::${lItem.color || ""}`;
      const existing = mergedMap.get(key);
      if (existing) {
        // Sum quantities, capped at 20 units per item
        existing.quantity = Math.min(20, existing.quantity + (lItem.quantity || 1));
        hasLocalMergeAdditions = true;
      } else {
        mergedMap.set(key, {
          id: lItem.id,
          size: lItem.size,
          color: lItem.color,
          quantity: Math.max(1, Math.min(20, Number(lItem.quantity) || 1)),
        });
        hasLocalMergeAdditions = true;
      }
    }

    const finalMergedItems = Array.from(mergedMap.values());
    const finalMergedJson = JSON.stringify(finalMergedItems);

    lastSyncedCartJsonRef.current = finalMergedJson;
    dispatch(replaceCart(finalMergedItems));
    hasHydratedCartRef.current = true;
    isHydratingCartRef.current = false;

    // If the guest session contributed items, sync the resolved cart back to the server once
    if (hasLocalMergeAdditions && localItems.length > 0) {
      updateCart.mutate(finalMergedItems);
    }
  }, [isAuthenticated, cartQuery.isSuccess, cartQuery.data, dispatch, updateCart]);

  // 2. Hydrate Wishlist from Server
  useEffect(() => {
    if (isAuthenticated && wishlistQuery.data && !hasHydratedWishlistRef.current) {
      hasHydratedWishlistRef.current = true;
      dispatch(replaceWishlist(wishlistQuery.data));
    }
  }, [isAuthenticated, wishlistQuery.data, dispatch]);

  // 3. Automatic Synchronization (Only active AFTER cart is completely hydrated)
  useEffect(() => {
    if (!isAuthenticated || !hasHydratedCartRef.current || isHydratingCartRef.current) {
      return;
    }

    const currentJson = JSON.stringify(cartItems);
    if (currentJson !== lastSyncedCartJsonRef.current) {
      lastSyncedCartJsonRef.current = currentJson;
      updateCart.mutate(cartItems);
    }
  }, [cartItems, isAuthenticated, updateCart]);

  return null;
}
