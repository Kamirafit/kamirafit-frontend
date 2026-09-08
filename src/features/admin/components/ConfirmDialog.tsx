"use client";

import Button from "@/components/ui/Button";
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
  loading?: boolean;
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
  loading = false,
}: Props) {
  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title={title} maxWidth="sm">
      <p className="text-[13.5px] leading-relaxed text-paper-muted">
        {description}
      </p>
      <div className="mt-7 flex items-center justify-end gap-2">
        <Button variant="dark" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={loading}
          disabled={loading}
          onClick={onConfirm}
          className={
            danger
              ? "!bg-[#B3261E] !text-paper !shadow-[0_10px_30px_-12px_rgba(179,38,30,0.55)] hover:!bg-[#92201A] hover:!shadow-[0_14px_40px_-12px_rgba(179,38,30,0.7)]"
              : ""
          }
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
