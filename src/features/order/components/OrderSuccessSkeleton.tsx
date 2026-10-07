"use client";

export default function OrderSuccessSkeleton() {
  return (
    <div className="relative w-full overflow-hidden py-10 md:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-8 md:gap-10 animate-pulse">
      {/* Hero Card Skeleton */}
      <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-14 text-center flex flex-col items-center border border-outline-variant/30 relative">
        <div className="w-20 h-20 rounded-full bg-surface-container mb-6" />
        <div className="h-3 w-40 bg-surface-container rounded-full mb-4" />
        <div className="h-8 w-72 sm:w-96 bg-surface-container rounded-lg mb-4" />
        <div className="h-4 w-60 bg-surface-container rounded-full mb-6" />
        <div className="flex gap-4">
          <div className="h-10 w-36 bg-surface-container rounded-full" />
          <div className="h-10 w-36 bg-surface-container rounded-full" />
        </div>
      </div>

      {/* Two Column Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 h-48 border border-outline-variant/30 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-surface-container rounded-full" />
            <div className="h-6 w-40 bg-surface-container rounded-lg" />
            <div className="h-3 w-48 bg-surface-container rounded-full" />
          </div>
          <div className="h-8 w-full bg-surface-container-low rounded-lg" />
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 h-48 border border-outline-variant/30 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-surface-container rounded-full" />
            <div className="h-6 w-36 bg-surface-container rounded-lg" />
            <div className="h-3 w-44 bg-surface-container rounded-full" />
          </div>
          <div className="h-8 w-full bg-surface-container-low rounded-lg" />
        </div>
      </div>

      {/* Items Section Skeleton */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="p-6 bg-surface-container-low flex justify-between items-center">
          <div className="h-5 w-48 bg-surface-container rounded-md" />
          <div className="h-3 w-32 bg-surface-container rounded-full" />
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <div className="h-24 bg-surface-container-low rounded-xl" />
          <div className="h-24 bg-surface-container-low rounded-xl" />
          <div className="h-32 bg-surface-container-low/60 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}
