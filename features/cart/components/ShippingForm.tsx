"use client";

import { useId, type FormEvent } from "react";

export type ShippingDetails = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
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
      className="text-xs font-medium uppercase tracking-wider text-neutral-600"
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

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/10 ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-neutral-300 focus:border-neutral-900"
    }`;

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={fieldId("name")}>Full name</FieldLabel>
        <input
          id={fieldId("name")}
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Krishnendu Ganguly"
          className={inputClass(Boolean(errors.name))}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${fieldId("name")}-err` : undefined}
        />
        {errors.name ? (
          <p id={`${fieldId("name")}-err`} className="text-xs text-red-600">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={fieldId("phone")}>Phone</FieldLabel>
        <input
          id={fieldId("phone")}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="9876543210"
          className={inputClass(Boolean(errors.phone))}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? `${fieldId("phone")}-err` : undefined}
        />
        {errors.phone ? (
          <p id={`${fieldId("phone")}-err`} className="text-xs text-red-600">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={fieldId("address")}>Address</FieldLabel>
        <textarea
          id={fieldId("address")}
          rows={3}
          autoComplete="street-address"
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="House no., street, locality"
          className={inputClass(Boolean(errors.address))}
          aria-invalid={Boolean(errors.address)}
          aria-describedby={
            errors.address ? `${fieldId("address")}-err` : undefined
          }
        />
        {errors.address ? (
          <p id={`${fieldId("address")}-err`} className="text-xs text-red-600">
            {errors.address}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={fieldId("city")}>City</FieldLabel>
          <input
            id={fieldId("city")}
            type="text"
            autoComplete="address-level2"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Kolkata"
            className={inputClass(Boolean(errors.city))}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? `${fieldId("city")}-err` : undefined}
          />
          {errors.city ? (
            <p id={`${fieldId("city")}-err`} className="text-xs text-red-600">
              {errors.city}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={fieldId("pincode")}>Pincode</FieldLabel>
          <input
            id={fieldId("pincode")}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={values.pincode}
            onChange={(e) => set("pincode", e.target.value)}
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
              className="text-xs text-red-600"
            >
              {errors.pincode}
            </p>
          ) : null}
        </div>
      </div>

      {formId ? null : (
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}
