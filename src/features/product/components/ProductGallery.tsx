"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import {
  CloseIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./icons";

type Props = {
  images: string[];
  alt: string;
};

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomPan, setZoomPan] = useState({ x: 50, y: 50 });
  const [isMounted, setIsMounted] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [images]);

  // Handle keyboard events (Escape, Left, Right)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomOpen(false);
        setIsZoomedIn(false);
      } else if (e.key === "ArrowLeft") {
        setActive((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setActive((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    },
    [images.length]
  );

  useEffect(() => {
    if (isZoomOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      setIsZoomedIn(false);
      setZoomPan({ x: 50, y: 50 });
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen, handleKeyDown]);

  const rawActiveSrc = images[active] ?? images[0];
  const activeValid = getValidImageSrc(rawActiveSrc, DEFAULT_PRODUCT_IMAGE);
  const activeSrc = failedSrcs[activeValid] ? DEFAULT_PRODUCT_IMAGE : activeValid;

  // Track cursor position for pan when 2x zoomed
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomedIn || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPan({ x, y });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomedIn(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomedIn(false);
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 xl:gap-6 relative items-start w-full">
      {/* Thumbnails (Vertical on md+, Horizontal scroll on mobile) */}
      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Product thumbnails"
          className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[min(620px,calc(100vh-140px))] shrink-0 pb-2 md:pb-0 scrollbar-none"
        >
          {images.slice(0, 8).map((src, i) => {
            const selected = i === active;
            const validThumb = getValidImageSrc(src, DEFAULT_PRODUCT_IMAGE);
            const thumbSrc = failedSrcs[validThumb] ? DEFAULT_PRODUCT_IMAGE : validThumb;

            return (
              <button
                key={`${src}-${i}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActive(i)}
                className={`group relative w-16 h-22 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-surface-container-low transition-all cursor-pointer p-0.5 border ${
                  selected
                    ? "border-primary-container ring-2 ring-primary-container opacity-100 shadow-sm"
                    : "border-outline-variant/30 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${alt} thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  unoptimized={thumbSrc.startsWith("data:") || thumbSrc.startsWith("blob:")}
                  onError={() => {
                    setFailedSrcs((prev) => ({ ...prev, [validThumb]: true }));
                  }}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Main Hero Image */}
      <div className="relative rounded-2xl overflow-hidden bg-surface-container-low/70 border border-outline-variant/20 shadow-sm aspect-[4/5] min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] max-h-[calc(100vh-140px)] w-full flex-1 flex items-center justify-center p-1 sm:p-2 group">
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 700px, (min-width: 1024px) 55vw, 100vw"
          priority
          unoptimized={activeSrc.startsWith("data:") || activeSrc.startsWith("blob:")}
          onError={() => {
            setFailedSrcs((prev) => ({ ...prev, [activeValid]: true }));
          }}
          className="w-full h-full object-contain transition-opacity duration-300 drop-shadow-sm cursor-zoom-in"
          onClick={() => setIsZoomOpen(true)}
        />

        {/* Expand / Zoom Button */}
        <button
          type="button"
          aria-label="Enlarge and inspect product image"
          title="Zoom & inspect details"
          onClick={() => setIsZoomOpen(true)}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary flex items-center justify-center hover:bg-surface-container-lowest transition-all hover:scale-110 shadow-sm hover:shadow-md cursor-pointer z-10 border border-outline-variant/30"
        >
          <ZoomInIcon width={18} height={18} />
        </button>
      </div>

      {/* High-Resolution Fullscreen Portal Lightbox */}
      {isMounted && isZoomOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} enlarged view`}
          className="fixed inset-0 z-[99999] flex flex-col bg-[#140205]/95 backdrop-blur-xl text-white select-none animate-in fade-in duration-200"
          onClick={() => {
            setIsZoomOpen(false);
            setIsZoomedIn(false);
          }}
        >
          {/* Top Control Bar */}
          <div
            className="w-full h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between border-b border-white/10 z-30 bg-black/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title / Counter */}
            <div className="flex items-center gap-3">
              <span className="font-serif text-sm sm:text-base font-medium text-white/90 line-clamp-1 max-w-xs sm:max-w-md">
                {alt}
              </span>
              {images.length > 1 && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                  {active + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Actions: Zoom Toggle + Close */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsZoomedIn((prev) => !prev)}
                aria-label={isZoomedIn ? "Reset zoom" : "Zoom in 2x"}
                title={isZoomedIn ? "Click to reset view" : "Click to zoom 2x"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 transition-colors cursor-pointer"
              >
                {isZoomedIn ? (
                  <>
                    <ZoomOutIcon width={16} height={16} />
                    <span className="hidden sm:inline">1x</span>
                  </>
                ) : (
                  <>
                    <ZoomInIcon width={16} height={16} />
                    <span className="hidden sm:inline">2x</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsZoomOpen(false);
                  setIsZoomedIn(false);
                }}
                aria-label="Close enlarged preview (Esc)"
                title="Close (Esc)"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-105"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
          </div>

          {/* Main Visual Stage */}
          <div
            className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-6"
            onClick={() => {
              setIsZoomOpen(false);
              setIsZoomedIn(false);
            }}
          >
            {/* Previous Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 cursor-pointer z-30"
              >
                <ChevronLeftIcon width={22} height={22} />
              </button>
            )}

            {/* Next Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 cursor-pointer z-30"
              >
                <ChevronRightIcon width={22} height={22} />
              </button>
            )}

            {/* Image Container with Zoom & Pan */}
            <div
              ref={imageContainerRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomedIn((prev) => !prev);
              }}
              onMouseMove={handleMouseMove}
              className={`relative max-w-5xl w-full h-full max-h-[82vh] overflow-hidden flex items-center justify-center transition-all ${
                isZoomedIn ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
            >
              <div
                className="relative w-full h-full transition-transform duration-200 ease-out flex items-center justify-center"
                style={
                  isZoomedIn
                    ? {
                        transform: `scale(2.2)`,
                        transformOrigin: `${zoomPan.x}% ${zoomPan.y}%`,
                      }
                    : {
                        transform: "scale(1)",
                        transformOrigin: "center center",
                      }
                }
              >
                <Image
                  src={activeSrc}
                  alt={alt}
                  fill
                  sizes="1600px"
                  unoptimized={activeSrc.startsWith("data:") || activeSrc.startsWith("blob:")}
                  className="object-contain drop-shadow-2xl select-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Thumbnails Rail (if multiple images) */}
          {images.length > 1 && (
            <div
              className="w-full py-3 px-4 flex items-center justify-center gap-2.5 overflow-x-auto border-t border-white/10 bg-black/30 z-30 scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, idx) => {
                const isSelected = idx === active;
                const valid = getValidImageSrc(src, DEFAULT_PRODUCT_IMAGE);
                const thumb = failedSrcs[valid] ? DEFAULT_PRODUCT_IMAGE : valid;
                return (
                  <button
                    key={`modal-thumb-${src}-${idx}`}
                    type="button"
                    onClick={() => {
                      setActive(idx);
                      setIsZoomedIn(false);
                    }}
                    aria-label={`Jump to image ${idx + 1}`}
                    className={`relative w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden transition-all cursor-pointer p-0.5 border ${
                      isSelected
                        ? "border-white ring-2 ring-white/60 opacity-100 scale-105"
                        : "border-white/20 opacity-50 hover:opacity-90"
                    }`}
                  >
                    <Image
                      src={thumb}
                      alt={`${alt} view ${idx + 1}`}
                      fill
                      sizes="60px"
                      className="object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
