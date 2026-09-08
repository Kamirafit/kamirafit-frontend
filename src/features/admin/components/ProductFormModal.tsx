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
import { useAdminCategories } from "@/services/admin";
import type { AdminCategory } from "@/types/entities";
import Button from "@/components/ui/Button";
import FormField, { inputClass, selectClass, textareaClass } from "./FormField";
import Modal from "./Modal";
import MultiSelectChips from "./MultiSelectChips";

type ProductState = "draft" | "active" | "archived";
type ImageDraft = { id: string; src: string; color: Color | "" };
type VariantDraft = {
  id: string;
  color: Color;
  size: Size;
  sku: string;
  stock: number;
  threshold: number;
  mrp?: number;
  offerPrice?: number;
  price?: number;
  hsnCode?: string;
  gstPercentage?: number;
  weight?: number;
};
type HistoryEntry = { id: string; variantId: string; at: string; reason: string; change: number; previous: number; next: number; note: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  initial?: Product | null;
  categoryOptions?: string[];
  categories?: AdminCategory[];
  duplicate?: boolean;
};

export type FormValues = {
  name: string;
  price: number;
  costPrice: number;
  mrp: number;
  description: string;
  category: Category;
  categoryId?: string;
  subcategory: string;
  size: Size[];
  color: Color[];
  images: string[];
  imageColorMap?: Record<string, string>;
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
  isFeatured: boolean;
  showOnStorefront: boolean;
  taxEnabled: boolean;
  gstRate: number;
  priceIncludesTax: boolean;
  variants?: Array<{
    id?: string;
    size: Size;
    color: Color;
    sku: string;
    stock: number;
    threshold?: number;
    mrp: number;
    offerPrice: number;
    price?: number;
    hsnCode?: string;
    gstPercentage?: number;
    weight?: number;
  }>;
};

const ADJUSTMENT_REASONS = ["Stock received", "Damaged", "Returned", "Manual adjustment", "Lost", "Order cancellation", "Stock correction"];
const MAX_IMAGES = 8;

const SUBCATEGORY_MAP: Record<string, string[]> = {
  "T-Shirts": ["Oversized T-Shirts", "Regular Fit", "Graphic Print", "Polo T-Shirts"],
  "Oversized T-Shirts": ["Heavyweight", "Vintage Wash", "Drop Shoulder", "Printed"],
  "Kurti": ["Straight Kurti", "Anarkali", "Short Kurti", "A-Line"],
  "Co-ords Sets": ["Printed Sets", "Casual Co-ords", "Lounge Sets"],
  "Dresses": ["Maxi Dress", "Midi Dress", "Bodycon", "A-Line"],
  "Hoodies": ["Pullover", "Zip-Up", "Oversized"],
};

const EMPTY: FormValues = {
  name: "",
  price: 0,
  costPrice: 0,
  mrp: 0,
  description: "",
  category: "T-Shirts",
  subcategory: "",
  size: [],
  color: [],
  images: [],
  imageColorMap: {},
  image: "",
  status: "inactive",
  tags: [],
  collections: [],
  isFeatured: false,
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
  const safeSize = String(size).trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
  const base = code(name || category) + "-" + code(category) + "-" + color.slice(0, 3).toUpperCase() + "-" + safeSize;
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

export default function ProductFormModal({ open, onClose, onSubmit, initial, categories: categoriesProp, duplicate = false }: Props) {
  const categoriesQuery = useAdminCategories();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [productState, setProductState] = useState<ProductState>("draft");
  const [customColorInput, setCustomColorInput] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const categoriesList = useMemo(() => {
    if (categoriesProp && categoriesProp.length > 0) return categoriesProp;
    const apiCats = categoriesQuery.data;
    if (apiCats && apiCats.length > 0) return apiCats;
    return (CATEGORY_OPTIONS as readonly string[]).map((name) => ({
      id: name,
      name,
      subcategories: SUBCATEGORY_MAP[name] || ["General", "Regular", "Printed"],
    }));
  }, [categoriesProp, categoriesQuery.data]);

  const selectedCategoryObj = useMemo(
    () => categoriesList.find((c: AdminCategory) => c.name === values.category),
    [categoriesList, values.category]
  );

  const availableSubcategories = useMemo(
    () => selectedCategoryObj?.subcategories ?? (values.category ? (SUBCATEGORY_MAP[values.category] || []) : []),
    [selectedCategoryObj, values.category]
  );

  const handleAddCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
    if (!values.color.includes(formatted)) {
      set("color", [...values.color, formatted]);
    }
    setCustomColorInput("");
  };

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const colorMap = (initial as any).imageColorMap || {};
      const singleProductColor = initial.color && initial.color.length === 1 ? initial.color[0] : "";
      const initialImages = initial.images.map((src, index) => {
        const assignedColor = colorMap[src] || colorMap[String(index)] || "";
        return {
          id: "existing-" + index,
          src,
          color: (assignedColor || singleProductColor) as Color | "",
        };
      });
      const allAssignedColors = Object.values(colorMap).filter(Boolean) as Color[];
      const combinedColors = Array.from(new Set([...(initial.color || []), ...allAssignedColors]));

      const seededVariants = initial.variants.map((variant, index) => ({
        id: variant.id || "variant-" + index,
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        stock: variant.inventory?.available ?? variant.stock ?? 0,
        threshold: 5,
        mrp: variant.mrp || initial.mrp || initial.baseMrp || initial.price,
        offerPrice: (variant as any).offerPrice || variant.price || initial.price,
        price: variant.price || initial.price,
        hsnCode: (variant as any).hsnCode || "61091000",
        gstPercentage: (variant as any).gstPercentage || 12,
        weight: (variant as any).weight || 0.2,
      }));
      setValues({
        ...EMPTY,
        name: duplicate ? initial.name + " Copy" : initial.name,
        price: initial.price,
        costPrice: initial.costPrice ?? 0,
        mrp: initial.mrp || initial.baseMrp || initial.price,
        description: initial.description,
        category: initial.category,
        categoryId: initial.categoryId,
        subcategory: initial.subcategory || "",
        size: initial.size,
        color: combinedColors,
        images: initial.images,
        imageColorMap: colorMap,
        image: initial.image,
        status: initial.status,
        slug: duplicate ? slugify(initial.name + " Copy") : initial.slug,
        isFeatured: Boolean(initial.isFeatured),
      });
      setProductState(productStateFromStatus(initial.status));
      setImages(initialImages);
      setVariants(duplicate ? [] : seededVariants);
      setHistory([]);
    } else {
      setValues({ ...EMPTY, category: "" as Category, subcategory: "" });
      setProductState("draft");
      setImages([]);
      setVariants([]);
      setHistory([]);
    }
    setErrors({});
    setAdvancedOpen(false);
  }, [open, initial, duplicate]);

  useEffect(() => () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((previous) => ({ ...previous, [key]: value }));

  const setNumber = (key: "costPrice" | "mrp" | "price" | "weight" | "length" | "width" | "height", raw: string) => set(key, numeric(raw));

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
      return existing || {
        id: color + "-" + size,
        color,
        size,
        sku: makeSku(values.name, values.category, color, size, used),
        stock: 0,
        threshold: 5,
        mrp: values.mrp || values.price,
        offerPrice: values.price,
        price: values.price,
        hsnCode: "61091000",
        gstPercentage: values.gstRate || 12,
        weight: values.weight || 0.2,
      };
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

    const imageColorMap: Record<string, string> = {};
    images.forEach((img) => {
      if (img.src && img.color) {
        imageColorMap[img.src] = img.color;
      }
    });

    onSubmit({
      ...values,
      name: values.name.trim(),
      slug: values.slug || slugify(values.name),
      description: values.description.trim(),
      costPrice: values.costPrice,
      images: images.map((image) => image.src),
      imageColorMap,
      image: images[0]?.src || "",
      status: productState === "active" ? "active" : "inactive",
      variants: variants.map((v) => ({
        id: v.id.startsWith("variant-") || (v.id.includes("-") && v.id.length < 20) ? undefined : v.id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: v.stock,
        threshold: v.threshold,
        mrp: v.mrp || values.mrp || values.price,
        offerPrice: v.offerPrice || values.price,
        price: values.price,
        hsnCode: v.hsnCode || "61091000",
        gstPercentage: v.gstPercentage || values.gstRate || 12,
        weight: v.weight || values.weight || 0.2,
      })),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={duplicate ? "Duplicate product" : initial ? "Edit product" : "Add product"} maxWidth="xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <Section title="Product">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Name" error={errors.name}><input value={values.name} onChange={(event) => handleNameChange(event.target.value)} maxLength={80} className={inputClass} placeholder="Ivory Oversized Tee" /></FormField>
            <FormField label="Category" error={errors.category}>
              <select
                value={values.category}
                onChange={(event) => {
                  const selectedCatName = event.target.value;
                  const catObj = categoriesList.find((c: AdminCategory) => c.name === selectedCatName || c.id === selectedCatName);
                  setValues((prev) => ({
                    ...prev,
                    category: (catObj?.name || selectedCatName) as Category,
                    categoryId: catObj?.id,
                    subcategory: ""
                  }));
                }}
                className={selectClass}
              >
                <option value="" disabled hidden>Select Category</option>
                {categoriesList.map((category: AdminCategory) => (
                  <option key={category.id || category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Subcategory" error={errors.subcategory}>
              <select
                disabled={!values.category || availableSubcategories.length === 0}
                value={values.subcategory}
                onChange={(event) => set("subcategory", event.target.value)}
                className={!values.category ? selectClass + " cursor-not-allowed bg-ink-3 text-paper-muted opacity-60" : selectClass}
              >
                <option value="" disabled hidden>Select Subcategory</option>
                {availableSubcategories.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Description" error={errors.description}><textarea value={values.description} onChange={(event) => set("description", event.target.value)} maxLength={600} className={textareaClass} placeholder="Fabric, fit, feel — in a sentence or two." /></FormField>
          <div className="rounded-2xl border border-line bg-ink-2/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <FormField label="Product lifecycle" hint="Draft and archived products are hidden. Active products are published to the storefront.">
                <div className="grid grid-cols-3 gap-2 sm:w-80">
                  {(["draft", "active", "archived"] as ProductState[]).map((state) => (
                    <button key={state} type="button" onClick={() => setProductState(state)} className={productState === state ? "rounded-full border border-gold bg-gold/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold" : "rounded-full border border-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-muted"}>
                      {state}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="w-44 pt-1 sm:pt-0">
                <Toggle label="Featured" checked={values.isFeatured} onChange={(value) => set("isFeatured", value)} />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Cost price (₹)" error={errors.costPrice}><input type="number" min={0} value={values.costPrice || ""} placeholder="Enter cost price" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("costPrice", event.target.value)} className={inputClass} /></FormField>
            <FormField label="MRP (₹)" error={errors.mrp}><input type="number" min={0} value={values.mrp || ""} placeholder="Enter MRP" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("mrp", event.target.value)} className={inputClass} /></FormField>
            <FormField label="Selling price (₹)" error={errors.price}><input type="number" min={0} value={values.price || ""} placeholder="Enter selling price" onKeyDown={preventInvalidNumberKeys} onChange={(event) => setNumber("price", event.target.value)} className={inputClass} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-ink-2/50 p-4">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">Profit</p><p className="mt-1 text-lg font-semibold text-gold">₹{profit.toLocaleString("en-IN")}</p></div>
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">Margin</p><p className="mt-1 text-lg font-semibold text-gold">{margin.toFixed(2)}%</p></div>
          </div>
          {values.price < values.costPrice ? <p className="rounded-xl border border-[#B3261E]/40 bg-[#B3261E]/10 px-3 py-2 text-[12px] text-[#B3261E]">Selling price is lower than cost price.</p> : null}
        </Section>

        <Section title="Variants & inventory">
          <FormField label="Sizes" error={errors.variants}><MultiSelectChips options={SIZE_OPTIONS} value={values.size} onChange={(value) => set("size", value)} /></FormField>
          <FormField label="Colors">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([...COLOR_OPTIONS, ...values.color])).map((col) => {
                  const active = values.color.includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => set("color", active ? values.color.filter((c) => c !== col) : [...values.color, col])}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                        active
                          ? "border-gold bg-gold text-ink shadow-[0_6px_18px_-8px_rgba(139,30,45,0.5)]"
                          : "border-line bg-transparent text-paper-muted hover:border-gold hover:text-gold"
                      }`}
                    >
                      <span>{col}</span>
                      {active && !(COLOR_OPTIONS as readonly string[]).includes(col) && (
                        <span className="text-[10px] font-bold ml-1">×</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomColor();
                    }
                  }}
                  className={inputClass}
                  placeholder="Add any custom color (e.g. Olive, Lavender, Mustard)..."
                />
                <Button type="button" size="sm" variant="dark" onClick={handleAddCustomColor}>
                  Add
                </Button>
              </div>
            </div>
          </FormField>
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
          {images.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image, index) => <div key={image.id} draggable onDragStart={() => setDraggedImage(image.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedImage) moveImage(draggedImage, image.id); setDraggedImage(null); }} className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-ink-2"><Image src={image.src} alt={"Product image " + (index + 1)} fill sizes="160px" className="object-cover" unoptimized={image.src.startsWith("blob:")} /><div className="absolute inset-x-1 bottom-1 flex gap-1"><select aria-label="Assign image color" value={image.color} onChange={(event) => { const chosen = event.target.value as Color | ""; setImages((previous) => previous.map((item) => item.id === image.id ? { ...item, color: chosen } : item)); if (chosen && !values.color.includes(chosen)) { set("color", [...values.color, chosen]); } }} className="min-w-0 flex-1 rounded-lg bg-ink/85 px-1 py-1 text-[10px] text-paper"><option value="">All colors</option>{Array.from(new Set([...values.color, ...(image.color ? [image.color] : []), ...variants.map((v) => v.color)])).filter(Boolean).map((color) => <option key={color} value={color}>{color}</option>)}</select></div>{index === 0 ? <span className="absolute left-1 top-1 rounded-full bg-gold px-2 py-1 text-[9px] font-semibold uppercase text-white">Primary</span> : <button type="button" onClick={() => moveImage(image.id, images[0].id)} className="absolute left-1 top-1 rounded-full bg-ink/80 px-2 py-1 text-[9px] font-semibold uppercase text-paper">Set primary</button>}<button type="button" onClick={() => removeImage(image.id)} className="absolute right-1 top-1 h-7 w-7 rounded-full bg-ink/85 text-paper hover:text-[#B3261E]" aria-label="Remove image">×</button></div>)}</div> : null}
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
