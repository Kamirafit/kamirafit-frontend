import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | KamiraFit",
  description: "Information about KamiraFit delivery timelines, shipping charges, tracking, and courier partners across India.",
};

export default function ShippingPolicyPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="border-b border-line pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Logistics & Delivery</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-paper sm:text-4xl">Shipping Policy</h1>
          <p className="mt-3 text-sm text-paper-muted">Pan-India delivery details and shipping standards</p>
        </div>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-paper-muted">
          <section>
            <h2 className="font-display text-lg font-medium text-paper">1. Dispatch & Processing Timelines</h2>
            <p className="mt-3">
              Every KamiraFit garment is carefully quality-checked and prepared in our fulfillment center. Orders are typically processed and handed over to our courier partners within <strong className="text-paper">24 to 48 hours</strong> (excluding Sundays and national holidays).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">2. Estimated Delivery Schedules</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-ink-2/40 p-5">
                <h3 className="font-medium text-paper">Metro Cities</h3>
                <p className="mt-2 text-2xl font-semibold text-gold">2 – 4 Days</p>
                <p className="mt-1 text-xs text-paper-muted">Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune.</p>
              </div>

              <div className="rounded-xl border border-line bg-ink-2/40 p-5">
                <h3 className="font-medium text-paper">Rest of India</h3>
                <p className="mt-2 text-2xl font-semibold text-gold">4 – 7 Days</p>
                <p className="mt-1 text-xs text-paper-muted">Tier 2, Tier 3 cities, and regional destinations with direct pin-code connectivity.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">3. Shipping Charges</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong className="text-paper">Prepaid Orders above ₹999:</strong> Free Standard Shipping across India.</li>
              <li><strong className="text-paper">Orders below ₹999:</strong> A nominal flat delivery fee of ₹99 applies at checkout.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">4. Tracking Your Order</h2>
            <p className="mt-3">
              Once your shipment is picked up, an Air Waybill (AWB) tracking number and live tracking link will be sent to your registered email and mobile number via SMS. You can monitor the real-time transit status directly via our carrier tracking portal or through your KamiraFit Account dashboard.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">5. Packaging Integrity</h2>
            <p className="mt-3">
              If your package appears tampered with or damaged upon delivery, please do not accept it from the courier executive and immediately take photographic proof. Contact our support team at <a href="mailto:support@kamirafit.com" className="text-gold hover:underline">support@kamirafit.com</a> within 24 hours.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
