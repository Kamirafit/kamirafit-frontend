import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-[26px] font-semibold tracking-tight text-paper sm:text-[30px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-paper-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
