"use client";

import { useEffect, useState } from "react";
import type { ContactQuery, AdminQueryInput, ContactQueryStatus } from "@/types/entities";
import Button from "@/components/ui/Button";
import FormField, {
  inputClass,
  inputErrorClass,
  selectClass,
  textareaClass,
  textareaErrorClass,
} from "./FormField";
import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AdminQueryInput) => Promise<void>;
  initial: ContactQuery | null;
  loading?: boolean;
};

const EMPTY_VALUES: AdminQueryInput = {
  firstName: "",
  lastName: "",
  countryCode: "+91",
  phone: "",
  email: "",
  message: "",
  status: "PENDING",
};

export default function QueryFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading = false,
}: Props) {
  const [values, setValues] = useState<AdminQueryInput>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = Boolean(initial);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        firstName: initial.firstName || "",
        lastName: initial.lastName || "",
        countryCode: initial.countryCode || "+91",
        phone: initial.phone || "",
        email: initial.email || "",
        message: initial.message || "",
        status: initial.status || "PENDING",
      });
    } else {
      setValues(EMPTY_VALUES);
    }
    setErrors({});
    setTouched({});
    setServerError(null);
  }, [open, initial]);

  const validateField = (field: string, val: string): string => {
    switch (field) {
      case "firstName":
        if (!val.trim()) return "First name is required";
        if (val.trim().length > 50) return "First name cannot exceed 50 characters";
        return "";
      case "email":
        if (!val.trim()) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
          return "Please enter a valid email address (e.g. name@domain.com)";
        return "";
      case "phone": {
        const digits = val.trim().replace(/\D/g, "");
        if (!val.trim()) return "Phone number is required";
        if (digits.length < 6) return "Phone number must be at least 6 digits";
        if (digits.length > 15) return "Phone number cannot exceed 15 digits";
        return "";
      }
      case "message":
        if (!val.trim()) return "Inquiry message content is required";
        if (val.trim().length < 5) return "Please provide a little more detail (at least 5 characters)";
        return "";
      default:
        return "";
    }
  };

  const validateAll = (): boolean => {
    const nextErrors: Record<string, string> = {};

    const fnErr = validateField("firstName", values.firstName);
    if (fnErr) nextErrors.firstName = fnErr;

    const emErr = validateField("email", values.email);
    if (emErr) nextErrors.email = emErr;

    const phErr = validateField("phone", values.phone);
    if (phErr) nextErrors.phone = phErr;

    const msgErr = validateField("message", values.message);
    if (msgErr) nextErrors.message = msgErr;

    setErrors(nextErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      message: true,
    });
    return Object.keys(nextErrors).length === 0;
  };

  const handleBlur = (field: keyof AdminQueryInput) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = String(values[field] || "");
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };


  const handleChange = (field: keyof AdminQueryInput, val: string) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (touched[field]) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateAll()) return;

    try {
      await onSubmit(values);
      onClose();
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const errorObj = err as { message?: string };
      const msg =
        responseData?.message ||
        errorObj?.message ||
        "An error occurred while saving the query.";
      setServerError(msg);
    }
  };

  return (
    <Modal
      open={open}
      title={isEditing ? "Modify Customer Query" : "Create New Customer Query"}
      onClose={loading ? () => {} : onClose}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {serverError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            {serverError}
          </div>
        )}

        {/* Customer Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="First Name *"
            error={touched.firstName ? errors.firstName : undefined}
            htmlFor="query-first-name"
          >
            <input
              id="query-first-name"
              type="text"
              value={values.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              onBlur={() => handleBlur("firstName")}
              placeholder="e.g. Rahul"
              className={touched.firstName && errors.firstName ? inputErrorClass : inputClass}
            />
          </FormField>

          <FormField
            label="Last Name"
            error={touched.lastName ? errors.lastName : undefined}
            htmlFor="query-last-name"
          >
            <input
              id="query-last-name"
              type="text"
              value={values.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              onBlur={() => handleBlur("lastName")}
              placeholder="e.g. Sharma"
              className={inputClass}
            />
          </FormField>
        </div>

        {/* Contact info: Email & Phone with Country Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Email Address *"
            error={touched.email ? errors.email : undefined}
            htmlFor="query-email"
          >
            <input
              id="query-email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="customer@example.com"
              className={touched.email && errors.email ? inputErrorClass : inputClass}
            />
          </FormField>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
              Phone Number *
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={values.countryCode || "+91"}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, countryCode: e.target.value }))
                }
                placeholder="+91"
                className="w-20 rounded-full border border-line bg-ink-2 px-3 py-2.5 text-center text-[13.5px] text-paper focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <input
                type="tel"
                value={values.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                onBlur={() => handleBlur("phone")}
                placeholder="9876543210"
                className={touched.phone && errors.phone ? inputErrorClass : inputClass}
              />
            </div>
            {touched.phone && errors.phone && (
              <span className="text-[11.5px] font-medium text-[#B3261E]">
                {errors.phone}
              </span>
            )}
          </div>
        </div>

        {/* Query Status */}
        <FormField label="Inquiry Status" htmlFor="query-status">
          <select
            id="query-status"
            value={values.status || "PENDING"}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                status: e.target.value as ContactQueryStatus,
              }))
            }
            className={selectClass}
          >
            <option value="PENDING">PENDING (Requires attention)</option>
            <option value="RESOLVED">RESOLVED (Inquiry addressed)</option>
            <option value="ARCHIVED">ARCHIVED (Inactive / Closed)</option>
          </select>
        </FormField>

        {/* Query Message Content */}
        <FormField
          label="Inquiry / Query Message *"
          error={touched.message ? errors.message : undefined}
          hint="Detail the customer request, offline interaction, or support inquiry."
          htmlFor="query-message"
        >
          <textarea
            id="query-message"
            rows={5}
            value={values.message}
            onChange={(e) => handleChange("message", e.target.value)}
            onBlur={() => handleBlur("message")}
            placeholder="Describe the inquiry details here..."
            className={touched.message && errors.message ? textareaErrorClass : textareaClass}
          />
        </FormField>

        {/* Modal Buttons */}
        <div className="mt-2 flex items-center justify-end gap-3 border-t border-line pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button type="submit" loading={loading} disabled={loading}>
            {loading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Save Changes"
              : "Create Query"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
