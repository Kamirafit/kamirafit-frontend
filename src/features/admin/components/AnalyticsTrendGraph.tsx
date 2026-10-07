"use client";

import React, { useId, useMemo, useState } from "react";
import type {
  AnalyticsTimelinePoint,
  AnalyticsTrends,
  TimeframeOption,
} from "@/types/entities/analytics";

interface AnalyticsTrendGraphProps {
  timeline?: AnalyticsTimelinePoint[];
  trends?: AnalyticsTrends;
  timeframe: TimeframeOption;
  totalRevenue: number;
  totalUnits: number;
  totalOrders: number;
  averageOrderValue: number;
}

type MetricKey = "revenue" | "units" | "orders" | "aov";

const METRIC_CONFIG: Record<
  MetricKey,
  {
    label: string;
    unit: string;
    prefix: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    format: (val: number) => string;
  }
> = {
  revenue: {
    label: "Sales",
    unit: "",
    prefix: "₹",
    color: "#8B1E2D", // Kamira Wine
    gradientFrom: "rgba(139, 30, 45, 0.35)",
    gradientTo: "rgba(139, 30, 45, 0.02)",
    format: (v) => `₹${Math.round(v).toLocaleString("en-IN")}`,
  },
  units: {
    label: "Items Sold",
    unit: "items",
    prefix: "",
    color: "#059669", // Rich Emerald
    gradientFrom: "rgba(5, 150, 105, 0.35)",
    gradientTo: "rgba(5, 150, 105, 0.02)",
    format: (v) => `${Math.round(v).toLocaleString("en-IN")} items`,
  },
  orders: {
    label: "Orders",
    unit: "orders",
    prefix: "",
    color: "#D97706", // Amber Bronze
    gradientFrom: "rgba(217, 119, 6, 0.35)",
    gradientTo: "rgba(217, 119, 6, 0.02)",
    format: (v) => `${v} orders`,
  },
  aov: {
    label: "Average Order",
    unit: "",
    prefix: "₹",
    color: "#3B82F6", // Sapphire Blue
    gradientFrom: "rgba(59, 130, 246, 0.35)",
    gradientTo: "rgba(59, 130, 246, 0.02)",
    format: (v) => `₹${Math.round(v).toLocaleString("en-IN")}`,
  },
};

const TIMEFRAME_LABELS: Record<TimeframeOption, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  all: "All Time",
};

export default function AnalyticsTrendGraph({
  timeline = [],
  trends,
  timeframe,
  totalRevenue,
  totalUnits,
  totalOrders,
  averageOrderValue,
}: AnalyticsTrendGraphProps) {
  const gradientId = useId();
  const [activeMetric, setActiveMetric] = useState<MetricKey>("revenue");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const config = METRIC_CONFIG[activeMetric];

  // Default timeline fallback if none provided
  const points = useMemo(() => {
    if (timeline && timeline.length > 0) return timeline;
    // Generate 7-day placeholder points
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0],
      label: `Day ${i + 1}`,
      revenue: 0,
      units: 0,
      orders: 0,
    }));
  }, [timeline]);

  // Extract numerical series for active metric
  const series = useMemo(() => {
    return points.map((p) => {
      if (activeMetric === "revenue") return p.revenue;
      if (activeMetric === "units") return p.units;
      if (activeMetric === "orders") return p.orders;
      if (activeMetric === "aov") return p.orders > 0 ? Math.round(p.revenue / p.orders) : 0;
      return 0;
    });
  }, [points, activeMetric]);

  const rawMax = Math.max(...series, 0);
  // Add 22% headroom above the peak point so peaks never touch the ceiling
  const maxVal = rawMax > 0 ? rawMax * 1.22 : 10;
  const minVal = 0;
  const range = maxVal - minVal || 1;

  // Chart dimensions in SVG coordinate space (Optimized for full card width with zero dead gap)
  const svgWidth = 1000;
  const svgHeight = 220;
  const padLeft = 46;
  const padRight = 14;
  const padTop = 26;
  const padBottom = 30;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Coordinates mapping
  const coords = useMemo(() => {
    return series.map((val, idx) => {
      const x = padLeft + (idx / Math.max(series.length - 1, 1)) * chartWidth;
      const normalized = (val - minVal) / range;
      const y = padTop + (1 - normalized) * chartHeight;
      return { x, y, val, point: points[idx] };
    });
  }, [series, points, padLeft, padTop, chartWidth, chartHeight, range, minVal]);

  // Build smooth bezier curve path
  const { linePath, areaPath } = useMemo(() => {
    if (coords.length === 0) return { linePath: "", areaPath: "" };
    if (coords.length === 1) {
      const p = coords[0];
      return {
        linePath: `M ${p.x} ${p.y}`,
        areaPath: `M ${p.x} ${p.y} L ${p.x} ${padTop + chartHeight} Z`,
      };
    }

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpX = (curr.x + next.x) / 2;
      d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }

    const baselineY = padTop + chartHeight;
    const area = `${d} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`;

    return { linePath: d, areaPath: area };
  }, [coords, padTop, chartHeight]);

  // Y-axis grid lines (4 ticks based on rawMax)
  const yTicks = useMemo(() => {
    const topTickVal = rawMax > 0 ? rawMax : 10;
    const ticks = [0, 0.33, 0.66, 1];
    return ticks.map((pct) => {
      const val = pct * topTickVal;
      const normalized = val / range;
      const y = padTop + (1 - normalized) * chartHeight;
      let label = "";
      if (activeMetric === "revenue" || activeMetric === "aov") {
        label = val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${Math.round(val)}`;
      } else {
        label = Math.round(val).toString();
      }
      return { y, val, label };
    });
  }, [rawMax, range, padTop, chartHeight, activeMetric]);

  // Smooth continuous mouse tracker across the entire graph
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const relX = e.clientX - rect.left;
    const svgX = (relX / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const diff = Math.abs(coords[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoveredIndex(closestIdx);
  };

  // Selected totals & growth percentages
  const currentTotal = useMemo(() => {
    if (activeMetric === "revenue") return config.format(totalRevenue);
    if (activeMetric === "units") return config.format(totalUnits);
    if (activeMetric === "orders") return config.format(totalOrders);
    return config.format(averageOrderValue);
  }, [activeMetric, totalRevenue, totalUnits, totalOrders, averageOrderValue, config]);

  const growthPct = useMemo(() => {
    if (!trends) return null;
    if (activeMetric === "revenue") return trends.revenueGrowth;
    if (activeMetric === "units") return trends.unitsGrowth;
    if (activeMetric === "orders") return trends.ordersGrowth;
    return trends.aovGrowth;
  }, [activeMetric, trends]);

  const peakPoint = useMemo(() => {
    if (coords.length === 0 || maxVal === 0) return null;
    return coords.reduce((max, c) => (c.val > max.val ? c : max), coords[0]);
  }, [coords, maxVal]);

  const activeHover = hoveredIndex !== null && coords[hoveredIndex] ? coords[hoveredIndex] : null;

  return (
    <div className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm transition-all">
      {/* Top Header & Metric Selector Tabs */}
      <div className="flex flex-col gap-4 border-b border-line/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold text-sm font-bold border border-gold/20">
              📈
            </span>
            <h3 className="font-display text-base font-bold tracking-tight text-paper sm:text-lg">
              Sales &amp; Activity Over Time
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-paper-muted">
            See how much you sold and how orders came in during {TIMEFRAME_LABELS[timeframe] || "this period"}.
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="inline-flex rounded-xl border border-line bg-ink-2 p-1 gap-1 self-start sm:self-auto shadow-inner">
          {(["revenue", "units", "orders", "aov"] as MetricKey[]).map((key) => {
            const isSelected = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveMetric(key);
                  setHoveredIndex(null);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-gold text-white shadow-sm font-bold"
                    : "text-paper-muted hover:text-paper"
                }`}
              >
                {METRIC_CONFIG[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-b border-line/60 pb-4 sm:grid-cols-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-paper-muted">
            Period Total
          </span>
          <div className="mt-1 font-display text-xl font-bold tracking-tight text-paper sm:text-2xl">
            {currentTotal}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-paper-muted">
            vs Previous Period
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            {growthPct === null || growthPct === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-3 px-2.5 py-0.5 text-xs font-medium text-paper-muted border border-line">
                <span>—</span> Stable (0%)
              </span>
            ) : growthPct > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <span>▲</span> +{growthPct}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                <span>▼</span> {growthPct}%
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-paper-muted">
            Daily Average
          </span>
          <div className="mt-1 text-sm font-semibold text-paper">
            {config.format(
              (activeMetric === "revenue" ? totalRevenue : totalUnits) /
                Math.max(points.length, 1)
            )}
            /day
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-paper-muted">
            Peak Day
          </span>
          <div className="mt-1 text-sm font-semibold text-paper">
            {peakPoint && peakPoint.val > 0 ? (
              <>
                <span className="font-bold text-gold">{config.format(peakPoint.val)}</span>{" "}
                <span className="text-xs text-paper-muted">({peakPoint.point.label})</span>
              </>
            ) : (
              <span className="text-paper-muted">No peak recorded</span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div
        className="relative mt-4 w-full select-none cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.gradientFrom} />
              <stop offset="100%" stopColor={config.gradientTo} />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines and Y-axis labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={svgWidth - padRight}
                y2={tick.y}
                stroke="#e4dad0"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 8}
                y={tick.y + 3}
                textAnchor="end"
                className="fill-paper-muted text-[10px] font-medium"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Area under curve */}
          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

          {/* Smooth line curve */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={config.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Crosshair Guide */}
          {activeHover && (
            <g className="transition-all duration-75">
              <line
                x1={activeHover.x}
                y1={padTop}
                x2={activeHover.x}
                y2={padTop + chartHeight}
                stroke={config.color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <circle
                cx={activeHover.x}
                cy={activeHover.y}
                r="5"
                fill={config.color}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* X-axis date labels */}
          {coords.map((c, idx) => {
            // Show dates evenly spaced (first, last, and every ~3rd)
            const showLabel =
              idx === 0 ||
              idx === coords.length - 1 ||
              idx % Math.ceil(coords.length / 6) === 0;

            if (!showLabel) return null;

            return (
              <text
                key={idx}
                x={c.x}
                y={svgHeight - 10}
                textAnchor="middle"
                className="fill-paper-muted text-[10px] font-medium pointer-events-none"
              >
                {c.point.label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Box (Smooth tracking, dynamic anchor to never break at edges or clip at top) */}
        {activeHover && (() => {
          const isNearRight = activeHover.x / svgWidth > 0.72;
          const isNearLeft = activeHover.x / svgWidth < 0.18;
          const isNearTop = activeHover.y < 85;

          const xTranslate = isNearRight
            ? "-translate-x-full -ml-3"
            : isNearLeft
            ? "translate-x-3"
            : "-translate-x-1/2";
          const yTranslate = isNearTop ? "translate-y-4" : "-translate-y-full -mt-3";

          return (
            <div
              className={`pointer-events-none absolute z-30 flex flex-col rounded-xl border border-line bg-white/95 px-3.5 py-2.5 text-xs shadow-xl backdrop-blur-md transition-all duration-75 ease-out whitespace-nowrap min-w-[170px] ${xTranslate} ${yTranslate}`}
              style={{
                left: `${Math.max(2, Math.min(98, (activeHover.x / svgWidth) * 100))}%`,
                top: `${(activeHover.y / svgHeight) * 100}%`,
              }}
            >
              <div className="font-semibold text-paper border-b border-line/40 pb-1 flex items-center justify-between gap-3">
                <span>{activeHover.point.label}</span>
                <span className="text-[10px] font-normal text-paper-muted">({activeHover.point.date})</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-4">
                <span className="text-[11px] text-paper-muted">{config.label}:</span>
                <span className="font-bold text-gold">{config.format(activeHover.val)}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-3 text-[10px] text-paper-muted">
                <span>Orders: <strong className="text-paper">{activeHover.point.orders}</strong></span>
                <span>·</span>
                <span>Units: <strong className="text-paper">{activeHover.point.units}</strong></span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Graph Footer Note */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-paper-muted border-t border-line/40 pt-2.5">
        <span>Timeline spans {points.length} consecutive date intervals</span>
        <span className="font-medium text-gold">Hover data points to inspect daily metrics</span>
      </div>
    </div>
  );
}
