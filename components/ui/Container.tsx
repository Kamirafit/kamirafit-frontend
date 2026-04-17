import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Width = "default" | "narrow" | "wide";

const WIDTH_CLASS: Record<Width, string> = {
  default: "max-w-7xl",
  narrow: "max-w-3xl",
  wide: "max-w-screen-2xl",
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
      className={`mx-auto w-full ${WIDTH_CLASS[width]} px-4 sm:px-6 lg:px-8 ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
