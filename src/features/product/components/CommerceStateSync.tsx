"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (cartQuery.data?.items) {
      dispatch(replaceCart(cartQuery.data.items));
    }
  }, [cartQuery.data, dispatch]);

  useEffect(() => {
    if (wishlistQuery.data) dispatch(replaceWishlist(wishlistQuery.data));
  }, [wishlistQuery.data, dispatch]);

  useEffect(() => {
    if (isAuthenticated && cartQuery.isFetched) updateCart.mutate(cartItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, isAuthenticated, cartQuery.isFetched]);

  useEffect(() => {
    if (isAuthenticated && wishlistQuery.isFetched) updateWishlist.mutate(wishlistIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistIds, isAuthenticated, wishlistQuery.isFetched]);

  return null;
}
