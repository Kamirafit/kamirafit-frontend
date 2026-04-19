type Props = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

/**
 * Green/red pill used to indicate storefront visibility status on product
 * rows. Green = live on storefront, red = hidden.
 */
export default function StatusPill({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
        active
          ? "border-[#16A34A]/40 bg-[#16A34A]/10 text-[#16A34A]"
          : "border-[#B3261E]/40 bg-[#B3261E]/10 text-[#B3261E]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#16A34A]" : "bg-[#B3261E]"
        }`}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
