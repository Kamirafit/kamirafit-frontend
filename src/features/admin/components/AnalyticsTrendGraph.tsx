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
    label: "Gross Revenue",
    unit: "",
    prefix: "₹",
    color: "#D4AF37", // Luxury Gold
    gradientFrom: "rgba(212, 175, 55, 0.40)",
    gradientTo: "rgba(212, 175, 55, 0.02)",
    format: (v) => `₹${Math.round(v).toLocaleString("en-IN")}`,
  },
  units: {
    label: "Units Sold",
    unit: "units",
    prefix: "",
    color: "#10B981", // Emerald
    gradientFrom: "rgba(16, 185, 129, 0.35)",
    gradientTo: "rgba(16, 185, 129, 0.02)",
    format: (v) => `${Math.round(v).toLocaleString("en-IN")} units`,
  },
  orders: {
    label: "Orders Volume",
    unit: "orders",
    prefix: "",
    color: "#8B1E2D", // Kamira Wine
    gradientFrom: "rgba(139, 30, 45, 0.40)",
    gradientTo: "rgba(139, 30, 45, 0.02)",
    format: (v) => `${v} orders`,
  },
  aov: {
    label: "Average Order Value",
    unit: "",
    prefix: "₹",
    color: "#3B82F6", // Sapphire Blue
    gradientFrom: "rgba(59, 130, 246, 0.35)",
    gradientTo: "rgba(59, 130, 246, 0.02)",
    format: (v) => `₹${Math.round(v).toLocaleString("en-IN")}`,
  },
};

const TIMEFRAME_LABELS: Record<TimeframeOption, string> = {
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

  const maxVal = Math.max(...series, 0);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  // Chart dimensions in SVG coordinate space
  const svgWidth = 840;
  const svgHeight = 220;
  const padLeft = 60;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 32;

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

  // Y-axis grid lines (4 ticks)
  const yTicks = useMemo(() => {
    const ticks = [0, 0.33, 0.66, 1];
    return ticks.map((pct) => {
      const val = minVal + pct * range;
      const y = padTop + (1 - pct) * chartHeight;
      let label = "";
      if (activeMetric === "revenue" || activeMetric === "aov") {
        label = val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${Math.round(val)}`;
      } else {
        label = Math.round(val).toString();
      }
      return { y, val, label };
    });
  }, [minVal, range, padTop, chartHeight, activeMetric]);

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
    <div className="rounded-2xl border border-line/70 bg-ink/70 backdrop-blur-md p-5 shadow-sm transition-all">
      {/* Top Header & Metric Selector Tabs */}
      <div className="flex flex-col gap-4 border-b border-line/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold text-sm font-bold">
              📈
            </span>
            <h3 className="font-display text-base font-bold tracking-tight text-paper sm:text-lg">
              Sales Velocity &amp; Revenue Trends
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-paper-muted">
            Continuous timeline tracking performance fluctuations and order cadence across {TIMEFRAME_LABELS[timeframe] || "this period"}.
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="inline-flex rounded-xl border border-line bg-ink-2 p-1 gap-1 self-start sm:self-auto">
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
                    ? "bg-gold text-ink shadow-sm font-bold"
                    : "text-paper-muted hover:text-paper"
                }`}
              >
                {METRIC_CONFIG[key].label.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-b border-line/40 pb-4 sm:grid-cols-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-paper-muted">
            Period Total
          </span>
          <div className="mt-1 font-display text-xl font-bold tracking-tight text-paper sm:text-2xl">
            {currentTotal}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-paper-muted">
            vs Previous Period
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            {growthPct === null || growthPct === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-500/15 px-2.5 py-0.5 text-xs font-semibold text-paper-muted">
                <span>—</span> Stable (0%)
              </span>
            ) : growthPct > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <span>▲</span> +{growthPct}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
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
      <div className="relative mt-4 w-full select-none overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-64 overflow-visible"
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
                x={padLeft - 10}
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
            <g>
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
                strokeWidth="2"
              />
            </g>
          )}

          {/* Interactive touch/hover invisible slice targets */}
          {coords.map((c, idx) => {
            const stepW = chartWidth / coords.length;
            const sliceX = c.x - stepW / 2;
            return (
              <rect
                key={idx}
                x={sliceX}
                y={padTop}
                width={stepW}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

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
                className="fill-paper-muted text-[10px] font-medium"
              >
                {c.point.label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {activeHover && (
          <div
            className="pointer-events-none absolute z-20 flex flex-col rounded-xl border border-line bg-ink-2/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md transition-all -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(activeHover.x / svgWidth) * 100}%`,
              top: `${Math.max(12, (activeHover.y / svgHeight) * 100 - 8)}%`,
            }}
          >
            <div className="font-semibold text-paper border-b border-line/40 pb-1">
              {activeHover.point.label} ({activeHover.point.date})
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-[11px] text-paper-muted">{config.label}:</span>
              <span className="font-bold text-gold">{config.format(activeHover.val)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[10px] text-paper-muted">
              <span>Orders: {activeHover.point.orders}</span>
              <span>·</span>
              <span>Units: {activeHover.point.units}</span>
            </div>
          </div>
        )}
      </div>

      {/* Graph Footer Note */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-paper-muted border-t border-line/40 pt-2.5">
        <span>Timeline spans {points.length} consecutive date intervals</span>
        <span className="font-medium text-gold">Hover data points to inspect daily metrics</span>
      </div>
    </div>
  );
}
