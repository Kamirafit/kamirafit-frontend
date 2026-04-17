"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import { clearCart } from "@/features/product/store/cartSlice";
import { calculateTotals, formatPrice, resolveCartItems } from "../utils";
import CheckoutOrderSummary from "./CheckoutOrderSummary";
import ShippingForm, {
  type ShippingDetails,
  type ShippingErrors,
} from "./ShippingForm";

const INITIAL_VALUES: ShippingDetails = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

function validate(values: ShippingDetails): ShippingErrors {
  const errors: ShippingErrors = {};
  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  const phoneDigits = values.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }
  if (!values.address.trim() || values.address.trim().length < 6) {
    errors.address = "Address looks too short.";
  }
  if (!values.city.trim()) {
    errors.city = "City is required.";
  }
  if (!/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = "Pincode must be 6 digits.";
  }
  return errors;
}

export default function CheckoutPageClient() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  const resolved = resolveCartItems(items);
  const { subtotal, delivery, total } = calculateTotals(resolved);

  const [values, setValues] = useState<ShippingDetails>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrderTotal, setPlacedOrderTotal] = useState<number | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resolved.length === 0) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    window.setTimeout(() => {
      setPlacedOrderTotal(total);
      dispatch(clearCart());
      setSubmitting(false);
    }, 600);
  };

  if (placedOrderTotal !== null) {
    return (
      <Container width="narrow" className="py-16 text-center lg:py-24">
        <div
          aria-hidden
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-2xl text-white"
        >
          ✓
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          Thank you, {values.name.split(" ")[0] || "friend"}!
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600">
          Your order of {formatPrice(placedOrderTotal)} has been placed. A
          confirmation will reach {values.phone || "you"} shortly.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

  if (resolved.length === 0) {
    return (
      <Container width="narrow" className="py-16 text-center lg:py-24">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          Nothing to check out
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600">
          Your cart is empty. Add something you love before heading to checkout.
        </p>
        <Link
          href="/shop"
          className={`${buttonClasses("primary", "md")} mt-8`}
        >
          Browse shop
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeader
        size="lg"
        eyebrow="Checkout"
        title="Complete your order"
        description="Enter your shipping details to place the order."
        className="mb-10"
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
        <section aria-label="Shipping address" className="min-w-0">
          <h2 className="mb-5 text-lg font-semibold text-neutral-900">
            Shipping address
          </h2>
          <ShippingForm
            formId="checkout-form"
            values={values}
            errors={errors}
            onChange={setValues}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </section>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <CheckoutOrderSummary
            resolved={resolved}
            subtotal={subtotal}
            delivery={delivery}
            total={total}
          />
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className={buttonClasses("primary", "lg")}
          >
            {submitting ? "Placing order…" : `Pay Now · ${formatPrice(total)}`}
          </button>
          <p className="text-xs text-neutral-500">
            Payment gateway not connected — this is a UI-only flow.
          </p>
        </div>
      </div>
    </Container>
  );
}
