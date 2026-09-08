"use client";

import { useId, type FormEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { lookupPincode } from "@/lib/pincode";

export type ShippingDetails = {
  name: string;
  phone: string;
  address: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type ShippingErrors = Partial<Record<keyof ShippingDetails, string>>;

type Props = {
  values: ShippingDetails;
  errors: ShippingErrors;
  onChange: (values: ShippingDetails) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitting?: boolean;
  submitLabel?: string;
  formId?: string;
};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-muted"
    >
      {children}
    </label>
  );
}

export default function ShippingForm({
  values,
  errors,
  onChange,
  onSubmit,
  submitting = false,
  submitLabel = "Pay Now",
  formId,
}: Props) {
  const id = useId();
  const fieldId = (name: string) => `${id}-${name}`;

  const set = <K extends keyof ShippingDetails>(
    key: K,
    value: ShippingDetails[K],
  ) => {
    onChange({ ...values, [key]: value });
  };

  const setPhone = (value: string) => {
    set("phone", value.replace(/[^\d+\s-]/g, "").slice(0, 16));
  };

  const setPincode = async (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    onChange({ ...values, pincode: clean });
    if (clean.length === 6) {
      const result = await lookupPincode(clean);
      if (result) {
        onChange({
          ...values,
          pincode: clean,
          city: result.city || values.city,
          state: result.state || values.state,
        });
      }
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-xl border bg-ink-2 px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-paper-muted/60 focus:ring-2 focus:ring-gold/30 ${
      hasError
        ? "border-red-500/70 focus:border-red-500"
        : "border-line focus:border-gold"
    }`;

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={fieldId("name")}>Full name</FieldLabel>
        <input
          id={fieldId("name")}
          type="text"
          autoComplete="name"
          maxLength={80}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Krishnendu Ganguly"
          className={inputClass(Boolean(errors.name))}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${fieldId("name")}-err` : undefined}
        />
        {errors.name ? (
          <p id={`${fieldId("name")}-err`} className="text-xs text-red-400">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={fieldId("phone")}>Phone</FieldLabel>
        <input
          id={fieldId("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={16}
          pattern="[0-9+\s-]{10,16}"
          value={values.phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9876543210"
          className={inputClass(Boolean(errors.phone))}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? `${fieldId("phone")}-err` : undefined}
        />
        {errors.phone ? (
          <p id={`${fieldId("phone")}-err`} className="text-xs text-red-400">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={fieldId("address")}>Address Line 1</FieldLabel>
        <textarea
          id={fieldId("address")}
          rows={2}
          autoComplete="street-address"
          maxLength={240}
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="House / Flat no., building name, street"
          className={inputClass(Boolean(errors.address))}
          aria-invalid={Boolean(errors.address)}
          aria-describedby={
            errors.address ? `${fieldId("address")}-err` : undefined
          }
        />
        {errors.address ? (
          <p id={`${fieldId("address")}-err`} className="text-xs text-red-400">
            {errors.address}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={fieldId("addressLine2")}>Address Line 2 <span className="text-[10px] font-normal lowercase text-paper-muted">(optional)</span></FieldLabel>
          <input
            id={fieldId("addressLine2")}
            type="text"
            maxLength={100}
            value={values.addressLine2 || ""}
            onChange={(e) => set("addressLine2", e.target.value)}
            placeholder="Apartment, suite, unit"
            className={inputClass(false)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={fieldId("landmark")}>Landmark <span className="text-[10px] font-normal lowercase text-paper-muted">(optional)</span></FieldLabel>
          <input
            id={fieldId("landmark")}
            type="text"
            maxLength={100}
            value={values.landmark || ""}
            onChange={(e) => set("landmark", e.target.value)}
            placeholder="Near City Mall, Opposite Metro"
            className={inputClass(false)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={fieldId("pincode")}>Pincode</FieldLabel>
          <input
            id={fieldId("pincode")}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            pattern="[0-9]{6}"
            value={values.pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="700001"
            className={inputClass(Boolean(errors.pincode))}
            aria-invalid={Boolean(errors.pincode)}
            aria-describedby={
              errors.pincode ? `${fieldId("pincode")}-err` : undefined
            }
          />
          {errors.pincode ? (
            <p
              id={`${fieldId("pincode")}-err`}
              className="text-xs text-red-400"
            >
              {errors.pincode}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={fieldId("city")}>City</FieldLabel>
          <input
            id={fieldId("city")}
            type="text"
            autoComplete="address-level2"
            maxLength={80}
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="City"
            className={inputClass(Boolean(errors.city))}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? `${fieldId("city")}-err` : undefined}
          />
          {errors.city ? (
            <p id={`${fieldId("city")}-err`} className="text-xs text-red-400">
              {errors.city}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={fieldId("state")}>State</FieldLabel>
          <input
            id={fieldId("state")}
            type="text"
            autoComplete="address-level1"
            maxLength={80}
            value={values.state}
            onChange={(e) => set("state", e.target.value)}
            placeholder="State"
            className={inputClass(Boolean(errors.state))}
            aria-invalid={Boolean(errors.state)}
            aria-describedby={errors.state ? `${fieldId("state")}-err` : undefined}
          />
          {errors.state ? (
            <p id={`${fieldId("state")}-err`} className="text-xs text-red-400">
              {errors.state}
            </p>
          ) : null}
        </div>
      </div>

      {formId ? null : (
        <button
          type="submit"
          disabled={submitting}
          className={`${buttonClasses("primary", "lg")} mt-2`}
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}
