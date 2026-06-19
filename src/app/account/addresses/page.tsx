"use client";

import { useState } from "react";
import AddressCard from "@/features/account/components/AddressCard";
import AddressFormModal from "@/features/account/components/AddressFormModal";
import { Address } from "@/features/account/types";
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from "@/services/address";
import AddressSkeleton from "@/components/skeleton/AddressSkeleton";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function AddressesPage() {
  const { data: addresses = [], isLoading, isError, refetch } = useAddresses();
  const isOnline = useOnlineStatus();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = async (address: Address) => {
    if (isAdding) {
      const addressData: Omit<Address, "id"> = {
        type: address.type,
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
      };
      await createMutation.mutateAsync(addressData);
    } else {
      await updateMutation.mutateAsync({ id: address.id, data: address });
    }
    setIsAdding(false);
    setEditingAddress(null);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSetDefault = (id: string) => {
    const addressToUpdate = addresses.find(a => a.id === id);
    if (addressToUpdate) {
      updateMutation.mutate({
        id,
        data: { ...addressToUpdate, isDefault: true }
      });
    }
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

      {createMutation.isError || updateMutation.isError || deleteMutation.isError ? (
        <div className="mt-6"><ErrorState className="min-h-0 py-6" title="Address change not saved" message="Please check your connection and try again." /></div>
      ) : null}

      {!isOnline && addresses.length === 0 ? (
        <div className="mt-8"><OfflineState onRetry={() => void refetch()} /></div>
      ) : isLoading ? (
        <div className="mt-8">
          <AddressSkeleton />
        </div>
      ) : isError ? (
        <div className="mt-8"><ErrorState message="We couldn’t load your addresses." onRetry={() => void refetch()} /></div>
      ) : addresses.length === 0 ? (
        <div className="mt-8"><EmptyState title="No saved addresses" description="Add a delivery address to make checkout faster." /></div>
      ) : (
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
        </div>
      )}

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
