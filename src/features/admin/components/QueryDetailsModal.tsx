"use client";

import { useState } from "react";
import type { ContactQuery } from "@/types/entities";
import Modal from "./Modal";
import ActionButton from "./ActionButton";
import { useUpdateAdminQueryStatus, useDeleteAdminQuery } from "@/services/admin";

interface Props {
  query: ContactQuery | null;
  onClose: () => void;
}

export default function QueryDetailsModal({ query, onClose }: Props) {
  const updateStatusMutation = useUpdateAdminQueryStatus();
  const deleteMutation = useDeleteAdminQuery();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!query) return null;

  const fullName = `${query.firstName} ${query.lastName}`.trim();
  const fullPhone = `${query.countryCode} ${query.phone}`.trim();
  const cleanPhoneDigits = `${query.countryCode}${query.phone}`.replace(/[^\d+]/g, "");

  const handleToggleStatus = async () => {
    const nextStatus = query.status === "RESOLVED" ? "PENDING" : "RESOLVED";
    try {
      await updateStatusMutation.mutateAsync({ id: query.id, status: nextStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(query.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete query:", err);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(query.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(query.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      open={Boolean(query)}
      title="Customer Inquiry Details"
      onClose={onClose}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6">
        {/* Header Profile Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-line bg-ink-2/60 p-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-lg font-bold text-gold ring-1 ring-gold/30">
              {query.firstName[0]?.toUpperCase() || "C"}
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-paper">
                {fullName}
              </h3>
              <p className="text-xs text-paper-muted">Received on {formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                query.status === "RESOLVED"
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  query.status === "RESOLVED" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                }`}
              />
              {query.status}
            </span>

            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={updateStatusMutation.isPending}
              className="rounded-full border border-line bg-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-paper hover:border-gold hover:text-gold transition-colors"
            >
              {query.status === "RESOLVED" ? "Mark Pending" : "Mark Resolved"}
            </button>
          </div>
        </div>

        {/* Contact Information & Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-line bg-ink-2/40 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-paper-muted">
              Email Address
            </span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-medium text-paper break-all">{query.email}</span>
              <a
                href={`mailto:${query.email}?subject=Regarding your KamiraFit inquiry`}
                className="inline-flex shrink-0 items-center gap-1 text-xs text-gold hover:underline ml-2"
              >
                Send Email ↗
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-ink-2/40 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-paper-muted">
              Phone Number
            </span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-medium text-paper">{fullPhone}</span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${cleanPhoneDigits}`}
                  className="inline-flex items-center text-xs text-gold hover:underline"
                >
                  Call ↗
                </a>
                <span className="text-line">•</span>
                <a
                  href={`https://wa.me/${cleanPhoneDigits.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-emerald-400 hover:underline"
                >
                  WhatsApp ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Message */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-paper-muted">
              Inquiry Message
            </span>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-xs text-gold hover:underline transition-colors"
            >
              {copied ? "Copied!" : "Copy Text"}
            </button>
          </div>
          <div className="rounded-xl border border-line bg-ink/90 p-4 text-sm leading-relaxed text-paper whitespace-pre-wrap selection:bg-gold/30">
            {query.message}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-line pt-4 mt-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400">Delete query permanently?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-paper-muted hover:text-paper"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
            >
              Delete Query
            </button>
          )}

          <ActionButton tone="neutral" onClick={onClose}>
            Close
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}
