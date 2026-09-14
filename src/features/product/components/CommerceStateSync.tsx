"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import {
  replaceCart,
  loadCartFromStorage,
  persistCartToStorage,
  type CartItem,
} from "@/features/product/store/cartSlice";
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

  // Hydrate Redux cart from localStorage on mount if unauthenticated and Redux is empty
  useEffect(() => {
    if (!isAuthenticated) {
      const saved = loadCartFromStorage();
      if (saved.length > 0 && cartItemsRef.current.length === 0) {
        dispatch(replaceCart(saved));
      }
    }
  }, [dispatch, isAuthenticated]);

  // Keep localStorage updated with Redux cart
  useEffect(() => {
    persistCartToStorage(cartItems);
  }, [cartItems]);

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

  // 1. Explicit Cart Hydration from Backend API Response
  useEffect(() => {
    if (!isAuthenticated || hasHydratedCartRef.current || isHydratingCartRef.current) {
      return;
    }

    if (!cartQuery.isSuccess) {
      return;
    }

    isHydratingCartRef.current = true;
    const rawServerItems: Array<Partial<CartItem> & { title?: string; images?: string[] }> =
      cartQuery.data?.items || [];

    // Standardize server items directly from backend API response
    const resolvedServerItems: CartItem[] = rawServerItems
      .filter((sItem) => Boolean(sItem.id))
      .map((sItem) => ({
        id: sItem.id as string,
        variantId: sItem.variantId,
        size: sItem.size,
        color: sItem.color,
        quantity: Math.max(1, Math.min(100, Number(sItem.quantity) || 1)),
      }));

    // If server has items, backend API response is the single source of truth:
    if (resolvedServerItems.length > 0) {
      const json = JSON.stringify(resolvedServerItems);
      lastSyncedCartJsonRef.current = json;
      dispatch(replaceCart(resolvedServerItems));
      persistCartToStorage(resolvedServerItems);
      localCartBeforeAuthRef.current = [];
      hasHydratedCartRef.current = true;
      isHydratingCartRef.current = false;
      return;
    }

    // If server cart is empty, but user just logged in with a guest cart:
    const guestItems = localCartBeforeAuthRef.current.length > 0 ? localCartBeforeAuthRef.current : [];
    if (guestItems.length > 0) {
      const json = JSON.stringify(guestItems);
      lastSyncedCartJsonRef.current = json;
      dispatch(replaceCart(guestItems));
      persistCartToStorage(guestItems);
      updateCart.mutate(guestItems);
      localCartBeforeAuthRef.current = [];
    } else {
      lastSyncedCartJsonRef.current = JSON.stringify([]);
      dispatch(replaceCart([]));
      persistCartToStorage([]);
    }

    hasHydratedCartRef.current = true;
    isHydratingCartRef.current = false;
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
