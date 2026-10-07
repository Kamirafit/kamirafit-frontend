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
      className={`flex min-h-60 w-full flex-col items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-6 py-12 text-center shadow-sm ${className}`}
    >
      <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-xl text-primary">
        {icon}
      </span>
      <h2 className="mt-4 font-serif text-xl font-medium text-primary">{title}</h2>
      <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-secondary font-light">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}

