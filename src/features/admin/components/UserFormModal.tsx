"use client";

import { useEffect, useState } from "react";
import type { AdminUser, Address } from "@/types/entities";
import Button from "@/components/ui/Button";
import FormField, { inputClass } from "./FormField";
import Modal from "./Modal";
import AddressCard from "@/features/account/components/AddressCard";
import AddressFormModal from "@/features/account/components/AddressFormModal";
import ConfirmDialog from "./ConfirmDialog";
import {
  useAdminUserAddresses,
  useAdminCreateUserAddress,
  useAdminUpdateUserAddress,
  useAdminDeleteUserAddress,
} from "@/services/admin";
import { useAdminToast } from "../context/AdminToastContext";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<AdminUser, "id">) => void;
  initial: AdminUser | null;
  loading?: boolean;
};

const EMPTY = { name: "", email: "", phone: "" };

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading = false,
}: Props) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const { showSuccess, showError } = useAdminToast();

  const addressesQuery = useAdminUserAddresses(initial?.id);
  const createAddressMutation = useAdminCreateUserAddress();
  const updateAddressMutation = useAdminUpdateUserAddress();
  const deleteAddressMutation = useAdminDeleteUserAddress();

  const addresses: Address[] = addressesQuery.data || initial?.addresses || [];

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        name: initial.name,
        email: initial.email,
        phone: initial.phone,
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
    setEditingAddress(null);
    setIsAddingAddress(false);
    setAddressToDelete(null);
  }, [open, initial]);

  const set = <K extends keyof typeof EMPTY>(k: K, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = "Name is required";
    if (!values.email.trim() || !values.email.includes("@"))
      nextErrors.email = "Valid email is required";
    if (!values.phone.trim()) nextErrors.phone = "Phone is required";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const defaultOrFirst = addresses.find((a) => a.isDefault) || addresses[0];
    const formattedAddress = defaultOrFirst
      ? [
          defaultOrFirst.addressLine1,
          defaultOrFirst.addressLine2,
          defaultOrFirst.city,
          defaultOrFirst.state,
          defaultOrFirst.pincode,
        ].filter(Boolean).join(", ")
      : "";

    onSubmit({
      ...values,
      address: formattedAddress,
      addresses,
    });
  };

  const handleSaveAddress = async (addrData: Address) => {
    if (!initial) return;
    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          userId: initial.id,
          addressId: editingAddress.id,
          data: addrData,
        });
        showSuccess("Address updated successfully.", "Address Saved");
      } else {
        await createAddressMutation.mutateAsync({
          userId: initial.id,
          data: addrData,
        });
        showSuccess("New customer address added successfully.", "Address Added");
      }
      setIsAddingAddress(false);
      setEditingAddress(null);
      void addressesQuery.refetch();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Failed to save address";
      showError(msg, "Error");
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (!initial) return;
    try {
      await updateAddressMutation.mutateAsync({
        userId: initial.id,
        addressId: addr.id,
        data: { isDefault: true },
      });
      showSuccess("Default address updated successfully.", "Address Updated");
      void addressesQuery.refetch();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Failed to set default address";
      showError(msg, "Error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!initial || !addressToDelete) return;
    try {
      await deleteAddressMutation.mutateAsync({
        userId: initial.id,
        addressId: addressToDelete,
      });
      showSuccess("Address removed from customer profile.", "Address Removed");
      setAddressToDelete(null);
      void addressesQuery.refetch();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Failed to delete address";
      showError(msg, "Error");
    }
  };

  const isBusy =
    loading ||
    createAddressMutation.isPending ||
    updateAddressMutation.isPending ||
    deleteAddressMutation.isPending;

  const handleCloseMainModal = () => {
    if (isAddingAddress || editingAddress !== null || addressToDelete !== null) {
      return;
    }
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={isBusy ? () => {} : handleCloseMainModal}
        title={initial ? `Customer Management — ${initial.name}` : "Customer Details"}
        maxWidth="xl"
      >
        <div className="flex flex-col gap-8 pb-2">
          {/* Section 1: Customer Contact Info */}
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-paper">
                  Contact Information
                </h3>
                <p className="text-xs text-paper-muted">
                  Update customer name, registered email address, or mobile number.
                </p>
              </div>
              {initial?.id && (
                <span className="rounded bg-ink-3 px-2 py-0.5 font-mono text-[11px] text-paper-muted">
                  ID: {initial.id}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitProfile} noValidate className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Full Name" error={errors.name}>
                  <input
                    type="text"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={inputClass}
                    disabled={isBusy}
                    placeholder="e.g. Rahul Sharma"
                  />
                </FormField>
                <FormField label="Email Address" error={errors.email}>
                  <input
                    type="email"
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputClass}
                    disabled={isBusy}
                    placeholder="e.g. rahul@example.com"
                  />
                </FormField>
                <FormField label="Mobile Number" error={errors.phone}>
                  <input
                    type="tel"
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputClass}
                    disabled={isBusy}
                    placeholder="e.g. 9876543210"
                  />
                </FormField>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="primary" size="sm" type="submit" loading={loading} disabled={isBusy}>
                  Save Contact Details
                </Button>
              </div>
            </form>
          </div>

          {/* Section 2: Addresses Management in Cards */}
          <div>
            <div className="flex items-center justify-between gap-4 border-t border-line pt-6 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-wide text-paper">
                    Customer Addresses
                  </h3>
                  <span className="inline-flex h-5 items-center rounded-full bg-gold/15 px-2 text-[11px] font-bold text-gold">
                    {addresses.length}
                  </span>
                </div>
                <p className="text-xs text-paper-muted mt-0.5">
                  Addresses on file for this customer. Add, edit, remove, or set default delivery address.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingAddress(true)}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-gold-bright hover:shadow disabled:opacity-50"
              >
                + Add Address
              </button>
            </div>

            {addressesQuery.isLoading && addresses.length === 0 ? (
              <div className="flex items-center justify-center p-8 rounded-xl border border-line bg-ink-2/30">
                <p className="text-xs text-paper-muted animate-pulse">Loading customer addresses…</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line p-8 text-center bg-ink/40">
                <p className="text-sm font-medium text-paper">No saved addresses on file</p>
                <p className="mt-1 text-xs text-paper-muted max-w-sm">
                  This customer doesn’t have any delivery addresses saved yet. Click &quot;+ Add Address&quot; above to create one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={(a) => setEditingAddress(a)}
                    onDelete={(id) => setAddressToDelete(id)}
                    onSetDefault={handleSetDefault}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Close Action */}
          <div className="flex items-center justify-end border-t border-line pt-4">
            <Button variant="dark" size="sm" onClick={onClose} disabled={isBusy}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Address Form Modal (Add / Edit) */}
      {(isAddingAddress || editingAddress !== null) && (
        <AddressFormModal
          zIndex="z-[150]"
          address={editingAddress || undefined}
          defaultValues={{
            fullName: values.name || initial?.name,
            phoneNumber: values.phone || initial?.phone,
            isDefault: addresses.length === 0,
          }}
          isSubmitting={createAddressMutation.isPending || updateAddressMutation.isPending}
          onClose={() => {
            setIsAddingAddress(false);
            setEditingAddress(null);
          }}
          onSave={handleSaveAddress}
        />
      )}

      {/* Confirm Delete Address Dialog */}
      <ConfirmDialog
        zIndex="z-[160]"
        open={Boolean(addressToDelete)}
        title="Delete Customer Address"
        description="Are you sure you want to permanently remove this delivery address from this customer's account?"
        confirmLabel="Remove Address"
        cancelLabel="Keep Address"
        danger
        loading={deleteAddressMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setAddressToDelete(null)}
      />
    </>
  );
}
