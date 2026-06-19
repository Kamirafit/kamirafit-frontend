import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  role?: "status" | "alert";
  className?: string;
};

export default function StateShell({ icon, title, description, action, role = "status", className = "" }: Props) {
  return (
    <section
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={`flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border border-line bg-ink-2/60 px-5 py-10 text-center sm:px-8 ${className}`}
    >
      <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ink text-xl text-gold">
        {icon}
      </span>
      <h2 className="mt-4 font-display text-xl font-semibold text-paper">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-paper-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
