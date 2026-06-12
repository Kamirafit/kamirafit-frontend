"use client";

import { useState } from "react";
import AddressCard from "@/features/account/components/AddressCard";
import AddressFormModal from "@/features/account/components/AddressFormModal";
import { MOCK_ADDRESSES } from "@/features/account/data/mockAccount";
import { Address } from "@/features/account/types";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = (address: Address) => {
    let newAddresses = [...addresses];
    
    // If setting as default, remove default from others
    if (address.isDefault) {
      newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
    } else if (newAddresses.length === 0 || (isAdding && newAddresses.every(a => !a.isDefault))) {
      // If it's the first address, or no default exists, make it default
      address.isDefault = true;
    }

    if (isAdding) {
      newAddresses.push(address);
    } else {
      const idx = newAddresses.findIndex(a => a.id === address.id);
      if (idx >= 0) newAddresses[idx] = address;
    }
    
    setAddresses(newAddresses);
    setIsAdding(false);
    setEditingAddress(null);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  return (
    <div className="rounded-2xl border border-line bg-ink p-6 shadow-sm sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-paper">
          Manage Addresses
        </h1>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-gold-bright hover:-translate-y-px hover:shadow-lg"
        >
          + Add New Address
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={setEditingAddress}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        ))}
        {addresses.length === 0 && (
          <div className="col-span-full py-12 text-center text-paper-muted">
            <p>You haven&apos;t saved any addresses yet.</p>
          </div>
        )}
      </div>

      {(isAdding || editingAddress) && (
        <AddressFormModal
          address={editingAddress || undefined}
          onClose={() => {
            setIsAdding(false);
            setEditingAddress(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
