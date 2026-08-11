"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  type Category,
  type Color,
  type Product,
  type ProductStatus,
  type Size,
} from "@/features/product/types";
import Button from "@/components/ui/Button";
import FormField, { inputClass, selectClass, textareaClass } from "./FormField";
import Modal from "./Modal";
import MultiSelectChips from "./MultiSelectChips";

type ProductState = "draft" | "active" | "archived";
type ImageDraft = { id: string; src: string; color: Color | "" };
type VariantDraft = { id: string; color: Color; size: Size; sku: string; stock: number; threshold: number };
type HistoryEntry = { id: string; variantId: string; at: string; reason: string; change: number; previous: number; next: number; note: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  initial?: Product | null;
  categoryOptions?: string[];
  duplicate?: boolean;
};

export type FormValues = {
  name: string;
  price: number;
  costPrice: number;
  description: string;
  category: Category;
  size: Size[];
  color: Color[];
  images: string[];
  image: string;
  status: ProductStatus;
  tags: string[];
  collections: string[];
  weight: number;
  length: number;
  width: number;
  height: number;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  showOnStorefront: boolean;
  taxEnabled: boolean;
  gstRate: number;
  priceIncludesTax: boolean;
};

const COLLECTIONS = ["New Arrivals", "Best Sellers", "Summer Collection", "Oversized Collection", "Pet Collection"];
const ADJUSTMENT_REASONS = ["Stock received", "Damaged", "Returned", "Manual adjustment", "Lost", "Order cancellation", "Stock correction"];
const MAX_IMAGES = 8;

const EMPTY: FormValues = {
  name: "",
  price: 0,
  costPrice: 0,
  description: "",
  category: "T-Shirts",
  size: [],
  color: [],
  images: [],
  image: "",
  status: "inactive",
  tags: [],
  collections: [],
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  slug: "",
  seoTitle: "",
  seoDescription: "",
  showOnStorefront: false,
  taxEnabled: false,
  gstRate: 0,
  priceIncludesTax: false,
};

const sectionTitle = "border-b border-line pb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold";

function isCategory(value: string, options: string[]): value is Category {
  return options.includes(value) && CATEGORY_OPTIONS.includes(value as Category);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function code(value: string, length = 3) {
  const token = slugify(value).split("-").filter(Boolean).map((part) => part.slice(0, length)).join("-");
  return (token || "PRD").toUpperCase();
}

function numeric(raw: string) {
  const value = raw === "" ? 0 : Number(raw);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function preventInvalidNumberKeys(event: React.KeyboardEvent<HTMLInputElement>) {
  if (["-", "+", "e", "E"].includes(event.key)) event.preventDefault();
}

function productStateFromStatus(status: ProductStatus): ProductState {
  return status === "active" ? "active" : "draft";
}

function makeSku(name: string, category: string, color: Color, size: Size, used: Set<string>) {
  const base = code(name || category) + "-" + code(category) + "-" + color.slice(0, 3).toUpperCase() + "-" + size;
  let sku = base;
  let suffix = 2;
  while (used.has(sku)) sku = base + "-" + suffix++;
  used.add(sku);
  return sku;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="flex flex-col gap-4"><h3 className={sectionTitle}>{title}</h3>{children}</section>;
}

function Toggle({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => { if (!disabled) onChange(!checked); }} className={disabled ? "flex w-full cursor-not-allowed items-center justify-between rounded-2xl border border-line bg-ink-3 px-4 py-3 text-left text-paper-muted opacity-65" : "flex w-full items-center justify-between rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left transition-colors hover:border-gold"}>
    <span className="text-[13px] font-medium">{label}</span>
    <span className={checked ? "relative h-6 w-11 rounded-full bg-gold transition-colors" : "relative h-6 w-11 rounded-full bg-line-strong transition-colors"}>
      <span className={checked ? "absolute top-1 h-4 w-4 rounded-full bg-white transition-all left-6" : "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all"} />
    </span>
  </button>;
}

export default function ProductFormModal({ open, onClose, onSubmit, initial, categoryOptions, duplicate = false }: Props) {
  const effectiveCategories = useMemo(
    () => categoryOptions && categoryOptions.length ? categoryOptions.filter((item): item is Category => (CATEGORY_OPTIONS as readonly string[]).includes(item)) : [...CATEGORY_OPTIONS],
    [categoryOptions],
  );
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [productState, setProductState] = useState<ProductState>("draft");
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [bulkStock, setBulkStock] = useState(0);
  const [bulkThreshold, setBulkThreshold] = useState(0);
  const [adjustmentVariant, setAdjustmentVariant] = useState("");
  const [adjustment, setAdjustment] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState(ADJUSTMENT_REASONS[0]);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const initialImages = initial.images.map((src, index) => ({ id: "existing-" + index, src, color: "" as Color | "" }));
      const seededVariants = initial.variants.map((variant, index) => ({ id: variant.id || "variant-" + index, color: variant.color, size: variant.size, sku: variant.sku, stock: variant.inventory.available, threshold: 5 }));
      setValues({
        ...EMPTY,
        name: duplicate ? initial.name + " Copy" : initial.name,
        price: initial.price,
        description: initial.description,
        category: initial.category,
        size: initial.size,
        color: initial.color,
        images: initial.images,
        image: initial.image,
        status: initial.status,
        slug: duplicate ? slugify(initial.name + " Copy") : initial.slug,
      });
      setProductState(productStateFromStatus(initial.status));
      setImages(initialImages);
      setVariants(duplicate ? [] : seededVariants);
      setHistory([]);
    } else {
      setValues({ ...EMPTY, category: effectiveCategories[0] || "T-Shirts" });
      setProductState("draft");
      setImages([]);
      setVariants([]);
      setHistory([]);
    }
    setErrors({});
    setAdvancedOpen(false);
  }, [open, initial, duplicate, effectiveCategories]);

  useEffect(() => () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((previous) => ({ ...previous, [key]: value }));

  const setNumber = (key: "costPrice" | "price" | "weight" | "length" | "width" | "height", raw: string) => set(key, numeric(raw));

  const profit = Math.max(0, values.price - values.costPrice);
  const margin = values.price > 0 ? (profit / values.price) * 100 : 0;

  const handleNameChange = (name: string) => {
    setValues((previous) => ({ ...previous, name, slug: previous.slug === slugify(previous.name) || !previous.slug ? slugify(name) : previous.slug }));
  };

  const generateVariants = () => {
    if (!values.size.length || !values.color.length) {
      setErrors((previous) => ({ ...previous, variants: "Choose at least one size and one color before generating variants." }));
      return;
    }
    const previous = new Map(variants.map((variant) => [variant.color + "-" + variant.size, variant]));
    const used = new Set(variants.map((variant) => variant.sku));
    const next = values.color.flatMap((color) => values.size.map((size) => {
      const existing = previous.get(color + "-" + size);
      return existing || { id: color + "-" + size, color, size, sku: makeSku(values.name, values.category, color, size, used), stock: 0, threshold: 5 };
    }));
    setVariants(next);
    setErrors((previousErrors) => ({ ...previousErrors, variants: "" }));
  };

  const updateVariant = (id: string, patch: Partial<VariantDraft>) => setVariants((previous) => previous.map((variant) => variant.id === id ? { ...variant, ...patch } : variant));

  const applyBulk = () => setVariants((previous) => previous.map((variant) => ({ ...variant, stock: bulkStock, threshold: bulkThreshold })));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((file) => file.type.startsWith("image/") && file.size <= 8 * 1024 * 1024).slice(0, MAX_IMAGES - images.length);
    const next = valid.map((file, index) => {
      const src = URL.createObjectURL(file);
      objectUrlsRef.current.push(src);
      return { id: "upload-" + Date.now() + "-" + index, src, color: "" as Color | "" };
    });
    if (!next.length) {
      setErrors((previous) => ({ ...previous, images: "Use image files under 8 MB (up to " + MAX_IMAGES + " images)." }));
      return;
    }
    setImages((previous) => [...previous, ...next]);
    setErrors((previous) => ({ ...previous, images: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => setImages((previous) => {
    const removed = previous.find((image) => image.id === id);
    if (removed && removed.src.startsWith("blob:")) URL.revokeObjectURL(removed.src);
    return previous.filter((image) => image.id !== id);
  });

  const moveImage = (from: string, to: string) => setImages((previous) => {
    const fromIndex = previous.findIndex((image) => image.id === from);
    const toIndex = previous.findIndex((image) => image.id === to);
    if (fromIndex < 0 || toIndex < 0) return previous;
    const next = [...previous];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
  });

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (values.tags.includes(tag)) {
      setErrors((previous) => ({ ...previous, tags: "That tag is already included." }));
      return;
    }
    set("tags", [...values.tags, tag]);
    setTagInput("");
    setErrors((previous) => ({ ...previous, tags: "" }));
  };

  const adjustStock = () => {
    const variant = variants.find((item) => item.id === adjustmentVariant);
    if (!variant || !Number.isFinite(adjustment) || adjustment === 0) {
      setErrors((previous) => ({ ...previous, adjustment: "Choose a variant and enter a non-zero adjustment." }));
      return;
    }
    const next = Math.max(0, variant.stock + adjustment);
    updateVariant(variant.id, { stock: next });
    setHistory((previous) => [{ id: "history-" + Date.now(), variantId: variant.id, at: new Date().toLocaleString("en-IN"), reason: adjustmentReason, change: next - variant.stock, previous: variant.stock, next, note: adjustmentNote.trim() }, ...previous]);
    setAdjustment(0);
    setAdjustmentNote("");
    setErrors((previous) => ({ ...previous, adjustment: "" }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = "Product name is required.";
    if (!values.category) nextErrors.category = "Category is required.";
    if (!Number.isFinite(values.price) || values.price < 0) nextErrors.price = "Enter a valid non-negative selling price.";
    if (!Number.isFinite(values.costPrice) || values.costPrice < 0) nextErrors.costPrice = "Enter a valid non-negative cost price.";
    if (!values.description.trim()) nextErrors.description = "Description is required.";
    if (values.weight < 0 || !Number.isFinite(values.weight)) nextErrors.weight = "Weight must be a non-negative number.";
    if ([values.length, values.width, values.height].some((value) => value < 0 || !Number.isFinite(value))) nextErrors.dimensions = "Dimensions must be non-negative numbers.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug || slugify(values.name))) nextErrors.slug = "Use lowercase letters, numbers, and hyphens only.";
    if (!images.length) nextErrors.images = "Add at least one product image.";
    if (values.size.length || values.color.length) {
      if (!values.size.length || !values.color.length) nextErrors.variants = "Select at least one size and color.";
      if (!variants.length) nextErrors.variants = "Generate variants before saving.";
      const skuSet = new Set<string>();
      variants.forEach((variant) => {
        if (!variant.sku.trim() || skuSet.has(variant.sku)) nextErrors.variants = "Every variant needs a unique SKU.";
        if (variant.stock < 0 || variant.threshold < 0) nextErrors.variants = "Stock and low-stock thresholds cannot be negative.";
        skuSet.add(variant.sku);
      });
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      slug: values.slug || slugify(values.name),
      description: values.description.trim(),
      images: images.map((image) => image.src),
      image: images[0].src,
      status: productState === "active" ? "active" : "inactive",
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={duplicate ? "Duplicate product" : initial ? "Edit product" : "Add product"} maxWidth="xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <Section title="Product">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Name" error={errors.name}><input value={values.name} onChange={(event) => handleNameChange(event.target.value)} maxLength={80} className={inputClass} placeholder="Ivory Oversized Tee" /></FormField>
            <FormField label="Category" error={errors.category}><select value={values.category} onChange={(event) => isCategory(event.target.value, effectiveCategories) && set("category", event.target.value)} className={selectClass}>{effectiveCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></FormField>
          </div>
          <FormField label="Description" error={errors.description}><textarea value={values.description} onChange={(event) => set("description", event.target.value)} maxLength={600} className={textareaClass} placeholder="Fabric, fit, feel — in a sentence or two." /></FormField>
          <div className="rounded-2xl border border-line bg-ink-2/40 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.3fr_1fr]">
              <FormField label="Product lifecycle" hint="Draft and archived products are always hidden. Active products can be shown on the storefront."><div className="grid grid-cols-3 gap-2">{(["draft", "active", "archived"] as ProductState[]).map((state) => <button key={state} type="button" onClick={() => setProductState(state)} className={productState === state ? "rounded-full border border-gold bg-gold/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold" : "rounded-full border border-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-muted"}>{state}</button>)}</div></FormField>
              <div className="flex flex-col gap-2"><Toggle label="Show on storefront" checked={values.showOnStorefront} onChange={(value) => set("showOnStorefront", value)} disabled={productState !== "active"} /><p className="text-[11px] leading-relaxed text-paper-muted">{productState === "active" ? "Turn this off to keep an active product out of the storefront." : "Visibility becomes available when the product is Active."}</p></div>
            </div>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Cost price (₹)" error={errors.costPrice}><input type="number" min={0} value={values.costPrice || ""} placeholder="Enter cost price" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("costPrice", event.target.value)} className={inputClass} /></FormField>
            <FormField label="Selling price (₹)" error={errors.price}><input type="number" min={0} value={values.price || ""} placeholder="Enter selling price" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("price", event.target.value)} className={inputClass} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-ink-2/50 p-4">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">Profit</p><p className="mt-1 text-lg font-semibold text-gold">₹{profit.toLocaleString("en-IN")}</p></div>
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">Margin</p><p className="mt-1 text-lg font-semibold text-gold">{margin.toFixed(2)}%</p></div>
          </div>
          {values.price < values.costPrice ? <p className="rounded-xl border border-[#B3261E]/40 bg-[#B3261E]/10 px-3 py-2 text-[12px] text-[#B3261E]">Selling price is lower than cost price.</p> : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Toggle label="Tax enabled" checked={values.taxEnabled} onChange={(value) => set("taxEnabled", value)} />
            <FormField label="GST rate"><select disabled={!values.taxEnabled} value={values.gstRate} onChange={(event) => set("gstRate", numeric(event.target.value))} className={values.taxEnabled ? selectClass : selectClass + " cursor-not-allowed bg-ink-3 text-paper-muted"}><option value={0}>Select GST rate</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option></select></FormField>
            <Toggle label="Price includes GST" checked={values.priceIncludesTax} onChange={(value) => set("priceIncludesTax", value)} />
          </div>
        </Section>

        <Section title="Variants & inventory">
          <FormField label="Sizes" error={errors.variants}><MultiSelectChips options={SIZE_OPTIONS} value={values.size} onChange={(value) => set("size", value)} /></FormField>
          <FormField label="Colors"><MultiSelectChips options={COLOR_OPTIONS} value={values.color} onChange={(value) => set("color", value)} /></FormField>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-ink-2/50 p-4">
            <p className="text-[13px] text-paper-muted">Create all selected color and size combinations automatically.</p>
            <Button type="button" size="sm" variant="primary" onClick={generateVariants}>Generate variants</Button>
          </div>
          {variants.length ? <>
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-ink-2/40 p-4 sm:grid-cols-[1fr_1fr_auto]">
              <FormField label="Stock for all"><input type="number" min={0} value={bulkStock || ""} placeholder="Stock" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setBulkStock(numeric(event.target.value))} className={inputClass} /></FormField>
              <FormField label="Low-stock threshold"><input type="number" min={0} value={bulkThreshold || ""} placeholder="Threshold" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setBulkThreshold(numeric(event.target.value))} className={inputClass} /></FormField>
              <Button type="button" size="sm" variant="dark" onClick={applyBulk} className="self-end">Apply to all</Button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-line"><table className="min-w-[680px] w-full text-left text-[12px]"><thead className="bg-ink-2/70 text-[10px] uppercase tracking-[0.14em] text-paper-muted"><tr><th className="px-3 py-3">Color</th><th className="px-3 py-3">Size</th><th className="px-3 py-3">SKU</th><th className="px-3 py-3">Stock</th><th className="px-3 py-3">Low stock</th><th className="px-3 py-3">State</th></tr></thead><tbody className="divide-y divide-line">{variants.map((variant) => <tr key={variant.id}><td className="px-3 py-2 text-paper">{variant.color}</td><td className="px-3 py-2 text-paper">{variant.size}</td><td className="px-3 py-2"><input value={variant.sku} onChange={(event) => updateVariant(variant.id, { sku: event.target.value.toUpperCase() })} className="w-40 rounded-lg border border-line bg-ink px-2 py-1.5 text-paper focus:border-gold focus:outline-none" /></td><td className="px-3 py-2"><input type="number" min={0} value={variant.stock} onKeyDown={preventInvalidNumberKeys} onChange={(event) => updateVariant(variant.id, { stock: numeric(event.target.value) })} className="w-20 rounded-lg border border-line bg-ink px-2 py-1.5 text-paper focus:border-gold focus:outline-none" /></td><td className="px-3 py-2"><input type="number" min={0} value={variant.threshold} onKeyDown={preventInvalidNumberKeys} onChange={(event) => updateVariant(variant.id, { threshold: numeric(event.target.value) })} className="w-20 rounded-lg border border-line bg-ink px-2 py-1.5 text-paper focus:border-gold focus:outline-none" /></td><td className="px-3 py-2">{variant.stock <= variant.threshold ? <span className="rounded-full bg-[#B3261E]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#B3261E]">Low stock</span> : <span className="rounded-full bg-[#16A34A]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#16A34A]">Healthy</span>}</td></tr>)}</tbody></table></div>
            <div className="rounded-2xl border border-line bg-ink-2/40 p-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Inventory adjustment</h4>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"><FormField label="Variant"><select value={adjustmentVariant} onChange={(event) => setAdjustmentVariant(event.target.value)} className={selectClass}><option value="">Choose a variant</option>{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.color} / {variant.size} · {variant.stock} in stock</option>)}</select></FormField><FormField label="Adjustment"><input type="number" value={adjustment} onChange={(event) => setAdjustment(Number(event.target.value) || 0)} className={inputClass} placeholder="+10 or -2" /></FormField><FormField label="Reason"><select value={adjustmentReason} onChange={(event) => setAdjustmentReason(event.target.value)} className={selectClass}>{ADJUSTMENT_REASONS.map((reason) => <option key={reason}>{reason}</option>)}</select></FormField><FormField label="Note"><input value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} className={inputClass} placeholder="Optional note" /></FormField></div>
              {errors.adjustment ? <p className="mt-2 text-[12px] text-[#B3261E]">{errors.adjustment}</p> : null}
              <div className="mt-3 flex justify-end"><Button type="button" size="sm" variant="dark" onClick={adjustStock}>Adjust stock</Button></div>
            </div>
            {history.length ? <div className="overflow-x-auto rounded-2xl border border-line"><table className="min-w-[640px] w-full text-left text-[12px]"><thead className="bg-ink-2/70 text-[10px] uppercase tracking-[0.14em] text-paper-muted"><tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Reason</th><th className="px-3 py-3">Change</th><th className="px-3 py-3">Stock</th><th className="px-3 py-3">Note</th></tr></thead><tbody className="divide-y divide-line">{history.map((entry) => <tr key={entry.id}><td className="px-3 py-2 text-paper-muted">{entry.at}</td><td className="px-3 py-2 text-paper">{entry.reason}</td><td className={entry.change >= 0 ? "px-3 py-2 text-[#16A34A]" : "px-3 py-2 text-[#B3261E]"}>{entry.change >= 0 ? "+" : ""}{entry.change}</td><td className="px-3 py-2 text-paper">{entry.previous} → {entry.next}</td><td className="px-3 py-2 text-paper-muted">{entry.note || "—"}</td></tr>)}</tbody></table></div> : null}
          </> : null}
        </Section>

        <Section title="Media">
          <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files); }} className="rounded-2xl border border-dashed border-line bg-ink-2/40 p-4">
            <label htmlFor="product-images-upload" className="flex cursor-pointer items-center justify-between gap-3 text-[13px] text-paper-muted"><span><span className="font-semibold text-paper">Click to upload</span> or drop image files here</span><span className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">Browse</span></label>
            <input ref={fileInputRef} id="product-images-upload" type="file" accept="image/*" multiple className="sr-only" onChange={(event) => handleFiles(event.target.files)} />
          </div>
          {errors.images ? <p className="text-[12px] text-[#B3261E]">{errors.images}</p> : null}
          {images.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image, index) => <div key={image.id} draggable onDragStart={() => setDraggedImage(image.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedImage) moveImage(draggedImage, image.id); setDraggedImage(null); }} className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-ink-2"><Image src={image.src} alt={"Product image " + (index + 1)} fill sizes="160px" className="object-cover" unoptimized={image.src.startsWith("blob:")} /><div className="absolute inset-x-1 bottom-1 flex gap-1"><select aria-label="Assign image color" value={image.color} onChange={(event) => setImages((previous) => previous.map((item) => item.id === image.id ? { ...item, color: event.target.value as Color | "" } : item))} className="min-w-0 flex-1 rounded-lg bg-ink/85 px-1 py-1 text-[10px] text-paper"><option value="">All colors</option>{values.color.map((color) => <option key={color}>{color}</option>)}</select></div>{index === 0 ? <span className="absolute left-1 top-1 rounded-full bg-gold px-2 py-1 text-[9px] font-semibold uppercase text-white">Primary</span> : <button type="button" onClick={() => moveImage(image.id, images[0].id)} className="absolute left-1 top-1 rounded-full bg-ink/80 px-2 py-1 text-[9px] font-semibold uppercase text-paper">Set primary</button>}<button type="button" onClick={() => removeImage(image.id)} className="absolute right-1 top-1 h-7 w-7 rounded-full bg-ink/85 text-paper hover:text-[#B3261E]" aria-label="Remove image">×</button></div>)}</div> : null}
        </Section>

        <Section title="Organization">
          <div className="rounded-2xl border border-line bg-ink-2/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">Collections</p>
            <p className="mt-1 text-[12px] text-paper-muted">Choose one or more collections for this product.</p>
            <div className="mt-3 flex flex-wrap gap-2">{COLLECTIONS.map((collection) => <button key={collection} type="button" onClick={() => set("collections", values.collections.includes(collection) ? values.collections.filter((item) => item !== collection) : [...values.collections, collection])} className={values.collections.includes(collection) ? "rounded-full border border-gold bg-gold/10 px-3.5 py-2 text-[11px] font-semibold text-gold" : "rounded-full border border-line bg-ink px-3.5 py-2 text-[11px] font-semibold text-paper-muted hover:border-gold hover:text-gold"}>{collection}</button>)}</div>
          </div>
          <div className="rounded-2xl border border-line bg-ink-2/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">Tags</p>
            <div className="mt-3 flex gap-2"><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} className={inputClass} placeholder="Add a tag, then press Enter" /><Button type="button" size="sm" variant="dark" onClick={addTag}>Add</Button></div>
            {errors.tags ? <p className="mt-2 text-[12px] text-[#B3261E]">{errors.tags}</p> : null}
            <div className="mt-3 flex min-h-7 flex-wrap gap-2">{values.tags.length ? values.tags.map((tag) => <button key={tag} type="button" onClick={() => set("tags", values.tags.filter((item) => item !== tag))} className="rounded-full border border-gold/50 bg-gold/10 px-3 py-1.5 text-[11px] font-semibold text-gold">{tag} ×</button>) : <span className="text-[12px] text-paper-muted">No tags added yet.</span>}</div>
          </div>
        </Section>

        <Section title="Shipping">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <FormField label="Weight (g)" error={errors.weight}><input type="number" min={0} value={values.weight || ""} placeholder="Weight" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("weight", event.target.value)} className={inputClass} /></FormField>
            <FormField label="Length (in)" error={errors.dimensions}><input type="number" min={0} value={values.length || ""} placeholder="L" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("length", event.target.value)} className={inputClass} /></FormField>
            <FormField label="Width (in)" error={errors.dimensions}><input type="number" min={0} value={values.width || ""} placeholder="W" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("width", event.target.value)} className={inputClass} /></FormField>
            <FormField label="Height (in)" error={errors.dimensions}><input type="number" min={0} value={values.height || ""} placeholder="H" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("height", event.target.value)} className={inputClass} /></FormField>
          </div>
          <p className="text-[12px] text-paper-muted">Package dimensions: L × W × H in inches.</p>
        </Section>

        <Section title="Advanced settings">
          <button type="button" onClick={() => setAdvancedOpen((value) => !value)} aria-expanded={advancedOpen} className="flex w-full items-center justify-between rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left text-[13px] font-medium text-paper"><span>URL handle and search metadata</span><span>{advancedOpen ? "−" : "+"}</span></button>
          {advancedOpen ? <div className="flex flex-col gap-4"><FormField label="URL handle / slug" error={errors.slug}><input value={values.slug} onChange={(event) => set("slug", slugify(event.target.value))} className={inputClass} /></FormField><FormField label="SEO title"><input value={values.seoTitle} onChange={(event) => set("seoTitle", event.target.value)} maxLength={70} className={inputClass} /></FormField><FormField label="SEO description"><textarea value={values.seoDescription} onChange={(event) => set("seoDescription", event.target.value)} maxLength={160} className={textareaClass} /></FormField></div> : null}
        </Section>

        <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t border-line bg-ink/95 px-6 py-4 backdrop-blur">
          <Button variant="dark" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" type="submit">{duplicate ? "Create duplicate" : initial ? "Save changes" : "Create product"}</Button>
        </div>
      </form>
    </Modal>
  );
}
