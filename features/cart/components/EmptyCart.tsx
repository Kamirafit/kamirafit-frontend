import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
      <div
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-neutral-500 shadow-sm"
      >
        ⌂
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-neutral-900">
          Your cart is empty
        </h2>
        <p className="max-w-sm text-sm text-neutral-600">
          Looks like you haven&apos;t added anything yet. Explore the collection
          to find your next favorite piece.
        </p>
      </div>
      <Link href="/shop" className={buttonClasses("primary", "md")}>
        Continue shopping
      </Link>
    </div>
  );
}
