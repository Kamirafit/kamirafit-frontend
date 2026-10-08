"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";

type Props = {
  images: string[];
  alt: string;
};

function ZoomInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ZoomOutIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});

  // Desktop hover zoom state
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Fullscreen / Mobile zoom modal state
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalZoomed, setModalZoomed] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 50, y: 50 });

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [images]);

  // Lock body scroll while modal is open & keyboard shortcuts
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setModalZoomed(false);
      } else if (e.key === "ArrowLeft") {
        setActive((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setActive((prev) => (prev < images.length - 1 ? prev + 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, images.length]);

  const rawActiveSrc = images[active] ?? images[0];
  const activeValid = getValidImageSrc(rawActiveSrc, DEFAULT_PRODUCT_IMAGE);
  const activeSrc = failedSrcs[activeValid] ? DEFAULT_PRODUCT_IMAGE : activeValid;

  // Touch swipe support in modal
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - (touchStartY.current ?? 0);

    // Only swipe if mostly horizontal swipe and not zoomed
    if (!modalZoomed && Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0 && active < images.length - 1) {
        setActive((prev) => prev + 1);
      } else if (deltaX > 0 && active > 0) {
        setActive((prev) => prev - 1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Container */}
      <div
        ref={mainContainerRef}
        role="button"
        tabIndex={0}
        aria-label="Enlarge product image"
        onClick={() => {
          setIsModalOpen(true);
          setModalZoomed(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") {
            setIsHovered(true);
          }
        }}
        onPointerLeave={() => {
          setIsHovered(false);
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") {
            const rect = e.currentTarget.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomPos({
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y)),
              });
            }
          }
        }}
        className="group relative aspect-[2/3] w-full max-h-[calc(100svh-5.5rem)] overflow-hidden rounded-2xl bg-ink-2 shadow-[0_20px_50px_-25px_rgba(74,14,26,0.12)] border border-line cursor-zoom-in select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {/* Hover-zoomed image layer on Desktop */}
        <div
          className="relative h-full w-full pointer-events-none will-change-transform"
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: isHovered ? "scale(2.25)" : "scale(1)",
            transition: isHovered
              ? "transform 0.08s ease-out"
              : "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <Image
            key={activeSrc}
            src={activeSrc}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            unoptimized={activeSrc.startsWith("data:") || activeSrc.startsWith("blob:")}
            onError={() => {
              setFailedSrcs((prev) => ({ ...prev, [activeValid]: true }));
            }}
            className="object-contain"
          />
        </div>

        {/* Desktop hint badge: fades out when hovering */}
        <div
          className={`hidden md:flex items-center gap-1.5 absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-ink/80 backdrop-blur-md border border-line/70 text-[11px] font-medium text-paper-muted pointer-events-none transition-opacity duration-200 ${
            isHovered ? "opacity-0" : "opacity-90"
          }`}
        >
          <ZoomInIcon className="w-3.5 h-3.5 text-gold" />
          <span>Hover to zoom</span>
        </div>

        {/* Mobile clickable badge: prominent on touch/small screens */}
        <div className="md:hidden absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink/90 backdrop-blur-md border border-gold/40 text-xs font-semibold text-paper shadow-lg pointer-events-none">
          <ZoomInIcon className="w-3.5 h-3.5 text-gold" />
          <span>Tap to zoom</span>
        </div>

        {/* Mobile image counter if multiple images */}
        {images.length > 1 && (
          <div className="md:hidden absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-ink/80 backdrop-blur-md border border-line/60 text-[11px] font-medium text-paper-muted pointer-events-none">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Product images"
          className="grid w-full grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-2.5"
        >
          {images.slice(0, 8).map((src, i) => {
            const selected = i === active;
            const validThumb = getValidImageSrc(src, DEFAULT_PRODUCT_IMAGE);
            const thumbSrc = failedSrcs[validThumb] ? DEFAULT_PRODUCT_IMAGE : validThumb;
            return (
              <button
                key={src + i}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-full overflow-hidden rounded-xl border transition-all duration-200 ${
                  selected
                    ? "border-gold ring-2 ring-gold/40 shadow-sm"
                    : "border-line hover:border-gold/30"
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${alt} thumbnail ${i + 1}`}
                  fill
                  sizes="100px"
                  unoptimized={thumbSrc.startsWith("data:") || thumbSrc.startsWith("blob:")}
                  onError={() => {
                    setFailedSrcs((prev) => ({ ...prev, [validThumb]: true }));
                  }}
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Fullscreen Modal / Lightbox for Mobile & Desktop Click */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} enlarged gallery`}
            className="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/95 backdrop-blur-md select-none animate-fadeIn"
          >
            {/* Top Bar */}
            <div className="relative z-20 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm sm:text-base font-semibold text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
                  {alt}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">
                  {active + 1} / {images.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom toggle button */}
                <button
                  type="button"
                  onClick={() => setModalZoomed((z) => !z)}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-gold/30 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                  aria-label={modalZoomed ? "Zoom out" : "Zoom in"}
                >
                  {modalZoomed ? (
                    <>
                      <ZoomOutIcon className="w-4 h-4 text-gold" />
                      <span className="hidden sm:inline">Zoom Out (1x)</span>
                    </>
                  ) : (
                    <>
                      <ZoomInIcon className="w-4 h-4 text-gold" />
                      <span className="hidden sm:inline">Zoom In (2x)</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalZoomed(false);
                  }}
                  className="rounded-full bg-white/10 p-2 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                  aria-label="Close enlarged view"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Stage */}
            <div
              className={`relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6 ${
                modalZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => setModalZoomed((z) => !z)}
              onPointerMove={(e) => {
                if (modalZoomed) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  if (rect.width > 0 && rect.height > 0) {
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setModalPos({
                      x: Math.max(0, Math.min(100, x)),
                      y: Math.max(0, Math.min(100, y)),
                    });
                  }
                }
              }}
            >
              <div
                className="relative h-full w-full max-w-4xl max-h-[82vh] transition-transform duration-200 ease-out"
                style={{
                  transformOrigin: modalZoomed ? `${modalPos.x}% ${modalPos.y}%` : "center center",
                  transform: modalZoomed ? "scale(2.4)" : "scale(1)",
                }}
              >
                <Image
                  key={activeSrc + "-modal"}
                  src={activeSrc}
                  alt={`${alt} enlarged view`}
                  fill
                  sizes="100vw"
                  priority
                  unoptimized={activeSrc.startsWith("data:") || activeSrc.startsWith("blob:")}
                  className="object-contain pointer-events-none"
                />
              </div>

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    disabled={active === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive((prev) => Math.max(0, prev - 1));
                    }}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 hover:bg-black/90 disabled:opacity-20 disabled:pointer-events-none p-3 text-white border border-white/20 shadow-xl transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    disabled={active === images.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive((prev) => Math.min(images.length - 1, prev + 1));
                    }}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 hover:bg-black/90 disabled:opacity-20 disabled:pointer-events-none p-3 text-white border border-white/20 shadow-xl transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Bar: Thumbnails & Interactive Guide */}
            <div className="relative z-20 flex flex-col items-center gap-2 px-4 py-3 sm:py-4 border-t border-white/10 bg-black/60">
              <p className="text-[11px] sm:text-xs text-white/60">
                {modalZoomed
                  ? "Move cursor or finger to explore details • Tap to zoom out"
                  : "Tap or click to zoom in • Swipe left/right to browse"}
              </p>

              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 no-scrollbar">
                  {images.map((src, i) => {
                    const isThumbSelected = i === active;
                    const validT = getValidImageSrc(src, DEFAULT_PRODUCT_IMAGE);
                    const thumbUrl = failedSrcs[validT] ? DEFAULT_PRODUCT_IMAGE : validT;
                    return (
                      <button
                        key={`modal-thumb-${i}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActive(i);
                        }}
                        className={`relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          isThumbSelected
                            ? "border-gold ring-2 ring-gold/40 scale-105"
                            : "border-white/20 opacity-60 hover:opacity-100"
                        }`}
                        aria-label={`View image ${i + 1}`}
                      >
                        <Image
                          src={thumbUrl}
                          alt=""
                          fill
                          sizes="56px"
                          unoptimized={thumbUrl.startsWith("data:") || thumbUrl.startsWith("blob:")}
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

