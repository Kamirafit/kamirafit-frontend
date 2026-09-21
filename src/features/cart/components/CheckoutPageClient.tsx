"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { calculateDeliveryCharge, calculateDeliveryDateRange } from "@/lib/delivery";
import { buttonClasses } from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import { clearCart } from "@/features/product/store/cartSlice";
import { calculateTotals, formatPrice, resolveCartItems } from "../utils";
import CheckoutOrderSummary from "./CheckoutOrderSummary";
import { useProducts } from "@/services/product";
import { useCheckout } from "@/services/checkout";
import { useAddresses, useCreateAddress, useUpdateAddress } from "@/services/address";
import AddressFormModal from "@/features/account/components/AddressFormModal";
import AddressSkeleton from "@/components/skeleton/AddressSkeleton";
import type { Address } from "@/features/account/types";
import { orderService, useVerifyPayment, type CouponValidationResult } from "@/services/order";
import { ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function mapCheckoutErrorMessage(err: unknown): string {
  if (!err) return "Unable to place the order. Please try again.";
  const anyErr = err as {
    code?: string;
    message?: string;
    response?: { data?: { code?: string; message?: string } };
  };
  const code = anyErr.code || anyErr.response?.data?.code || "";
  const msg = (anyErr.message || anyErr.response?.data?.message || "").toLowerCase();

  if (
    code === "OUT_OF_STOCK" ||
    msg.includes("stock") ||
    msg.includes("claimed by another customer") ||
    msg.includes("insufficient stock")
  ) {
    return "One or more items in your cart are no longer available in the requested quantity. Please review your cart.";
  }
  if (code === "PRICE_CHANGED" || msg.includes("price")) {
    return "Prices have updated for one or more items. Please review your order summary.";
  }
  if (code === "COUPON_INVALID" || msg.includes("coupon")) {
    return "The applied coupon is invalid, expired, or has already been used.";
  }
  if (code === "ORDER_EXPIRED" || msg.includes("expired")) {
    return "This order reservation window has expired. Please try placing your order again.";
  }
  if (
    code === "PAYMENT_INITIALIZATION_FAILED" ||
    msg.includes("gateway") ||
    msg.includes("razorpay")
  ) {
    return "Unable to initialize payment gateway. Please try again or select another payment method.";
  }
  if (
    code === "NETWORK_ERROR" ||
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("failed to fetch")
  ) {
    return "Network connection error. Please check your internet connection and try again.";
  }

  return anyErr.message || anyErr.response?.data?.message || "Unable to place the order. Please try again.";
}

export default function CheckoutPageClient() {
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const isOnline = useOnlineStatus();
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  const resolved = resolveCartItems(items, products);

  // Address queries and mutations
  const addressesQuery = useAddresses();
  const { data: addresses = [], isLoading: isAddressesLoading, isFetching: isAddressesFetching } = addressesQuery;
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const hasAutoOpenedModalRef = useRef(false);

  // Selected address object
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;
  const { subtotal, delivery } = calculateTotals(resolved, selectedAddress?.pincode, selectedAddress?.country);

  // Real-time delivery charge & date estimation based on selected address PIN and cart value
  const deliveryEstimation = useMemo(() => {
    if (!selectedAddress) return null;
    const pin = selectedAddress.pincode || "";
    const country = selectedAddress.country || "India";
    const charge = calculateDeliveryCharge(pin, country);
    const dateRange = calculateDeliveryDateRange(charge.estimatedDays);
    const isFree = subtotal > 999;
    return {
      ...charge,
      effectiveRate: isFree ? 0 : charge.rate,
      isFree,
      ...dateRange,
    };
  }, [selectedAddress, subtotal]);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Checkout submission state
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE");
  const [placedOrderTotal, setPlacedOrderTotal] = useState<number | null>(null);
  const [placedRecipientName, setPlacedRecipientName] = useState<string>("");
  const [placedPaymentMethod, setPlacedPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkoutMutation = useCheckout();
  const verifyPaymentMutation = useVerifyPayment();

  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );

  // Auto-select default or first address, or prompt modal if user has 0 addresses
  useEffect(() => {
    if (addresses.length > 0) {
      if (!selectedAddressId || !addresses.some((a) => a.id === selectedAddressId)) {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } else if (!isAddressesLoading && !hasAutoOpenedModalRef.current) {
      hasAutoOpenedModalRef.current = true;
      setIsAddressModalOpen(true);
    }
  }, [addresses, selectedAddressId, isAddressesLoading]);

  // Calculate final total with coupon discount
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + delivery);

  const handleApplyCoupon = async (code: string) => {
    setCouponError(null);
    setIsApplyingCoupon(true);
    try {
      const res = await orderService.validateCoupon({
        code,
        subtotal,
        items: items.map((it) => ({
          variantId: it.id,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
        })),
      });
      setAppliedCoupon(res);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj?.response?.data?.message || errorObj?.message || "Invalid or expired coupon code";
      setCouponError(msg);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleSaveAddress = async (addr: Address) => {
    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({ id: addr.id, data: addr });
        setSelectedAddressId(addr.id);
      } else {
        const addressData: Omit<Address, "id"> = {
          type: addr.type,
          fullName: addr.fullName,
          phoneNumber: addr.phoneNumber,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          landmark: addr.landmark,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country || "India",
          isDefault: addr.isDefault || addresses.length === 0,
        };
        const created = await createAddressMutation.mutateAsync(addressData);
        if (created?.id) {
          setSelectedAddressId(created.id);
        }
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      setCheckoutError(null);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleCheckoutSubmit = async () => {
    if (resolved.length === 0 || isSubmitting) return;

    if (!selectedAddress) {
      setCheckoutError("Please add or select a shipping address to place your order.");
      setIsAddressModalOpen(true);
      return;
    }

    setCheckoutError(null);
    setIsSubmitting(true);

    try {
      const formattedItems = items.map((it) => {
        const prod = products.find((p) => p.id === it.id);
        const matchedVariant =
          prod?.variants?.find(
            (v) => (!it.size || v.size === it.size) && (!it.color || v.color === it.color)
          ) || prod?.variants?.[0];

        return {
          id: it.id,
          variantId: matchedVariant?.id || it.id,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
        };
      });

      const checkoutPayload = {
        items: formattedItems,
        shippingAddressId: selectedAddress.id,
        shippingAddress: {
          type: selectedAddress.type,
          fullName: selectedAddress.fullName,
          phoneNumber: selectedAddress.phoneNumber,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 || undefined,
          landmark: selectedAddress.landmark || undefined,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country || "India",
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
        idempotencyKey: idempotencyKeyRef.current,
      };

      const result = await checkoutMutation.mutateAsync(checkoutPayload);

      // --- FLOW A: CASH ON DELIVERY (COD) ---
      if (paymentMethod === "COD") {
        setPlacedOrderTotal(result.order.totalAmount);
        setPlacedRecipientName(selectedAddress.fullName);
        setPlacedPaymentMethod("COD");
        dispatch(clearCart());
        setIsSubmitting(false);
        return;
      }

      // --- FLOW B: UPI / ONLINE VIA RAZORPAY ---
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setIsSubmitting(false);
        setCheckoutError("Could not load payment gateway. Please check your internet connection or choose Cash on Delivery.");
        return;
      }

      const paymentInfo = result.payment as { orderId?: string; amount?: number; currency?: string; keyId?: string } | undefined;
      const keyId = paymentInfo?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";
      const orderNumber = (result.order as { orderNumber?: string }).orderNumber || result.order.id;

      const rzpOptions = {
        key: keyId,
        amount: paymentInfo?.amount || Math.round(result.order.totalAmount * 100),
        currency: paymentInfo?.currency || "INR",
        name: "KamiraFit",
        description: `Order #${orderNumber}`,
        order_id: paymentInfo?.orderId,
        prefill: {
          name: selectedAddress.fullName,
        },
        send_sms_hash: false,
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        notes: {
          orderId: result.order.id,
          orderNumber: orderNumber,
        },
        theme: {
          color: "#C9A24D",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setCheckoutError("Payment was cancelled or closed. Your order was not placed. Please try again or select Cash on Delivery.");
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            await verifyPaymentMutation.mutateAsync({
              orderId: result.order.id,
              razorpayOrderId: response.razorpay_order_id || paymentInfo?.orderId || "",
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setPlacedOrderTotal(result.order.totalAmount);
            setPlacedRecipientName(selectedAddress.fullName);
            setPlacedPaymentMethod("ONLINE");
            dispatch(clearCart());
          } catch {
            setCheckoutError(
              "Payment verification failed. If money was debited from your account, your order will be verified automatically, or please contact support."
            );
          } finally {
            setIsSubmitting(false);
          }
        },
      };

      type RazorpayInstance = {
        open: () => void;
        on: (event: string, callback: (response: { error?: { description?: string; reason?: string } }) => void) => void;
      };
      type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

      const RazorpayClass = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!RazorpayClass) {
        setIsSubmitting(false);
        setCheckoutError("Payment gateway could not be loaded. Please select Cash on Delivery or retry.");
        return;
      }

      const rzp = new RazorpayClass(rzpOptions as unknown as Record<string, unknown>);

      rzp.on("payment.failed", function (response: { error?: { description?: string; reason?: string } }) {
        setIsSubmitting(false);
        const description = response?.error?.description || response?.error?.reason || "Payment transaction was declined";
        setCheckoutError(`${description}. Your order was not placed. Please try again or choose Cash on Delivery.`);
      });

      try {
        rzp.open();
      } catch {
        setIsSubmitting(false);
        setCheckoutError("Payment gateway could not be launched. Please try again or select Cash on Delivery.");
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setCheckoutError(mapCheckoutErrorMessage(err));
    }
  };

  if (placedOrderTotal !== null) {
    return (
      <Container width="narrow" className="py-20 text-center lg:py-28">
        <div
          aria-hidden
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-ink-2 text-3xl text-gold shadow-[0_20px_50px_-20px_rgba(139,30,45,0.5)]"
        >
          ✓
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
          Thank you, {placedRecipientName.split(" ")[0] || "friend"}.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-paper-muted">
          Your order of{" "}
          <span className="font-semibold text-gold">
            {formatPrice(placedOrderTotal)}
          </span>{" "}
          has been placed {placedPaymentMethod === "COD" ? "via COD" : "via UPI"}.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/account/orders" className={buttonClasses("primary", "md")}>
            View My Orders
          </Link>
          <Link href="/shop" className={buttonClasses("secondary", "md")}>
            Continue shopping
          </Link>
          <Link href="/" className={buttonClasses("secondary", "md")}>
            Back to home
          </Link>
        </div>
      </Container>
    );
  }

  if (!isOnline && items.length > 0) {
    return (
      <Container width="narrow" className="py-20">
        <OfflineState onRetry={() => void refetch()} />
      </Container>
    );
  }

  if (isLoading && products.length === 0) {
    return (
      <Container width="narrow" className="py-20 animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-ink-4" />
        <div className="h-4 w-64 rounded bg-ink-3" />
        <div className="space-y-4 pt-6">
          <div className="h-20 w-full rounded-2xl border border-line bg-ink p-4" />
          <div className="h-20 w-full rounded-2xl border border-line bg-ink p-4" />
          <div className="h-12 w-full rounded-full bg-ink-4" />
        </div>
      </Container>
    );
  }

  if (isError && products.length === 0 && items.length > 0) {
    return (
      <Container width="narrow" className="py-20">
        <ErrorState
          message="We couldn’t load checkout details. Please try again."
          onRetry={() => void refetch()}
        />
      </Container>
    );
  }

  if (resolved.length === 0) {
    return (
      <Container width="narrow" className="py-20 text-center lg:py-28">
        <h1 className="font-display text-3xl font-semibold text-paper sm:text-4xl">
          Your cart is empty
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-paper-muted">
          Add some items to your bag before checking out.
        </p>
        <Link href="/shop" className={`${buttonClasses("primary", "md")} mt-8`}>
          Browse shop
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-14 lg:py-20">
      <SectionHeader
        size="lg"
        eyebrow="Checkout"
        title="Complete your order"
        description="Choose your delivery address, select payment method, and review your order."
        className="mb-12"
      />

      {checkoutError && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 animate-fadeIn"
        >
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1 font-medium">{checkoutError}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* Shipping Address Selection Section */}
        <section aria-label="Shipping address and payment" className="min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-paper flex items-center gap-2">
                Shipping address
                {addresses.length > 0 && (
                  <span className="text-xs font-normal text-paper-muted">
                    ({addresses.length} saved)
                  </span>
                )}
              </h2>
              <p className="text-xs text-paper-muted mt-0.5">
                Select where you want your order delivered
              </p>
            </div>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-white transition-all duration-200 cursor-pointer"
              >
                <span>+</span> Add New Address
              </button>
            )}
          </div>

          {/* If addresses are loading or refetching */}
          {isAddressesLoading || isAddressesFetching ? (
            <AddressSkeleton />
          ) : addresses.length > 0 ? (
            <div className="space-y-2">
              <div className="max-h-[440px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gold/30 hover:scrollbar-thumb-gold/60 scrollbar-track-ink-2/30 rounded-2xl">
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-gold bg-gold/10 shadow-[0_0_20px_rgba(201,162,77,0.15)] ring-1 ring-gold"
                          : "border-line bg-ink hover:border-gold/40 hover:bg-ink-2/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Radio Checkmark */}
                          <div
                            className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                              isSelected
                                ? "border-gold bg-gold text-ink"
                                : "border-paper-muted/50 bg-transparent group-hover:border-gold/50"
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-[15px] font-semibold text-paper">
                                {addr.fullName}
                              </span>
                              <span className="inline-flex rounded bg-ink-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper-muted">
                                {addr.type}
                              </span>
                              {addr.isDefault && (
                                <span className="inline-flex rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold border border-gold/30">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-paper-muted mt-0.5 font-mono">
                              {addr.phoneNumber}
                            </p>

                            <p className="mt-1.5 text-xs text-paper-muted leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                              {addr.landmark ? ` (Landmark: ${addr.landmark})` : ""}
                              {`, ${addr.city}, ${addr.state} - ${addr.pincode}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(addr);
                              setIsAddressModalOpen(true);
                            }}
                            className="rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          {isSelected && (
                            <span className="text-[11px] font-semibold text-emerald-400">
                              ✓ Deliver here
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {addresses.length > 3 && (
                <p className="text-[11px] text-paper-muted/80 text-right pr-2">
                  Showing 3 of {addresses.length} addresses. Scroll to view all.
                </p>
              )}
            </div>
          ) : (
            /* Empty State when no addresses exist */
            <div className="rounded-2xl border border-line bg-ink p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-2xl text-gold">
                📍
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-paper">
                  No delivery address found
                </h3>
                <p className="text-xs text-paper-muted max-w-sm mx-auto mt-1">
                  Please add a shipping address so we can deliver your order smoothly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-gold-bright transition-all cursor-pointer"
              >
                + Add Delivery Address
              </button>
            </div>
          )}

          {/* Real-time Delivery Estimation & Order Processing Breakdown */}
          {selectedAddress && deliveryEstimation && (
            <div className="mt-5 rounded-2xl border border-line bg-ink-2/60 p-4 sm:p-5 space-y-4 shadow-sm transition-all animate-fadeIn">
              {/* Top Banner: Destination & Calculated Delivery Fee */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm text-gold border border-gold/30">
                    🚚
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xs sm:text-sm font-semibold text-paper">
                        Standard Delivery ({deliveryEstimation.zoneLabel})
                      </h3>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        {deliveryEstimation.isDomestic ? "Domestic Express" : "International Express"}
                      </span>
                    </div>
                    <p className="text-[11px] text-paper-muted mt-0.5">
                      Destination PIN: <strong className="text-paper font-mono">{selectedAddress.pincode}</strong> ({selectedAddress.city}, {selectedAddress.state})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {deliveryEstimation.isFree ? (
                    <div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-paper-muted line-through">
                          ₹{deliveryEstimation.rate}
                        </span>
                        <span className="text-sm font-bold text-emerald-400 font-display">
                          FREE
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ✓ Free delivery on orders over ₹999
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-display text-sm font-bold text-gold">
                        ₹{deliveryEstimation.rate}
                      </span>
                      <p className="text-[10px] text-paper-muted">
                        Regional shipping fee
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transit & Processing Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Order Processing Time */}
                <div className="rounded-xl border border-line/60 bg-ink/70 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-paper">
                    <span>⏱️</span>
                    <span>Order Processing: 24–48 Hours</span>
                  </div>
                  <p className="text-[11px] text-paper-muted leading-relaxed">
                    Takes <strong>1–2 business days</strong> for verification, tailoring inspection, and packaging at our atelier (<strong>barring Saturdays, Sundays, and national holidays</strong>).
                  </p>
                </div>

                {/* 2. Courier Transit Time */}
                <div className="rounded-xl border border-line/60 bg-ink/70 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-paper">
                    <span>📦</span>
                    <span>Courier Transit: ~{deliveryEstimation.estimatedDays} Days</span>
                  </div>
                  <p className="text-[11px] text-paper-muted leading-relaxed">
                    Dispatched via <strong>{deliveryEstimation.courierName}</strong> with live tracking. Estimated arrival: <strong className="text-gold font-semibold">{deliveryEstimation.fullDateRange}</strong>.
                  </p>
                </div>
              </div>

              {/* Explicit Transparency Notice */}
              <div className="flex items-start gap-2.5 rounded-xl border border-gold/20 bg-gold/5 px-3.5 py-2.5 text-[11px] leading-relaxed text-paper-muted">
                <span className="text-sm text-gold shrink-0">✨</span>
                <p>
                  <strong className="text-paper font-medium">Delivery Transparency:</strong> To ensure complete honesty and prevent false promises, our delivery estimate accounts for <strong>24–48 hrs processing (1–2 business days)</strong> plus carrier transit to your address.
                </p>
              </div>
            </div>
          )}

          {/* Payment Method Selection Section */}
          <div className="mt-8 pt-6 border-t border-line">
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold text-paper">
                Payment method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* COD */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`relative flex items-center justify-between rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
                  paymentMethod === "COD"
                    ? "border-gold bg-gold/10 shadow-[0_0_20px_rgba(201,162,77,0.15)] ring-1 ring-gold"
                    : "border-line bg-ink hover:border-gold/40 hover:bg-ink-2/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                      paymentMethod === "COD"
                        ? "border-gold bg-gold text-ink"
                        : "border-paper-muted/50 bg-transparent"
                    }`}
                  >
                    {paymentMethod === "COD" && (
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="font-display text-base font-semibold text-paper tracking-wide">
                    COD
                  </span>
                </div>
              </div>

              {/* UPI */}
              <div
                onClick={() => setPaymentMethod("ONLINE")}
                className={`relative flex items-center justify-between rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
                  paymentMethod === "ONLINE"
                    ? "border-gold bg-gold/10 shadow-[0_0_20px_rgba(201,162,77,0.15)] ring-1 ring-gold"
                    : "border-line bg-ink hover:border-gold/40 hover:bg-ink-2/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                      paymentMethod === "ONLINE"
                        ? "border-gold bg-gold text-ink"
                        : "border-paper-muted/50 bg-transparent"
                    }`}
                  >
                    {paymentMethod === "ONLINE" && (
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="font-display text-base font-semibold text-paper tracking-wide">
                    UPI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order Summary Column */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <CheckoutOrderSummary
            resolved={resolved}
            subtotal={subtotal}
            delivery={delivery}
            total={finalTotal}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            isApplyingCoupon={isApplyingCoupon}
            couponError={couponError}
            selectedPincode={selectedAddress?.pincode}
            deliveryZoneLabel={deliveryEstimation?.zoneLabel}
          />
          <button
            type="button"
            onClick={handleCheckoutSubmit}
            disabled={isSubmitting || checkoutMutation.isPending || !selectedAddress}
            className={buttonClasses("primary", "lg")}
          >
            {paymentMethod === "COD"
              ? (isSubmitting || checkoutMutation.isPending ? "Placing order…" : "Place Order")
              : (isSubmitting || checkoutMutation.isPending ? "Opening payment gateway…" : `Pay Now · ${formatPrice(finalTotal)}`)
            }
          </button>
          <p className="text-xs text-paper-muted/80">
            {paymentMethod === "COD"
              ? "Pay comfortably upon delivery at your doorstep."
              : "Guaranteed 256-bit SSL encrypted & secure Razorpay checkout."
            }
          </p>
        </div>
      </div>

      {/* Address Form Modal (Reused from Profile) */}
      {isAddressModalOpen && (
        <AddressFormModal
          address={editingAddress || undefined}
          onClose={() => {
            setIsAddressModalOpen(false);
            setEditingAddress(null);
          }}
          onSave={handleSaveAddress}
          isSubmitting={createAddressMutation.isPending || updateAddressMutation.isPending}
        />
      )}
    </Container>
  );
}
