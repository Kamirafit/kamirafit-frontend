"use client";

import React, { useId } from "react";

interface MiniSparklineProps {
  data?: number[];
  color?: "wine" | "gold" | "emerald" | "rose" | "blue";
  width?: number;
  height?: number;
  className?: string;
}

const COLOR_MAP = {
  wine: {
    stroke: "#8B1E2D",
    gradientFrom: "rgba(139, 30, 45, 0.35)",
    gradientTo: "rgba(139, 30, 45, 0.0)",
    dot: "#4A0E1A",
  },
  gold: {
    stroke: "#D4AF37",
    gradientFrom: "rgba(212, 175, 55, 0.4)",
    gradientTo: "rgba(212, 175, 55, 0.0)",
    dot: "#B89628",
  },
  emerald: {
    stroke: "#10B981",
    gradientFrom: "rgba(16, 185, 129, 0.35)",
    gradientTo: "rgba(16, 185, 129, 0.0)",
    dot: "#059669",
  },
  rose: {
    stroke: "#F43F5E",
    gradientFrom: "rgba(244, 63, 94, 0.35)",
    gradientTo: "rgba(244, 63, 94, 0.0)",
    dot: "#E11D48",
  },
  blue: {
    stroke: "#3B82F6",
    gradientFrom: "rgba(59, 130, 246, 0.35)",
    gradientTo: "rgba(59, 130, 246, 0.0)",
    dot: "#2563EB",
  },
};

export default function MiniSparkline({
  data = [],
  color = "gold",
  width = 96,
  height = 36,
  className = "",
}: MiniSparklineProps) {
  const gradientId = useId();
  const theme = COLOR_MAP[color] || COLOR_MAP.gold;

  // Safe fallback for empty/flat data
  const values = data && data.length > 1 ? data : [0, 0, 0, 0, 0, 0, 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const paddingX = 4;
  const paddingY = 4;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  // Compute coordinate points
  const points = values.map((val, idx) => {
    const x = paddingX + (idx / (values.length - 1)) * usableWidth;
    // Invert y: highest value at top
    const normalized = (val - min) / range;
    const y = paddingY + (1 - normalized) * usableHeight;
    return { x, y };
  });

  // Build smooth bezier curve
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX = (curr.x + next.x) / 2;
    pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  // Area path: closes down to the bottom
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <div className={`relative flex items-center shrink-0 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.gradientFrom} />
            <stop offset="100%" stopColor={theme.gradientTo} />
          </linearGradient>
        </defs>

        {/* Gradient fill area */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Smooth line */}
        <path
          d={pathD}
          fill="none"
          stroke={theme.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last data point pulsing indicator */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="3"
          fill={theme.stroke}
          className="shadow-sm"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="5"
          fill="none"
          stroke={theme.stroke}
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
