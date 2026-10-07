"use client";

import type { Address } from "@/types/entities";

type DeliveryAddressCardProps = {
  address?: Address | null;
  shippingMethod?: string;
};

export default function DeliveryAddressCard({
  address,
  shippingMethod = "Standard Delivery",
}: DeliveryAddressCardProps) {
  if (!address) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-4 text-surface-tint">
            <svg className="w-5 h-5 text-surface-tint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-surface-tint">
              Delivery Address
            </span>
          </div>
          <p className="font-sans text-sm text-on-surface-variant italic">
            Address information recorded with order.
          </p>
        </div>
      </div>
    );
  }

  const {
    fullName,
    phoneNumber,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    postalCode,
    country = "India",
  } = address as Address & { postalCode?: string };

  const pin = pincode || postalCode || "";

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between border border-outline-variant/30 transition-all hover:shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-4 text-surface-tint">
          <svg className="w-5 h-5 text-surface-tint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-surface-tint">
            Delivery Address
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl text-primary mb-2 font-medium">
          {fullName || "Recipient"}
        </h3>

        <div className="font-sans text-sm text-on-surface-variant leading-relaxed space-y-0.5">
          {addressLine1 && <p>{addressLine1}</p>}
          {addressLine2 && <p>{addressLine2}</p>}
          {landmark && <p className="text-xs text-on-surface-variant/80">Near {landmark}</p>}
          <p>
            {[city, state].filter(Boolean).join(", ")}
            {pin ? ` ${pin}` : ""}
          </p>
          {country && <p>{country}</p>}
        </div>
      </div>

      <div className="pt-5 mt-6 bg-surface-container-low/60 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-3.5 rounded-b-2xl border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-on-surface-variant">
        <span>Contact: {phoneNumber || "—"}</span>
        <span className="text-surface-tint font-medium bg-surface-container px-2 py-0.5 rounded text-[11px]">
          {shippingMethod}
        </span>
      </div>
    </div>
  );
}
