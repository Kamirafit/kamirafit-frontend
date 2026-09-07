"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Testimonial, CreateTestimonialInput } from "@/types/entities";
import {
  useAdminTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useReorderTestimonials,
} from "@/services/testimonial";
import ActionButton from "../components/ActionButton";
import ConfirmDialog from "../components/ConfirmDialog";
import TestimonialFormModal from "../components/TestimonialFormModal";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import { EmptyState } from "@/components/states";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="opacity-60 group-hover:opacity-100 transition-opacity">
      <circle cx="9" cy="5" r="1.5" />
      <circle cx="15" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="15" cy="19" r="1.5" />
    </svg>
  );
}

function StarIconFilled() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function TestimonialsPage() {
  const { data: serverTestimonials = [], isLoading } = useAdminTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const reorderMutation = useReorderTestimonials();

  // Local list state for instant, lag-free drag-and-drop
  const [items, setItems] = useState<Testimonial[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync server testimonials to local state on initial load or background refetch
  useEffect(() => {
    if (serverTestimonials && serverTestimonials.length > 0) {
      setItems(serverTestimonials);
    }
  }, [serverTestimonials]);

  const deletingItem = deletingId
    ? items.find((t) => t.id === deletingId) ?? null
    : null;

  // ---------------- DRAG AND DROP HANDLERS ----------------
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...items];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    // Update order numbers in local array
    const reorderedItems = updated.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    setItems(reorderedItems);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Auto-save the new sequence to backend
    setSaveStatus("saving");
    const orderedIds = reorderedItems.map((it) => it.id);
    reorderMutation.mutate(orderedIds, {
      onSuccess: () => {
        setSaveStatus("saved");
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
      },
      onError: () => {
        setSaveStatus("idle");
      },
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ---------------- CRUD HANDLERS ----------------
  const handleFormSubmit = async (values: CreateTestimonialInput) => {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    await deleteMutation.mutateAsync(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Social Proof"
        title="Testimonials"
        description="Drag and drop items to reorder how testimonials appear on the storefront. The list auto-saves automatically upon dropping."
        action={
          <div className="flex items-center gap-3">
            {/* Auto-save Status Pill */}
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-medium text-gold animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Auto-saving order...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400 transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Order saved
              </span>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5"
            >
              <PlusIcon />
              Add Testimonial
            </Button>
          </div>
        }
      />

      {isLoading && items.length === 0 ? (
        <AdminTableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="No testimonials found"
          description="Create your first customer testimonial to highlight verified social proof on the website."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add Testimonial
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-3 text-[11px] uppercase tracking-wider text-paper-muted">
            <span>Drag to Reorder · Sequence determines website order</span>
            <span>{items.length} {items.length === 1 ? "entry" : "entries"} (max 10 shown on homepage)</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {items.map((testimonial, index) => {
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={testimonial.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                    isDragging
                      ? "opacity-40 border-gold/70 bg-gold/5 scale-[0.99] shadow-inner"
                      : isOver
                      ? "border-gold bg-ink-2 shadow-[0_0_15px_rgba(212,175,55,0.25)] -translate-y-0.5"
                      : "border-line bg-ink hover:border-line-strong hover:bg-ink-2"
                  }`}
                >
                  {/* Left Grip + Order Badge + Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-paper-muted hover:text-gold transition-colors shrink-0"
                      title="Drag to reorder"
                    >
                      <GripIcon />
                    </div>

                    {/* Order Index Pill */}
                    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-ink-3 px-1.5 text-[11px] font-bold text-paper-muted border border-line shrink-0">
                      #{index + 1}
                    </span>

                    {/* Details */}
                    <div className="flex flex-col min-w-0 flex-1 gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-paper text-[14px]">
                          {testimonial.name}
                        </span>
                        <span className="text-[12px] text-paper-muted">
                          · {testimonial.location}
                        </span>
                        <div className="flex items-center gap-0.5 ml-1">
                          {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                            <StarIconFilled key={i} />
                          ))}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                            testimonial.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-ink-3 text-paper-muted border border-line"
                          }`}
                        >
                          {testimonial.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>

                      <p className="text-[12.5px] leading-relaxed text-paper-muted line-clamp-2 italic">
                        “{testimonial.quote}”
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/60">
                    <ActionButton
                      onClick={() => {
                        setEditing(testimonial);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      onClick={() => setDeletingId(testimonial.id)}
                    >
                      Delete
                    </ActionButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Testimonial Create / Edit Modal */}
      <TestimonialFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleFormSubmit}
        initial={editing}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Testimonial"
        description={`Are you sure you want to delete the testimonial from "${deletingItem?.name || "this customer"}"? This will remove it from the storefront permanently.`}
        confirmLabel="Delete Testimonial"
        danger
      />
    </div>
  );
}
