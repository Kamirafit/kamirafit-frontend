"use client";

import { useState, useEffect } from "react";
import { Address, AddressType } from "../types";
import { lookupPincode } from "@/lib/pincode";
import Button from "@/components/ui/Button";

type Props = {
  address?: Address; // If provided, we're editing. If not, adding.
  onClose: () => void;
  onSave: (address: Address) => void;
  isSubmitting?: boolean;
};

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  pincode?: string;
}

export default function AddressFormModal({ address, onClose, onSave, isSubmitting = false }: Props) {
  const [formData, setFormData] = useState<Partial<Address>>(
    address || { type: "Home", isDefault: false }
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const validateFields = (data: Partial<Address>): FormErrors => {
    const errs: FormErrors = {};

    if (!data.fullName || data.fullName.trim().length < 2) {
      errs.fullName = "Please enter your full name";
    }

    const cleanPhone = (data.phoneNumber || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phoneNumber = "Please enter a valid 10-digit mobile number";
    }

    if (!data.addressLine1 || data.addressLine1.trim().length < 3) {
      errs.addressLine1 = "Please enter flat, house no., building or street";
    }

    const cleanPin = (data.pincode || "").replace(/\D/g, "");
    if (!cleanPin || cleanPin.length !== 6) {
      errs.pincode = "Please enter a valid 6-digit PIN code";
    } else if (!data.city || !data.state) {
      errs.pincode = "Location could not be detected. Please check PIN code";
    }

    return errs;
  };

  useEffect(() => {
    if (formData.pincode && formData.pincode.length === 6 && (!formData.city || !formData.state)) {
      lookupPincode(formData.pincode).then((result) => {
        if (result) {
          setFormData((prev) => ({
            ...prev,
            city: prev.city || result.city,
            state: prev.state || result.state,
          }));
        }
      });
    }
  }, [formData.pincode, formData.city, formData.state]);

  const handlePincodeChange = async (value: string) => {
    const cleanPin = value.replace(/\D/g, "").slice(0, 6);
    const updatedData = { ...formData, pincode: cleanPin };
    setFormData(updatedData);
    setTouched((prev) => ({ ...prev, pincode: true }));

    if (cleanPin.length === 6) {
      setIsDetecting(true);
      try {
        const result = await lookupPincode(cleanPin);
        if (result) {
          const withLocation = {
            ...updatedData,
            city: result.city,
            state: result.state,
          };
          setFormData(withLocation);
          setErrors(validateFields(withLocation));
          return;
        }
      } finally {
        setIsDetecting(false);
      }
    }
    setErrors(validateFields(updatedData));
  };

  const handleFieldChange = (field: keyof Address, value: string | boolean) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (touched[field]) {
      setErrors(validateFields(updated));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateFields(formData));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = {
      fullName: true,
      phoneNumber: true,
      addressLine1: true,
      pincode: true,
    };
    setTouched(allTouched);

    const validationErrors = validateFields(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSave({
      id: formData.id || `addr-${Date.now()}`,
      type: formData.type as AddressType,
      fullName: (formData.fullName || "").trim(),
      phoneNumber: (formData.phoneNumber || "").trim(),
      addressLine1: (formData.addressLine1 || "").trim(),
      addressLine2: (formData.addressLine2 || "").trim(),
      landmark: (formData.landmark || "").trim(),
      city: (formData.city || "").trim(),
      state: (formData.state || "").trim(),
      pincode: (formData.pincode || "").trim(),
      country: (formData.country || "India").trim(),
      isDefault: formData.isDefault || false,
    });
  };

  const getInputClass = (fieldName: keyof FormErrors) => {
    const hasError = Boolean(touched[fieldName] && errors[fieldName]);
    return `w-full rounded-lg border px-4 py-2.5 text-sm text-paper outline-none transition-colors ${
      hasError
        ? "border-red-500/80 bg-red-500/5 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
        : "border-line bg-transparent focus:border-gold"
    }`;
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto modal-scrollbar-hidden rounded-2xl border border-line bg-ink shadow-2xl backdrop-blur-xl">
        <div className="sticky top-0 z-10 border-b border-line bg-ink/95 px-6 py-4 backdrop-blur-md flex justify-between items-center">
          <h2 className="font-display text-lg font-bold text-paper">
            {address ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={isSubmitting ? undefined : onClose}
            disabled={isSubmitting}
            className="text-paper-muted hover:text-paper disabled:opacity-40"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={formData.fullName || ""}
                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                onBlur={() => handleBlur("fullName")}
                placeholder="Enter full name"
                className={getInputClass("fullName")}
              />
              {touched.fullName && errors.fullName && (
                <p className="text-[11.5px] text-red-400 mt-0.5">{errors.fullName}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Mobile Number</label>
              <input
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={(e) => handleFieldChange("phoneNumber", e.target.value.replace(/[^\d+\s-]/g, ""))}
                onBlur={() => handleBlur("phoneNumber")}
                placeholder="10-digit mobile number"
                className={getInputClass("phoneNumber")}
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <p className="text-[11.5px] text-red-400 mt-0.5">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Address Line 1</label>
            <input
              type="text"
              value={formData.addressLine1 || ""}
              onChange={(e) => handleFieldChange("addressLine1", e.target.value)}
              onBlur={() => handleBlur("addressLine1")}
              placeholder="Flat / House no., Building, Street"
              className={getInputClass("addressLine1")}
            />
            {touched.addressLine1 && errors.addressLine1 && (
              <p className="text-[11.5px] text-red-400 mt-0.5">{errors.addressLine1}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={formData.addressLine2 || ""}
              onChange={(e) => handleFieldChange("addressLine2", e.target.value)}
              placeholder="Apartment, suite, unit, etc."
              className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-paper outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Landmark (Optional)</label>
              <input
                type="text"
                value={formData.landmark || ""}
                onChange={(e) => handleFieldChange("landmark", e.target.value)}
                placeholder="Nearby landmark"
                className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-paper outline-none focus:border-gold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">
                Pincode {isDetecting && <span className="text-[10px] lowercase text-gold font-normal">(detecting location...)</span>}
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode || ""}
                onChange={(e) => handlePincodeChange(e.target.value)}
                onBlur={() => handleBlur("pincode")}
                placeholder="6-digit PIN code"
                className={getInputClass("pincode")}
              />
              {touched.pincode && errors.pincode && (
                <p className="text-[11.5px] text-red-400 mt-0.5">{errors.pincode}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">
                City <span className="text-[10px] lowercase text-paper-muted font-normal">(auto-detected)</span>
              </label>
              <input
                disabled
                type="text"
                value={formData.city || ""}
                placeholder={isDetecting ? "Detecting city..." : "Auto-detected from Pincode"}
                className="w-full rounded-lg border border-line bg-ink-3/50 px-4 py-2.5 text-sm text-paper cursor-not-allowed opacity-80 select-none outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">
                State <span className="text-[10px] lowercase text-paper-muted font-normal">(auto-detected)</span>
              </label>
              <input
                disabled
                type="text"
                value={formData.state || ""}
                placeholder={isDetecting ? "Detecting state..." : "Auto-detected from Pincode"}
                className="w-full rounded-lg border border-line bg-ink-3/50 px-4 py-2.5 text-sm text-paper cursor-not-allowed opacity-80 select-none outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Address Type</label>
            <div className="flex gap-4">
              {["Home", "Work", "Other"].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="addressType"
                    checked={formData.type === t}
                    onChange={() => handleFieldChange("type", t as AddressType)}
                    className="text-gold focus:ring-gold accent-gold"
                  />
                  <span className="text-sm text-paper">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleFieldChange("isDefault", e.target.checked)}
              className="h-4 w-4 rounded border-line text-gold focus:ring-gold accent-gold"
            />
            <label htmlFor="isDefault" className="text-sm text-paper cursor-pointer">
              Set as default address
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-line pt-6">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Save Address
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
