import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Padding = "none" | "sm" | "md" | "lg";

const PADDING_CLASS: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

type Props = {
  /** Inner padding. Use "none" when the card wraps a table or custom header. */
  padding?: Padding;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">;

/**
 * Shared card shell for admin panels, tables, and KPI tiles. Matches the
 * storefront's product-card radii (rounded-2xl) + line border + ink surface.
 */
export default function AdminCard({
  padding = "none",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line bg-ink ${PADDING_CLASS[padding]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
