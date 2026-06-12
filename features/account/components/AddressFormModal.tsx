"use client";

import { useState } from "react";
import { Address, AddressType } from "../types";

type Props = {
  address?: Address; // If provided, we're editing. If not, adding.
  onClose: () => void;
  onSave: (address: Address) => void;
};

export default function AddressFormModal({ address, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Address>>(
    address || { type: "Home", isDefault: false }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: formData.id || `addr-${Date.now()}`,
      type: formData.type as AddressType,
      fullName: formData.fullName || "",
      phoneNumber: formData.phoneNumber || "",
      addressLine1: formData.addressLine1 || "",
      addressLine2: formData.addressLine2 || "",
      landmark: formData.landmark || "",
      city: formData.city || "",
      state: formData.state || "",
      pincode: formData.pincode || "",
      isDefault: formData.isDefault || false,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-ink shadow-2xl backdrop-blur-xl">
        <div className="sticky top-0 z-10 border-b border-line bg-ink/95 px-6 py-4 backdrop-blur-md flex justify-between items-center">
          <h2 className="font-display text-lg font-bold text-paper">
            {address ? "Edit Address" : "Add New Address"}
          </h2>
          <button onClick={onClose} className="text-paper-muted hover:text-paper">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Full Name</label>
              <input
                required
                type="text"
                value={formData.fullName || ""}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Mobile Number</label>
              <input
                required
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Address Line 1</label>
            <input
              required
              type="text"
              value={formData.addressLine1 || ""}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={formData.addressLine2 || ""}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Landmark (Optional)</label>
              <input
                type="text"
                value={formData.landmark || ""}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Pincode</label>
              <input
                required
                type="text"
                value={formData.pincode || ""}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">City</label>
              <input
                required
                type="text"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">State</label>
              <input
                required
                type="text"
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
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
                    onChange={() => setFormData({ ...formData, type: t as AddressType })}
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
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-line text-gold focus:ring-gold accent-gold"
            />
            <label htmlFor="isDefault" className="text-sm text-paper cursor-pointer">
              Set as default address
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-paper-muted hover:bg-ink-3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-gold px-6 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md hover:bg-gold-bright transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
