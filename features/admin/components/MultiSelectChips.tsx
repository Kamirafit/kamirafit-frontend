"use client";

type Props<T extends string> = {
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
};

export default function MultiSelectChips<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  const toggle = (opt: T) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${
              active
                ? "border-gold bg-gold text-white"
                : "border-line bg-transparent text-paper-muted hover:border-gold hover:text-gold"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
