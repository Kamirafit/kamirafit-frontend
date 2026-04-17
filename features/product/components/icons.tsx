import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function HeartIcon({
  filled = false,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...base}
      {...props}
      fill={filled ? "currentColor" : "none"}
    >
      <path d="M12 21s-7-4.35-9.5-8.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6.5C19 16.65 12 21 12 21Z" />
    </svg>
  );
}

export function StarIcon({
  filled = false,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...base}
      {...props}
      fill={filled ? "currentColor" : "none"}
    >
      <path d="m12 3 2.6 5.8L21 9.6l-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.6l6.4-.8L12 3Z" />
    </svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h16M7 12h10M10 19h4" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}
