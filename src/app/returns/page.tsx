import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Returns & Exchanges | KamiraFit",
  description: "Learn about KamiraFit's 7-day hassle-free return and exchange policy.",
};

export default function ReturnsPolicyPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="border-b border-line pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Customer Satisfaction</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-paper sm:text-4xl">Returns & Exchanges</h1>
          <p className="mt-3 text-sm text-paper-muted">7-Day hassle-free return and size exchange policy</p>
        </div>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-paper-muted">
          <section>
            <h2 className="font-display text-lg font-medium text-paper">1. 7-Day Return Window</h2>
            <p className="mt-3">
              We want you to love your KamiraFit garments. If you are not completely satisfied with the fit or style, you may request a return or size exchange within <strong className="text-paper">7 calendar days</strong> from the date of recorded delivery.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">2. Eligibility Criteria</h2>
            <p className="mt-3">To qualify for a full refund or exchange, items must satisfy the following conditions:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Item must be completely unworn, unwashed, and free from any perfumes, stains, or pet hair.</li>
              <li>All original brand tags, neck labels, and packaging must be intact.</li>
              <li>Free promotional gifts or bundled accessories included in the original order must be returned together.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">3. Reverse Pickup & Quality Check</h2>
            <p className="mt-3">
              Once your return request is logged, our logistics partner will arrange a complimentary doorstep reverse pickup within 3-4 business days. Once the parcel reaches our warehouse, our quality audit team inspects the garment within 48 hours.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">4. Refund Processing</h2>
            <p className="mt-3">
              Upon successful quality clearance, the refund is initiated immediately to your original payment source (UPI or direct bank transfer for COD). Bank processing typically reflects within <strong className="text-paper">5 to 7 business days</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">6. How to Initiate a Return</h2>
            <p className="mt-3">
              Log into your KamiraFit Account, navigate to <strong className="text-paper">Orders</strong>, select the relevant item, and click &quot;Request Return / Exchange&quot;.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
