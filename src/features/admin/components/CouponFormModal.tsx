"use client";

import { useEffect, useState } from "react";
import type { AdminCoupon, CreateCouponDto, CouponDiscountType, AdminCategory } from "@/types/entities";
import { useAdminCategories } from "@/services/admin";
import Button from "@/components/ui/Button";
import FormField, { inputClass, textareaClass } from "./FormField";
import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCouponDto) => void;
  initial: AdminCoupon | null;
  isSubmitting?: boolean;
};

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

export default function CouponFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  isSubmitting = false,
}: Props) {
  const { data: categories = [] } = useAdminCategories();

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<CouponDiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<string>("");
  const [minOrderVal, setMinOrderVal] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(getTodayString());
  const [neverExpires, setNeverExpires] = useState<boolean>(true);
  const [endDate, setEndDate] = useState<string>("");
  const [applicableCategoryIds, setApplicableCategoryIds] = useState<string[]>([]);
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setCode(initial.code || "");
      setDescription(initial.description || "");
      setDiscountType(initial.discountType || "PERCENTAGE");
      setDiscountValue(String(initial.discountValue ?? initial.discountVal ?? ""));
      setMaxDiscount(initial.maxDiscount != null ? String(initial.maxDiscount) : "");
      setMinOrderVal(initial.minOrderVal != null ? String(initial.minOrderVal) : "");
      setStartDate(formatDateForInput(initial.startDate) || getTodayString());
      if (initial.endDate) {
        setNeverExpires(false);
        setEndDate(formatDateForInput(initial.endDate));
      } else {
        setNeverExpires(true);
        setEndDate("");
      }
      setApplicableCategoryIds(Array.isArray(initial.applicableCategoryIds) ? initial.applicableCategoryIds : []);
      setUsageLimit(initial.usageLimit != null ? String(initial.usageLimit) : "");
      setIsActive(typeof initial.isActive === "boolean" ? initial.isActive : true);
    } else {
      setCode("");
      setDescription("");
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      setMaxDiscount("");
      setMinOrderVal("");
      setStartDate(getTodayString());
      setNeverExpires(true);
      setEndDate("");
      setApplicableCategoryIds([]);
      setUsageLimit("");
      setIsActive(true);
    }
    setErrors({});
  }, [open, initial]);

  const toggleCategory = (catId: string) => {
    setApplicableCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSelectAllCategories = () => {
    if (applicableCategoryIds.length === categories.length) {
      setApplicableCategoryIds([]);
    } else {
      setApplicableCategoryIds(categories.map((c: AdminCategory) => c.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      nextErrors.code = "Coupon code is required";
    } else if (cleanCode.length < 3) {
      nextErrors.code = "Coupon code must be at least 3 characters";
    } else if (cleanCode.length > 30) {
      nextErrors.code = "Coupon code cannot exceed 30 characters";
    } else if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      nextErrors.code = "Only letters, numbers, hyphens, and underscores allowed";
    }

    const numVal = parseFloat(discountValue);
    if (!discountValue || isNaN(numVal) || numVal <= 0) {
      nextErrors.discountValue = "Enter a valid positive discount amount";
    } else if (discountType === "PERCENTAGE" && numVal > 100) {
      nextErrors.discountValue = "Percentage discount cannot exceed 100%";
    }

    if (maxDiscount) {
      const numMax = parseFloat(maxDiscount);
      if (isNaN(numMax) || numMax <= 0) {
        nextErrors.maxDiscount = "Max discount cap must be greater than 0";
      }
    }

    if (minOrderVal) {
      const numMin = parseFloat(minOrderVal);
      if (isNaN(numMin) || numMin < 0) {
        nextErrors.minOrderVal = "Minimum cart value must be 0 or higher";
      }
    }

    if (usageLimit) {
      const numLimit = parseInt(usageLimit, 10);
      if (isNaN(numLimit) || numLimit < 1) {
        nextErrors.usageLimit = "Usage limit must be at least 1";
      }
    }

    if (!neverExpires && !endDate) {
      nextErrors.endDate = "Specify an expiry date or select 'Never expires'";
    } else if (!neverExpires && endDate && startDate) {
      if (new Date(endDate) <= new Date(startDate)) {
        nextErrors.endDate = "Expiry date must be after the start date";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const startIso = startDate
      ? new Date(`${startDate}T00:00:00.000Z`).toISOString()
      : new Date().toISOString();

    const endIso =
      !neverExpires && endDate
        ? new Date(`${endDate}T23:59:59.999Z`).toISOString()
        : null;

    const payload: CreateCouponDto = {
      code: cleanCode,
      description: description.trim() || null,
      discountType,
      discountValue: numVal,
      discountVal: numVal,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      minOrderVal: minOrderVal ? parseFloat(minOrderVal) : null,
      startDate: startIso,
      endDate: endIso,
      applicableCategoryIds,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      isActive,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title={initial ? `Edit Coupon: ${initial.code}` : "Create New Coupon"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {/* Row 1: Code and Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Coupon Code"
            hint="Unique code customers enter during checkout (auto-uppercased)"
            error={errors.code}
          >
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder="FESTIVE25"
                className={`${inputClass} font-mono tracking-wider font-semibold text-gold uppercase`}
                maxLength={30}
              />
            </div>
          </FormField>

          <FormField
            label="Active Status"
            hint="Controls whether customers can apply this coupon"
          >
            <div className="flex h-[46px] items-center gap-3 px-4 rounded-full border border-line bg-ink-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-line bg-ink text-gold focus:ring-gold accent-gold cursor-pointer"
              />
              <label htmlFor="isActive" className="text-[13px] font-medium text-paper cursor-pointer select-none">
                {isActive ? "Active (Can be applied)" : "Inactive (Disabled)"}
              </label>
            </div>
          </FormField>
        </div>

        {/* Description */}
        <FormField
          label="Description / Purpose (Optional)"
          hint="Internal and customer-visible note about this promotion"
        >
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 20% discount on summer t-shirts for orders above ₹999"
            rows={2}
            className={textareaClass}
          />
        </FormField>

        {/* Discount Type and Value Section */}
        <div className="rounded-2xl border border-line bg-ink-2/50 p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-paper">
              Discount Calculation
            </span>
            <span className="text-[11px] text-paper-muted">Choose discount method</span>
          </div>

          {/* Discount Type Toggle Buttons */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-full border border-line bg-ink">
            <button
              type="button"
              onClick={() => setDiscountType("PERCENTAGE")}
              className={`flex items-center justify-center gap-2 py-2 rounded-full text-[12.5px] font-semibold tracking-wide transition-all ${
                discountType === "PERCENTAGE"
                  ? "bg-gold text-ink shadow-sm"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              <span>%</span>
              <span>Percentage Discount</span>
            </button>
            <button
              type="button"
              onClick={() => setDiscountType("FIXED_AMOUNT")}
              className={`flex items-center justify-center gap-2 py-2 rounded-full text-[12.5px] font-semibold tracking-wide transition-all ${
                discountType === "FIXED_AMOUNT"
                  ? "bg-gold text-ink shadow-sm"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              <span>₹</span>
              <span>Fixed Amount Discount</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label={discountType === "PERCENTAGE" ? "Discount Percentage (%)" : "Discount Amount (₹)"}
              hint={
                discountType === "PERCENTAGE"
                  ? "e.g. 15 for 15% off"
                  : "e.g. 200 for ₹200 off"
              }
              error={errors.discountValue}
            >
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={discountType === "PERCENTAGE" ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "PERCENTAGE" ? "15" : "200"}
                  className={inputClass}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-paper-muted">
                  {discountType === "PERCENTAGE" ? "%" : "₹"}
                </span>
              </div>
            </FormField>

            <FormField
              label="Maximum Discount Cap (₹) (Optional)"
              hint={
                discountType === "PERCENTAGE"
                  ? "Capping max savings (e.g. ₹500 limit)"
                  : "Leave blank for no limit"
              }
              error={errors.maxDiscount}
            >
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="e.g. 500"
                  className={inputClass}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-paper-muted">
                  ₹
                </span>
              </div>
            </FormField>
          </div>
        </div>

        {/* Validity Dates Section */}
        <div className="rounded-2xl border border-line bg-ink-2/50 p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-paper">
              Validity & Expiry Period
            </span>
            <span className="text-[11px] text-gold">Optional expiry support</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Start Date"
              hint="Date from which coupon can be redeemed"
            >
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </FormField>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
                  Expiry Date
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11.5px] text-gold select-none">
                  <input
                    type="checkbox"
                    checked={neverExpires}
                    onChange={(e) => {
                      setNeverExpires(e.target.checked);
                      if (e.target.checked) setEndDate("");
                    }}
                    className="h-3.5 w-3.5 rounded border-line bg-ink text-gold focus:ring-gold accent-gold cursor-pointer"
                  />
                  <span>Never expires</span>
                </label>
              </div>

              <input
                type="date"
                value={endDate}
                disabled={neverExpires}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className={`${inputClass} ${
                  neverExpires ? "opacity-40 cursor-not-allowed bg-ink" : ""
                }`}
                placeholder={neverExpires ? "No Expiry Date" : ""}
              />
              {neverExpires ? (
                <span className="text-[11px] text-emerald-400 font-medium">
                  ✓ This coupon does not have an expiration date
                </span>
              ) : errors.endDate ? (
                <span className="text-[11.5px] font-medium text-[#B3261E]">
                  {errors.endDate}
                </span>
              ) : (
                <span className="text-[11px] text-paper-muted">
                  Coupon automatically expires after this date
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Conditions Section: Cart Value & Collections */}
        <div className="rounded-2xl border border-line bg-ink-2/50 p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-paper">
              Redemption Conditions
            </span>
            <span className="text-[11px] text-paper-muted">Collection & Cart Rules</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Minimum Cart Value (₹) (Optional)"
              hint="Cart must reach this amount before discount applies"
              error={errors.minOrderVal}
            >
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={minOrderVal}
                  onChange={(e) => setMinOrderVal(e.target.value)}
                  placeholder="e.g. 999"
                  className={inputClass}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-paper-muted">
                  ₹
                </span>
              </div>
            </FormField>

            <FormField
              label="Total Usage Limit (Optional)"
              hint="Max total times this coupon can be redeemed across all users"
              error={errors.usageLimit}
            >
              <input
                type="number"
                min="1"
                step="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="e.g. 100 (Blank for unlimited)"
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Collection / Category Conditions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-line/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
                Applicable Collections / Categories
              </span>
              <button
                type="button"
                onClick={handleSelectAllCategories}
                className="text-[11px] font-semibold text-gold hover:underline"
              >
                {applicableCategoryIds.length === categories.length && categories.length > 0
                  ? "Clear selection"
                  : "Select all collections"}
              </button>
            </div>

            <p className="text-[11.5px] text-paper-muted">
              {applicableCategoryIds.length === 0
                ? "✨ Currently applies to all collections across the catalog."
                : `Applied to ${applicableCategoryIds.length} specific collection${
                    applicableCategoryIds.length === 1 ? "" : "s"
                  }. Only matching products qualify for discount.`}
            </p>

            {categories.length === 0 ? (
              <p className="text-[12px] italic text-paper-muted py-1">No categories configured yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map((cat: AdminCategory) => {
                  const selected = applicableCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
                        selected
                          ? "border-gold bg-gold text-ink shadow-[0_4px_12px_-4px_rgba(139,30,45,0.4)]"
                          : "border-line bg-ink text-paper-muted hover:border-gold hover:text-paper"
                      }`}
                    >
                      <span>{selected ? "✓" : "+"}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
          <Button variant="dark" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : initial
              ? "Save Changes"
              : "Create Coupon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
