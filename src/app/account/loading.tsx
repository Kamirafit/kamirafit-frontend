import OrderSkeleton from "@/components/skeleton/OrderSkeleton";

export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded bg-ink-4 animate-shimmer" />
        <div className="h-4 w-24 rounded bg-ink-3 animate-shimmer" />
      </div>
      <OrderSkeleton />
    </div>
  );
}
