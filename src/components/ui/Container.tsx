import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Width = "default" | "narrow" | "wide";

// Full-width by default. `narrow` still caps for long-form text blocks
// (e.g. testimonials) where edge-to-edge would hurt readability.
const WIDTH_CLASS: Record<Width, string> = {
  default: "",
  narrow: "max-w-3xl",
  wide: "",
};

type ContainerProps<T extends ElementType> = {
  as?: T;
  width?: Width;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "className" | "children">;

/**
 * Horizontal page/section gutter. Keeps max-width + px padding consistent
 * across every page and section.
 */
export default function Container<T extends ElementType = "div">({
  as,
  width = "default",
  className = "",
  children,
  ...rest
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={`mx-auto w-full ${WIDTH_CLASS[width]} px-4 sm:px-6 lg:px-10 ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
