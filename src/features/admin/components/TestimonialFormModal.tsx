"use client";

import { useEffect, useState } from "react";
import type { Testimonial, CreateTestimonialInput } from "@/types/entities";
import Button from "@/components/ui/Button";
import FormField, { inputClass } from "./FormField";
import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTestimonialInput) => void;
  initial: Testimonial | null;
  isSubmitting?: boolean;
};

const EMPTY: CreateTestimonialInput = {
  name: "",
  location: "",
  quote: "",
  rating: 5,
  isActive: true,
};

export default function TestimonialFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  isSubmitting = false,
}: Props) {
  const [values, setValues] = useState<CreateTestimonialInput>(EMPTY);
  const [errors, setErrors] = useState<{
    name?: string;
    location?: string;
    quote?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        name: initial.name,
        location: initial.location,
        quote: initial.quote,
        rating: initial.rating ?? 5,
        isActive: initial.isActive ?? true,
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = "Customer name is required";
    if (!values.location.trim()) nextErrors.location = "Location/City is required";
    if (!values.quote.trim()) nextErrors.quote = "Testimonial quote is required";
    else if (values.quote.trim().length < 5)
      nextErrors.quote = "Quote must be at least 5 characters";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      name: values.name.trim(),
      location: values.location.trim(),
      quote: values.quote.trim(),
      rating: Number(values.rating) || 5,
      isActive: values.isActive,
    });
  };

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title={initial ? "Edit Testimonial" : "Add Testimonial"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Customer Name" error={errors.name}>
            <input
              type="text"
              value={values.name}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, name: e.target.value }))
              }
              className={inputClass}
              placeholder="Ava Thompson"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Location / City" error={errors.location}>
            <input
              type="text"
              value={values.location}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, location: e.target.value }))
              }
              className={inputClass}
              placeholder="Brooklyn, NY"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        <FormField label="Star Rating">
          <div className="flex items-center gap-2 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValues((prev) => ({ ...prev, rating: star }))}
                className="group p-1 transition-transform hover:scale-110 focus:outline-none"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                disabled={isSubmitting}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill={(values.rating ?? 5) >= star ? "#D4AF37" : "none"}
                  stroke={(values.rating ?? 5) >= star ? "#D4AF37" : "#555"}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-colors"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-[12px] font-medium text-paper-muted">
              {values.rating ?? 5} / 5
            </span>
          </div>
        </FormField>

        <FormField label="Testimonial Quote" error={errors.quote}>
          <textarea
            rows={4}
            value={values.quote}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, quote: e.target.value }))
            }
            className="w-full rounded-lg border border-line bg-ink-2 px-4 py-3 text-[13.5px] leading-relaxed text-paper placeholder:text-paper-muted/70 transition-colors focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            placeholder="The fit, the fabric, the finish — everything feels considered..."
            disabled={isSubmitting}
          />
        </FormField>

        <div className="flex items-center gap-3 pt-1">
          <label className="flex cursor-pointer items-center gap-2.5 select-none">
            <input
              type="checkbox"
              checked={values.isActive ?? true}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-line bg-ink-2 text-gold focus:ring-gold"
              disabled={isSubmitting}
            />
            <span className="text-[13px] font-medium text-paper">
              Show on storefront
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3">
          <Button variant="dark" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : initial
              ? "Save changes"
              : "Create testimonial"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
