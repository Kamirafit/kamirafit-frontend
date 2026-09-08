"use client";

import { useEffect, useState } from "react";
import type { AdminUser } from "@/types/entities";
import Button from "@/components/ui/Button";
import FormField, { inputClass, textareaClass } from "./FormField";
import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<AdminUser, "id">) => void;
  initial: AdminUser | null;
  loading?: boolean;
};

const EMPTY = { name: "", email: "", phone: "", address: "" };

export default function UserFormModal({ open, onClose, onSubmit, initial, loading = false }: Props) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        name: initial.name,
        email: initial.email,
        phone: initial.phone,
        address: initial.address,
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, initial]);

  const set = <K extends keyof typeof EMPTY>(k: K, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = "Name is required";
    if (!values.email.trim() || !values.email.includes("@"))
      nextErrors.email = "Valid email is required";
    if (!values.phone.trim()) nextErrors.phone = "Phone is required";
    if (!values.address.trim()) nextErrors.address = "Address is required";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(values);
  };

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title="Edit user" maxWidth="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="Name" error={errors.name}>
          <input
            type="text"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </FormField>
        <FormField label="Phone" error={errors.phone}>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </FormField>
        <FormField label="Address" error={errors.address}>
          <textarea
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            className={textareaClass}
            disabled={loading}
          />
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-3">
          <Button variant="dark" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={loading} disabled={loading}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
