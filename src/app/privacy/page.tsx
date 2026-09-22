import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | KamiraFit",
  description: "Learn how KamiraFit collects, protects, and handles your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="border-b border-line pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Legal & Transparency</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-paper sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-paper-muted">Effective Date: September 2026 | Last updated: September 2026</p>
        </div>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-paper-muted">
          <section>
            <h2 className="font-display text-lg font-medium text-paper">1. Overview</h2>
            <p className="mt-3">
              At KamiraFit, we prioritize the confidentiality and integrity of our customers&apos; personal data. This Privacy Policy describes how KamiraFit (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects, processes, and protects your information when you browse our website, create an account, purchase luxury streetwear essentials, or contact our customer care team.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">2. Information We Collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong className="text-paper">Identity & Contact Data:</strong> Name, email address, phone number, shipping address, and billing address.</li>
              <li><strong className="text-paper">Transaction & Payment Data:</strong> Order details, order numbers, transaction dates, and items purchased. Card/banking credentials are processed directly by RBI-authorized payment aggregators (such as Razorpay) and are never stored on KamiraFit servers.</li>
              <li><strong className="text-paper">Technical & Usage Data:</strong> IP address, device type, browser specifications, and browsing interaction metrics through secure analytics cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">3. How We Use Your Information</h2>
            <p className="mt-3">We process your personal information strictly for legitimate operational purposes:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Processing, fulfilling, and dispatching your orders.</li>
              <li>Sending transactional notifications via email/SMS (order confirmations, dispatch alerts, tracking numbers).</li>
              <li>Providing responsive customer support and addressing product inquiries.</li>
              <li>Safeguarding our platform against fraudulent transactions and bot abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">4. Information Sharing & Third Parties</h2>
            <p className="mt-3">
              We never sell or rent your personal data. We share necessary data only with trusted infrastructure providers required to operate our service:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong className="text-paper">Logistics Partners:</strong> Courier aggregators (e.g. Shiprocket, Delhivery, BlueDart) to deliver your parcels.</li>
              <li><strong className="text-paper">Payment Processors:</strong> Tokenized payment transactions via PCI-DSS Level 1 certified gateways.</li>
              <li><strong className="text-paper">Communication Gateways:</strong> Email service providers.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">5. Data Retention & Security</h2>
            <p className="mt-3">
              We employ industry-standard encryption (TLS/HTTPS in transit and AES-256 for sensitive credentials at rest). Financial records and tax invoices are retained in accordance with applicable Indian tax and corporate compliance laws.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">6. Your Rights & Contact</h2>
            <p className="mt-3">
              You have the right to review, update, or request the deletion of your account and personal details. For privacy-related inquiries, please contact our Data Grievance Officer at <a href="mailto:privacy@kamirafit.com" className="text-gold underline underline-offset-4 hover:text-gold/80">support@kamirafit.com</a> or write to us at:
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
