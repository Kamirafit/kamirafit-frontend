import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Size Guide | KamiraFit",
  description: "Accurate garment dimensions and sizing charts for KamiraFit oversized tees, regular essentials, and hoodies.",
};

export default function SizeGuidePage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="border-b border-line pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Fit & Measurements</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-paper sm:text-4xl">Size Guide</h1>
          <p className="mt-3 text-sm text-paper-muted">Find your ideal fit across our streetwear and luxury essentials collection.</p>
        </div>

        <div className="mt-10 space-y-12 text-sm leading-relaxed text-paper-muted">
          {/* Section 1: Oversized T-Shirts */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium text-paper">Oversized T-Shirts (Drop Shoulder)</h2>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold">Relaxed Boxy Silhouette</span>
            </div>
            <p className="mt-2 text-xs text-paper-muted">All dimensions in inches (tolerance +/- 0.5&quot;). Designed with an intentional loose, dropped-shoulder aesthetic.</p>
            
            <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-ink-2/30">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-line bg-ink-2/60 text-paper font-semibold">
                  <tr>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Chest (in)</th>
                    <th className="px-4 py-3">Length (in)</th>
                    <th className="px-4 py-3">Shoulder (in)</th>
                    <th className="px-4 py-3">Sleeve (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">S</td>
                    <td className="px-4 py-3">42</td>
                    <td className="px-4 py-3">28</td>
                    <td className="px-4 py-3">20.5</td>
                    <td className="px-4 py-3">8.5</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">M</td>
                    <td className="px-4 py-3">44</td>
                    <td className="px-4 py-3">29</td>
                    <td className="px-4 py-3">21.5</td>
                    <td className="px-4 py-3">9.0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">L</td>
                    <td className="px-4 py-3">46</td>
                    <td className="px-4 py-3">30</td>
                    <td className="px-4 py-3">22.5</td>
                    <td className="px-4 py-3">9.5</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">XL</td>
                    <td className="px-4 py-3">48</td>
                    <td className="px-4 py-3">31</td>
                    <td className="px-4 py-3">23.5</td>
                    <td className="px-4 py-3">10.0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">XXL</td>
                    <td className="px-4 py-3">50</td>
                    <td className="px-4 py-3">32</td>
                    <td className="px-4 py-3">24.5</td>
                    <td className="px-4 py-3">10.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Regular Fit T-Shirts */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium text-paper">Regular Fit Essentials</h2>
              <span className="rounded-full border border-line bg-ink-2/60 px-3 py-1 text-xs text-paper-muted">Classic Tailored Cut</span>
            </div>
            <p className="mt-2 text-xs text-paper-muted">Tailored silhouette through the torso and sleeves. True to size.</p>
            
            <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-ink-2/30">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-line bg-ink-2/60 text-paper font-semibold">
                  <tr>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Chest (in)</th>
                    <th className="px-4 py-3">Length (in)</th>
                    <th className="px-4 py-3">Shoulder (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">S</td>
                    <td className="px-4 py-3">38</td>
                    <td className="px-4 py-3">27</td>
                    <td className="px-4 py-3">17.0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">M</td>
                    <td className="px-4 py-3">40</td>
                    <td className="px-4 py-3">28</td>
                    <td className="px-4 py-3">18.0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">L</td>
                    <td className="px-4 py-3">42</td>
                    <td className="px-4 py-3">29</td>
                    <td className="px-4 py-3">19.0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">XL</td>
                    <td className="px-4 py-3">44</td>
                    <td className="px-4 py-3">30</td>
                    <td className="px-4 py-3">20.0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-paper">XXL</td>
                    <td className="px-4 py-3">46</td>
                    <td className="px-4 py-3">31</td>
                    <td className="px-4 py-3">21.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: How to Measure */}
          <section className="rounded-2xl border border-line bg-ink-2/40 p-6 sm:p-8">
            <h2 className="font-display text-lg font-medium text-paper">How to Measure</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold">1. Chest</h3>
                <p className="mt-1 text-xs text-paper-muted">Measure around the fullest part of your chest under your arms, keeping the tape horizontal.</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold">2. Length</h3>
                <p className="mt-1 text-xs text-paper-muted">Measure from the highest point of your shoulder seam down to the bottom hem of the shirt.</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold">3. Shoulder</h3>
                <p className="mt-1 text-xs text-paper-muted">Measure across the upper back from one shoulder point seam straight across to the other.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
