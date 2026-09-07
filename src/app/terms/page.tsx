import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service | KamiraFit",
  description: "Terms and conditions governing the purchase and use of KamiraFit products and services.",
};

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="border-b border-line pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Legal Agreement</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-paper sm:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-paper-muted">Effective Date: September 2026</p>
        </div>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-paper-muted">
          <section>
            <h2 className="font-display text-lg font-medium text-paper">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing, browsing, or placing an order on the KamiraFit website (kamirafit.com), you agree to be bound by these Terms of Service, along with our Privacy Policy, Shipping Policy, and Return Policy. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">2. Eligibility & Account Responsibilities</h2>
            <p className="mt-3">
              You must be at least 18 years of age or accessing under the supervision of a parent or legal guardian. When creating an account or placing an order, you agree to provide authentic, current, and complete details. You are responsible for safeguarding your login credentials and one-time verification tokens.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">3. Product Descriptions & Pricing</h2>
            <p className="mt-3">
              We strive to display the colors, fabrics, and fit of our garments as accurately as possible. However, individual screen calibration may subtly alter apparent coloration. All prices are listed in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless specified otherwise. We reserve the right to correct typographical pricing errors before order fulfillment.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">4. Order Confirmation & Fulfillment</h2>
            <p className="mt-3">
              Receipt of an order confirmation email indicates receipt of your order request, not acceptance of your order. KamiraFit reserves the right to accept or decline orders due to stock unavailability, pricing inaccuracies, or unauthorized/fraudulent payment suspicion. In any such cancellation, any deducted funds will be refunded promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">5. Intellectual Property</h2>
            <p className="mt-3">
              All visual trademarks, brand signatures, graphics, imagery, custom garment designs, and web assets are the proprietary intellectual property of KamiraFit. Unauthorized reproduction, modification, or commercial exploitation is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">6. Governing Law & Jurisdiction</h2>
            <p className="mt-3">
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms or transactions shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra, India.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
