"use client";

import { useState } from "react";
import { useAiAnalyticsQuery } from "@/services/ai";
import type { TimeframeOption } from "@/types/entities/analytics";
import type { AiAnalyticsQueryResponse } from "@/services/ai";

type Props = {
  timeframe: TimeframeOption;
};

const SUGGESTED_QUESTIONS = [
  "How were sales this week?",
  "What should I restock?",
  "Which products are selling fastest?",
  "Which products are not moving?",
  "What changed compared with last month?",
  "What should I pay attention to today?",
];

export default function AiAnalyticsSection({ timeframe }: Props) {
  const queryMutation = useAiAnalyticsQuery();

  const [question, setQuestion] = useState("");
  const [queryResponses, setQueryResponses] = useState<
    Array<{ question: string; data: AiAnalyticsQueryResponse }>
  >([]);

  const handleAsk = async (promptText: string) => {
    const q = promptText.trim();
    if (!q || queryMutation.isPending) return;

    setQuestion("");
    try {
      const res = await queryMutation.mutateAsync({ question: q, timeframe });
      setQueryResponses((prev) => [
        { question: q, data: res },
        ...prev,
      ]);
    } catch {
      setQueryResponses((prev) => [
        {
          question: q,
          data: {
            answer: "Unable to reach the assistant right now. Please verify your connection and try again.",
            groundedFacts: [],
            whatIFound: "Network or assistant request failed.",
            whatThisMeans: "The server could not process the analytics query at this moment.",
            thingsToLookAt: ["Check if your internet connection is active", "Retry the question in a few moments"],
          },
        },
        ...prev,
      ]);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-white/80 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold text-lg font-bold border border-gold/30">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-paper">
                AI Business Assistant
              </h2>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Live Store Data
              </span>
            </div>
            <p className="text-xs text-paper-muted">
              Ask about your store and get answers from your latest data.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Query Assistant Box */}
      <div className="rounded-xl border border-gold/25 bg-gold/[0.04] p-4 sm:p-5 space-y-4">
        <div>
          <label htmlFor="ai-analyst-input" className="text-xs font-bold text-paper flex items-center gap-1.5">
            <span>💬</span> Ask something about your store...
          </label>
          <p className="text-[11px] text-paper-muted mt-0.5">
            Type any question in plain English or click a suggested question below:
          </p>
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(q)}
              disabled={queryMutation.isPending}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-paper hover:text-gold hover:border-gold transition-colors disabled:opacity-40 shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="flex items-center gap-2"
        >
          <input
            id="ai-analyst-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about your store (e.g. Which products are selling fastest?)"
            className="flex-1 rounded-lg border border-line bg-white px-3.5 py-2.5 text-xs text-paper placeholder:text-paper-muted/70 focus:border-gold focus:outline-none transition-colors shadow-sm"
          />
          <button
            type="submit"
            disabled={queryMutation.isPending || !question.trim()}
            className="rounded-lg bg-gold px-4 py-2.5 text-xs font-semibold text-white hover:bg-gold-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {queryMutation.isPending ? (
              <>
                <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              "Ask Assistant"
            )}
          </button>
        </form>

        {/* Structured Answers Feed */}
        {queryResponses.length > 0 && (
          <div className="space-y-4 pt-3 border-t border-line/60">
            {queryResponses.map((item, idx) => {
              const res = item.data;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-line bg-ink-3/90 p-4 space-y-3.5 text-xs animate-in fade-in"
                >
                  {/* User Question */}
                  <div className="flex items-center justify-between border-b border-line/40 pb-2">
                    <span className="font-semibold text-gold flex items-center gap-1.5">
                      <span>You asked:</span> &ldquo;{item.question}&rdquo;
                    </span>
                    <span className="text-[10px] text-paper-muted">Real-time answer</span>
                  </div>

                  {/* Section 1: What I found */}
                  {res.whatIFound ? (
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted flex items-center gap-1">
                        <span>🔍</span> What I found
                      </div>
                      <p className="text-paper/95 leading-relaxed pl-2 border-l-2 border-gold/40">
                        {res.whatIFound}
                      </p>
                    </div>
                  ) : (
                    <p className="text-paper/95 leading-relaxed pl-2 border-l-2 border-gold/40">
                      {res.answer}
                    </p>
                  )}

                  {/* Section 2: Important numbers */}
                  {res.importantNumbers && res.importantNumbers.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted flex items-center gap-1">
                        <span>📊</span> Important numbers
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {res.importantNumbers.map((num, nIdx) => {
                          const parts = num.includes(":") ? num.split(":") : [num, ""];
                          const label = parts[0]?.trim();
                          const val = parts.slice(1).join(":").trim();
                          return (
                            <div
                              key={nIdx}
                              className="rounded-lg border border-line bg-ink-2 p-2.5 flex flex-col justify-between"
                            >
                              <span className="text-[11px] text-paper-muted">{label}</span>
                              {val ? (
                                <span className="font-mono text-sm font-semibold text-paper mt-0.5">
                                  {val}
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 3: What this means */}
                  {res.whatThisMeans && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted flex items-center gap-1">
                        <span>💡</span> What this means
                      </div>
                      <p className="text-paper/90 leading-relaxed text-xs">
                        {res.whatThisMeans}
                      </p>
                    </div>
                  )}

                  {/* Section 4: Things to look at */}
                  {res.thingsToLookAt && res.thingsToLookAt.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted flex items-center gap-1">
                        <span>👀</span> Things to look at
                      </div>
                      <div className="space-y-1 pl-1">
                        {res.thingsToLookAt.map((suggestion, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-paper/85 text-[11.5px]">
                            <span className="text-gold font-bold">•</span>
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounded facts badges if available */}
                  {res.groundedFacts && res.groundedFacts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-line/30">
                      {res.groundedFacts.map((fact, fIdx) => (
                        <span
                          key={fIdx}
                          className="rounded bg-ink-2 px-2 py-0.5 text-[10px] font-mono text-paper-muted border border-line/60"
                        >
                          ✓ {fact}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
