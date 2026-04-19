"use client";

import type { ReactNode } from "react";
import AdminCard from "./AdminCard";

export type Column<Row> = {
  key: string;
  label: string;
  /** Right-align header + cell (useful for numeric / action columns). */
  align?: "left" | "right";
  /** Render the cell contents from the row. */
  render: (row: Row) => ReactNode;
  /** Optional width hint (e.g. "w-14"). */
  width?: string;
};

type Props<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string;
  emptyLabel?: string;
};

/**
 * Generic table used by every admin list page. Wraps rows in an AdminCard
 * shell with consistent header + row + hover styles.
 */
export default function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  emptyLabel = "Nothing to show.",
}: Props<Row>) {
  return (
    <AdminCard>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left text-[13px]">
          <thead className="bg-ink-2/60 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""} ${col.width ?? ""}`.trim()}
                  scope="col"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-paper">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="transition-colors hover:bg-ink-2/60"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`.trim()}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-paper-muted"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}
