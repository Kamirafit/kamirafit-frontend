"use client";

import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CalculationRulesModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How Inventory & Dead Stock Are Calculated"
      maxWidth="lg"
    >
      <div className="space-y-6 text-paper text-xs sm:text-sm">
        {/* Intro */}
        <div className="rounded-xl border border-line bg-ink-2/60 p-4">
          <p className="text-paper-muted leading-relaxed">
            Every metric and alert in your dashboard is calculated using grounded, predictable business rules designed for fashion retail. Below is an easy-to-read breakdown of how each calculation works.
          </p>
        </div>

        {/* 1. STOCK RUNS OUT IN */}
        <div className="rounded-xl border border-line bg-white/70 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🕒</span>
            <h4 className="font-bold text-sm text-paper">
              1. &ldquo;Stock Runs Out In&rdquo; (Inventory Runway)
            </h4>
          </div>
          <p className="text-paper-muted leading-relaxed">
            Estimates how long your current inventory will last based on customer buying habits:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-paper-muted pl-1 leading-relaxed">
            <li>
              <strong className="text-paper">The Formula:</strong> Remaining Stock Units ÷ Units Sold Per Day.
            </li>
            <li>
              <strong className="text-paper">Example:</strong> If 20 units remain and you sell 2 units per day, stock will run out in <span className="font-semibold text-paper">~10 days</span>.
            </li>
            <li>
              <strong className="text-paper">Comfortable Stock:</strong> If you have more than 3 months of inventory runway, it displays <span className="font-semibold text-emerald-800">Plenty in stock (3+ months)</span> rather than an overwhelming 300+ day countdown.
            </li>
            <li>
              <strong className="text-paper">No Sales Yet:</strong> If an item hasn&apos;t started selling yet, it shows <span className="font-semibold text-paper">Not yet selling (Stock intact)</span> so you know the inventory is safe and not depleting.
            </li>
          </ul>
        </div>

        {/* 2. DEAD STOCK & DORMANT INVENTORY */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">❄️</span>
            <h4 className="font-bold text-sm text-rose-950">
              2. Dead Stock &amp; Dormant Inventory Rules
            </h4>
          </div>
          <p className="text-rose-900/90 leading-relaxed">
            To prevent false alarms, products are never unfairly penalized as dead stock:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-rose-950/80 pl-1 leading-relaxed">
            <li>
              <strong className="text-rose-950">Strict 60-Day Rule:</strong> A product is ONLY considered dead stock if it has been published and available for sale for <strong className="text-rose-950">at least 60 days</strong> with zero sales and stock remaining.
            </li>
            <li>
              <strong className="text-rose-950">New Releases Protected:</strong> Items added within the last 14 days are classified as <strong className="text-blue-900">✨ New Releases</strong>. Items in their first month (14–29 days) are <strong className="text-indigo-900">⏳ Gathering Data</strong>. They are NEVER flagged as dead stock.
            </li>
            <li>
              <strong className="text-rose-950">Date Filters Don&apos;t Alter Dead Stock:</strong> Choosing &ldquo;Last 7 Days&rdquo; or &ldquo;All Time&rdquo; changes your sales and revenue numbers—it will never turn a brand new product into dead stock.
            </li>
            <li>
              <strong className="text-rose-950">Long-Term Dead Stock (90+ Days):</strong> Items available for 90 or more continuous days with zero sales are flagged with higher priority so you can plan bundle promotions or clearance strategies.
            </li>
            <li>
              <strong className="text-rose-950">Size/Variant Precision:</strong> Stock health checks each individual size (e.g. XS, S, M, L, XL). If size M sells well but size XL sits idle, only that specific size is flagged—the style is not condemned.
            </li>
          </ul>
        </div>

        {/* 3. RESTOCK ALERTS */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🚨</span>
            <h4 className="font-bold text-sm text-amber-950">
              3. Restock Alerts (Out of Stock vs. Running Low)
            </h4>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-amber-950/80 pl-1 leading-relaxed">
            <li>
              <strong className="text-rose-900">🔴 Out of Stock:</strong> 0 units available in the warehouse. Customers cannot purchase this item.
            </li>
            <li>
              <strong className="text-amber-950">🟠 Running Low:</strong> You have 5 or fewer units left, OR at your current selling speed, all remaining stock will be depleted within the next 14 days.
            </li>
            <li>
              <strong className="text-amber-950">Ordering Buffer:</strong> The system alerts you early enough so you can place supplier reorders before popular garments completely sell out.
            </li>
          </ul>
        </div>

        {/* 4. INVENTORY HEALTH */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🩺</span>
            <h4 className="font-bold text-sm text-emerald-950">
              4. Inventory Health Percentage (e.g. 80%+ Healthy)
            </h4>
          </div>
          <p className="text-emerald-950/80 leading-relaxed">
            Measures the percentage of your store&apos;s products that are well-stocked and ready for customer purchases:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-emerald-950/80 pl-1 leading-relaxed">
            <li>
              <strong className="text-emerald-950">What Counts as Healthy Stock:</strong> Any garment that has plenty of inventory (more than 5 units), is not in danger of running out within 14 days, and is not stagnant dead stock.
            </li>
            <li>
              <strong className="text-emerald-950">New Collections Included:</strong> Newly launched items with stock on hand are fully recognized as healthy stock.
            </li>
            <li>
              <strong className="text-emerald-950">The Goal:</strong> Having enough clothes in stock to satisfy customer orders without running out, while avoiding excess clothes that sit unsold for months.
            </li>
          </ul>
        </div>

        {/* 5. SELLING SPEED */}
        <div className="rounded-xl border border-line bg-white/70 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <h4 className="font-bold text-sm text-paper">
              5. Selling Speed (Sales Velocity)
            </h4>
          </div>
          <p className="text-paper-muted leading-relaxed">
            Explains how quickly customers are purchasing garments in everyday language:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-paper-muted pl-1 leading-relaxed">
            <li>
              <strong className="text-paper">Human Pace:</strong> Instead of confusing fractional numbers like &ldquo;0.14 sales/day&rdquo;, you see simple phrases like <span className="font-semibold text-paper">~1 / week</span> or <span className="font-semibold text-paper">~2 / day</span>.
            </li>
            <li>
              <strong className="text-paper">Unsold Items:</strong> Items without orders during the period clearly show <span className="font-semibold text-paper">No sales yet</span>.
            </li>
          </ul>
        </div>

        {/* 6. RECOMMENDATIONS */}
        <div className="rounded-xl border border-line bg-white/70 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <h4 className="font-bold text-sm text-paper">
              6. Strategic Actions (No Confusing Jargon)
            </h4>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-paper-muted pl-1 leading-relaxed">
            <li>
              <strong className="text-paper">New Products:</strong> Never discount or reduce prices prematurely. Allow customers adequate time to find and purchase new collections.
            </li>
            <li>
              <strong className="text-paper">Stagnant Stock:</strong> Before cutting prices, review photoshoot quality, styling tags, product descriptions, and homepage placement, or test bundle styling.
            </li>
          </ul>
        </div>

        {/* Footer Action */}
        <div className="flex items-center justify-end pt-2 border-t border-line/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gold px-5 py-2 text-xs font-bold text-white hover:bg-gold-bright transition-colors shadow-sm"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
