import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-line-strong bg-ink-2/60 px-6 py-16 text-center">
      <div
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-ink text-2xl text-gold shadow-[0_10px_30px_-12px_rgba(212,175,55,0.3)]"
      >
        ⌂
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-paper">
          Your cart is empty
        </h2>
        <p className="max-w-sm text-sm text-paper-muted">
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
