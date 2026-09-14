"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
import type { Address } from "@/features/account/types";
import { orderService, type CouponValidationResult } from "@/services/order";
import { ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

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
  const { subtotal, delivery } = calculateTotals(resolved);

  // Address queries and mutations
  const { data: addresses = [], isLoading: isAddressesLoading } = useAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const hasAutoOpenedModalRef = useRef(false);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Checkout submission state
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placedOrderTotal, setPlacedOrderTotal] = useState<number | null>(null);
  const [placedRecipientName, setPlacedRecipientName] = useState<string>("");
  const [placedRecipientPhone, setPlacedRecipientPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkoutMutation = useCheckout();

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

  // Selected address object
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;

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
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid or expired coupon code";
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
      const result = await checkoutMutation.mutateAsync({
        items,
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
        paymentMethod: "ONLINE",
        couponCode: appliedCoupon?.code,
        idempotencyKey: idempotencyKeyRef.current,
      });

      setPlacedOrderTotal(result.order.totalAmount);
      setPlacedRecipientName(selectedAddress.fullName);
      setPlacedRecipientPhone(selectedAddress.phoneNumber);
      dispatch(clearCart());
    } catch (err: unknown) {
      setCheckoutError(mapCheckoutErrorMessage(err));
    } finally {
      setIsSubmitting(false);
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
          has been placed. A confirmation will reach {placedRecipientPhone || "you"}{" "}
          shortly.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className={buttonClasses("primary", "md")}>
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
        <ErrorState message="We couldn’t prepare checkout." onRetry={() => void refetch()} />
      </Container>
    );
  }

  if (resolved.length === 0) {
    return (
      <Container width="narrow" className="py-20 text-center lg:py-28">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
          Nothing to check out
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-paper-muted">
          Your cart is empty. Add something you love before heading to checkout.
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
        description="Choose your delivery address and review your order."
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
        <section aria-label="Shipping address" className="min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-paper">
                Shipping address
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
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-white transition-all duration-200 cursor-pointer"
              >
                <span>+</span> Add New Address
              </button>
            )}
          </div>

          {/* If user has addresses */}
          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`relative flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-gold bg-gold/10 shadow-[0_0_20px_rgba(201,162,77,0.15)] ring-1 ring-gold"
                        : "border-line bg-ink hover:border-gold/40 hover:bg-ink-2/60"
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Radio Checkmark */}
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                              isSelected
                                ? "border-gold bg-gold text-ink"
                                : "border-paper-muted/50 bg-transparent"
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="inline-flex rounded bg-ink-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper-muted">
                            {addr.type}
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span className="inline-flex rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold border border-gold/30">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Address Info */}
                      <div className="mt-3">
                        <p className="font-display text-[15px] font-semibold text-paper">
                          {addr.fullName}
                        </p>
                        <p className="text-xs text-paper-muted mt-0.5">
                          {addr.phoneNumber}
                        </p>
                        <div className="mt-2 text-xs leading-relaxed text-paper-muted">
                          <p>{addr.addressLine1}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          {addr.landmark && <p className="text-paper-muted/70">Landmark: {addr.landmark}</p>}
                          <p className="text-paper font-medium mt-1">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                      <span className={`text-[11px] font-medium ${isSelected ? "text-emerald-400 font-semibold" : "text-paper-muted"}`}>
                        {isSelected ? "✓ Deliver to this address" : "Click to deliver here"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAddress(addr);
                          setIsAddressModalOpen(true);
                        }}
                        className="text-[11px] font-semibold uppercase tracking-wider text-gold hover:underline transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add New Address Card in Grid */}
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="flex flex-col items-center justify-center min-h-[180px] rounded-2xl border-2 border-dashed border-line hover:border-gold bg-ink/40 hover:bg-gold/5 p-6 text-center transition-all group cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold group-hover:scale-110 group-hover:bg-gold group-hover:text-ink transition-all mb-2">
                  <span className="text-xl font-bold">+</span>
                </div>
                <p className="font-display text-sm font-semibold text-paper group-hover:text-gold transition-colors">
                  Add New Address
                </p>
                <p className="text-xs text-paper-muted mt-1">
                  Deliver to another location
                </p>
              </button>
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
          />
          <button
            type="button"
            onClick={handleCheckoutSubmit}
            disabled={isSubmitting || checkoutMutation.isPending || !selectedAddress}
            className={buttonClasses("primary", "lg")}
          >
            {isSubmitting || checkoutMutation.isPending ? "Placing order…" : `Pay Now · ${formatPrice(finalTotal)}`}
          </button>
          <p className="text-xs text-paper-muted/80">
            Guaranteed 256-bit SSL encrypted & secure checkout.
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
