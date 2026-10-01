"use client";

import type { InventoryMovement } from "@/types/entities/analytics";

type Props = {
  movements?: InventoryMovement[];
};

export default function RecentMovementsSection({ movements = [] }: Props) {
  if (movements.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-ink-3/40 p-6 text-center text-xs text-paper-muted">
        No recent stock movements recorded yet.
      </div>
    );
  }

  const getBadge = (type: InventoryMovement["type"]) => {
    switch (type) {
      case "SALE":
        return {
          label: "Sale",
          bg: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
          icon: "🛒",
        };
      case "RETURN":
        return {
          label: "Return",
          bg: "bg-blue-100 text-blue-900 border-blue-300 font-bold",
          icon: "↩️",
        };
      case "RESERVATION":
        return {
          label: "Cart Hold",
          bg: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
          icon: "⏳",
        };
      default:
        return {
          label: "Adjustment",
          bg: "bg-ink-3 text-paper border-line font-medium",
          icon: "📦",
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-white/80 overflow-hidden divide-y divide-line/60 shadow-sm">
        {movements.map((item) => {
          const badge = getBadge(item.type);
          const dateStr = new Date(item.timestamp).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-ink-3/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.bg}`}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </span>
                <div>
                  <div className="text-xs font-medium text-paper">
                    {item.productName}
                    {item.variantInfo ? (
                      <span className="text-paper-muted font-normal text-[11px] ml-1.5">
                        ({item.variantInfo})
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[11px] text-paper-muted">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="text-right sm:self-center pl-7 sm:pl-0">
                <span className="text-[11px] text-paper-muted">
                  {dateStr}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
