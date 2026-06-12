"use client";

import { useCallback } from "react";

export interface AnalyticsEvent {
  eventName: string;
  params?: Record<string, unknown>;
}

export function useAnalytics() {
  const trackEvent = useCallback(({ eventName, params = {} }: AnalyticsEvent) => {
    // In production, dispatch events to GA4 (window.gtag) or Meta Pixel (window.fbq):
    // if (typeof window !== "undefined" && (window as any).gtag) {
    //   (window as any).gtag("event", eventName, params);
    // }
    // if (typeof window !== "undefined" && (window as any).fbq) {
    //   (window as any).fbq("track", eventName, params);
    // }
    console.log(`[Analytics Event] Name: ${eventName}`, params);
  }, []);

  const trackPageView = useCallback((url: string) => {
    trackEvent({
      eventName: "page_view",
      params: { page_path: url },
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((item: { id: string; name: string; price: number; quantity: number }) => {
    trackEvent({
      eventName: "add_to_cart",
      params: {
        value: item.price * item.quantity,
        currency: "INR",
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
          },
        ],
      },
    });
  }, [trackEvent]);

  const trackInitiateCheckout = useCallback((cartItems: Array<{ id: string; name: string; price: number; quantity: number }>) => {
    const totalValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    trackEvent({
      eventName: "begin_checkout",
      params: {
        value: totalValue,
        currency: "INR",
        items: cartItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  }, [trackEvent]);

  const trackPurchase = useCallback((orderId: string, totalAmount: number, items: Array<{ productId: string; productName: string; price: number; quantity: number }>) => {
    trackEvent({
      eventName: "purchase",
      params: {
        transaction_id: orderId,
        value: totalAmount,
        currency: "INR",
        items: items.map((item) => ({
          item_id: item.productId,
          item_name: item.productName,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
  };
}
