"use client";

import { useState } from "react";
import { useAiAnalyticsInsights, useAiAnalyticsQuery } from "@/services/ai";
import type { TimeframeOption } from "@/types/entities/analytics";

type Props = {
  timeframe: TimeframeOption;
};

const VERDICT_CONFIG = {
  EXCELLENT: {
    label: "Peak Performance",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
  },
  STABLE: {
    label: "Stable Velocity",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/40",
  },
  NEEDS_ATTENTION: {
    label: "Needs Attention",
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/40",
  },
  CRITICAL: {
    label: "Capital Risk",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/40",
  },
};

const SUGGESTED_QUESTIONS = [
  "Which products are losing me money in storage?",
  "What is our top revenue driver and how can we scale it?",
  "How should we liquidate stagnant inventory to recover capital?",
  "Are there any products with urgent stockout risk?",
];

export default function AiAnalyticsSection({ timeframe }: Props) {
  const { data: insights, isLoading, isError, refetch, isFetching } = useAiAnalyticsInsights(timeframe);
  const queryMutation = useAiAnalyticsQuery();

  const [question, setQuestion] = useState("");
  const [queryResponses, setQueryResponses] = useState<
    Array<{ question: string; answer: string; groundedFacts?: string[] }>
  >([]);

  const handleAsk = async (promptText: string) => {
    const q = promptText.trim();
    if (!q || queryMutation.isPending) return;

    setQuestion("");
    try {
      const res = await queryMutation.mutateAsync({ question: q, timeframe });
      setQueryResponses((prev) => [
        { question: q, answer: res.answer, groundedFacts: res.groundedFacts },
        ...prev,
      ]);
    } catch {
      setQueryResponses((prev) => [
        {
          question: q,
          answer: "Unable to complete AI query at this moment. Please check network connection or retry.",
        },
        ...prev,
      ]);
    }
  };

  const verdict = insights?.healthVerdict ? VERDICT_CONFIG[insights.healthVerdict] : VERDICT_CONFIG.STABLE;

  return (
    <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-ink-2 via-ink to-gold/5 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-gold to-amber-500 text-ink shadow-md font-bold text-xl">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold tracking-tight text-paper sm:text-xl">
                Kamira AI Executive Intelligence
              </h2>
              <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                100% Grounded in Real Data
              </span>
            </div>
            <p className="text-xs text-paper-muted">
              Diagnostic business insights, stockout risk evaluations, and capital recovery actions based on verified store transactions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isFetching}
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-ink transition-all disabled:opacity-50"
          >
            {isFetching ? (
              <>
                <span className="h-3 w-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                Analyzing Store Data...
              </>
            ) : (
              <>
                <span>🔄</span> Re-Analyze Metrics
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-6">
          <div className="flex items-center gap-3 text-sm text-gold">
            <span className="h-4 w-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <span>Crunching order velocity, inventory burn rates, and capital distribution...</span>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-40 rounded-2xl border border-line bg-ink-3/40 animate-pulse" />
            <div className="h-40 rounded-2xl border border-line bg-ink-3/40 animate-pulse" />
            <div className="h-40 rounded-2xl border border-line bg-ink-3/40 animate-pulse" />
          </div>
        </div>
      ) : isError || !insights ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-300">
          <p className="font-semibold">AI Business Intelligence currently synchronizing</p>
          <p className="text-xs text-paper-muted mt-1">
            Click &quot;Re-Analyze Metrics&quot; above to re-run the ground-truth intelligence engine on this timeframe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Overview & Health Verdict */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
            <div className="rounded-2xl border border-line/60 bg-ink-2/60 p-5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-paper-muted flex items-center gap-1.5">
                <span>📋</span> Executive Performance Briefing
              </span>
              <p className="text-sm leading-relaxed text-paper/90 whitespace-pre-line font-serif">
                {insights.executiveSummary}
              </p>
            </div>

            {/* Health Score Card */}
            <div className="rounded-2xl border border-line/60 bg-ink-2/60 p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-paper-muted">
                  Store Health Score
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-black tracking-tight text-gold">
                    {insights.healthScore}
                  </span>
                  <span className="text-xs text-paper-muted">/ 100</span>
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${verdict.bg} ${verdict.text} ${verdict.border}`}
                >
                  {verdict.label}
                </span>
                <p className="text-[11px] text-paper-muted mt-2">
                  Calculated from sell-through velocity, dead-stock capital ratio, and customer ratings.
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Pillars: Restock Alerts, Dead Stock Capital Recovery, Action Items */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Restock Alerts */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <span>⚠️</span> Inventory Depletion Risks
                  </span>
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    {insights.restockAlerts.length} Products
                  </span>
                </div>
                {insights.restockAlerts.length === 0 ? (
                  <p className="text-xs text-paper-muted pt-2">
                    No critical stockout risks detected. All active products have adequate runway for this timeframe.
                  </p>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {insights.restockAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-amber-500/20 bg-ink-2/80 p-3 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-paper">
                          <span className="truncate max-w-[170px]">{alert.productName}</span>
                          <span className="text-amber-400">
                            {alert.daysOfInventory !== null ? `${alert.daysOfInventory}d runway` : "Low Stock"}
                          </span>
                        </div>
                        <p className="text-[11px] text-paper-muted leading-relaxed">
                          {alert.reasoning}
                        </p>
                        <div className="text-[10.5px] font-medium text-emerald-400 pt-0.5">
                          Suggested PO: +{alert.recommendedRestockUnits} units
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dead Stock Action Plan */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span>❄️</span> Dead-Stock Liquidation
                  </span>
                  <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                    Capital Recovery
                  </span>
                </div>
                {insights.deadStockActionPlan.length === 0 ? (
                  <p className="text-xs text-paper-muted pt-2">
                    Zero dormant dead-stock. Working capital turnover is running at maximum efficiency.
                  </p>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {insights.deadStockActionPlan.map((plan, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-rose-500/20 bg-ink-2/80 p-3 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-paper">
                          <span className="truncate max-w-[160px]">{plan.productName}</span>
                          <span className="text-rose-400 font-mono">
                            ₹{plan.tiedUpCapital.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-paper-muted leading-relaxed">
                          {plan.strategy}
                        </p>
                        <div className="text-[10.5px] font-semibold text-gold pt-0.5">
                          Action: {plan.action} ({plan.recommendedDiscountPercent}% Markdown / Incentive)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Executive Directives */}
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <span>🎯</span> Priority Action Items
                </span>
                <div className="space-y-2 pt-1">
                  {insights.actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-line bg-ink-2/80 p-3 text-xs"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
                        {idx + 1}
                      </span>
                      <p className="text-paper/90 leading-relaxed text-[11.5px]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive AI Business Analyst Query Bar */}
          <div className="rounded-2xl border border-line bg-ink-2/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <span>💬</span> Interactive AI Business Analyst
                </h3>
                <p className="text-[11.5px] text-paper-muted mt-0.5">
                  Ask specific analytical questions about your revenue, inventory, or margins grounded strictly in verified database metrics.
                </p>
              </div>
            </div>

            {/* Suggested quick chips */}
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAsk(q)}
                  disabled={queryMutation.isPending}
                  className="rounded-full border border-line bg-ink-3/60 px-3 py-1 text-[11px] font-medium text-paper-muted hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(question);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your AI Analyst anything about your store numbers (e.g. Which category had the best margins?)"
                className="flex-1 rounded-xl border border-line bg-ink-3 px-4 py-2.5 text-xs text-paper placeholder:text-paper-muted/60 focus:border-gold focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={queryMutation.isPending || !question.trim()}
                className="rounded-xl border border-gold bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-gold/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                {queryMutation.isPending ? (
                  <>
                    <span className="h-3 w-3 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                    Querying Data...
                  </>
                ) : (
                  "Ask Analyst"
                )}
              </button>
            </form>

            {/* Query responses feed */}
            {queryResponses.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-line/50">
                {queryResponses.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-line bg-ink p-4 space-y-2 text-xs animate-in fade-in duration-200">
                    <p className="font-semibold text-gold flex items-center gap-1.5">
                      <span>Q:</span> {item.question}
                    </p>
                    <p className="text-paper/90 leading-relaxed whitespace-pre-line pl-4 border-l-2 border-gold/40">
                      {item.answer}
                    </p>
                    {item.groundedFacts && item.groundedFacts.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 pl-4">
                        {item.groundedFacts.map((fact, fIdx) => (
                          <span
                            key={fIdx}
                            className="rounded-md bg-ink-2 px-2 py-0.5 text-[10px] font-mono text-paper-muted border border-line"
                          >
                            ✓ {fact}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
