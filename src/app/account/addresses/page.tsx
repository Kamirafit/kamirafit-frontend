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
  const addressesQuery = useAddresses();
  const { data: addresses = [], isError, refetch } = addressesQuery;
  const isLoading = addressesQuery.isLoading || (addressesQuery.isFetching && addresses.length === 0);
  const isOnline = useOnlineStatus();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const handleSave = async (address: Address) => {
    try {
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
          country: address.country || "India",
          isDefault: address.isDefault,
        };
        await createMutation.mutateAsync(addressData);
      } else {
        await updateMutation.mutateAsync({ id: address.id, data: address });
      }
      setIsAdding(false);
      setEditingAddress(null);
    } catch {
      // Error handled by mutation state
    }
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteMutation.mutateAsync(addressToDelete);
      setAddressToDelete(null);
    } catch {
      // Error handled
    }
  };

  const handleSetDefault = (address: Address) => {
    updateMutation.mutate({
      id: address.id,
      data: {
        id: address.id,
        type: address.type,
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        landmark: address.landmark || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || "India",
        isDefault: true,
      },
    });
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
              onDelete={(id) => setAddressToDelete(id)}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {(isAdding || editingAddress) && (
        <AddressFormModal
          address={editingAddress || undefined}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setIsAdding(false);
            setEditingAddress(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Address Confirmation Modal */}
      {addressToDelete && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={deleteMutation.isPending ? undefined : () => setAddressToDelete(null)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-ink p-6 shadow-2xl backdrop-blur-xl modal-scrollbar-hidden">
            <h3 className="font-display text-xl font-bold text-paper">
              Delete Address
            </h3>
            <p className="mt-2 text-sm text-paper-muted">
               Are you sure you want to remove this delivery address? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setAddressToDelete(null)}
                className="rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider text-paper-muted hover:bg-ink-3 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={confirmDelete}
                className="rounded-full bg-[#DC2626] px-5 py-2 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
