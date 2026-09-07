import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Cookie Policy | KamiraFit",
  description: "Understand how KamiraFit uses cookies and web technologies to ensure a seamless shopping experience.",
};

export default function CookiePolicyPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="border-b border-line pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Browser Technologies</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-paper sm:text-4xl">Cookie Policy</h1>
          <p className="mt-3 text-sm text-paper-muted">Effective Date: September 2026</p>
        </div>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-paper-muted">
          <section>
            <h2 className="font-display text-lg font-medium text-paper">1. What Are Cookies?</h2>
            <p className="mt-3">
              Cookies are compact text files stored on your browser or device when you navigate web applications. They allow websites to remember user sessions, shopping bags, and preference settings over time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">2. Cookies We Utilize</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-line bg-ink-2/40 p-4">
                <h3 className="font-medium text-paper">Essential / Strictly Necessary Cookies</h3>
                <p className="mt-1 text-xs text-paper-muted">
                  Required for core platform operations, such as secure session preservation, shopping bag synchronization across navigation, and CSRF protection.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-ink-2/40 p-4">
                <h3 className="font-medium text-paper">Functional & Preference Cookies</h3>
                <p className="mt-1 text-xs text-paper-muted">
                  Remember your interface preferences (such as size filters or view modes) to deliver a seamless shopping experience.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-ink-2/40 p-4">
                <h3 className="font-medium text-paper">Performance & Analytics</h3>
                <p className="mt-1 text-xs text-paper-muted">
                  Gather aggregated, non-personally identifiable diagnostic metrics to help us optimize load speeds, page rendering, and catalog discovery.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-paper">3. Managing Your Cookies</h2>
            <p className="mt-3">
              You can configure your web browser settings to block or notify you about cookies. Please note that disabling essential cookies may impact your ability to authenticate, save cart items, or complete checkouts.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
