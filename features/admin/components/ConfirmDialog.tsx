"use client";

import Modal from "./Modal";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  danger = false,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <p className="text-[13.5px] leading-relaxed text-paper-muted">
        {description}
      </p>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line bg-transparent px-4 py-2 text-[12.5px] font-medium text-paper transition-colors hover:bg-ink-2"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white transition-all duration-300 ease-in-out ${
            danger
              ? "bg-[#B3261E] hover:bg-[#92201A] hover:shadow-[0_10px_24px_-10px_rgba(179,38,30,0.55)]"
              : "bg-gold hover:bg-gold-bright hover:shadow-[0_10px_24px_-10px_rgba(74,14,26,0.55)]"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
