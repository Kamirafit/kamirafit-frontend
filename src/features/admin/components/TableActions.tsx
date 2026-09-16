"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import ActionButton from "./ActionButton";

export type TableAction = {
  label: ReactNode;
  onClick: () => void;
  tone?: "neutral" | "danger" | "warning" | "success";
  icon?: ReactNode;
  disabled?: boolean;
};

type Props = {
  actions: TableAction[];
  align?: "left" | "right";
  className?: string;
};

export default function TableActions({
  actions,
  align = "right",
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownEstimatedHeight = actions.length * 38 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldFlip =
      spaceBelow < dropdownEstimatedHeight && rect.top > dropdownEstimatedHeight;

    if (shouldFlip) {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        right: window.innerWidth - rect.right,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
  }, [actions.length]);

  const toggleOpen = () => {
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click or scroll or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  // If no actions, render nothing
  if (!actions || actions.length === 0) {
    return null;
  }

  // If only 1 action, render the single ActionButton directly
  if (actions.length === 1) {
    const single = actions[0];
    return (
      <div
        className={`flex items-center ${
          align === "right" ? "justify-end" : "justify-start"
        } ${className}`.trim()}
      >
        <ActionButton
          tone={single.tone}
          disabled={single.disabled}
          onClick={single.onClick}
        >
          {single.icon && <span className="mr-1 inline-flex">{single.icon}</span>}
          {single.label}
        </ActionButton>
      </div>
    );
  }

  // If more than 1 action, render 3-dots button with dropdown list
  return (
    <div
      className={`relative inline-flex items-center ${
        align === "right" ? "justify-end" : "justify-start"
      } ${className}`.trim()}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleOpen();
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Available actions"
        className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-gold ${
          isOpen
            ? "border-gold bg-gold/15 text-gold shadow-sm"
            : "border-line bg-surface/60 text-paper-muted hover:border-gold/60 hover:text-paper hover:bg-surface-raised active:scale-95"
        }`}
      >
        {/* 3 Dots Icon (vertical ellipsis) */}
        <svg
          className="h-4 w-4 transition-transform group-hover:scale-110"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {/* Floating Action Menu rendered in Portal to avoid table scroll overflow clipping */}
      {isOpen &&
        mounted &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom:
                coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              right: `${coords.right}px`,
              zIndex: 99999,
            }}
            className="w-48 overflow-hidden rounded-xl border border-line-strong bg-white/98 p-1.5 shadow-[0_16px_36px_rgba(74,14,26,0.12),0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="flex flex-col gap-0.5">
              {actions.map((act, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="menuitem"
                  disabled={act.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    act.onClick();
                  }}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] font-medium tracking-wide transition-all ${
                    act.tone === "danger"
                      ? "text-red-700 hover:bg-red-50 hover:text-red-900"
                      : act.tone === "warning"
                      ? "text-amber-900 hover:bg-amber-100/90 hover:text-amber-950"
                      : act.tone === "success"
                      ? "text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
                      : "text-paper hover:bg-ink-2 hover:text-gold"
                  } ${
                    act.disabled
                      ? "opacity-40 cursor-not-allowed pointer-events-none"
                      : "cursor-pointer"
                  }`}
                >
                  {act.icon && (
                    <span className="shrink-0 text-current transition-transform group-hover:scale-110">
                      {act.icon}
                    </span>
                  )}
                  <span className="truncate">{act.label}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
